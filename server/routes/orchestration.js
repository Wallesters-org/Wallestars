/**
 * AI Agent Orchestration Farm API Routes
 * Endpoints for managing the multi-agent orchestration system
 */

import express from 'express';
import { getFarmManager, WORKFLOW_TEMPLATES } from '../orchestration/farm-manager.js';
import {
  getAllPlatforms,
  getConfiguredPlatforms,
  getUnconfiguredPlatforms,
  getPlatform,
  getPlatformsByCapability
} from '../orchestration/platforms-registry.js';

const router = express.Router();

// Get or create farm manager instance
let farmManager = null;
const getFarm = () => {
  if (!farmManager) {
    farmManager = getFarmManager();
  }
  return farmManager;
};

/**
 * @route POST /api/orchestration/initialize
 * @desc Initialize the AI agent farm with all configured platforms
 */
router.post('/initialize', async (req, res) => {
  try {
    const farm = getFarm();
    const result = await farm.initialize();

    res.json({
      success: true,
      message: 'AI Agent Orchestration Farm initialized',
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
 * @route GET /api/orchestration/status
 * @desc Get current farm status including all agents
 */
router.get('/status', (req, res) => {
  try {
    const farm = getFarm();
    const status = farm.getStatus();

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/orchestration/platforms
 * @desc Get all available AI platforms (configured and unconfigured)
 */
router.get('/platforms', (req, res) => {
  try {
    const allPlatforms = getAllPlatforms();
    const configured = getConfiguredPlatforms();
    const unconfigured = getUnconfiguredPlatforms();

    res.json({
      success: true,
      total: allPlatforms.length,
      configured: configured.map(p => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        capabilities: p.capabilities,
        models: p.models,
        rateLimit: p.rateLimit
      })),
      available: unconfigured.map(p => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        trialCredits: p.trialCredits,
        signupUrl: p.signupUrl,
        capabilities: p.capabilities,
        setupInstructions: p.setupInstructions
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/orchestration/platforms/:id
 * @desc Get details for a specific platform
 */
router.get('/platforms/:id', (req, res) => {
  try {
    const platform = getPlatform(req.params.id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        error: `Platform not found: ${req.params.id}`
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

/**
 * @route GET /api/orchestration/platforms/capability/:capability
 * @desc Get platforms by capability (chat, code, vision, etc.)
 */
router.get('/platforms/capability/:capability', (req, res) => {
  try {
    const platforms = getPlatformsByCapability(req.params.capability);

    res.json({
      success: true,
      capability: req.params.capability,
      platforms: platforms.map(p => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        configured: getConfiguredPlatforms().some(c => c.id === p.id)
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/orchestration/setup-guide
 * @desc Get setup instructions for all unconfigured platforms
 */
router.get('/setup-guide', (req, res) => {
  try {
    const farm = getFarm();
    const guide = farm.getSetupGuide();

    res.json({
      success: true,
      platformsNeedingSetup: guide.length,
      platforms: guide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/orchestration/env-template
 * @desc Generate .env template for all platforms
 */
router.get('/env-template', (req, res) => {
  try {
    const farm = getFarm();
    const template = farm.generateEnvTemplate();

    if (req.query.download === 'true') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=".env.ai-farm"');
    }

    res.send(template);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/orchestration/execute
 * @desc Execute a single task using the farm
 */
router.post('/execute', async (req, res) => {
  try {
    const { prompt, systemPrompt, preferredPlatform, maxTokens } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const farm = getFarm();

    if (!farm.isInitialized) {
      await farm.initialize();
    }

    const taskId = farm.orchestrator.submitTask({
      prompt,
      systemPrompt,
      preferredPlatform,
      maxTokens: maxTokens || 4096
    });

    res.json({
      success: true,
      message: 'Task submitted to orchestration farm',
      taskId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/orchestration/execute-all
 * @desc Execute a task on ALL agents simultaneously
 */
router.post('/execute-all', async (req, res) => {
  try {
    const { prompt, systemPrompt, maxTokens } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const farm = getFarm();

    if (!farm.isInitialized) {
      await farm.initialize();
    }

    const results = await farm.getDiverseResponses(prompt, {
      systemPrompt,
      maxTokens: maxTokens || 4096
    });

    res.json({
      success: true,
      message: 'Task executed on all agents',
      ...results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/orchestration/workflow/:workflowId
 * @desc Execute a predefined workflow template
 */
router.post('/workflow/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const farm = getFarm();

    if (!farm.isInitialized) {
      await farm.initialize();
    }

    const results = await farm.executeWorkflow(workflowId, prompt, options);

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/orchestration/workflows
 * @desc Get all available workflow templates
 */
router.get('/workflows', (req, res) => {
  try {
    const workflows = Object.entries(WORKFLOW_TEMPLATES).map(([key, value]) => ({
      id: key.toLowerCase(),
      ...value
    }));

    res.json({
      success: true,
      workflows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/orchestration/parallel
 * @desc Execute multiple different tasks in parallel
 */
router.post('/parallel', async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tasks array is required'
      });
    }

    const farm = getFarm();

    if (!farm.isInitialized) {
      await farm.initialize();
    }

    const results = await farm.executeParallel(tasks);

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/orchestration/smart-execute
 * @desc Smart routing - picks best agent for capabilities
 */
router.post('/smart-execute', async (req, res) => {
  try {
    const { prompt, capabilities } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const farm = getFarm();

    if (!farm.isInitialized) {
      await farm.initialize();
    }

    const taskId = await farm.smartExecute(prompt, capabilities || []);

    res.json({
      success: true,
      message: 'Task routed to best available agent',
      taskId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/orchestration/metrics
 * @desc Get farm metrics and statistics
 */
router.get('/metrics', (req, res) => {
  try {
    const farm = getFarm();
    const metrics = farm.orchestrator.getMetrics();

    res.json({
      success: true,
      ...metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/orchestration/stop
 * @desc Stop the orchestration farm
 */
router.post('/stop', (req, res) => {
  try {
    const farm = getFarm();
    const result = farm.stop();

    res.json({
      success: true,
      message: 'Orchestration farm stopped',
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
 * @route POST /api/orchestration/add-agent/:platformId
 * @desc Add a new agent for a specific platform
 */
router.post('/add-agent/:platformId', async (req, res) => {
  try {
    const farm = getFarm();
    const result = await farm.orchestrator.addAgent(req.params.platformId);

    res.json({
      success: result.success,
      message: result.success ? 'Agent added successfully' : 'Failed to add agent',
      agentId: result.agentId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/orchestration/agent/:agentId
 * @desc Remove an agent from the farm
 */
router.delete('/agent/:agentId', (req, res) => {
  try {
    const farm = getFarm();
    const removed = farm.orchestrator.removeAgent(req.params.agentId);

    res.json({
      success: removed,
      message: removed ? 'Agent removed' : 'Agent not found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
