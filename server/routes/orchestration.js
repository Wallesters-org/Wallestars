/**
 * Orchestration API Routes
 *
 * REST API endpoints for managing the AI agents orchestration farm.
 */

import express from 'express';
import { getAllPlatformConfigs, getPlatformsByType } from '../services/orchestration/adapters/index.js';

const router = express.Router();

// In-memory state for coordinator
let coordinatorState = {
    isRunning: false,
    activeTasks: [],
    pendingTasks: [],
    completedTasks: [],
    failedTasks: [],
    metrics: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageDuration: 0
    }
};

/**
 * Get orchestration status
 */
router.get('/status', (req, res) => {
    try {
        res.json({
            success: true,
            isRunning: coordinatorState.isRunning,
            ...coordinatorState
        });
    } catch (error) {
        console.error('[Orchestration API] Status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get available platforms
 */
router.get('/platforms', (req, res) => {
    try {
        const { type } = req.query;

        if (type) {
            const platforms = getPlatformsByType(type);
            return res.json({ success: true, platforms });
        }

        const allPlatforms = getAllPlatformConfigs();
        const platforms = Object.entries(allPlatforms).map(([name, config]) => ({
            name,
            ...config
        }));

        res.json({
            success: true,
            platforms,
            types: [...new Set(platforms.map(p => p.type))]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Start all platforms registration at once
 */
router.post('/start-all', async (req, res) => {
    try {
        const {
            platforms,
            userData,
            maxConcurrent = 5
        } = req.body;

        // Validate userData
        if (!userData?.email) {
            return res.status(400).json({
                success: false,
                error: 'userData.email is required'
            });
        }

        // Get platforms to register
        let platformsToRegister;
        if (platforms && platforms.length > 0) {
            platformsToRegister = platforms;
        } else {
            const allPlatforms = getAllPlatformConfigs();
            platformsToRegister = Object.keys(allPlatforms);
        }

        // Create tasks
        const tasks = platformsToRegister.map((platform, index) => ({
            id: `task_${Date.now()}_${index}`,
            platform: typeof platform === 'string' ? platform : platform.name,
            userData,
            status: 'pending',
            createdAt: new Date().toISOString()
        }));

        // Update state
        coordinatorState = {
            isRunning: true,
            activeTasks: [],
            pendingTasks: tasks,
            completedTasks: [],
            failedTasks: [],
            metrics: {
                totalTasks: tasks.length,
                completedTasks: 0,
                failedTasks: 0,
                averageDuration: 0
            }
        };

        // Emit via WebSocket if available
        if (global.io) {
            global.io.emit('orchestration:batch-started', {
                totalPlatforms: platformsToRegister.length,
                platforms: platformsToRegister
            });
        }

        // Trigger N8n workflow for batch processing
        const n8nUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1201204.hstgr.cloud';
        try {
            await fetch(`${n8nUrl}/webhook/orchestration-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    batchId: `batch_${Date.now()}`,
                    platforms: platformsToRegister,
                    userData,
                    maxConcurrent
                })
            });
        } catch (n8nError) {
            console.warn('[Orchestration API] N8n webhook call failed:', n8nError.message);
        }

        res.json({
            success: true,
            message: `Started registration for ${platformsToRegister.length} platforms`,
            batchId: `batch_${Date.now()}`,
            totalTasks: tasks.length,
            platforms: platformsToRegister,
            status: coordinatorState
        });

    } catch (error) {
        console.error('[Orchestration API] Start all error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Register a single platform
 */
router.post('/register-platform', async (req, res) => {
    try {
        const { platform, userData } = req.body;

        if (!platform) {
            return res.status(400).json({
                success: false,
                error: 'platform is required'
            });
        }

        if (!userData?.email) {
            return res.status(400).json({
                success: false,
                error: 'userData.email is required'
            });
        }

        const task = {
            id: `task_${Date.now()}`,
            platform,
            userData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        coordinatorState.pendingTasks.push(task);
        coordinatorState.metrics.totalTasks++;

        // Trigger N8n workflow
        const n8nUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1201204.hstgr.cloud';
        try {
            await fetch(`${n8nUrl}/webhook/platform-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: getAllPlatformConfigs()[platform] || { name: platform },
                    taskData: { ...userData, workspace_id: 'default' }
                })
            });
        } catch (n8nError) {
            console.warn('[Orchestration API] N8n webhook call failed:', n8nError.message);
        }

        // Emit via WebSocket
        if (global.io) {
            global.io.emit('orchestration:task-added', task);
        }

        res.json({
            success: true,
            message: `Added ${platform} to registration queue`,
            taskId: task.id,
            status: coordinatorState
        });

    } catch (error) {
        console.error('[Orchestration API] Register platform error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get task status
 */
router.get('/task/:taskId', (req, res) => {
    try {
        const { taskId } = req.params;

        // Search all task lists
        const allTasks = [
            ...coordinatorState.activeTasks,
            ...coordinatorState.pendingTasks,
            ...coordinatorState.completedTasks,
            ...coordinatorState.failedTasks
        ];

        const task = allTasks.find(t => t.id === taskId);

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
 * Cancel all pending tasks
 */
router.post('/cancel-all', (req, res) => {
    try {
        const cancelledCount = coordinatorState.pendingTasks.length;

        coordinatorState.failedTasks.push(
            ...coordinatorState.pendingTasks.map(t => ({
                ...t,
                status: 'cancelled',
                error: 'Cancelled by user'
            }))
        );
        coordinatorState.pendingTasks = [];
        coordinatorState.isRunning = false;

        // Emit via WebSocket
        if (global.io) {
            global.io.emit('orchestration:batch-cancelled', { cancelledCount });
        }

        res.json({
            success: true,
            message: `Cancelled ${cancelledCount} pending tasks`,
            status: coordinatorState
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get results
 */
router.get('/results', (req, res) => {
    try {
        const platformResults = {};

        for (const task of coordinatorState.completedTasks) {
            platformResults[task.platform] = {
                status: 'completed',
                result: task.result
            };
        }

        for (const task of coordinatorState.failedTasks) {
            platformResults[task.platform] = {
                status: 'failed',
                error: task.error
            };
        }

        res.json({
            success: true,
            summary: {
                total: coordinatorState.metrics.totalTasks,
                completed: coordinatorState.completedTasks.length,
                failed: coordinatorState.failedTasks.length,
                pending: coordinatorState.pendingTasks.length
            },
            platforms: platformResults
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Reset orchestration session
 */
router.post('/reset', (req, res) => {
    try {
        coordinatorState = {
            isRunning: false,
            activeTasks: [],
            pendingTasks: [],
            completedTasks: [],
            failedTasks: [],
            metrics: {
                totalTasks: 0,
                completedTasks: 0,
                failedTasks: 0,
                averageDuration: 0
            }
        };

        res.json({
            success: true,
            message: 'Orchestration session reset'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Handle registration status update (from N8n)
 */
router.post('/registration-status', (req, res) => {
    try {
        const statusUpdate = req.body;

        console.log('[Orchestration API] Registration status update:', statusUpdate);

        // Update task status
        const taskId = statusUpdate.sessionId || statusUpdate.taskId;
        const allLists = [coordinatorState.pendingTasks, coordinatorState.activeTasks];

        for (const list of allLists) {
            const task = list.find(t => t.id === taskId);
            if (task) {
                task.status = statusUpdate.status;
                task.lastUpdate = new Date().toISOString();
            }
        }

        // Emit to WebSocket
        if (global.io) {
            global.io.emit('orchestration:registration-status', statusUpdate);
        }

        res.json({ success: true, received: true });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Handle registration completion (from N8n)
 */
router.post('/registration-complete', (req, res) => {
    try {
        const completion = req.body;

        console.log('[Orchestration API] Registration complete:', completion);

        // Move task to completed
        const taskId = completion.sessionId || completion.taskId;
        const taskIndex = coordinatorState.activeTasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1) {
            const task = coordinatorState.activeTasks.splice(taskIndex, 1)[0];
            task.status = completion.status === 'completed' ? 'completed' : 'failed';
            task.result = completion;
            task.completedAt = new Date().toISOString();

            if (task.status === 'completed') {
                coordinatorState.completedTasks.push(task);
                coordinatorState.metrics.completedTasks++;
            } else {
                coordinatorState.failedTasks.push(task);
                coordinatorState.metrics.failedTasks++;
            }
        }

        // Emit to WebSocket
        if (global.io) {
            global.io.emit('orchestration:registration-complete', completion);
        }

        res.json({ success: true, received: true });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export const orchestrationRouter = router;
