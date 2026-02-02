/**
 * Worker Management API Routes
 *
 * Endpoints for controlling and monitoring the worker system:
 * - Start/stop workers
 * - Get status
 * - Adjust CPU targets
 * - View analytics
 */

import { Router } from 'express';
import { workerOrchestrator } from '../workers/index.js';

const router = Router();

/**
 * GET /api/workers/status
 * Get status of all workers
 */
router.get('/status', (req, res) => {
  try {
    const status = workerOrchestrator.getStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workers/start
 * Start all workers
 */
router.post('/start', async (req, res) => {
  try {
    const result = await workerOrchestrator.startAll(req.body);
    res.json({
      success: true,
      message: 'All workers started',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workers/stop
 * Stop all workers
 */
router.post('/stop', async (req, res) => {
  try {
    const result = await workerOrchestrator.stopAll();
    res.json({
      success: true,
      message: 'All workers stopped',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workers/cpu
 * Get CPU workload manager status
 */
router.get('/cpu', (req, res) => {
  try {
    const cpuWorker = workerOrchestrator.getWorker('cpu');
    const status = cpuWorker.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workers/cpu/target
 * Set CPU target range
 */
router.post('/cpu/target', (req, res) => {
  try {
    const { min = 50, max = 85 } = req.body;
    const result = workerOrchestrator.setCpuTargets(min, max);
    res.json({
      success: true,
      message: `CPU target set to ${result.min}%-${result.max}%`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workers/cpu/force-work
 * Force additional workload
 */
router.post('/cpu/force-work', (req, res) => {
  try {
    const { intensity = 'heavy', count = 3 } = req.body;
    const result = workerOrchestrator.forceWorkload(intensity, count);
    res.json({
      success: true,
      message: `Added ${count} ${intensity} work items`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workers/slack
 * Get Slack monitor status
 */
router.get('/slack', (req, res) => {
  try {
    const slackWorker = workerOrchestrator.getWorker('slack');
    const status = slackWorker.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workers/pr
 * Get PR analysis worker status
 */
router.get('/pr', (req, res) => {
  try {
    const prWorker = workerOrchestrator.getWorker('pr');
    const status = prWorker.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workers/pr/:repo/:number
 * Get analysis for specific PR
 */
router.get('/pr/:repo/:number', (req, res) => {
  try {
    const { repo, number } = req.params;
    const prWorker = workerOrchestrator.getWorker('pr');
    const analysis = prWorker.getAnalysis(repo, parseInt(number));

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workers/pr/analyze
 * Force analyze a specific PR
 */
router.post('/pr/analyze', async (req, res) => {
  try {
    const { owner, repo, prNumber } = req.body;

    if (!owner || !repo || !prNumber) {
      return res.status(400).json({
        success: false,
        error: 'owner, repo, and prNumber are required'
      });
    }

    const prWorker = workerOrchestrator.getWorker('pr');
    const analysis = await prWorker.forceAnalyze(owner, repo, prNumber);

    res.json({
      success: true,
      message: `Analyzed PR #${prNumber}`,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workers/metrics
 * Get combined metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const status = workerOrchestrator.getStatus();

    const metrics = {
      cpu: {
        current: status.summary.currentCpu,
        target: status.summary.targetCpu,
        mode: status.summary.workloadMode
      },
      tasks: {
        processed: status.summary.tasksProcessed,
        prsAnalyzed: status.summary.prsAnalyzed
      },
      workers: {
        active: status.orchestrator.workersActive,
        uptime: status.orchestrator.uptime
      },
      slack: {
        messagesProcessed: status.workers.slack.stats.messagesProcessed,
        extensionsMonitored: status.workers.slack.stats.extensionsMonitored
      },
      pr: {
        monitored: status.workers.pr.current.prsMonitored,
        inQueue: status.workers.pr.current.prsInQueue,
        issuesFound: status.workers.pr.stats.issuesFound
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * WebSocket event forwarding setup
 */
export function setupWorkerSocketEvents(io) {
  workerOrchestrator.on('cpu:status', (data) => {
    io.emit('worker:cpu:status', data);
  });

  workerOrchestrator.on('slack:tasks', (data) => {
    io.emit('worker:slack:tasks', data);
  });

  workerOrchestrator.on('pr:analyzed', (data) => {
    io.emit('worker:pr:analyzed', {
      prNumber: data.pr.number,
      repo: data.pr.repo,
      score: data.analysis.score,
      summary: data.analysis.summary
    });
  });

  workerOrchestrator.on('worker:error', (data) => {
    io.emit('worker:error', data);
  });

  console.log('🔌 Worker socket events configured');
}

export default router;
