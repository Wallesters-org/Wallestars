/**
 * Agent Delegation Service
 * Handles automatic task delegation to available agents based on GitHub events
 */

import { getAgentsByCapability, getAgentById, TASK_TYPE_MAPPING } from './agentRegistry.js';

// Store for delegated tasks (in production, use a database)
const delegatedTasks = [];
const agentWorkload = {}; // Track current tasks per agent

/**
 * Analyze GitHub event and determine task type
 */
function analyzeGitHubEvent(event) {
  const { eventType, title, body, labels, branch, action } = event;
  
  const taskType = {
    type: 'unknown',
    priority: 'P3',
    keywords: [],
    suggestedCapabilities: []
  };

  // Combine text fields for analysis
  const text = `${title || ''} ${body || ''} ${labels?.join(' ') || ''}`.toLowerCase();
  const branchName = (branch || '').toLowerCase();

  // Security-related
  if (text.includes('security') || text.includes('vulnerability') || 
      text.includes('credentials') || text.includes('password') ||
      labels?.some(l => l.toLowerCase().includes('security'))) {
    taskType.type = 'security';
    taskType.priority = 'P0';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.security;
    taskType.keywords.push('security');
  }
  
  // Deployment-related
  else if (text.includes('deploy') || text.includes('vps') || 
           text.includes('infrastructure') || branchName.includes('deploy')) {
    taskType.type = 'deployment';
    taskType.priority = 'P1';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.deployment;
    taskType.keywords.push('deployment');
  }
  
  // Testing-related
  else if (text.includes('test') || text.includes('testing') || 
           text.includes('coverage') || branchName.includes('test')) {
    taskType.type = 'testing';
    taskType.priority = 'P2';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.testing;
    taskType.keywords.push('testing');
  }
  
  // Documentation-related
  else if (text.includes('docs') || text.includes('documentation') || 
           text.includes('readme') || branchName.includes('docs')) {
    taskType.type = 'documentation';
    taskType.priority = 'P2';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.documentation;
    taskType.keywords.push('documentation');
  }
  
  // Workflow/automation-related
  else if (text.includes('n8n') || text.includes('workflow') || 
           text.includes('automation')) {
    taskType.type = 'workflow';
    taskType.priority = 'P2';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.workflow;
    taskType.keywords.push('workflow');
  }
  
  // Configuration-related
  else if (text.includes('config') || text.includes('copilot') || 
           text.includes('devcontainer')) {
    taskType.type = 'configuration';
    taskType.priority = 'P3';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.configuration;
    taskType.keywords.push('configuration');
  }
  
  // Feature-related (default for PRs with feature branches)
  else if (branchName.includes('feature') || branchName.includes('add') ||
           text.includes('feature') || text.includes('implement')) {
    taskType.type = 'feature';
    taskType.priority = 'P2';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.feature;
    taskType.keywords.push('feature');
  }

  // CI/CD related
  else if (text.includes('ci') || text.includes('github actions') ||
           text.includes('workflow')) {
    taskType.type = 'infrastructure';
    taskType.priority = 'P2';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.infrastructure;
    taskType.keywords.push('cicd');
  }

  return taskType;
}

/**
 * Find the best agent for a task
 */
function findBestAgent(taskType) {
  if (!taskType.suggestedCapabilities || taskType.suggestedCapabilities.length === 0) {
    return null;
  }

  // Try each capability in order
  for (const capability of taskType.suggestedCapabilities) {
    const agents = getAgentsByCapability(capability);
    
    // Find agent with lowest workload
    for (const agent of agents) {
      const currentWorkload = agentWorkload[agent.id] || 0;
      if (currentWorkload < agent.maxConcurrentTasks) {
        return agent;
      }
    }
  }

  return null;
}

/**
 * Create a delegated task
 */
function createDelegatedTask(event, taskType, agent) {
  const task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    eventType: event.eventType,
    eventNumber: event.number,
    eventTitle: event.title,
    eventUrl: event.url,
    eventAuthor: event.author,
    taskType: taskType.type,
    priority: taskType.priority,
    keywords: taskType.keywords,
    agentId: agent.id,
    agentName: agent.name,
    status: 'delegated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Store task
  delegatedTasks.push(task);

  // Update agent workload
  agentWorkload[agent.id] = (agentWorkload[agent.id] || 0) + 1;

  // Keep only last 100 tasks
  if (delegatedTasks.length > 100) {
    const removed = delegatedTasks.shift();
    if (removed.status === 'delegated' || removed.status === 'in-progress') {
      agentWorkload[removed.agentId] = Math.max(0, (agentWorkload[removed.agentId] || 1) - 1);
    }
  }

  return task;
}

/**
 * Main delegation function
 */
export function delegateTask(event) {
  try {
    // Only delegate for specific event types and actions
    if (!event || !event.eventType) {
      return null;
    }

    // Skip if it's a closed/merged PR or closed issue
    if (event.state === 'closed' || event.action === 'closed') {
      return null;
    }

    // Skip drafts unless it's a security issue
    if (event.draft && !event.title?.toLowerCase().includes('security')) {
      return null;
    }

    // Analyze the event
    const taskType = analyzeGitHubEvent(event);

    // Skip unknown or low-priority tasks without clear capabilities
    if (taskType.type === 'unknown' || taskType.suggestedCapabilities.length === 0) {
      console.log('⏭️  Skipping delegation - unknown task type:', event.title);
      return null;
    }

    // Find best agent
    const agent = findBestAgent(taskType);

    if (!agent) {
      console.log('⚠️  No available agent for task type:', taskType.type);
      return null;
    }

    // Create delegated task
    const task = createDelegatedTask(event, taskType, agent);

    console.log(`✅ Task delegated to ${agent.name}:`, {
      taskId: task.id,
      type: taskType.type,
      priority: taskType.priority,
      event: `${event.eventType} #${event.number}`
    });

    return task;
  } catch (error) {
    console.error('Error delegating task:', error);
    return null;
  }
}

/**
 * Get all delegated tasks
 */
export function getDelegatedTasks(filters = {}) {
  let tasks = [...delegatedTasks];

  if (filters.agentId) {
    tasks = tasks.filter(t => t.agentId === filters.agentId);
  }

  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status);
  }

  if (filters.taskType) {
    tasks = tasks.filter(t => t.taskType === filters.taskType);
  }

  if (filters.priority) {
    tasks = tasks.filter(t => t.priority === filters.priority);
  }

  return tasks;
}

/**
 * Update task status
 */
export function updateTaskStatus(taskId, status, details = {}) {
  const task = delegatedTasks.find(t => t.id === taskId);
  
  if (!task) {
    return null;
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();

  if (details.completedAt) {
    task.completedAt = details.completedAt;
  }

  if (details.result) {
    task.result = details.result;
  }

  // Update workload if task is completed or failed
  if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    agentWorkload[task.agentId] = Math.max(0, (agentWorkload[task.agentId] || 1) - 1);
  }

  return task;
}

/**
 * Get agent workload statistics
 */
export function getAgentWorkload() {
  return { ...agentWorkload };
}

/**
 * Get delegation statistics
 */
export function getDelegationStats() {
  const stats = {
    totalTasks: delegatedTasks.length,
    byStatus: {},
    byTaskType: {},
    byPriority: {},
    byAgent: {},
    agentWorkload: { ...agentWorkload }
  };

  delegatedTasks.forEach(task => {
    // By status
    stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;

    // By task type
    stats.byTaskType[task.taskType] = (stats.byTaskType[task.taskType] || 0) + 1;

    // By priority
    stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;

    // By agent
    stats.byAgent[task.agentName] = (stats.byAgent[task.agentName] || 0) + 1;
  });

  return stats;
}
