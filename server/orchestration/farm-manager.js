/**
 * AI Farm Manager
 * High-level manager for the AI agents orchestration farm
 * Handles automatic setup, platform onboarding, and workflow execution
 */

import { EventEmitter } from 'events';
import { AgentOrchestrator, getOrchestrator, AGENT_STATE } from './agent-orchestrator.js';
import {
  getAllPlatforms,
  getConfiguredPlatforms,
  getUnconfiguredPlatforms,
  getPlatformsByCapability,
  getPlatform,
  PLATFORM_STATUS,
  PLATFORM_TIER
} from './platforms-registry.js';

/**
 * Workflow templates for common orchestration patterns
 */
export const WORKFLOW_TEMPLATES = {
  // Research workflow - use multiple AI agents to research a topic
  RESEARCH: {
    id: 'research',
    name: 'Multi-Agent Research',
    description: 'Multiple agents research the same topic and aggregate findings',
    systemPrompt: 'You are a research assistant. Provide detailed, factual information with sources when possible.',
    aggregation: 'merge' // merge, vote, best
  },

  // Code review workflow - multiple agents review code
  CODE_REVIEW: {
    id: 'code_review',
    name: 'Parallel Code Review',
    description: 'Multiple agents review code for different aspects',
    systemPrompt: 'You are a code reviewer. Analyze the code for bugs, security issues, performance problems, and best practices.',
    aggregation: 'merge'
  },

  // Content generation - generate variations
  CONTENT_GENERATION: {
    id: 'content_generation',
    name: 'Content Variations',
    description: 'Generate multiple content variations from different AI perspectives',
    systemPrompt: 'You are a creative content writer. Generate unique, engaging content.',
    aggregation: 'collect'
  },

  // Task decomposition - break down complex tasks
  TASK_DECOMPOSITION: {
    id: 'task_decomposition',
    name: 'Task Breakdown',
    description: 'Decompose complex tasks into smaller subtasks',
    systemPrompt: 'You are a project planner. Break down complex tasks into clear, actionable subtasks.',
    aggregation: 'best'
  },

  // Consensus building - get agreement from multiple agents
  CONSENSUS: {
    id: 'consensus',
    name: 'Multi-Agent Consensus',
    description: 'Multiple agents analyze and vote on the best solution',
    systemPrompt: 'You are an expert analyst. Provide your best answer with confidence score (1-10).',
    aggregation: 'vote'
  }
};

/**
 * Farm Manager class
 */
export class FarmManager extends EventEmitter {
  constructor() {
    super();
    this.orchestrator = getOrchestrator();
    this.workflows = new Map();
    this.setupStatus = new Map();
    this.isInitialized = false;

    // Forward orchestrator events
    this.orchestrator.on('task-completed', (data) => this.emit('task-completed', data));
    this.orchestrator.on('task-failed', (data) => this.emit('task-failed', data));
    this.orchestrator.on('parallel-execution-complete', (data) => this.emit('parallel-complete', data));
  }

  /**
   * Initialize the farm with all configured platforms
   */
  async initialize() {
    console.log('🌾 Initializing AI Agent Orchestration Farm...');

    const configuredPlatforms = getConfiguredPlatforms();
    const unconfiguredPlatforms = getUnconfiguredPlatforms();

    console.log(`📊 Platform Status:`);
    console.log(`   ✅ Configured: ${configuredPlatforms.length}`);
    console.log(`   ⚠️  Need setup: ${unconfiguredPlatforms.length}`);

    // Initialize orchestrator with configured platforms
    const results = await this.orchestrator.initializeFarm();

    // Start the farm
    this.orchestrator.start();

    this.isInitialized = true;

    return {
      success: true,
      configured: configuredPlatforms.map(p => p.name),
      needSetup: unconfiguredPlatforms.map(p => ({
        name: p.name,
        signupUrl: p.signupUrl,
        envVar: p.envVarName,
        trialCredits: p.trialCredits
      })),
      agentCount: this.orchestrator.agents.size
    };
  }

  /**
   * Get setup guide for all unconfigured platforms
   */
  getSetupGuide() {
    const unconfigured = getUnconfiguredPlatforms();

    return unconfigured.map(platform => ({
      id: platform.id,
      name: platform.name,
      tier: platform.tier,
      trialCredits: platform.trialCredits,
      signupUrl: platform.signupUrl,
      envVarName: platform.envVarName,
      setupInstructions: platform.setupInstructions,
      capabilities: platform.capabilities
    }));
  }

  /**
   * Quick-add a platform (generates env variable template)
   */
  generateEnvTemplate() {
    const allPlatforms = getAllPlatforms();

    let template = `# AI Agent Orchestration Farm - Environment Variables\n`;
    template += `# Generated on ${new Date().toISOString()}\n\n`;

    template += `# ===== CONFIGURED PLATFORMS =====\n`;
    const configured = getConfiguredPlatforms();
    configured.forEach(p => {
      template += `${p.envVarName}=your_key_here  # ✅ Configured\n`;
    });

    template += `\n# ===== AVAILABLE FREE TRIALS =====\n`;
    const unconfigured = getUnconfiguredPlatforms();
    unconfigured.forEach(p => {
      template += `# ${p.envVarName}=  # ${p.name} - ${p.trialCredits}\n`;
      template += `#   Signup: ${p.signupUrl}\n`;
    });

    return template;
  }

  /**
   * Execute a workflow template with a prompt
   */
  async executeWorkflow(workflowId, prompt, options = {}) {
    const template = WORKFLOW_TEMPLATES[workflowId.toUpperCase()];
    if (!template) {
      throw new Error(`Unknown workflow: ${workflowId}`);
    }

    const task = {
      id: `workflow_${workflowId}_${Date.now()}`,
      prompt,
      systemPrompt: template.systemPrompt,
      workflow: workflowId,
      ...options
    };

    console.log(`🔄 Executing workflow: ${template.name}`);

    // Execute on all agents
    const results = await this.orchestrator.executeOnAllAgents(task);

    // Aggregate results based on workflow type
    const aggregated = this.aggregateResults(results.results, template.aggregation);

    return {
      workflowId,
      workflowName: template.name,
      prompt,
      results: results.results,
      aggregated,
      totalTime: results.totalTime
    };
  }

  /**
   * Aggregate results from multiple agents
   */
  aggregateResults(results, strategy) {
    const successful = results.filter(r => r.success);

    switch (strategy) {
      case 'merge':
        // Combine all responses
        return {
          type: 'merged',
          responses: successful.map(r => ({
            agent: r.agent,
            response: r.result
          })),
          summary: `Collected ${successful.length} responses from different AI agents.`
        };

      case 'vote':
        // Extract confidence scores if present and pick highest
        const withScores = successful.map(r => {
          const confidenceMatch = r.result?.match(/confidence[:\s]*(\d+)/i);
          return {
            agent: r.agent,
            response: r.result,
            confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 5
          };
        });
        const best = withScores.reduce((best, curr) =>
          curr.confidence > best.confidence ? curr : best
        );
        return {
          type: 'voted',
          winner: best,
          allVotes: withScores
        };

      case 'best':
        // Pick the fastest successful response
        const fastest = successful.reduce((fast, curr) =>
          (curr.responseTime || Infinity) < (fast.responseTime || Infinity) ? curr : fast
        );
        return {
          type: 'best',
          selected: fastest
        };

      case 'collect':
      default:
        // Just collect all responses
        return {
          type: 'collected',
          count: successful.length,
          responses: successful.map(r => ({
            agent: r.agent,
            response: r.result
          }))
        };
    }
  }

  /**
   * Execute parallel tasks - one task per agent
   */
  async executeParallel(tasks) {
    console.log(`🚀 Executing ${tasks.length} tasks in parallel...`);

    const taskIds = this.orchestrator.submitTasks(tasks);

    return {
      submitted: taskIds.length,
      taskIds,
      status: 'processing'
    };
  }

  /**
   * Execute the same prompt on all agents and get diverse responses
   */
  async getDiverseResponses(prompt, options = {}) {
    const task = {
      id: `diverse_${Date.now()}`,
      prompt,
      systemPrompt: options.systemPrompt || 'Provide your unique perspective on the following:',
      maxTokens: options.maxTokens || 2048
    };

    return this.orchestrator.executeOnAllAgents(task);
  }

  /**
   * Smart routing - pick best agent for a task based on capabilities
   */
  async smartExecute(prompt, requiredCapabilities = []) {
    const platforms = requiredCapabilities.length > 0
      ? getPlatformsByCapability(requiredCapabilities[0])
      : getConfiguredPlatforms();

    if (platforms.length === 0) {
      throw new Error('No suitable platforms found for the required capabilities');
    }

    // Find configured platform with required capabilities
    const suitable = platforms.find(p => {
      const configured = getConfiguredPlatforms().find(c => c.id === p.id);
      return configured && requiredCapabilities.every(cap => p.capabilities.includes(cap));
    });

    if (!suitable) {
      // Fall back to any configured platform
      const configured = getConfiguredPlatforms();
      if (configured.length === 0) {
        throw new Error('No platforms configured');
      }
      return this.orchestrator.submitTask({
        prompt,
        preferredPlatform: configured[0].id
      });
    }

    return this.orchestrator.submitTask({
      prompt,
      preferredPlatform: suitable.id
    });
  }

  /**
   * Get comprehensive farm status
   */
  getStatus() {
    const orchestratorStatus = this.orchestrator.getStatus();
    const allPlatforms = getAllPlatforms();

    return {
      initialized: this.isInitialized,
      orchestrator: orchestratorStatus,
      platforms: {
        total: allPlatforms.length,
        configured: getConfiguredPlatforms().length,
        available: getUnconfiguredPlatforms().length,
        byTier: {
          freeTrial: allPlatforms.filter(p => p.tier === PLATFORM_TIER.FREE_TRIAL).length,
          freeTier: allPlatforms.filter(p => p.tier === PLATFORM_TIER.FREE_TIER).length
        }
      },
      availableWorkflows: Object.keys(WORKFLOW_TEMPLATES),
      metrics: this.orchestrator.getMetrics()
    };
  }

  /**
   * Get all available platforms info
   */
  getPlatformsInfo() {
    return {
      configured: getConfiguredPlatforms().map(p => ({
        id: p.id,
        name: p.name,
        capabilities: p.capabilities,
        models: p.models
      })),
      available: getUnconfiguredPlatforms().map(p => ({
        id: p.id,
        name: p.name,
        trialCredits: p.trialCredits,
        signupUrl: p.signupUrl,
        capabilities: p.capabilities
      }))
    };
  }

  /**
   * Stop the farm
   */
  stop() {
    return this.orchestrator.stop();
  }
}

// Singleton instance
let farmManagerInstance = null;

export function getFarmManager() {
  if (!farmManagerInstance) {
    farmManagerInstance = new FarmManager();
  }
  return farmManagerInstance;
}

export default FarmManager;
