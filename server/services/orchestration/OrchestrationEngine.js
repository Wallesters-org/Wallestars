/**
 * AI Agents Orchestration Engine
 *
 * Core engine for coordinating multiple AI agents to automate
 * free trial platform registration and management.
 */

const EventEmitter = require('events');
const { createClient } = require('@supabase/supabase-js');

class OrchestrationEngine extends EventEmitter {
    constructor(options = {}) {
        super();

        this.supabase = options.supabase || createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        this.agents = new Map();
        this.activeTasks = new Map();
        this.taskQueue = [];
        this.isRunning = false;

        // Configuration
        this.config = {
            maxConcurrentTasks: options.maxConcurrentTasks || 10,
            taskPollingInterval: options.taskPollingInterval || 5000,
            agentHeartbeatInterval: options.agentHeartbeatInterval || 30000,
            retryDelayMs: options.retryDelayMs || 5000,
            maxRetries: options.maxRetries || 3
        };

        // Metrics
        this.metrics = {
            tasksProcessed: 0,
            tasksSucceeded: 0,
            tasksFailed: 0,
            averageTaskDuration: 0,
            activeAgents: 0
        };
    }

    /**
     * Initialize the orchestration engine
     */
    async initialize() {
        console.log('[OrchestrationEngine] Initializing...');

        // Load agents from database
        await this.loadAgents();

        // Start heartbeat monitoring
        this.heartbeatInterval = setInterval(
            () => this.checkAgentHeartbeats(),
            this.config.agentHeartbeatInterval
        );

        // Start task processor
        this.startTaskProcessor();

        this.emit('initialized', { agentCount: this.agents.size });
        console.log(`[OrchestrationEngine] Initialized with ${this.agents.size} agents`);

        return this;
    }

    /**
     * Load agents from database
     */
    async loadAgents() {
        const { data: agents, error } = await this.supabase
            .from('orchestration_agents')
            .select('*');

        if (error) {
            console.error('[OrchestrationEngine] Error loading agents:', error);
            throw error;
        }

        agents.forEach(agent => {
            this.agents.set(agent.id, {
                ...agent,
                lastActivity: new Date()
            });
        });

        this.metrics.activeAgents = agents.filter(a => a.status !== 'offline').length;
    }

    /**
     * Register a new agent
     */
    async registerAgent(agentConfig) {
        const { data: agent, error } = await this.supabase
            .from('orchestration_agents')
            .upsert({
                agent_name: agentConfig.name,
                agent_type: agentConfig.type,
                skills: agentConfig.skills || [],
                supported_platforms: agentConfig.supportedPlatforms || [],
                max_concurrent_tasks: agentConfig.maxConcurrentTasks || 5,
                endpoint_url: agentConfig.endpointUrl,
                status: 'idle',
                last_heartbeat_at: new Date().toISOString()
            }, { onConflict: 'agent_name' })
            .select()
            .single();

        if (error) throw error;

        this.agents.set(agent.id, { ...agent, lastActivity: new Date() });
        this.emit('agentRegistered', agent);

        await this.logEvent('agent_registered', 'system', { agent }, 'info', agent.id);

        return agent;
    }

    /**
     * Start the task processor loop
     */
    startTaskProcessor() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.processTasksLoop();

        console.log('[OrchestrationEngine] Task processor started');
    }

    /**
     * Task processing loop
     */
    async processTasksLoop() {
        while (this.isRunning) {
            try {
                await this.processPendingTasks();
            } catch (error) {
                console.error('[OrchestrationEngine] Task processing error:', error);
            }

            await this.sleep(this.config.taskPollingInterval);
        }
    }

    /**
     * Process pending tasks from the queue
     */
    async processPendingTasks() {
        // Get pending tasks
        const { data: pendingTasks, error } = await this.supabase
            .from('orchestration_tasks')
            .select('*')
            .in('status', ['pending', 'queued'])
            .order('priority', { ascending: true })
            .order('created_at', { ascending: true })
            .limit(this.config.maxConcurrentTasks - this.activeTasks.size);

        if (error) {
            console.error('[OrchestrationEngine] Error fetching tasks:', error);
            return;
        }

        for (const task of pendingTasks) {
            if (this.activeTasks.size >= this.config.maxConcurrentTasks) break;

            await this.assignAndExecuteTask(task);
        }
    }

    /**
     * Assign task to best available agent and execute
     */
    async assignAndExecuteTask(task) {
        // Find best agent
        const agent = await this.findBestAgent(task);

        if (!agent) {
            console.log(`[OrchestrationEngine] No available agent for task ${task.id}`);
            return;
        }

        // Assign task
        await this.supabase
            .from('orchestration_tasks')
            .update({
                agent_id: agent.id,
                status: 'running',
                started_at: new Date().toISOString()
            })
            .eq('id', task.id);

        // Track active task
        this.activeTasks.set(task.id, {
            task,
            agent,
            startTime: Date.now()
        });

        // Execute task asynchronously
        this.executeTask(task, agent).catch(error => {
            console.error(`[OrchestrationEngine] Task ${task.id} execution error:`, error);
        });

        this.emit('taskAssigned', { task, agent });
    }

    /**
     * Find the best available agent for a task
     */
    async findBestAgent(task) {
        const availableAgents = [];

        for (const [id, agent] of this.agents) {
            if (agent.status === 'offline') continue;
            if (agent.current_task_count >= agent.max_concurrent_tasks) continue;

            // Check if agent supports the platform
            if (task.platform_id) {
                const supportsPlatform =
                    agent.supported_platforms.length === 0 ||
                    agent.supported_platforms.includes(task.platform_id);
                if (!supportsPlatform) continue;
            }

            // Check if agent has required skills
            const requiredSkills = task.task_data?.required_skills || [];
            const hasSkills = requiredSkills.every(skill =>
                agent.skills.includes(skill)
            );
            if (!hasSkills) continue;

            availableAgents.push(agent);
        }

        if (availableAgents.length === 0) return null;

        // Sort by: task count (asc), success rate (desc), health score (desc)
        availableAgents.sort((a, b) => {
            if (a.current_task_count !== b.current_task_count) {
                return a.current_task_count - b.current_task_count;
            }
            if (a.success_rate !== b.success_rate) {
                return b.success_rate - a.success_rate;
            }
            return b.health_score - a.health_score;
        });

        return availableAgents[0];
    }

    /**
     * Execute a task
     */
    async executeTask(task, agent) {
        const startTime = Date.now();
        let result = null;
        let error = null;

        try {
            // Update agent status
            await this.updateAgentStatus(agent.id, {
                current_task_count: agent.current_task_count + 1,
                status: agent.current_task_count + 1 >= agent.max_concurrent_tasks ? 'busy' : agent.status
            });

            // Execute based on task type
            switch (task.task_type) {
                case 'platform_registration':
                    result = await this.executePlatformRegistration(task, agent);
                    break;
                case 'platform_setup':
                    result = await this.executePlatformSetup(task, agent);
                    break;
                case 'integration_test':
                    result = await this.executeIntegrationTest(task, agent);
                    break;
                case 'health_check':
                    result = await this.executeHealthCheck(task, agent);
                    break;
                default:
                    result = await this.executeGenericTask(task, agent);
            }

            // Mark task as completed
            await this.completeTask(task.id, 'completed', result);
            this.metrics.tasksSucceeded++;

        } catch (err) {
            error = err;
            console.error(`[OrchestrationEngine] Task ${task.id} failed:`, err);

            // Handle retry
            if (task.retry_count < task.max_retries) {
                await this.retryTask(task);
            } else {
                await this.completeTask(task.id, 'failed', null, err.message);
                this.metrics.tasksFailed++;
            }
        } finally {
            // Update metrics
            const duration = Date.now() - startTime;
            this.metrics.tasksProcessed++;
            this.updateAverageTaskDuration(duration);

            // Release agent capacity
            await this.updateAgentStatus(agent.id, {
                current_task_count: Math.max(0, agent.current_task_count - 1),
                status: 'idle',
                total_tasks_completed: agent.total_tasks_completed + (error ? 0 : 1),
                total_tasks_failed: agent.total_tasks_failed + (error ? 1 : 0)
            });

            // Remove from active tasks
            this.activeTasks.delete(task.id);

            // Update batch if applicable
            if (task.batch_id) {
                await this.updateBatchProgress(task.batch_id);
            }

            this.emit('taskCompleted', {
                task,
                agent,
                result,
                error,
                duration
            });
        }
    }

    /**
     * Execute platform registration task
     */
    async executePlatformRegistration(task, agent) {
        const platformId = task.platform_id;

        // Get platform details
        const { data: platform } = await this.supabase
            .from('platform_registry')
            .select('*')
            .eq('id', platformId)
            .single();

        if (!platform) {
            throw new Error(`Platform ${platformId} not found`);
        }

        // Get registration template
        const { data: template } = await this.supabase
            .from('platform_templates')
            .select('*')
            .eq('platform_id', platformId)
            .eq('is_default', true)
            .single();

        // Trigger N8n workflow for registration
        const n8nResult = await this.triggerN8nWorkflow('platform-registration', {
            platform,
            template,
            taskData: task.task_data,
            agentId: agent.id
        });

        // Create workspace platform entry
        const { data: workspacePlatform } = await this.supabase
            .from('workspace_platforms')
            .upsert({
                workspace_id: task.task_data?.workspace_id || 'default',
                platform_id: platformId,
                account_status: 'registering',
                assigned_agent: agent.agent_name,
                agent_session_id: n8nResult?.sessionId
            }, { onConflict: 'workspace_id,platform_id' })
            .select()
            .single();

        return {
            workspacePlatformId: workspacePlatform?.id,
            n8nExecutionId: n8nResult?.executionId,
            status: 'registration_initiated'
        };
    }

    /**
     * Execute platform setup task
     */
    async executePlatformSetup(task, agent) {
        const { workspace_platform_id } = task.task_data;

        // Get workspace platform
        const { data: wp } = await this.supabase
            .from('workspace_platforms')
            .select('*, platform:platform_registry(*)')
            .eq('id', workspace_platform_id)
            .single();

        if (!wp) {
            throw new Error(`Workspace platform ${workspace_platform_id} not found`);
        }

        // Trigger setup workflow
        const n8nResult = await this.triggerN8nWorkflow('platform-setup', {
            workspacePlatform: wp,
            platform: wp.platform,
            credentials: wp.credentials,
            agentId: agent.id
        });

        // Update status
        await this.supabase
            .from('workspace_platforms')
            .update({
                integration_status: 'connecting',
                last_sync_at: new Date().toISOString()
            })
            .eq('id', workspace_platform_id);

        return {
            setupStatus: 'initiated',
            n8nExecutionId: n8nResult?.executionId
        };
    }

    /**
     * Execute integration test task
     */
    async executeIntegrationTest(task, agent) {
        const { workspace_platform_id } = task.task_data;

        // Get workspace platform with credentials
        const { data: wp } = await this.supabase
            .from('workspace_platforms')
            .select('*, platform:platform_registry(*)')
            .eq('id', workspace_platform_id)
            .single();

        // Trigger test workflow
        const n8nResult = await this.triggerN8nWorkflow('integration-test', {
            workspacePlatform: wp,
            testCases: task.task_data?.testCases || ['connectivity', 'authentication', 'basic_operations']
        });

        return {
            testResults: n8nResult?.results,
            passed: n8nResult?.allPassed
        };
    }

    /**
     * Execute health check task
     */
    async executeHealthCheck(task, agent) {
        const { platform_ids } = task.task_data;

        const results = [];

        for (const platformId of platform_ids || []) {
            const { data: wp } = await this.supabase
                .from('workspace_platforms')
                .select('*, platform:platform_registry(*)')
                .eq('platform_id', platformId)
                .single();

            if (wp) {
                const healthResult = await this.triggerN8nWorkflow('health-check', {
                    workspacePlatform: wp
                });

                results.push({
                    platformId,
                    platformName: wp.platform?.platform_name,
                    status: healthResult?.status || 'unknown',
                    responseTime: healthResult?.responseTime
                });

                // Update platform health status
                await this.supabase
                    .from('platform_registry')
                    .update({
                        health_status: healthResult?.status || 'unknown',
                        last_checked_at: new Date().toISOString()
                    })
                    .eq('id', platformId);
            }
        }

        return { healthResults: results };
    }

    /**
     * Execute generic task
     */
    async executeGenericTask(task, agent) {
        // Trigger generic workflow
        const n8nResult = await this.triggerN8nWorkflow('generic-task', {
            taskType: task.task_type,
            taskData: task.task_data,
            agentId: agent.id
        });

        return n8nResult;
    }

    /**
     * Trigger N8n workflow
     */
    async triggerN8nWorkflow(workflowName, data) {
        const n8nUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1201204.hstgr.cloud';

        try {
            const response = await fetch(`${n8nUrl}/webhook/${workflowName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`N8n webhook failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[OrchestrationEngine] N8n workflow ${workflowName} error:`, error);
            throw error;
        }
    }

    /**
     * Complete a task
     */
    async completeTask(taskId, status, result, errorMessage = null) {
        await this.supabase
            .from('orchestration_tasks')
            .update({
                status,
                result,
                error_message: errorMessage,
                completed_at: new Date().toISOString()
            })
            .eq('id', taskId);

        await this.logEvent(
            `task_${status}`,
            'system',
            { taskId, result, error: errorMessage },
            status === 'failed' ? 'error' : 'info',
            null,
            taskId
        );
    }

    /**
     * Retry a failed task
     */
    async retryTask(task) {
        await this.supabase
            .from('orchestration_tasks')
            .update({
                status: 'pending',
                retry_count: task.retry_count + 1,
                agent_id: null
            })
            .eq('id', task.id);

        await this.logEvent(
            'task_retry',
            'system',
            { taskId: task.id, retryCount: task.retry_count + 1 },
            'warning',
            null,
            task.id
        );
    }

    /**
     * Update agent status
     */
    async updateAgentStatus(agentId, updates) {
        await this.supabase
            .from('orchestration_agents')
            .update({
                ...updates,
                last_heartbeat_at: new Date().toISOString()
            })
            .eq('id', agentId);

        // Update local cache
        const agent = this.agents.get(agentId);
        if (agent) {
            Object.assign(agent, updates);
            agent.lastActivity = new Date();
        }
    }

    /**
     * Update batch progress
     */
    async updateBatchProgress(batchId) {
        // Call database function
        await this.supabase.rpc('update_batch_progress', { p_batch_id: batchId });
    }

    /**
     * Check agent heartbeats
     */
    async checkAgentHeartbeats() {
        const now = new Date();
        const offlineThreshold = 15 * 60 * 1000; // 15 minutes

        for (const [id, agent] of this.agents) {
            const lastHeartbeat = new Date(agent.last_heartbeat_at || 0);
            const timeSinceHeartbeat = now - lastHeartbeat;

            if (timeSinceHeartbeat > offlineThreshold && agent.status !== 'offline') {
                await this.updateAgentStatus(id, { status: 'offline' });
                this.emit('agentOffline', agent);

                await this.logEvent(
                    'agent_offline',
                    'system',
                    { agentId: id, lastHeartbeat: agent.last_heartbeat_at },
                    'warning',
                    id
                );
            }
        }

        // Update active agent count
        this.metrics.activeAgents = Array.from(this.agents.values())
            .filter(a => a.status !== 'offline').length;
    }

    /**
     * Create a batch of tasks for parallel execution
     */
    async createBatch(batchConfig) {
        const {
            name,
            workspaceId = 'default',
            batchType,
            tasks,
            parallelLimit = 5,
            config = {}
        } = batchConfig;

        // Create batch
        const { data: batch, error: batchError } = await this.supabase
            .from('orchestration_batches')
            .insert({
                batch_name: name,
                workspace_id: workspaceId,
                batch_type: batchType,
                parallel_limit: parallelLimit,
                config,
                total_tasks: tasks.length,
                status: 'pending'
            })
            .select()
            .single();

        if (batchError) throw batchError;

        // Create tasks
        const taskInserts = tasks.map((task, index) => ({
            task_type: task.type,
            platform_id: task.platformId,
            task_data: task.data,
            priority: task.priority || 5
        }));

        const { data: createdTasks, error: tasksError } = await this.supabase
            .from('orchestration_tasks')
            .insert(taskInserts)
            .select();

        if (tasksError) throw tasksError;

        // Link tasks to batch
        const batchTaskLinks = createdTasks.map((task, index) => ({
            batch_id: batch.id,
            task_id: task.id,
            execution_order: index
        }));

        await this.supabase
            .from('batch_tasks')
            .insert(batchTaskLinks);

        await this.logEvent(
            'batch_created',
            'system',
            { batchId: batch.id, taskCount: tasks.length },
            'info',
            null,
            null,
            batch.id
        );

        this.emit('batchCreated', { batch, tasks: createdTasks });

        return { batch, tasks: createdTasks };
    }

    /**
     * Start all platforms registration at once
     */
    async startAllPlatformsRegistration(workspaceId = 'default', platformIds = null) {
        // Get platforms to register
        let query = this.supabase
            .from('platform_registry')
            .select('*')
            .eq('is_active', true);

        if (platformIds?.length) {
            query = query.in('id', platformIds);
        }

        const { data: platforms } = await query;

        if (!platforms?.length) {
            throw new Error('No platforms available for registration');
        }

        // Create batch for parallel registration
        const tasks = platforms.map(platform => ({
            type: 'platform_registration',
            platformId: platform.id,
            data: {
                workspace_id: workspaceId,
                platform_name: platform.platform_name,
                registration_url: platform.registration_url
            },
            priority: 3 // High priority
        }));

        const batch = await this.createBatch({
            name: `Bulk Registration - ${new Date().toISOString()}`,
            workspaceId,
            batchType: 'bulk_registration',
            tasks,
            parallelLimit: 5
        });

        // Start batch immediately
        await this.supabase
            .from('orchestration_batches')
            .update({ status: 'running', started_at: new Date().toISOString() })
            .eq('id', batch.batch.id);

        this.emit('bulkRegistrationStarted', {
            batchId: batch.batch.id,
            platformCount: platforms.length
        });

        return batch;
    }

    /**
     * Log orchestration event
     */
    async logEvent(eventType, source, data, severity = 'info', agentId = null, taskId = null, batchId = null, platformId = null) {
        await this.supabase.rpc('log_orchestration_event', {
            p_event_type: eventType,
            p_event_source: source,
            p_event_data: data,
            p_severity: severity,
            p_agent_id: agentId,
            p_task_id: taskId,
            p_batch_id: batchId,
            p_platform_id: platformId
        });
    }

    /**
     * Get orchestration status
     */
    async getStatus() {
        const [
            { data: agents },
            { data: activeTasks },
            { data: batches },
            { data: platforms }
        ] = await Promise.all([
            this.supabase.from('v_agent_orchestration_dashboard').select('*'),
            this.supabase.from('orchestration_tasks').select('*').eq('status', 'running'),
            this.supabase.from('v_batch_progress').select('*').eq('status', 'running'),
            this.supabase.from('v_workspace_platform_status').select('*')
        ]);

        return {
            isRunning: this.isRunning,
            metrics: this.metrics,
            agents: agents || [],
            activeTasks: activeTasks || [],
            runningBatches: batches || [],
            platforms: platforms || []
        };
    }

    /**
     * Shutdown the orchestration engine
     */
    async shutdown() {
        console.log('[OrchestrationEngine] Shutting down...');

        this.isRunning = false;

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Mark all agents as offline
        for (const [id] of this.agents) {
            await this.updateAgentStatus(id, { status: 'offline' });
        }

        this.emit('shutdown');
        console.log('[OrchestrationEngine] Shutdown complete');
    }

    // Utility methods
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateAverageTaskDuration(newDuration) {
        const n = this.metrics.tasksProcessed;
        const currentAvg = this.metrics.averageTaskDuration;
        this.metrics.averageTaskDuration = currentAvg + (newDuration - currentAvg) / n;
    }
}

// Singleton instance
let orchestrationEngine = null;

function getOrchestrationEngine(options) {
    if (!orchestrationEngine) {
        orchestrationEngine = new OrchestrationEngine(options);
    }
    return orchestrationEngine;
}

module.exports = {
    OrchestrationEngine,
    getOrchestrationEngine
};
