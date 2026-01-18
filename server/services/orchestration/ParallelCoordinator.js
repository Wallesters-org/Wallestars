/**
 * Parallel Coordinator
 *
 * Coordinates multiple AI agents working simultaneously on different platforms.
 * Handles parallel execution, rate limiting, and resource management.
 */

const EventEmitter = require('events');
const { createAdapter, getPlatformConfig } = require('./adapters');

class ParallelCoordinator extends EventEmitter {
    constructor(options = {}) {
        super();

        // Configuration
        this.maxConcurrent = options.maxConcurrent || 5;
        this.taskTimeout = options.taskTimeout || 300000; // 5 minutes
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 5000;

        // State
        this.activeTasks = new Map();
        this.pendingTasks = [];
        this.completedTasks = [];
        this.failedTasks = [];

        // Resource pools
        this.browserSessions = new Map();
        this.agentAssignments = new Map();

        // Metrics
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageDuration: 0,
            concurrentPeak: 0
        };

        // Callbacks
        this.onProgress = options.onProgress || (() => {});
        this.onTaskComplete = options.onTaskComplete || (() => {});
        this.onTaskFailed = options.onTaskFailed || (() => {});
        this.onAllComplete = options.onAllComplete || (() => {});
    }

    /**
     * Start all platforms at once
     */
    async startAll(platforms, userData = {}) {
        this.emit('batchStart', { platformCount: platforms.length });

        const tasks = platforms.map(platform => ({
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            platform: typeof platform === 'string' ? platform : platform.name,
            platformConfig: typeof platform === 'object' ? platform : getPlatformConfig(platform),
            userData,
            status: 'pending',
            retries: 0,
            createdAt: new Date().toISOString()
        }));

        this.metrics.totalTasks = tasks.length;
        this.pendingTasks = [...tasks];

        // Start processing
        await this.processQueue();

        return {
            batchId: `batch_${Date.now()}`,
            totalTasks: tasks.length,
            tasks: tasks.map(t => ({ id: t.id, platform: t.platform }))
        };
    }

    /**
     * Process task queue with parallel execution
     */
    async processQueue() {
        while (this.pendingTasks.length > 0 || this.activeTasks.size > 0) {
            // Fill up to max concurrent
            while (this.pendingTasks.length > 0 && this.activeTasks.size < this.maxConcurrent) {
                const task = this.pendingTasks.shift();
                this.executeTask(task);
            }

            // Update concurrent peak metric
            if (this.activeTasks.size > this.metrics.concurrentPeak) {
                this.metrics.concurrentPeak = this.activeTasks.size;
            }

            // Wait a bit before checking again
            await this.sleep(100);
        }

        // All tasks complete
        this.emit('batchComplete', {
            completed: this.completedTasks.length,
            failed: this.failedTasks.length,
            metrics: this.metrics
        });

        this.onAllComplete({
            completedTasks: this.completedTasks,
            failedTasks: this.failedTasks,
            metrics: this.metrics
        });
    }

    /**
     * Execute a single task
     */
    async executeTask(task) {
        task.status = 'running';
        task.startedAt = new Date().toISOString();
        this.activeTasks.set(task.id, task);

        this.emit('taskStart', { taskId: task.id, platform: task.platform });

        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Task timeout')), this.taskTimeout);
            });

            // Execute with timeout
            const result = await Promise.race([
                this.runPlatformTask(task),
                timeoutPromise
            ]);

            // Success
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            task.result = result;
            task.duration = new Date(task.completedAt) - new Date(task.startedAt);

            this.completedTasks.push(task);
            this.metrics.completedTasks++;
            this.updateAverageDuration(task.duration);

            this.emit('taskComplete', { taskId: task.id, platform: task.platform, result });
            this.onTaskComplete(task);

        } catch (error) {
            // Handle failure
            task.status = 'failed';
            task.error = error.message;

            // Retry logic
            if (task.retries < this.retryAttempts) {
                task.retries++;
                task.status = 'pending';
                this.pendingTasks.push(task);

                this.emit('taskRetry', {
                    taskId: task.id,
                    platform: task.platform,
                    attempt: task.retries
                });

                await this.sleep(this.retryDelay * task.retries);
            } else {
                task.completedAt = new Date().toISOString();
                this.failedTasks.push(task);
                this.metrics.failedTasks++;

                this.emit('taskFailed', { taskId: task.id, platform: task.platform, error: error.message });
                this.onTaskFailed(task);
            }
        } finally {
            this.activeTasks.delete(task.id);
        }
    }

    /**
     * Run platform-specific task
     */
    async runPlatformTask(task) {
        const { platform, platformConfig, userData } = task;

        // Create adapter
        const adapter = createAdapter(platform, {
            ...platformConfig,
            onProgress: (progress) => {
                this.emit('taskProgress', {
                    taskId: task.id,
                    ...progress
                });
                this.onProgress({ taskId: task.id, ...progress });
            }
        });

        // Initialize adapter
        await adapter.initialize();

        // Register
        const registrationResult = await adapter.register(userData);

        // If verification needed, we return partial result
        if (registrationResult.status === 'awaiting_verification') {
            return {
                status: 'awaiting_verification',
                platform,
                ...registrationResult,
                needsAction: true,
                actionType: registrationResult.verificationType
            };
        }

        // Complete setup
        await adapter.setup();

        // Get credentials
        const credentials = await adapter.getCredentials();

        // Test integration
        const testResult = await adapter.testIntegration();

        return {
            status: 'completed',
            platform,
            credentials,
            testResult,
            registeredAt: new Date().toISOString()
        };
    }

    /**
     * Add platform to running batch
     */
    addPlatform(platform, userData = {}) {
        const task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            platform: typeof platform === 'string' ? platform : platform.name,
            platformConfig: typeof platform === 'object' ? platform : getPlatformConfig(platform),
            userData,
            status: 'pending',
            retries: 0,
            createdAt: new Date().toISOString()
        };

        this.pendingTasks.push(task);
        this.metrics.totalTasks++;

        this.emit('taskAdded', { taskId: task.id, platform: task.platform });

        return task.id;
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isRunning: this.activeTasks.size > 0 || this.pendingTasks.length > 0,
            activeTasks: Array.from(this.activeTasks.values()).map(t => ({
                id: t.id,
                platform: t.platform,
                status: t.status,
                startedAt: t.startedAt
            })),
            pendingCount: this.pendingTasks.length,
            completedCount: this.completedTasks.length,
            failedCount: this.failedTasks.length,
            metrics: this.metrics
        };
    }

    /**
     * Get task by ID
     */
    getTask(taskId) {
        // Check active tasks
        if (this.activeTasks.has(taskId)) {
            return this.activeTasks.get(taskId);
        }

        // Check pending
        const pending = this.pendingTasks.find(t => t.id === taskId);
        if (pending) return pending;

        // Check completed
        const completed = this.completedTasks.find(t => t.id === taskId);
        if (completed) return completed;

        // Check failed
        const failed = this.failedTasks.find(t => t.id === taskId);
        if (failed) return failed;

        return null;
    }

    /**
     * Cancel a task
     */
    cancelTask(taskId) {
        // Remove from pending
        const pendingIndex = this.pendingTasks.findIndex(t => t.id === taskId);
        if (pendingIndex !== -1) {
            const task = this.pendingTasks.splice(pendingIndex, 1)[0];
            task.status = 'cancelled';
            this.failedTasks.push(task);
            return true;
        }

        // Can't cancel running tasks directly
        if (this.activeTasks.has(taskId)) {
            // Mark for cancellation
            this.activeTasks.get(taskId).shouldCancel = true;
            return true;
        }

        return false;
    }

    /**
     * Cancel all pending tasks
     */
    cancelAll() {
        const cancelled = this.pendingTasks.map(t => {
            t.status = 'cancelled';
            return t;
        });

        this.failedTasks.push(...cancelled);
        this.pendingTasks = [];

        // Mark all active for cancellation
        for (const [id, task] of this.activeTasks) {
            task.shouldCancel = true;
        }

        this.emit('batchCancelled', { cancelled: cancelled.length });

        return cancelled.length;
    }

    /**
     * Get results summary
     */
    getResults() {
        const platformResults = {};

        for (const task of this.completedTasks) {
            platformResults[task.platform] = {
                status: 'completed',
                result: task.result,
                duration: task.duration
            };
        }

        for (const task of this.failedTasks) {
            platformResults[task.platform] = {
                status: 'failed',
                error: task.error,
                retries: task.retries
            };
        }

        return {
            summary: {
                total: this.metrics.totalTasks,
                completed: this.metrics.completedTasks,
                failed: this.metrics.failedTasks,
                successRate: this.metrics.totalTasks > 0
                    ? (this.metrics.completedTasks / this.metrics.totalTasks * 100).toFixed(2) + '%'
                    : 'N/A',
                averageDuration: `${Math.round(this.metrics.averageDuration / 1000)}s`
            },
            platforms: platformResults
        };
    }

    /**
     * Reset coordinator state
     */
    reset() {
        this.activeTasks.clear();
        this.pendingTasks = [];
        this.completedTasks = [];
        this.failedTasks = [];
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageDuration: 0,
            concurrentPeak: 0
        };
    }

    // Utility methods
    updateAverageDuration(newDuration) {
        const n = this.metrics.completedTasks;
        const currentAvg = this.metrics.averageDuration;
        this.metrics.averageDuration = currentAvg + (newDuration - currentAvg) / n;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Create pre-configured coordinator for common scenarios
 */
function createCoordinator(scenario = 'default', options = {}) {
    const scenarios = {
        'default': { maxConcurrent: 5, taskTimeout: 300000 },
        'aggressive': { maxConcurrent: 10, taskTimeout: 180000 },
        'conservative': { maxConcurrent: 2, taskTimeout: 600000 },
        'single': { maxConcurrent: 1, taskTimeout: 600000 }
    };

    return new ParallelCoordinator({
        ...scenarios[scenario] || scenarios['default'],
        ...options
    });
}

module.exports = {
    ParallelCoordinator,
    createCoordinator
};
