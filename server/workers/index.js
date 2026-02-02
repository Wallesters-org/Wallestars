/**
 * Worker System Entry Point
 *
 * Orchestrates all workers:
 * - Slack Monitor Worker
 * - CPU Workload Manager
 * - PR Analysis Worker
 *
 * Maintains CPU above 50% with continuous useful work
 */

import { SlackMonitorWorker, slackMonitorWorker } from './SlackMonitorWorker.js';
import { CPUWorkloadManager, cpuWorkloadManager } from './CPUWorkloadManager.js';
import { PRAnalysisWorker, prAnalysisWorker } from './PRAnalysisWorker.js';
import EventEmitter from 'events';

export class WorkerOrchestrator extends EventEmitter {
  constructor() {
    super();

    this.workers = {
      slack: slackMonitorWorker,
      cpu: cpuWorkloadManager,
      pr: prAnalysisWorker
    };

    this.state = {
      isRunning: false,
      startedAt: null,
      workersActive: 0
    };

    this.setupEventForwarding();
  }

  /**
   * Forward events from all workers
   */
  setupEventForwarding() {
    // Slack worker events
    this.workers.slack.on('started', () => this.emit('worker:started', { worker: 'slack' }));
    this.workers.slack.on('stopped', () => this.emit('worker:stopped', { worker: 'slack' }));
    this.workers.slack.on('tasks_extracted', (data) => this.emit('slack:tasks', data));
    this.workers.slack.on('pr_mentions', (data) => this.emit('slack:pr_mentions', data));
    this.workers.slack.on('cpu_update', (data) => this.emit('slack:cpu', data));
    this.workers.slack.on('error', (data) => this.emit('worker:error', { worker: 'slack', ...data }));

    // CPU worker events
    this.workers.cpu.on('started', () => this.emit('worker:started', { worker: 'cpu' }));
    this.workers.cpu.on('stopped', () => this.emit('worker:stopped', { worker: 'cpu' }));
    this.workers.cpu.on('cpu_status', (data) => this.emit('cpu:status', data));
    this.workers.cpu.on('work_added', (data) => this.emit('cpu:work_added', data));
    this.workers.cpu.on('work_completed', (data) => this.emit('cpu:work_completed', data));
    this.workers.cpu.on('error', (data) => this.emit('worker:error', { worker: 'cpu', ...data }));

    // PR worker events
    this.workers.pr.on('started', () => this.emit('worker:started', { worker: 'pr' }));
    this.workers.pr.on('stopped', () => this.emit('worker:stopped', { worker: 'pr' }));
    this.workers.pr.on('pr_discovered', (data) => this.emit('pr:discovered', data));
    this.workers.pr.on('pr_analyzed', (data) => this.emit('pr:analyzed', data));
    this.workers.pr.on('deep_analysis_complete', (data) => this.emit('pr:deep_analyzed', data));
    this.workers.pr.on('error', (data) => this.emit('worker:error', { worker: 'pr', ...data }));
  }

  /**
   * Start all workers
   */
  async startAll(config = {}) {
    console.log('═══════════════════════════════════════════════');
    console.log('🚀 Starting Worker Orchestrator');
    console.log('═══════════════════════════════════════════════');

    this.state.isRunning = true;
    this.state.startedAt = new Date();

    const results = {};

    // Start CPU Workload Manager first (to maintain baseline)
    console.log('\n📊 Starting CPU Workload Manager...');
    results.cpu = await this.workers.cpu.start();
    this.state.workersActive++;

    // Start Slack Monitor
    console.log('\n💬 Starting Slack Monitor Worker...');
    results.slack = await this.workers.slack.start();
    this.state.workersActive++;

    // Start PR Analysis
    console.log('\n🔍 Starting PR Analysis Worker...');
    results.pr = await this.workers.pr.start();
    this.state.workersActive++;

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ All workers started successfully');
    console.log(`📊 Active workers: ${this.state.workersActive}`);
    console.log('═══════════════════════════════════════════════\n');

    this.emit('all:started', results);
    return results;
  }

  /**
   * Stop all workers
   */
  async stopAll() {
    console.log('\n🛑 Stopping all workers...');

    const results = {};

    results.slack = await this.workers.slack.stop();
    results.cpu = await this.workers.cpu.stop();
    results.pr = await this.workers.pr.stop();

    this.state.isRunning = false;
    this.state.workersActive = 0;

    console.log('✅ All workers stopped\n');

    this.emit('all:stopped', results);
    return results;
  }

  /**
   * Get combined status
   */
  getStatus() {
    return {
      orchestrator: {
        isRunning: this.state.isRunning,
        startedAt: this.state.startedAt,
        uptime: this.state.startedAt
          ? Math.floor((Date.now() - this.state.startedAt) / 1000)
          : 0,
        workersActive: this.state.workersActive
      },
      workers: {
        slack: this.workers.slack.getStatus(),
        cpu: this.workers.cpu.getStatus(),
        pr: this.workers.pr.getStatus()
      },
      summary: {
        currentCpu: this.workers.cpu.state.currentCpuUsage,
        targetCpu: {
          min: this.workers.cpu.config.minCpuTarget,
          max: this.workers.cpu.config.maxCpuTarget
        },
        tasksProcessed: this.workers.slack.state.tasksExtracted,
        prsAnalyzed: this.workers.pr.state.prsAnalyzed,
        workloadMode: this.workers.cpu.state.workloadMode
      }
    };
  }

  /**
   * Adjust CPU targets
   */
  setCpuTargets(min, max) {
    this.workers.cpu.setTarget(min, max);
    return {
      min: this.workers.cpu.config.minCpuTarget,
      max: this.workers.cpu.config.maxCpuTarget
    };
  }

  /**
   * Force additional workload
   */
  forceWorkload(intensity = 'heavy', count = 3) {
    this.workers.cpu.forceAddWork(count, intensity);
    return { added: count, intensity };
  }

  /**
   * Get specific worker
   */
  getWorker(name) {
    return this.workers[name];
  }
}

// Export singleton
export const workerOrchestrator = new WorkerOrchestrator();

// Export all workers
export {
  SlackMonitorWorker,
  slackMonitorWorker,
  CPUWorkloadManager,
  cpuWorkloadManager,
  PRAnalysisWorker,
  prAnalysisWorker
};

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting Worker Orchestrator standalone...');

  const orchestrator = new WorkerOrchestrator();

  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down...');
    await orchestrator.stopAll();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down...');
    await orchestrator.stopAll();
    process.exit(0);
  });

  // Start all workers
  orchestrator.startAll().then(() => {
    console.log('Worker Orchestrator is running');
    console.log('Press Ctrl+C to stop');
  });
}
