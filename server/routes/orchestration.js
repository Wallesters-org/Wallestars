/**
 * AI Agents Orchestration Farm - API Routes
 *
 * REST API endpoints for managing trial platform orchestration
 */

import express from 'express';
import { getOrchestrationService } from '../services/orchestrationService.js';
import {
  getAllPlatforms,
  getPlatformsByCategory,
  getPlatformBySlug,
  getFreeTierPlatforms,
  getPlatformsByPriority,
  getMCPCompatiblePlatforms,
  getWebhookPlatforms,
  generateOrchestrationBatch,
  PLATFORM_CATEGORIES
} from '../config/platformRegistry.js';

const router = express.Router();

// Initialize orchestration service
const orchestration = getOrchestrationService();

// ============================================================================
// PLATFORM ENDPOINTS
// ============================================================================

/**
 * GET /api/orchestration/platforms
 * Get all available trial platforms
 */
router.get('/platforms', (req, res) => {
  try {
    const { category, freeTier, priority, mcpCompatible, webhookSupport } = req.query;

    let platforms = getAllPlatforms();

    if (category) {
      platforms = getPlatformsByCategory(category);
    }

    if (freeTier === 'true') {
      platforms = getFreeTierPlatforms();
    }

    if (priority === 'true') {
      platforms = getPlatformsByPriority();
    }

    if (mcpCompatible === 'true') {
      platforms = getMCPCompatiblePlatforms();
    }

    if (webhookSupport === 'true') {
      platforms = getWebhookPlatforms();
    }

    res.json({
      success: true,
      count: platforms.length,
      platforms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/orchestration/platforms/categories
 * Get all platform categories
 */
router.get('/platforms/categories', (req, res) => {
  res.json({
    success: true,
    categories: Object.values(PLATFORM_CATEGORIES)
  });
});

/**
 * GET /api/orchestration/platforms/:slug
 * Get specific platform by slug
 */
router.get('/platforms/:slug', (req, res) => {
  try {
    const platform = getPlatformBySlug(req.params.slug);

    if (!platform) {
      return res.status(404).json({
        success: false,
        error: 'Platform not found'
      });
    }

    res.json({
      success: true,
      platform
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// AGENT ENDPOINTS
// ============================================================================

/**
 * GET /api/orchestration/agents
 * Get all registered agents
 */
router.get('/agents', (req, res) => {
  try {
    const agents = orchestration.getAgents();

    res.json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/orchestration/agents/:id
 * Get specific agent by ID
 */
router.get('/agents/:id', (req, res) => {
  try {
    const agent = orchestration.getAgent(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/orchestration/agents
 * Register a new agent
 */
router.post('/agents', (req, res) => {
  try {
    const { id, name, type, capabilities, maxConcurrentTasks } = req.body;

    if (!id || !name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Agent id, name, and type are required'
      });
    }

    const agent = orchestration.registerAgent({
      id,
      name,
      type,
      capabilities: capabilities || [],
      maxConcurrentTasks: maxConcurrentTasks || 3
    });

    res.status(201).json({
      success: true,
      agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// BATCH ENDPOINTS
// ============================================================================

/**
 * GET /api/orchestration/batches
 * Get all orchestration batches
 */
router.get('/batches', (req, res) => {
  try {
    const batches = orchestration.getAllBatches();

    res.json({
      success: true,
      count: batches.length,
      batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/orchestration/batches/:id
 * Get specific batch by ID
 */
router.get('/batches/:id', (req, res) => {
  try {
    const batch = orchestration.getBatchStatus(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    res.json({
      success: true,
      batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/orchestration/batches
 * Create a new orchestration batch
 */
router.post('/batches', async (req, res) => {
  try {
    const { platforms, name, type, config } = req.body;

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Platforms array is required'
      });
    }

    const batch = await orchestration.createBatch(platforms, {
      name: name || 'Trial Activation Batch',
      type: type || 'trial_activation',
      ...config
    });

    res.status(201).json({
      success: true,
      batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/orchestration/batches/:id/start
 * Start a specific batch
 */
router.post('/batches/:id/start', async (req, res) => {
  try {
    const result = await orchestration.startBatch(req.params.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// TASK ENDPOINTS
// ============================================================================

/**
 * GET /api/orchestration/tasks/:id
 * Get specific task by ID
 */
router.get('/tasks/:id', (req, res) => {
  try {
    const task = orchestration.getTaskStatus(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/orchestration/execute-task
 * Execute a single task (called by n8n workflow)
 */
router.post('/execute-task', async (req, res) => {
  try {
    const { taskId, platformSlug, automationSteps } = req.body;

    // This endpoint is called by the n8n workflow to execute individual tasks
    // In a real implementation, this would trigger browser automation or API calls

    const platform = getPlatformBySlug(platformSlug);

    if (!platform) {
      return res.status(404).json({
        success: false,
        taskId,
        platformSlug,
        error: 'Platform not found'
      });
    }

    // Simulate task execution
    const result = {
      taskId,
      platformSlug,
      platformName: platform.name,
      success: true,
      credentials: {
        accountCreated: true,
        apiKeyGenerated: true,
        integrationReady: true
      },
      completedSteps: automationSteps?.length || 0,
      completedAt: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      taskId: req.body.taskId,
      platformSlug: req.body.platformSlug,
      error: error.message
    });
  }
});

// ============================================================================
// QUICK START ENDPOINTS
// ============================================================================

/**
 * POST /api/orchestration/quick-start
 * Quick start - create and immediately execute a batch for all or selected platforms
 */
router.post('/quick-start', async (req, res) => {
  try {
    const { platforms, category } = req.body;

    let platformSlugs = platforms;

    // If no platforms specified, use all or filter by category
    if (!platformSlugs || platformSlugs.length === 0) {
      let allPlatforms = getAllPlatforms();

      if (category) {
        allPlatforms = getPlatformsByCategory(category);
      }

      platformSlugs = allPlatforms.map(p => p.slug);
    }

    const result = await orchestration.quickStart(platformSlugs);

    res.json({
      success: true,
      message: 'Orchestration started for all platforms',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/orchestration/start-all
 * Start all pending batches
 */
router.post('/start-all', async (req, res) => {
  try {
    const results = await orchestration.startAll();

    res.json({
      success: true,
      message: 'All pending batches started',
      results: results.map(r => ({
        status: r.status,
        batchId: r.value?.batch?.id,
        error: r.reason
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// METRICS ENDPOINTS
// ============================================================================

/**
 * GET /api/orchestration/metrics
 * Get orchestration metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = orchestration.getMetrics();

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/orchestration/status
 * Get overall orchestration status
 */
router.get('/status', (req, res) => {
  try {
    const agents = orchestration.getAgents();
    const batches = orchestration.getAllBatches();
    const metrics = orchestration.getMetrics();

    res.json({
      success: true,
      status: {
        agents: {
          total: agents.length,
          active: agents.filter(a => a.status === 'busy').length,
          idle: agents.filter(a => a.status === 'idle').length
        },
        batches: {
          total: batches.length,
          pending: batches.filter(b => b.status === 'pending').length,
          running: batches.filter(b => b.status === 'running').length,
          completed: batches.filter(b => b.status === 'completed' || b.status === 'completed_with_errors').length
        },
        metrics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// PREVIEW/PLAN ENDPOINTS
// ============================================================================

/**
 * POST /api/orchestration/preview
 * Preview what would happen for a batch without executing
 */
router.post('/preview', (req, res) => {
  try {
    const { platforms } = req.body;

    if (!platforms || !Array.isArray(platforms)) {
      return res.status(400).json({
        success: false,
        error: 'Platforms array is required'
      });
    }

    const batch = generateOrchestrationBatch(platforms);

    res.json({
      success: true,
      preview: batch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// EVENT STREAM (SSE) FOR REAL-TIME UPDATES
// ============================================================================

/**
 * GET /api/orchestration/events
 * Server-Sent Events stream for real-time orchestration updates
 */
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

  // Subscribe to orchestration events
  const handlers = {
    'agent:registered': (agent) => {
      res.write(`data: ${JSON.stringify({ type: 'agent:registered', agent })}\n\n`);
    },
    'batch:created': (batch) => {
      res.write(`data: ${JSON.stringify({ type: 'batch:created', batch })}\n\n`);
    },
    'batch:started': (batch) => {
      res.write(`data: ${JSON.stringify({ type: 'batch:started', batch })}\n\n`);
    },
    'batch:progress': (batch) => {
      res.write(`data: ${JSON.stringify({ type: 'batch:progress', batch })}\n\n`);
    },
    'batch:completed': (batch, results) => {
      res.write(`data: ${JSON.stringify({ type: 'batch:completed', batch, results })}\n\n`);
    },
    'task:created': (task) => {
      res.write(`data: ${JSON.stringify({ type: 'task:created', task })}\n\n`);
    },
    'task:started': (task, agent) => {
      res.write(`data: ${JSON.stringify({ type: 'task:started', task, agent: { id: agent.id, name: agent.name } })}\n\n`);
    },
    'task:step': (task, step, current, total) => {
      res.write(`data: ${JSON.stringify({ type: 'task:step', taskId: task.id, step, current, total, progress: task.progress })}\n\n`);
    },
    'task:completed': (task, result) => {
      res.write(`data: ${JSON.stringify({ type: 'task:completed', task, result })}\n\n`);
    },
    'task:failed': (task, error) => {
      res.write(`data: ${JSON.stringify({ type: 'task:failed', task, error: error.message })}\n\n`);
    },
    'task:retrying': (task, attempt) => {
      res.write(`data: ${JSON.stringify({ type: 'task:retrying', task, attempt })}\n\n`);
    }
  };

  // Attach all handlers
  for (const [event, handler] of Object.entries(handlers)) {
    orchestration.on(event, handler);
  }

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 30000);

  // Cleanup on close
  req.on('close', () => {
    clearInterval(heartbeat);
    for (const [event, handler] of Object.entries(handlers)) {
      orchestration.off(event, handler);
    }
  });
});

export { router as orchestrationRouter };
