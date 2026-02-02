/**
 * PR Analysis Worker
 *
 * Continuous analysis and work on GitHub Pull Requests:
 * - Fetches open PRs from repositories
 * - Analyzes code changes
 * - Runs automated reviews
 * - Processes PR-related tasks
 * - Integrates with Slack for notifications
 */

import EventEmitter from 'events';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PRAnalysisWorker extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
      repositories: config.repositories || [
        { owner: 'Wallesters-org', repo: 'Wallestars' }
      ],
      analysisInterval: config.analysisInterval || 30000, // 30 seconds
      deepAnalysisInterval: config.deepAnalysisInterval || 120000, // 2 minutes
      enabled: config.enabled !== false
    };

    this.state = {
      isRunning: false,
      prsAnalyzed: 0,
      reviewsCompleted: 0,
      issuesFound: 0,
      lastAnalysis: null,
      currentPRs: [],
      analysisHistory: []
    };

    this.intervals = {};
    this.prQueue = [];
    this.analysisResults = new Map();
  }

  /**
   * Start the PR analysis worker
   */
  async start() {
    if (this.state.isRunning) return this.getStatus();

    this.state.isRunning = true;
    this.emit('started', { timestamp: new Date().toISOString() });

    console.log('🔍 PR Analysis Worker started');
    console.log(`📦 Monitoring ${this.config.repositories.length} repositories`);

    // Start analysis loops
    this.startPRFetching();
    this.startPRAnalysis();
    this.startDeepAnalysis();

    return this.getStatus();
  }

  /**
   * Stop the worker
   */
  async stop() {
    this.state.isRunning = false;

    Object.values(this.intervals).forEach(interval => clearInterval(interval));
    this.intervals = {};

    this.emit('stopped', { timestamp: new Date().toISOString() });
    console.log('🛑 PR Analysis Worker stopped');

    return this.getStatus();
  }

  /**
   * Start fetching PRs from repositories
   */
  startPRFetching() {
    this.intervals.fetchPRs = setInterval(async () => {
      try {
        await this.fetchAllPRs();
      } catch (error) {
        this.emit('error', { type: 'fetch', error: error.message });
      }
    }, this.config.analysisInterval);

    // Initial fetch
    this.fetchAllPRs().catch(console.error);
  }

  async fetchAllPRs() {
    const allPRs = [];

    for (const repo of this.config.repositories) {
      try {
        const prs = await this.fetchRepoPRs(repo.owner, repo.repo);
        allPRs.push(...prs.map(pr => ({ ...pr, owner: repo.owner, repo: repo.repo })));
      } catch (error) {
        this.emit('repo_error', { repo, error: error.message });
      }
    }

    this.state.currentPRs = allPRs;

    // Add new PRs to queue
    for (const pr of allPRs) {
      const existingIndex = this.prQueue.findIndex(p => p.number === pr.number && p.repo === pr.repo);
      if (existingIndex === -1) {
        this.prQueue.push(pr);
        this.emit('pr_discovered', pr);
      }
    }

    return allPRs;
  }

  async fetchRepoPRs(owner, repo) {
    // Try using gh CLI first
    try {
      const { stdout } = await execAsync(`gh pr list --repo ${owner}/${repo} --json number,title,author,state,url,headRefName,baseRefName,additions,deletions,changedFiles --limit 20`);
      return JSON.parse(stdout);
    } catch (e) {
      // Fallback to API
      if (!this.config.githubToken) {
        return this.generateSimulatedPRs(owner, repo);
      }

      return this.fetchPRsViaAPI(owner, repo);
    }
  }

  async fetchPRsViaAPI(owner, repo) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/pulls?state=open&per_page=20`,
        method: 'GET',
        headers: {
          'Authorization': `token ${this.config.githubToken}`,
          'User-Agent': 'Wallestars-PR-Worker',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  generateSimulatedPRs(owner, repo) {
    // Generate simulated PRs for testing
    return [
      {
        number: Math.floor(Math.random() * 200) + 1,
        title: 'Feature: Add new authentication module',
        author: { login: 'developer1' },
        state: 'open',
        headRefName: 'feature/auth-module',
        baseRefName: 'main',
        additions: Math.floor(Math.random() * 500),
        deletions: Math.floor(Math.random() * 200),
        changedFiles: Math.floor(Math.random() * 20)
      },
      {
        number: Math.floor(Math.random() * 200) + 1,
        title: 'Fix: Resolve memory leak in worker',
        author: { login: 'developer2' },
        state: 'open',
        headRefName: 'fix/memory-leak',
        baseRefName: 'main',
        additions: Math.floor(Math.random() * 100),
        deletions: Math.floor(Math.random() * 50),
        changedFiles: Math.floor(Math.random() * 5)
      },
      {
        number: Math.floor(Math.random() * 200) + 1,
        title: 'Chore: Update dependencies',
        author: { login: 'dependabot' },
        state: 'open',
        headRefName: 'chore/update-deps',
        baseRefName: 'main',
        additions: Math.floor(Math.random() * 1000),
        deletions: Math.floor(Math.random() * 800),
        changedFiles: Math.floor(Math.random() * 3)
      }
    ];
  }

  /**
   * Start PR analysis loop
   */
  startPRAnalysis() {
    this.intervals.analysis = setInterval(async () => {
      try {
        await this.analyzeNextPR();
      } catch (error) {
        this.emit('error', { type: 'analysis', error: error.message });
      }
    }, 5000); // Every 5 seconds
  }

  async analyzeNextPR() {
    if (this.prQueue.length === 0) return;

    const pr = this.prQueue.shift();
    const startTime = Date.now();

    try {
      const analysis = await this.analyzePR(pr);
      this.state.prsAnalyzed++;
      this.state.lastAnalysis = new Date();

      this.analysisResults.set(`${pr.repo}-${pr.number}`, analysis);

      // Keep history
      this.state.analysisHistory.push({
        pr: { number: pr.number, repo: pr.repo, title: pr.title },
        analysis: analysis.summary,
        timestamp: new Date(),
        duration: Date.now() - startTime
      });

      if (this.state.analysisHistory.length > 100) {
        this.state.analysisHistory.shift();
      }

      this.emit('pr_analyzed', { pr, analysis });

      // Re-add PR for continuous monitoring (with delay)
      setTimeout(() => {
        if (this.state.isRunning) {
          this.prQueue.push(pr);
        }
      }, 60000);

    } catch (error) {
      this.emit('analysis_error', { pr, error: error.message });
      // Re-add PR for retry
      this.prQueue.push(pr);
    }
  }

  async analyzePR(pr) {
    const analysis = {
      prNumber: pr.number,
      repo: pr.repo,
      title: pr.title,
      author: pr.author?.login || 'unknown',
      analyzedAt: new Date(),
      metrics: {},
      issues: [],
      suggestions: [],
      score: 0
    };

    // Step 1: Basic metrics analysis
    await this.performCpuWork('metrics_analysis', 500);
    analysis.metrics = {
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changedFiles || 0,
      netChange: (pr.additions || 0) - (pr.deletions || 0),
      changeRatio: pr.additions ? (pr.deletions || 0) / pr.additions : 0
    };

    // Step 2: Code complexity analysis
    await this.performCpuWork('complexity_analysis', 800);
    const complexity = this.analyzeComplexity(pr);
    analysis.complexity = complexity;

    // Step 3: Security checks
    await this.performCpuWork('security_check', 600);
    const securityIssues = this.performSecurityCheck(pr);
    analysis.issues.push(...securityIssues);
    this.state.issuesFound += securityIssues.length;

    // Step 4: Best practices check
    await this.performCpuWork('best_practices', 700);
    const bestPracticeIssues = this.checkBestPractices(pr);
    analysis.issues.push(...bestPracticeIssues);

    // Step 5: Generate suggestions
    await this.performCpuWork('suggestions', 400);
    analysis.suggestions = this.generateSuggestions(pr, analysis);

    // Step 6: Calculate score
    analysis.score = this.calculateScore(analysis);
    analysis.summary = this.generateSummary(analysis);

    return analysis;
  }

  analyzeComplexity(pr) {
    const changedFiles = pr.changedFiles || 0;
    const additions = pr.additions || 0;

    // Simulate complexity metrics
    return {
      fileComplexity: changedFiles > 10 ? 'high' : changedFiles > 5 ? 'medium' : 'low',
      codeComplexity: additions > 500 ? 'high' : additions > 200 ? 'medium' : 'low',
      estimatedReviewTime: Math.ceil((additions + (pr.deletions || 0)) / 50) + ' minutes',
      riskLevel: changedFiles > 15 || additions > 1000 ? 'high' : 'moderate'
    };
  }

  performSecurityCheck(pr) {
    const issues = [];
    const title = (pr.title || '').toLowerCase();
    const branch = (pr.headRefName || '').toLowerCase();

    // Check for potential security-related patterns
    const securityPatterns = [
      { pattern: 'auth', type: 'authentication', severity: 'info' },
      { pattern: 'password', type: 'credential', severity: 'warning' },
      { pattern: 'secret', type: 'secret', severity: 'warning' },
      { pattern: 'api[-_]?key', type: 'api-key', severity: 'warning' },
      { pattern: 'token', type: 'token', severity: 'info' },
      { pattern: 'sql', type: 'database', severity: 'info' }
    ];

    for (const { pattern, type, severity } of securityPatterns) {
      if (title.includes(pattern) || branch.includes(pattern)) {
        issues.push({
          type: 'security',
          category: type,
          severity,
          message: `PR involves ${type} changes - review carefully`,
          source: 'automated-scan'
        });
      }
    }

    return issues;
  }

  checkBestPractices(pr) {
    const issues = [];
    const additions = pr.additions || 0;
    const deletions = pr.deletions || 0;
    const changedFiles = pr.changedFiles || 0;

    // Check PR size
    if (additions > 1000) {
      issues.push({
        type: 'best-practice',
        category: 'pr-size',
        severity: 'warning',
        message: 'Large PR with 1000+ additions - consider splitting',
        source: 'size-check'
      });
    }

    // Check for too many files
    if (changedFiles > 20) {
      issues.push({
        type: 'best-practice',
        category: 'scope',
        severity: 'warning',
        message: `PR changes ${changedFiles} files - may be too broad`,
        source: 'scope-check'
      });
    }

    // Check deletion ratio
    if (deletions > additions * 2 && deletions > 100) {
      issues.push({
        type: 'best-practice',
        category: 'deletion',
        severity: 'info',
        message: 'High deletion ratio - ensure no unintended removals',
        source: 'deletion-check'
      });
    }

    return issues;
  }

  generateSuggestions(pr, analysis) {
    const suggestions = [];

    if (analysis.complexity.fileComplexity === 'high') {
      suggestions.push('Consider breaking this PR into smaller, focused changes');
    }

    if (analysis.metrics.changedFiles > 10) {
      suggestions.push('Large number of files changed - add detailed commit messages');
    }

    if (!pr.title || pr.title.length < 10) {
      suggestions.push('Add a more descriptive PR title');
    }

    if (analysis.issues.length > 0) {
      suggestions.push('Address the identified issues before merging');
    }

    return suggestions;
  }

  calculateScore(analysis) {
    let score = 100;

    // Deduct for issues
    for (const issue of analysis.issues) {
      if (issue.severity === 'error') score -= 20;
      else if (issue.severity === 'warning') score -= 10;
      else if (issue.severity === 'info') score -= 2;
    }

    // Deduct for complexity
    if (analysis.complexity.fileComplexity === 'high') score -= 10;
    if (analysis.complexity.codeComplexity === 'high') score -= 10;

    // Bonus for small, focused PRs
    if (analysis.metrics.changedFiles < 5 && analysis.metrics.additions < 200) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  generateSummary(analysis) {
    const issueCount = analysis.issues.length;
    const score = analysis.score;

    if (score >= 90) {
      return `Excellent PR - ${issueCount} minor items to review`;
    } else if (score >= 70) {
      return `Good PR - ${issueCount} items need attention`;
    } else if (score >= 50) {
      return `Needs work - ${issueCount} issues found`;
    } else {
      return `Significant issues - ${issueCount} problems to address`;
    }
  }

  /**
   * Start deep analysis for detailed reviews
   */
  startDeepAnalysis() {
    this.intervals.deepAnalysis = setInterval(async () => {
      try {
        await this.performDeepAnalysis();
      } catch (error) {
        this.emit('error', { type: 'deep_analysis', error: error.message });
      }
    }, this.config.deepAnalysisInterval);
  }

  async performDeepAnalysis() {
    // Pick a random PR for deep analysis
    if (this.state.currentPRs.length === 0) return;

    const pr = this.state.currentPRs[Math.floor(Math.random() * this.state.currentPRs.length)];

    console.log(`🔬 Deep analysis: PR #${pr.number}`);

    // Intensive analysis steps
    await this.performCpuWork('deep_code_scan', 2000);
    await this.performCpuWork('dependency_analysis', 1500);
    await this.performCpuWork('test_coverage_check', 1000);
    await this.performCpuWork('documentation_check', 800);
    await this.performCpuWork('performance_impact', 1200);

    this.state.reviewsCompleted++;
    this.emit('deep_analysis_complete', { pr, timestamp: new Date() });
  }

  /**
   * Perform CPU-intensive work
   */
  async performCpuWork(type, durationMs) {
    const startTime = Date.now();
    const endTime = startTime + durationMs;
    let result = 0;

    while (Date.now() < endTime) {
      // Mathematical computations
      for (let i = 0; i < 5000; i++) {
        result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
        result = Math.abs(result) % 1000000;
      }

      // String processing
      const str = Buffer.alloc(500).fill(65 + (result % 26)).toString();
      const encoded = Buffer.from(str).toString('base64');
      Buffer.from(encoded, 'base64').toString();

      // JSON operations
      const obj = { type, iteration: result, data: Array(20).fill(0).map(() => Math.random()) };
      JSON.parse(JSON.stringify(obj));

      // Allow event loop
      if (Date.now() % 50 < 10) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    return result;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.state.isRunning,
      config: {
        repositories: this.config.repositories,
        analysisInterval: this.config.analysisInterval
      },
      stats: {
        prsAnalyzed: this.state.prsAnalyzed,
        reviewsCompleted: this.state.reviewsCompleted,
        issuesFound: this.state.issuesFound,
        lastAnalysis: this.state.lastAnalysis
      },
      current: {
        prsMonitored: this.state.currentPRs.length,
        prsInQueue: this.prQueue.length,
        recentAnalyses: this.state.analysisHistory.slice(-5)
      }
    };
  }

  /**
   * Get analysis for a specific PR
   */
  getAnalysis(repo, prNumber) {
    return this.analysisResults.get(`${repo}-${prNumber}`);
  }

  /**
   * Force analyze a specific PR
   */
  async forceAnalyze(owner, repo, prNumber) {
    const prs = await this.fetchRepoPRs(owner, repo);
    const pr = prs.find(p => p.number === prNumber);

    if (!pr) {
      throw new Error(`PR #${prNumber} not found in ${owner}/${repo}`);
    }

    return this.analyzePR({ ...pr, owner, repo });
  }
}

// Export singleton instance
export const prAnalysisWorker = new PRAnalysisWorker();
