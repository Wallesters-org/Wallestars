import express from 'express';
import {
  getAllAgents,
  getAvailableAgents,
  getAgentStatus,
  getActiveAssignments,
  getCompletedAssignments,
  completeAssignment
} from '../services/agentDelegation.js';

const router = express.Router();

/**
 * Get all registered agents
 */
router.get('/agents', (req, res) => {
  try {
    const agents = getAllAgents();
    res.json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

/**
 * Get available agents (not busy)
 */
router.get('/agents/available', (req, res) => {
  try {
    const agents = getAvailableAgents();
    res.json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    console.error('Error fetching available agents:', error);
    res.status(500).json({ error: 'Failed to fetch available agents' });
  }
});

/**
 * Get specific agent status
 */
router.get('/agents/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = getAgentStatus(agentId);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    console.error('Error fetching agent status:', error);
    res.status(500).json({ error: 'Failed to fetch agent status' });
  }
});

/**
 * Get active assignments
 */
router.get('/assignments/active', (req, res) => {
  try {
    const assignments = getActiveAssignments();
    res.json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Error fetching active assignments:', error);
    res.status(500).json({ error: 'Failed to fetch active assignments' });
  }
});

/**
 * Get completed assignments
 */
router.get('/assignments/completed', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const assignments = getCompletedAssignments(limit);
    res.json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Error fetching completed assignments:', error);
    res.status(500).json({ error: 'Failed to fetch completed assignments' });
  }
});

/**
 * Mark assignment as complete
 */
router.post('/assignments/:assignmentId/complete', (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = completeAssignment(assignmentId);

    // Emit completion event to WebSocket clients
    if (global.io) {
      global.io.emit('n8n:agent-assignment-complete', assignment);
    }

    res.json({
      success: true,
      message: 'Assignment marked as complete',
      assignment
    });
  } catch (error) {
    console.error('Error completing assignment:', error);
    res.status(500).json({ 
      error: 'Failed to complete assignment',
      message: error.message 
    });
  }
});

/**
 * Get delegation dashboard summary
 */
router.get('/dashboard', (req, res) => {
  try {
    const allAgents = getAllAgents();
    const availableAgents = getAvailableAgents();
    const activeAssignments = getActiveAssignments();
    const completedAssignments = getCompletedAssignments(5);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalAgents: allAgents.length,
        availableAgents: availableAgents.length,
        busyAgents: allAgents.length - availableAgents.length,
        activeAssignments: activeAssignments.length,
        recentCompletions: completedAssignments.length
      },
      agents: allAgents,
      activeAssignments,
      recentCompletions: completedAssignments
    });
  } catch (error) {
    console.error('Error fetching delegation dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * Test endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Agent Delegation API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      agents: 'GET /api/agents',
      availableAgents: 'GET /api/agents/available',
      agentStatus: 'GET /api/agents/:agentId',
      activeAssignments: 'GET /api/agents/assignments/active',
      completedAssignments: 'GET /api/agents/assignments/completed',
      completeAssignment: 'POST /api/agents/assignments/:assignmentId/complete',
      dashboard: 'GET /api/agents/dashboard'
    }
  });
});

export const agentDelegationRouter = router;
