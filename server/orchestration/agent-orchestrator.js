/**
 * AI Agent Orchestrator
 * Manages multiple AI agents working in parallel
 * Coordinates tasks, load balances, and aggregates results
 */

import Anthropic from '@anthropic-ai/sdk';
import { EventEmitter } from 'events';
import {
  platformsRegistry,
  getConfiguredPlatforms,
  isPlatformConfigured,
  PLATFORM_STATUS
} from './platforms-registry.js';

// Agent states
export const AGENT_STATE = {
  IDLE: 'idle',
  WORKING: 'working',
  WAITING: 'waiting',
  ERROR: 'error',
  COMPLETED: 'completed'
};

/**
 * Individual Agent instance
 */
class Agent {
  constructor(platform, config = {}) {
    this.id = `agent_${platform.id}_${Date.now()}`;
    this.platform = platform;
    this.state = AGENT_STATE.IDLE;
    this.currentTask = null;
    this.results = [];
    this.errors = [];
    this.startTime = null;
    this.config = config;
    this.client = null;
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      totalTokens: 0,
      avgResponseTime: 0
    };
  }

  async initialize() {
    try {
      switch (this.platform.id) {
        case 'anthropic_claude':
          this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
          });
          break;
        case 'openai_gpt':
          // Dynamic import for OpenAI
          const { default: OpenAI } = await import('openai');
          this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
          });
          break;
        case 'google_gemini':
          // Google Generative AI
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
          break;
        case 'groq':
          // Groq uses OpenAI-compatible API
          const { default: GroqOpenAI } = await import('openai');
          this.client = new GroqOpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1'
          });
          break;
        case 'together_ai':
          const { default: TogetherAI } = await import('openai');
          this.client = new TogetherAI({
            apiKey: process.env.TOGETHER_API_KEY,
            baseURL: 'https://api.together.xyz/v1'
          });
          break;
        default:
          // Generic HTTP client for other platforms
          this.client = { platformId: this.platform.id };
      }
      return true;
    } catch (error) {
      this.errors.push({ time: new Date(), error: error.message });
      this.state = AGENT_STATE.ERROR;
      return false;
    }
  }

  async executeTask(task) {
    this.state = AGENT_STATE.WORKING;
    this.currentTask = task;
    this.startTime = Date.now();

    try {
      let result;

      switch (this.platform.id) {
        case 'anthropic_claude':
          result = await this.executeClaudeTask(task);
          break;
        case 'openai_gpt':
          result = await this.executeOpenAITask(task);
          break;
        case 'google_gemini':
          result = await this.executeGeminiTask(task);
          break;
        case 'groq':
        case 'together_ai':
          result = await this.executeOpenAICompatibleTask(task);
          break;
        default:
          result = await this.executeGenericTask(task);
      }

      const responseTime = Date.now() - this.startTime;
      this.metrics.tasksCompleted++;
      this.metrics.avgResponseTime =
        (this.metrics.avgResponseTime * (this.metrics.tasksCompleted - 1) + responseTime) /
        this.metrics.tasksCompleted;

      this.results.push({
        taskId: task.id,
        result,
        responseTime,
        timestamp: new Date()
      });

      this.state = AGENT_STATE.COMPLETED;
      this.currentTask = null;
      return { success: true, result, responseTime };
    } catch (error) {
      this.metrics.tasksFailed++;
      this.errors.push({
        taskId: task.id,
        error: error.message,
        time: new Date()
      });
      this.state = AGENT_STATE.ERROR;
      return { success: false, error: error.message };
    }
  }

  async executeClaudeTask(task) {
    const response = await this.client.messages.create({
      model: task.model || 'claude-sonnet-4-20250514',
      max_tokens: task.maxTokens || 4096,
      messages: [{ role: 'user', content: task.prompt }],
      system: task.systemPrompt || 'You are a helpful AI assistant working as part of an orchestration farm.'
    });

    this.metrics.totalTokens += response.usage?.input_tokens + response.usage?.output_tokens || 0;
    return response.content[0].text;
  }

  async executeOpenAITask(task) {
    const response = await this.client.chat.completions.create({
      model: task.model || 'gpt-4o-mini',
      max_tokens: task.maxTokens || 4096,
      messages: [
        { role: 'system', content: task.systemPrompt || 'You are a helpful AI assistant.' },
        { role: 'user', content: task.prompt }
      ]
    });

    this.metrics.totalTokens += response.usage?.total_tokens || 0;
    return response.choices[0].message.content;
  }

  async executeGeminiTask(task) {
    const model = this.client.getGenerativeModel({
      model: task.model || 'gemini-1.5-flash'
    });
    const result = await model.generateContent(task.prompt);
    return result.response.text();
  }

  async executeOpenAICompatibleTask(task) {
    const response = await this.client.chat.completions.create({
      model: task.model || this.platform.models[0],
      max_tokens: task.maxTokens || 4096,
      messages: [
        { role: 'system', content: task.systemPrompt || 'You are a helpful AI assistant.' },
        { role: 'user', content: task.prompt }
      ]
    });

    return response.choices[0].message.content;
  }

  async executeGenericTask(task) {
    // Placeholder for platforms with custom APIs
    return {
      status: 'not_implemented',
      platform: this.platform.id,
      message: 'Custom implementation required for this platform'
    };
  }

  getStatus() {
    return {
      id: this.id,
      platform: this.platform.name,
      state: this.state,
      currentTask: this.currentTask?.id || null,
      metrics: this.metrics,
      errors: this.errors.slice(-5) // Last 5 errors
    };
  }
}

/**
 * Main Orchestrator class
 * Manages farm of AI agents
 */
export class AgentOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.agents = new Map();
    this.taskQueue = [];
    this.completedTasks = [];
    this.options = {
      maxConcurrentTasks: options.maxConcurrentTasks || 10,
      retryAttempts: options.retryAttempts || 3,
      loadBalanceStrategy: options.loadBalanceStrategy || 'round-robin', // round-robin, least-busy, priority
      ...options
    };
    this.isRunning = false;
    this.currentRoundRobinIndex = 0;
  }

  /**
   * Initialize all configured platforms as agents
   */
  async initializeFarm(platformIds = null) {
    const platforms = platformIds
      ? platformIds.map(id => platformsRegistry[id]).filter(Boolean)
      : getConfiguredPlatforms();

    console.log(`🚀 Initializing AI Agent Farm with ${platforms.length} platforms...`);

    const initResults = await Promise.all(
      platforms.map(async (platform) => {
        const agent = new Agent(platform);
        const success = await agent.initialize();
        if (success) {
          this.agents.set(agent.id, agent);
          console.log(`✅ Agent initialized: ${platform.name}`);
        } else {
          console.log(`❌ Failed to initialize: ${platform.name}`);
        }
        return { platform: platform.name, success };
      })
    );

    this.emit('farm-initialized', {
      totalPlatforms: platforms.length,
      successfulAgents: this.agents.size,
      results: initResults
    });

    return initResults;
  }

  /**
   * Add a new agent for a specific platform
   */
  async addAgent(platformId) {
    const platform = platformsRegistry[platformId];
    if (!platform) {
      throw new Error(`Unknown platform: ${platformId}`);
    }

    if (!isPlatformConfigured(platformId)) {
      throw new Error(`Platform ${platformId} is not configured. Add ${platform.envVarName} to your environment.`);
    }

    const agent = new Agent(platform);
    const success = await agent.initialize();
    if (success) {
      this.agents.set(agent.id, agent);
      this.emit('agent-added', { agentId: agent.id, platform: platform.name });
    }
    return { success, agentId: agent.id };
  }

  /**
   * Remove an agent from the farm
   */
  removeAgent(agentId) {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      this.agents.delete(agentId);
      this.emit('agent-removed', { agentId, platform: agent.platform.name });
      return true;
    }
    return false;
  }

  /**
   * Submit a task to the farm
   */
  submitTask(task) {
    const taskWithMeta = {
      id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...task,
      submittedAt: new Date(),
      status: 'queued',
      attempts: 0
    };

    this.taskQueue.push(taskWithMeta);
    this.emit('task-submitted', taskWithMeta);

    // Auto-process if running
    if (this.isRunning) {
      this.processQueue();
    }

    return taskWithMeta.id;
  }

  /**
   * Submit multiple tasks to be executed in parallel
   */
  submitTasks(tasks) {
    return tasks.map(task => this.submitTask(task));
  }

  /**
   * Get the next available agent based on load balancing strategy
   */
  getNextAgent(preferredPlatform = null) {
    const availableAgents = Array.from(this.agents.values())
      .filter(a => a.state === AGENT_STATE.IDLE || a.state === AGENT_STATE.COMPLETED);

    if (availableAgents.length === 0) return null;

    // If preferred platform specified, try to use it
    if (preferredPlatform) {
      const preferred = availableAgents.find(a => a.platform.id === preferredPlatform);
      if (preferred) return preferred;
    }

    switch (this.options.loadBalanceStrategy) {
      case 'round-robin':
        this.currentRoundRobinIndex = (this.currentRoundRobinIndex + 1) % availableAgents.length;
        return availableAgents[this.currentRoundRobinIndex];

      case 'least-busy':
        return availableAgents.reduce((least, agent) =>
          agent.metrics.tasksCompleted < least.metrics.tasksCompleted ? agent : least
        );

      case 'priority':
        return availableAgents.reduce((highest, agent) =>
          agent.platform.priority < highest.platform.priority ? agent : highest
        );

      default:
        return availableAgents[0];
    }
  }

  /**
   * Process the task queue
   */
  async processQueue() {
    const activeTasks = Array.from(this.agents.values())
      .filter(a => a.state === AGENT_STATE.WORKING).length;

    while (
      this.taskQueue.length > 0 &&
      activeTasks < this.options.maxConcurrentTasks
    ) {
      const task = this.taskQueue.shift();
      const agent = this.getNextAgent(task.preferredPlatform);

      if (!agent) {
        // No available agents, put task back
        this.taskQueue.unshift(task);
        break;
      }

      task.status = 'processing';
      task.agentId = agent.id;
      task.attempts++;

      this.emit('task-started', { task, agent: agent.getStatus() });

      // Execute asynchronously
      agent.executeTask(task).then(result => {
        if (result.success) {
          task.status = 'completed';
          task.result = result.result;
          task.completedAt = new Date();
          task.responseTime = result.responseTime;
          this.completedTasks.push(task);
          this.emit('task-completed', { task, agent: agent.getStatus() });
        } else {
          if (task.attempts < this.options.retryAttempts) {
            task.status = 'queued';
            this.taskQueue.push(task);
            this.emit('task-retrying', { task, attempt: task.attempts });
          } else {
            task.status = 'failed';
            task.error = result.error;
            this.completedTasks.push(task);
            this.emit('task-failed', { task, error: result.error });
          }
        }

        // Continue processing
        if (this.isRunning) {
          this.processQueue();
        }
      });
    }
  }

  /**
   * Start the orchestration farm
   */
  start() {
    this.isRunning = true;
    this.emit('farm-started');
    this.processQueue();
    return { status: 'started', agents: this.agents.size };
  }

  /**
   * Stop the orchestration farm
   */
  stop() {
    this.isRunning = false;
    this.emit('farm-stopped');
    return { status: 'stopped', pendingTasks: this.taskQueue.length };
  }

  /**
   * Execute a task on ALL agents simultaneously
   * Returns aggregated results from all agents
   */
  async executeOnAllAgents(task) {
    const agents = Array.from(this.agents.values());
    console.log(`🔄 Executing task on ${agents.length} agents simultaneously...`);

    const startTime = Date.now();
    const results = await Promise.allSettled(
      agents.map(agent => agent.executeTask({ ...task, id: `${task.id}_${agent.id}` }))
    );

    const aggregatedResults = results.map((result, index) => ({
      agent: agents[index].platform.name,
      agentId: agents[index].id,
      ...result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    }));

    const totalTime = Date.now() - startTime;

    this.emit('parallel-execution-complete', {
      taskId: task.id,
      totalAgents: agents.length,
      successful: aggregatedResults.filter(r => r.success).length,
      failed: aggregatedResults.filter(r => !r.success).length,
      totalTime,
      results: aggregatedResults
    });

    return {
      taskId: task.id,
      totalTime,
      results: aggregatedResults
    };
  }

  /**
   * Get farm status
   */
  getStatus() {
    const agents = Array.from(this.agents.values());
    return {
      isRunning: this.isRunning,
      totalAgents: this.agents.size,
      agentsByState: {
        idle: agents.filter(a => a.state === AGENT_STATE.IDLE).length,
        working: agents.filter(a => a.state === AGENT_STATE.WORKING).length,
        error: agents.filter(a => a.state === AGENT_STATE.ERROR).length,
        completed: agents.filter(a => a.state === AGENT_STATE.COMPLETED).length
      },
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks.length,
      agents: agents.map(a => a.getStatus())
    };
  }

  /**
   * Get metrics summary
   */
  getMetrics() {
    const agents = Array.from(this.agents.values());
    return {
      totalTasksCompleted: agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0),
      totalTasksFailed: agents.reduce((sum, a) => sum + a.metrics.tasksFailed, 0),
      totalTokensUsed: agents.reduce((sum, a) => sum + a.metrics.totalTokens, 0),
      avgResponseTime: agents.length > 0
        ? agents.reduce((sum, a) => sum + a.metrics.avgResponseTime, 0) / agents.length
        : 0,
      byPlatform: agents.map(a => ({
        platform: a.platform.name,
        ...a.metrics
      }))
    };
  }
}

// Singleton instance
let orchestratorInstance = null;

export function getOrchestrator(options = {}) {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator(options);
  }
  return orchestratorInstance;
}

export default AgentOrchestrator;
