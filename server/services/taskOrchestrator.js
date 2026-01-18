// server/services/taskOrchestrator.js
// Central Task Orchestration and Agent Management System
// Created: 2026-01-12

import { EventEmitter } from 'events';

/**
 * TaskOrchestrator - Централна система за управление на задачи и агенти
 * Integrates with Antigravity and manages all agent workflows
 */
export class TaskOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.tasks = new Map();
        this.agents = new Map();
        this.taskQueue = [];
        this.completedTasks = [];
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            activeAgents: 0
        };
    }

    /**
     * Initialize task orchestrator with existing tasks
     */
    async initialize() {
        console.log('[TaskOrchestrator] Initializing...');
        
        // Load tasks from PRIORITY_TASKS
        await this.loadPriorityTasks();
        
        // Initialize agent registry
        this.initializeAgents();
        
        // Start monitoring
        this.startMonitoring();
        
        this.emit('initialized', { metrics: this.metrics });
        console.log('[TaskOrchestrator] Initialized successfully');
    }

    /**
     * Load priority tasks from documentation
     */
    async loadPriorityTasks() {
        const priorityTasks = [
            {
                id: 'TASK-001',
                name: 'Testing Infrastructure',
                priority: 'P1',
                status: 'IN_PROGRESS',
                agent: 'antigravity',
                eta: '2-4h',
                description: 'Add Vitest and React Testing Library',
                progress: 50,
                sla: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
            },
            {
                id: 'TASK-002',
                name: 'Security Documentation',
                priority: 'P1',
                status: 'COMPLETED',
                agent: 'antigravity',
                eta: '30min',
                description: 'Create SECURITY.md',
                progress: 100,
                completedAt: new Date()
            },
            {
                id: 'TASK-003',
                name: 'License File',
                priority: 'P1',
                status: 'COMPLETED',
                agent: 'antigravity',
                eta: '5min',
                description: 'Add MIT LICENSE',
                progress: 100,
                completedAt: new Date()
            },
            {
                id: 'TASK-004',
                name: 'Contributing Guidelines',
                priority: 'P1',
                status: 'COMPLETED',
                agent: 'antigravity',
                eta: '1h',
                description: 'Create CONTRIBUTING.md',
                progress: 100,
                completedAt: new Date()
            },
            {
                id: 'TASK-005',
                name: 'GitHub Templates',
                priority: 'P2',
                status: 'PENDING',
                agent: null,
                eta: '1h',
                description: 'Create issue and PR templates',
                progress: 0
            },
            {
                id: 'TASK-006',
                name: 'CI/CD Pipeline',
                priority: 'P1',
                status: 'COMPLETED',
                agent: 'antigravity',
                eta: '2h',
                description: 'Setup GitHub Actions',
                progress: 100,
                completedAt: new Date()
            },
            {
                id: 'TASK-007',
                name: 'QR Scanner Feature',
                priority: 'P2',
                status: 'PENDING',
                agent: null,
                eta: '4h',
                description: 'Implement QR scanner with AI analysis',
                progress: 0
            },
            {
                id: 'TASK-008',
                name: 'n8n Integration',
                priority: 'P2',
                status: 'PENDING',
                agent: null,
                eta: '3h',
                description: 'Deploy n8n workflows to VPS',
                progress: 0
            },
            {
                id: 'TASK-009',
                name: 'Copilot Configuration',
                priority: 'P2',
                status: 'COMPLETED',
                agent: 'copilot',
                eta: '1h',
                description: 'Setup Copilot instructions',
                progress: 100,
                completedAt: new Date()
            },
            {
                id: 'TASK-010',
                name: 'DevContainer Setup',
                priority: 'P3',
                status: 'PENDING',
                agent: null,
                eta: '2h',
                description: 'Create DevContainer configuration',
                progress: 0
            }
        ];

        priorityTasks.forEach(task => {
            this.tasks.set(task.id, task);
            if (task.status === 'PENDING') {
                this.taskQueue.push(task.id);
            }
            if (task.status === 'COMPLETED') {
                this.completedTasks.push(task.id);
            }
        });

        this.updateMetrics();
    }

    /**
     * Initialize agent registry
     */
    initializeAgents() {
        const agents = [
            {
                id: 'antigravity-main',
                name: 'Antigravity AI',
                status: 'ACTIVE',
                capabilities: ['infrastructure', 'testing', 'cicd', 'security'],
                currentTasks: ['TASK-001'],
                maxConcurrentTasks: 3,
                reliability: 0.98
            },
            {
                id: 'agent-security-cleanup',
                name: 'Security Agent',
                status: 'IDLE',
                capabilities: ['security', 'credentials', 'audit'],
                currentTasks: [],
                maxConcurrentTasks: 1,
                reliability: 0.95
            },
            {
                id: 'agent-vps-deploy',
                name: 'VPS Deployment Agent',
                status: 'IDLE',
                capabilities: ['deployment', 'vps', 'nginx', 'pm2'],
                currentTasks: [],
                maxConcurrentTasks: 1,
                reliability: 0.90
            },
            {
                id: 'agent-qr-feature',
                name: 'Feature Development Agent',
                status: 'IDLE',
                capabilities: ['frontend', 'react', 'features'],
                currentTasks: [],
                maxConcurrentTasks: 2,
                reliability: 0.92
            },
            {
                id: 'agent-n8n-integration',
                name: 'n8n Integration Agent',
                status: 'IDLE',
                capabilities: ['n8n', 'workflows', 'automation'],
                currentTasks: [],
                maxConcurrentTasks: 1,
                reliability: 0.88
            },
            {
                id: 'copilot-agent',
                name: 'GitHub Copilot Agent',
                status: 'ACTIVE',
                capabilities: ['code-generation', 'documentation', 'review'],
                currentTasks: [],
                maxConcurrentTasks: 5,
                reliability: 0.94
            }
        ];

        agents.forEach(agent => {
            this.agents.set(agent.id, agent);
        });

        this.metrics.activeAgents = agents.filter(a => a.status === 'ACTIVE').length;
    }

    /**
     * Assign task to best available agent
     */
    async assignTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        if (task.agent) {
            console.log(`[TaskOrchestrator] Task ${taskId} already assigned to ${task.agent}`);
            return task;
        }

        // Find best agent based on capabilities and availability
        const bestAgent = this.findBestAgent(task);
        
        if (!bestAgent) {
            console.warn(`[TaskOrchestrator] No available agent for task ${taskId}`);
            return null;
        }

        // Assign task
        task.agent = bestAgent.id;
        task.status = 'ASSIGNED';
        task.assignedAt = new Date();
        
        bestAgent.currentTasks.push(taskId);
        
        this.emit('taskAssigned', { task, agent: bestAgent });
        console.log(`[TaskOrchestrator] Task ${taskId} assigned to ${bestAgent.name}`);
        
        return task;
    }

    /**
     * Find best agent for a task
     */
    findBestAgent(task) {
        const requiredCapabilities = this.getRequiredCapabilities(task);
        
        let bestAgent = null;
        let bestScore = 0;

        for (const [agentId, agent] of this.agents) {
            // Check if agent is available
            if (agent.status !== 'ACTIVE' && agent.status !== 'IDLE') {
                continue;
            }

            // Check if agent has capacity
            if (agent.currentTasks.length >= agent.maxConcurrentTasks) {
                continue;
            }

            // Calculate capability match score
            const matchScore = this.calculateCapabilityMatch(
                agent.capabilities,
                requiredCapabilities
            );

            // Calculate final score (capability match + reliability - current load)
            const loadPenalty = agent.currentTasks.length / agent.maxConcurrentTasks;
            const finalScore = (matchScore * agent.reliability) * (1 - loadPenalty * 0.3);

            if (finalScore > bestScore) {
                bestScore = finalScore;
                bestAgent = agent;
            }
        }

        return bestAgent;
    }

    /**
     * Get required capabilities for a task
     */
    getRequiredCapabilities(task) {
        const capabilityMap = {
            'TASK-001': ['testing', 'infrastructure'],
            'TASK-005': ['github', 'documentation'],
            'TASK-007': ['frontend', 'react', 'features'],
            'TASK-008': ['n8n', 'workflows', 'deployment'],
            'TASK-010': ['devcontainer', 'vscode', 'docker']
        };

        return capabilityMap[task.id] || [];
    }

    /**
     * Calculate capability match score
     */
    calculateCapabilityMatch(agentCapabilities, requiredCapabilities) {
        if (requiredCapabilities.length === 0) return 0.5;
        
        const matches = requiredCapabilities.filter(cap =>
            agentCapabilities.some(ac => ac.includes(cap) || cap.includes(ac))
        );

        return matches.length / requiredCapabilities.length;
    }

    /**
     * Update task progress
     */
    async updateTaskProgress(taskId, progress, status = null) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        task.progress = Math.min(100, Math.max(0, progress));
        
        if (status) {
            task.status = status;
        }

        if (progress >= 100 || status === 'COMPLETED') {
            task.status = 'COMPLETED';
            task.completedAt = new Date();
            this.completedTasks.push(taskId);
            
            // Remove from agent's current tasks
            if (task.agent) {
                const agent = this.agents.get(task.agent);
                if (agent) {
                    agent.currentTasks = agent.currentTasks.filter(id => id !== taskId);
                }
            }

            // Remove from queue
            this.taskQueue = this.taskQueue.filter(id => id !== taskId);
        }

        this.updateMetrics();
        this.emit('taskUpdated', { task });
        
        console.log(`[TaskOrchestrator] Task ${taskId} updated: ${progress}% - ${task.status}`);
    }

    /**
     * Mark task as failed
     */
    async failTask(taskId, reason) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        task.status = 'FAILED';
        task.failedAt = new Date();
        task.failureReason = reason;
        
        // Release agent
        if (task.agent) {
            const agent = this.agents.get(task.agent);
            if (agent) {
                agent.currentTasks = agent.currentTasks.filter(id => id !== taskId);
            }
        }

        this.updateMetrics();
        this.emit('taskFailed', { task, reason });
        
        console.error(`[TaskOrchestrator] Task ${taskId} failed: ${reason}`);
    }

    /**
     * Get all tasks
     */
    getAllTasks() {
        return Array.from(this.tasks.values());
    }

    /**
     * Get tasks by status
     */
    getTasksByStatus(status) {
        return Array.from(this.tasks.values()).filter(t => t.status === status);
    }

    /**
     * Get tasks by priority
     */
    getTasksByPriority(priority) {
        return Array.from(this.tasks.values()).filter(t => t.priority === priority);
    }

    /**
     * Get all agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }

    /**
     * Get agent status
     */
    getAgentStatus(agentId) {
        return this.agents.get(agentId);
    }

    /**
     * Get orchestration metrics
     */
    getMetrics() {
        return this.metrics;
    }

    /**
     * Update metrics
     */
    updateMetrics() {
        this.metrics.totalTasks = this.tasks.size;
        this.metrics.completedTasks = this.completedTasks.length;
        this.metrics.failedTasks = Array.from(this.tasks.values())
            .filter(t => t.status === 'FAILED').length;
        this.metrics.activeAgents = Array.from(this.agents.values())
            .filter(a => a.status === 'ACTIVE').length;
    }

    /**
     * Start monitoring for SLA violations and health
     */
    startMonitoring() {
        setInterval(() => {
            this.checkSLAViolations();
            this.checkAgentHealth();
        }, 60000); // Check every minute
    }

    /**
     * Check for SLA violations
     */
    checkSLAViolations() {
        const now = new Date();
        
        for (const [taskId, task] of this.tasks) {
            if (task.status === 'IN_PROGRESS' && task.sla) {
                if (now > task.sla) {
                    console.warn(`[TaskOrchestrator] SLA violation for task ${taskId}`);
                    this.emit('slaViolation', { task });
                }
            }
        }
    }

    /**
     * Check agent health
     */
    checkAgentHealth() {
        for (const [agentId, agent] of this.agents) {
            // Check if agent is overloaded
            if (agent.currentTasks.length > agent.maxConcurrentTasks) {
                console.warn(`[TaskOrchestrator] Agent ${agentId} is overloaded`);
                this.emit('agentOverload', { agent });
            }
        }
    }

    /**
     * Process next task in queue
     */
    async processNextTask() {
        if (this.taskQueue.length === 0) {
            return null;
        }

        const taskId = this.taskQueue[0];
        const task = await this.assignTask(taskId);
        
        if (task) {
            this.taskQueue.shift();
        }
        
        return task;
    }

    /**
     * Get task delegation report
     */
    getDelegationReport() {
        const tasks = this.getAllTasks();
        const agents = this.getAllAgents();
        
        return {
            summary: {
                totalTasks: tasks.length,
                completed: tasks.filter(t => t.status === 'COMPLETED').length,
                inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
                pending: tasks.filter(t => t.status === 'PENDING').length,
                failed: tasks.filter(t => t.status === 'FAILED').length
            },
            tasksByPriority: {
                P0: tasks.filter(t => t.priority === 'P0').length,
                P1: tasks.filter(t => t.priority === 'P1').length,
                P2: tasks.filter(t => t.priority === 'P2').length,
                P3: tasks.filter(t => t.priority === 'P3').length
            },
            agents: agents.map(a => ({
                id: a.id,
                name: a.name,
                status: a.status,
                currentLoad: `${a.currentTasks.length}/${a.maxConcurrentTasks}`,
                reliability: `${(a.reliability * 100).toFixed(0)}%`
            })),
            recentActivity: tasks
                .filter(t => t.completedAt || t.assignedAt)
                .sort((a, b) => {
                    const dateA = a.completedAt || a.assignedAt;
                    const dateB = b.completedAt || b.assignedAt;
                    return dateB - dateA;
                })
                .slice(0, 10)
                .map(t => ({
                    id: t.id,
                    name: t.name,
                    status: t.status,
                    agent: t.agent,
                    timestamp: t.completedAt || t.assignedAt
                }))
        };
    }
}

// Singleton instance
let orchestratorInstance = null;

export function getTaskOrchestrator() {
    if (!orchestratorInstance) {
        orchestratorInstance = new TaskOrchestrator();
    }
    return orchestratorInstance;
}

export default TaskOrchestrator;
