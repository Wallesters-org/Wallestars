/**
 * AI Agent Orchestration Manager
 * Manages parallel execution of AI agents across multiple platforms
 */

import EventEmitter from 'events';

export class OrchestrationManager extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.taskQueue = [];
    this.runningTasks = new Map();
    this.maxConcurrentTasks = 5;
    this.platforms = ['linux', 'android', 'web'];
  }

  /**
   * Register a new agent worker
   * @param {string} agentId - Unique agent identifier
   * @param {object} config - Agent configuration
   */
  registerAgent(agentId, config = {}) {
    const agent = {
      id: agentId,
      platform: config.platform || 'linux',
      status: 'idle',
      capabilities: config.capabilities || [],
      lastActive: new Date(),
      tasksCompleted: 0,
      tasksFailed: 0
    };

    this.agents.set(agentId, agent);
    this.emit('agent:registered', agent);
    
    return agent;
  }

  /**
   * Unregister an agent
   * @param {string} agentId - Agent identifier
   */
  unregisterAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.emit('agent:unregistered', agent);
    }
  }

  /**
   * Submit a task to the orchestration queue
   * @param {object} task - Task configuration
   * @returns {Promise} Task execution promise
   */
  async submitTask(task) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const taskObj = {
      id: taskId,
      type: task.type,
      platform: task.platform || 'linux',
      priority: task.priority || 5,
      data: task.data || {},
      status: 'queued',
      createdAt: new Date(),
      retries: 0,
      maxRetries: task.maxRetries || 3
    };

    this.taskQueue.push(taskObj);
    this.emit('task:queued', taskObj);

    // Try to execute immediately if capacity available
    this.processQueue();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Task ${taskId} timed out`));
      }, task.timeout || 300000); // 5 minutes default

      this.once(`task:${taskId}:complete`, (result) => {
        clearTimeout(timeout);
        resolve(result);
      });

      this.once(`task:${taskId}:error`, (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Process the task queue
   */
  async processQueue() {
    if (this.runningTasks.size >= this.maxConcurrentTasks) {
      return;
    }

    this.taskQueue.sort((a, b) => b.priority - a.priority);

    while (this.taskQueue.length > 0 && this.runningTasks.size < this.maxConcurrentTasks) {
      const task = this.taskQueue.shift();
      
      if (!task) break;

      const agent = this.findAvailableAgent(task.platform, task.type);
      
      if (agent) {
        this.executeTask(task, agent);
      } else {
        this.taskQueue.unshift(task);
        break;
      }
    }
  }

  findAvailableAgent(platform, taskType) {
    for (const [agentId, agent] of this.agents.entries()) {
      if (agent.status === 'idle' && agent.platform === platform) {
        if (agent.capabilities.length === 0 || agent.capabilities.includes(taskType)) {
          return agent;
        }
      }
    }
    return null;
  }

  async executeTask(task, agent) {
    agent.status = 'busy';
    agent.lastActive = new Date();
    task.status = 'running';
    task.agentId = agent.id;
    task.startedAt = new Date();

    this.runningTasks.set(task.id, task);
    this.emit('task:started', { task, agent });

    try {
      const result = await this.executePlatformTask(task, agent);
      
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      
      agent.status = 'idle';
      agent.tasksCompleted++;
      
      this.runningTasks.delete(task.id);
      this.emit(`task:${task.id}:complete`, result);
      this.emit('task:completed', { task, agent, result });

      this.processQueue();

      return result;
    } catch (error) {
      task.retries++;
      
      if (task.retries < task.maxRetries) {
        task.status = 'queued';
        agent.status = 'idle';
        this.runningTasks.delete(task.id);
        this.taskQueue.unshift(task);
        this.emit('task:retry', { task, agent, error });
        this.processQueue();
      } else {
        task.status = 'failed';
        task.error = error.message;
        agent.status = 'idle';
        agent.tasksFailed++;
        
        this.runningTasks.delete(task.id);
        this.emit(`task:${task.id}:error`, error);
        this.emit('task:failed', { task, agent, error });
        
        this.processQueue();
      }
    }
  }

  async executePlatformTask(task, agent) {
    return new Promise((resolve, reject) => {
      this.emit('task:execute', {
        task,
        agent,
        resolve,
        reject
      });
    });
  }

  getStatus() {
    return {
      agents: {
        total: this.agents.size,
        idle: Array.from(this.agents.values()).filter(a => a.status === 'idle').length,
        busy: Array.from(this.agents.values()).filter(a => a.status === 'busy').length,
        byPlatform: this.platforms.reduce((acc, platform) => {
          acc[platform] = Array.from(this.agents.values()).filter(a => a.platform === platform).length;
          return acc;
        }, {})
      },
      tasks: {
        queued: this.taskQueue.length,
        running: this.runningTasks.size,
        completed: Array.from(this.agents.values()).reduce((sum, a) => sum + a.tasksCompleted, 0),
        failed: Array.from(this.agents.values()).reduce((sum, a) => sum + a.tasksFailed, 0)
      },
      queue: this.taskQueue.map(t => ({
        id: t.id,
        type: t.type,
        platform: t.platform,
        priority: t.priority,
        status: t.status
      })),
      runningTasks: Array.from(this.runningTasks.values()).map(t => ({
        id: t.id,
        type: t.type,
        platform: t.platform,
        agentId: t.agentId,
        startedAt: t.startedAt
      }))
    };
  }

  getAgentStats(agentId) {
    return this.agents.get(agentId) || null;
  }

  cancelTask(taskId) {
    const queueIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1);
      this.emit('task:cancelled', { taskId, location: 'queue' });
      return true;
    }

    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      const agent = this.agents.get(runningTask.agentId);
      if (agent) {
        agent.status = 'idle';
      }
      this.runningTasks.delete(taskId);
      this.emit('task:cancelled', { taskId, location: 'running' });
      this.processQueue();
      return true;
    }

    return false;
  }

  setMaxConcurrentTasks(max) {
    this.maxConcurrentTasks = Math.max(1, Math.min(max, 20));
    this.processQueue();
  }

  clearHistory() {
    for (const agent of this.agents.values()) {
      agent.tasksCompleted = 0;
      agent.tasksFailed = 0;
    }
    this.emit('history:cleared');
  }
}

export const orchestrationManager = new OrchestrationManager();
