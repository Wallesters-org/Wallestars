// server/routes/agents.js
// Agent Management API Routes
// Created: 2026-01-12

import express from 'express';
import { getTaskOrchestrator } from '../services/taskOrchestrator.js';

const router = express.Router();

/**
 * GET /api/agents
 * Get all agents
 */
router.get('/', async (req, res) => {
    try {
        const orchestrator = getTaskOrchestrator();
        const agents = orchestrator.getAllAgents();
        
        res.json({
            success: true,
            agents,
            count: agents.length
        });
    } catch (error) {
        console.error('[Agents API] Error fetching agents:', error);
        res.status(500).json({
            error: 'Failed to fetch agents',
            details: error.message
        });
    }
});

/**
 * GET /api/agents/:agentId
 * Get specific agent status
 */
router.get('/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const orchestrator = getTaskOrchestrator();
        const agent = orchestrator.getAgentStatus(agentId);
        
        if (!agent) {
            return res.status(404).json({
                error: 'Agent not found',
                agentId
            });
        }
        
        res.json({
            success: true,
            agent
        });
    } catch (error) {
        console.error('[Agents API] Error fetching agent:', error);
        res.status(500).json({
            error: 'Failed to fetch agent',
            details: error.message
        });
    }
});

/**
 * PUT /api/agents/:agentId/status
 * Update agent status
 */
router.put('/:agentId/status', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                error: 'Status is required'
            });
        }
        
        const orchestrator = getTaskOrchestrator();
        const agent = orchestrator.agents.get(agentId);
        
        if (!agent) {
            return res.status(404).json({
                error: 'Agent not found',
                agentId
            });
        }
        
        agent.status = status;
        orchestrator.updateMetrics();
        
        res.json({
            success: true,
            message: 'Agent status updated',
            agent
        });
    } catch (error) {
        console.error('[Agents API] Error updating agent status:', error);
        res.status(500).json({
            error: 'Failed to update agent status',
            details: error.message
        });
    }
});

/**
 * GET /api/agents/:agentId/tasks
 * Get agent's current tasks
 */
router.get('/:agentId/tasks', async (req, res) => {
    try {
        const { agentId } = req.params;
        const orchestrator = getTaskOrchestrator();
        const agent = orchestrator.agents.get(agentId);
        
        if (!agent) {
            return res.status(404).json({
                error: 'Agent not found',
                agentId
            });
        }
        
        const tasks = agent.currentTasks.map(taskId => 
            orchestrator.tasks.get(taskId)
        ).filter(Boolean);
        
        res.json({
            success: true,
            agentId,
            tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('[Agents API] Error fetching agent tasks:', error);
        res.status(500).json({
            error: 'Failed to fetch agent tasks',
            details: error.message
        });
    }
});

export default router;
