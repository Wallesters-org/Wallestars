// server/routes/tasks.js
// Task Management API Routes
// Created: 2026-01-12

import express from 'express';
import { getTaskOrchestrator } from '../services/taskOrchestrator.js';

const router = express.Router();

/**
 * GET /api/tasks
 * Get all tasks
 */
router.get('/', async (req, res) => {
    try {
        const orchestrator = getTaskOrchestrator();
        const tasks = orchestrator.getAllTasks();
        
        res.json({
            success: true,
            tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('[Tasks API] Error fetching tasks:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks',
            details: error.message
        });
    }
});

/**
 * GET /api/tasks/status/:status
 * Get tasks by status
 */
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const orchestrator = getTaskOrchestrator();
        const tasks = orchestrator.getTasksByStatus(status.toUpperCase());
        
        res.json({
            success: true,
            status,
            tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('[Tasks API] Error fetching tasks by status:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks',
            details: error.message
        });
    }
});

/**
 * GET /api/tasks/priority/:priority
 * Get tasks by priority
 */
router.get('/priority/:priority', async (req, res) => {
    try {
        const { priority } = req.params;
        const orchestrator = getTaskOrchestrator();
        const tasks = orchestrator.getTasksByPriority(priority.toUpperCase());
        
        res.json({
            success: true,
            priority,
            tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('[Tasks API] Error fetching tasks by priority:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks',
            details: error.message
        });
    }
});

/**
 * GET /api/tasks/:taskId
 * Get specific task details
 */
router.get('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const orchestrator = getTaskOrchestrator();
        const task = orchestrator.tasks.get(taskId);
        
        if (!task) {
            return res.status(404).json({
                error: 'Task not found',
                taskId
            });
        }
        
        res.json({
            success: true,
            task
        });
    } catch (error) {
        console.error('[Tasks API] Error fetching task:', error);
        res.status(500).json({
            error: 'Failed to fetch task',
            details: error.message
        });
    }
});

/**
 * POST /api/tasks/:taskId/assign
 * Assign task to agent
 */
router.post('/:taskId/assign', async (req, res) => {
    try {
        const { taskId } = req.params;
        const orchestrator = getTaskOrchestrator();
        
        const task = await orchestrator.assignTask(taskId);
        
        if (!task) {
            return res.status(404).json({
                error: 'No available agent for task'
            });
        }
        
        res.json({
            success: true,
            message: `Task ${taskId} assigned to ${task.agent}`,
            task
        });
    } catch (error) {
        console.error('[Tasks API] Error assigning task:', error);
        res.status(500).json({
            error: 'Failed to assign task',
            details: error.message
        });
    }
});

/**
 * PUT /api/tasks/:taskId/progress
 * Update task progress
 */
router.put('/:taskId/progress', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { progress, status } = req.body;
        
        if (progress === undefined) {
            return res.status(400).json({
                error: 'Progress value is required'
            });
        }
        
        const orchestrator = getTaskOrchestrator();
        await orchestrator.updateTaskProgress(taskId, progress, status);
        
        const task = orchestrator.tasks.get(taskId);
        
        res.json({
            success: true,
            message: 'Task progress updated',
            task
        });
    } catch (error) {
        console.error('[Tasks API] Error updating progress:', error);
        res.status(500).json({
            error: 'Failed to update progress',
            details: error.message
        });
    }
});

/**
 * POST /api/tasks/:taskId/fail
 * Mark task as failed
 */
router.post('/:taskId/fail', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({
                error: 'Failure reason is required'
            });
        }
        
        const orchestrator = getTaskOrchestrator();
        await orchestrator.failTask(taskId, reason);
        
        const task = orchestrator.tasks.get(taskId);
        
        res.json({
            success: true,
            message: 'Task marked as failed',
            task
        });
    } catch (error) {
        console.error('[Tasks API] Error failing task:', error);
        res.status(500).json({
            error: 'Failed to mark task as failed',
            details: error.message
        });
    }
});

/**
 * GET /api/tasks/queue/next
 * Process next task in queue
 */
router.post('/queue/next', async (req, res) => {
    try {
        const orchestrator = getTaskOrchestrator();
        const task = await orchestrator.processNextTask();
        
        if (!task) {
            return res.json({
                success: true,
                message: 'No tasks in queue',
                task: null
            });
        }
        
        res.json({
            success: true,
            message: 'Next task assigned',
            task
        });
    } catch (error) {
        console.error('[Tasks API] Error processing next task:', error);
        res.status(500).json({
            error: 'Failed to process next task',
            details: error.message
        });
    }
});

/**
 * GET /api/tasks/metrics
 * Get orchestration metrics
 */
router.get('/api/metrics', async (req, res) => {
    try {
        const orchestrator = getTaskOrchestrator();
        const metrics = orchestrator.getMetrics();
        
        res.json({
            success: true,
            metrics
        });
    } catch (error) {
        console.error('[Tasks API] Error fetching metrics:', error);
        res.status(500).json({
            error: 'Failed to fetch metrics',
            details: error.message
        });
    }
});

/**
 * GET /api/tasks/report/delegation
 * Get delegation report
 */
router.get('/report/delegation', async (req, res) => {
    try {
        const orchestrator = getTaskOrchestrator();
        const report = orchestrator.getDelegationReport();
        
        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('[Tasks API] Error generating report:', error);
        res.status(500).json({
            error: 'Failed to generate report',
            details: error.message
        });
    }
});

export default router;
