import { Router } from 'express';
import { orchestrationManager } from '../orchestration/OrchestrationManager.js';

const router = Router();

// Get orchestration status
router.get('/status', (req, res) => {
  try {
    const status = orchestrationManager.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Register a new agent
router.post('/agents/register', (req, res) => {
  try {
    const { agentId, platform, capabilities } = req.body;
    
    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'agentId is required'
      });
    }

    const agent = orchestrationManager.registerAgent(agentId, {
      platform,
      capabilities
    });

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

// Unregister an agent
router.post('/agents/:agentId/unregister', (req, res) => {
  try {
    const { agentId } = req.params;
    orchestrationManager.unregisterAgent(agentId);
    
    res.json({
      success: true,
      message: `Agent ${agentId} unregistered`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get agent statistics
router.get('/agents/:agentId/stats', (req, res) => {
  try {
    const { agentId } = req.params;
    const stats = orchestrationManager.getAgentStats(agentId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit a new task
router.post('/tasks/submit', async (req, res) => {
  try {
    const { type, platform, priority, data, timeout, maxRetries } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'type is required'
      });
    }

    const result = await orchestrationManager.submitTask({
      type,
      platform,
      priority,
      data,
      timeout,
      maxRetries
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel a task
router.post('/tasks/:taskId/cancel', (req, res) => {
  try {
    const { taskId } = req.params;
    const cancelled = orchestrationManager.cancelTask(taskId);
    
    if (!cancelled) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: `Task ${taskId} cancelled`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update max concurrent tasks
router.post('/config/max-concurrent', (req, res) => {
  try {
    const { maxConcurrent } = req.body;
    
    if (typeof maxConcurrent !== 'number' || maxConcurrent < 1) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be a positive number'
      });
    }

    orchestrationManager.setMaxConcurrentTasks(maxConcurrent);
    
    res.json({
      success: true,
      maxConcurrent: orchestrationManager.maxConcurrentTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear task history
router.post('/history/clear', (req, res) => {
  try {
    orchestrationManager.clearHistory();
    
    res.json({
      success: true,
      message: 'History cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as orchestrationRouter };
