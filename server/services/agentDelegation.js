/**
 * Agent Delegation Service
 * 
 * Automatically delegates tasks to appropriate agents based on GitHub events.
 * Implements the delegation strategy from .github/TASKS/AGENT_DELEGATION_GUIDE.md
 */

// Agent Session Registry
const AGENT_SESSIONS = {
  'agent-security-cleanup': {
    id: 'agent-security-cleanup',
    name: 'Security Cleanup Agent',
    expertise: ['security', 'credentials', 'git-history', 'vulnerabilities'],
    priority: 0, // P0 - Critical
    status: 'available',
    keywords: ['security', 'exposed', 'credentials', 'vulnerability', 'password', 'api key', 'secret', 'token']
  },
  'agent-vps-deploy': {
    id: 'agent-vps-deploy',
    name: 'VPS Deployment Agent',
    expertise: ['deployment', 'vps', 'hosting', 'nginx', 'pm2', 'ssl'],
    priority: 0, // P0 - Critical
    status: 'available',
    keywords: ['deploy', 'vps', 'hosting', 'nginx', 'pm2', 'ssl', 'server', 'production']
  },
  'agent-qr-feature': {
    id: 'agent-qr-feature',
    name: 'QR Scanner Feature Agent',
    expertise: ['frontend', 'qr-scanner', 'ai-analysis', 'react'],
    priority: 2, // P2 - Medium
    status: 'available',
    keywords: ['qr', 'scanner', 'barcode', 'camera', 'scan']
  },
  'agent-n8n-integration': {
    id: 'agent-n8n-integration',
    name: 'N8N Integration Agent',
    expertise: ['n8n', 'workflows', 'automation', 'webhooks'],
    priority: 2, // P2 - Medium
    status: 'available',
    keywords: ['n8n', 'workflow', 'automation', 'webhook', 'integration']
  },
  'agent-copilot-config': {
    id: 'agent-copilot-config',
    name: 'Copilot Configuration Agent',
    expertise: ['copilot', 'github', 'configuration', 'documentation'],
    priority: 2, // P2 - Medium
    status: 'available',
    keywords: ['copilot', 'github copilot', 'instructions', 'configuration', 'setup']
  },
  'agent-devcontainer': {
    id: 'agent-devcontainer',
    name: 'DevContainer Agent',
    expertise: ['devcontainer', 'vscode', 'docker', 'development-environment'],
    priority: 3, // P3 - Nice to have
    status: 'available',
    keywords: ['devcontainer', 'vscode', 'docker', 'development environment', 'container']
  },
  'agent-testing-setup': {
    id: 'agent-testing-setup',
    name: 'Testing Infrastructure Agent',
    expertise: ['testing', 'vitest', 'unit-tests', 'integration-tests'],
    priority: 1, // P1 - High
    status: 'available',
    keywords: ['test', 'testing', 'vitest', 'unit test', 'integration test', 'e2e']
  },
  'agent-docs-complete': {
    id: 'agent-docs-complete',
    name: 'Documentation Agent',
    expertise: ['documentation', 'markdown', 'readme', 'guides'],
    priority: 1, // P1 - High
    status: 'available',
    keywords: ['documentation', 'docs', 'readme', 'guide', 'contributing', 'license']
  },
  'agent-cicd-setup': {
    id: 'agent-cicd-setup',
    name: 'CI/CD Pipeline Agent',
    expertise: ['cicd', 'github-actions', 'workflows', 'automation'],
    priority: 1, // P1 - High
    status: 'available',
    keywords: ['ci', 'cd', 'pipeline', 'github actions', 'workflow', 'automation', 'build']
  }
};

// Active agent assignments
const activeAssignments = new Map();

/**
 * Analyze GitHub event and determine if agent delegation is needed
 * @param {Object} event - GitHub event data
 * @returns {Object|null} Agent assignment or null
 */
export function analyzeGitHubEvent(event) {
  const { eventType, action, title, body, labels, branch, isAgentBranch } = event;

  // Skip events from agent branches to avoid loops
  if (isAgentBranch) {
    console.log('⏩ Skipping agent branch event to avoid loops');
    return null;
  }

  // Analyze event content
  const contentToAnalyze = `${title || ''} ${body || ''}`.toLowerCase();
  const eventLabels = (labels || []).map(l => l.toLowerCase());

  // Find matching agents
  const matches = [];

  for (const [agentId, agent] of Object.entries(AGENT_SESSIONS)) {
    let score = 0;

    // Check keyword matches in content
    for (const keyword of agent.keywords) {
      if (contentToAnalyze.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Check label matches
    for (const label of eventLabels) {
      if (agent.keywords.some(k => label.includes(k.toLowerCase()))) {
        score += 15;
      }
    }

    // Priority boost (lower priority number = higher importance)
    score += (3 - agent.priority) * 5;

    if (score > 0 && agent.status === 'available') {
      matches.push({ agent, score });
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  // Return top match if score is significant
  if (matches.length > 0 && matches[0].score >= 10) {
    return {
      agent: matches[0].agent,
      event,
      score: matches[0].score,
      reason: generateDelegationReason(matches[0].agent, event)
    };
  }

  return null;
}

/**
 * Generate human-readable delegation reason
 */
function generateDelegationReason(agent, event) {
  const { eventType, action, title } = event;
  return `Agent "${agent.name}" matched for ${eventType} event: "${title}" (action: ${action})`;
}

/**
 * Delegate task to agent
 * @param {Object} assignment - Agent assignment object
 * @returns {Object} Assignment result
 */
export function delegateToAgent(assignment) {
  const { agent, event, score, reason } = assignment;

  // Create assignment record
  const assignmentId = `${agent.id}-${Date.now()}`;
  const assignmentRecord = {
    id: assignmentId,
    agentId: agent.id,
    agentName: agent.name,
    event: {
      type: event.eventType,
      action: event.action,
      number: event.number,
      title: event.title,
      url: event.url
    },
    score,
    reason,
    status: 'assigned',
    assignedAt: new Date().toISOString(),
    completedAt: null
  };

  // Store assignment
  activeAssignments.set(assignmentId, assignmentRecord);

  // Update agent status
  if (AGENT_SESSIONS[agent.id]) {
    AGENT_SESSIONS[agent.id].status = 'busy';
  }

  console.log(`✅ Delegated task to ${agent.name}:`, {
    assignmentId,
    event: event.title,
    score
  });

  return assignmentRecord;
}

/**
 * Mark agent task as complete
 * @param {string} assignmentId - Assignment ID
 */
export function completeAssignment(assignmentId) {
  const assignment = activeAssignments.get(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  assignment.status = 'completed';
  assignment.completedAt = new Date().toISOString();

  // Free up agent
  if (AGENT_SESSIONS[assignment.agentId]) {
    AGENT_SESSIONS[assignment.agentId].status = 'available';
  }

  console.log(`✅ Assignment ${assignmentId} completed by ${assignment.agentName}`);

  return assignment;
}

/**
 * Get all active assignments
 */
export function getActiveAssignments() {
  return Array.from(activeAssignments.values()).filter(a => a.status === 'assigned');
}

/**
 * Get completed assignments
 */
export function getCompletedAssignments(limit = 10) {
  return Array.from(activeAssignments.values())
    .filter(a => a.status === 'completed')
    .slice(-limit);
}

/**
 * Get all available agents
 */
export function getAvailableAgents() {
  return Object.values(AGENT_SESSIONS).filter(a => a.status === 'available');
}

/**
 * Get agent status
 */
export function getAgentStatus(agentId) {
  return AGENT_SESSIONS[agentId] || null;
}

/**
 * Get all agents
 */
export function getAllAgents() {
  return Object.values(AGENT_SESSIONS);
}

/**
 * Process GitHub event and delegate if needed
 * @param {Object} event - GitHub event data
 * @returns {Object|null} Assignment result or null
 */
export function processGitHubEventForDelegation(event) {
  try {
    // Analyze event
    const assignment = analyzeGitHubEvent(event);

    if (!assignment) {
      console.log('ℹ️ No agent delegation needed for this event');
      return null;
    }

    // Delegate to agent
    const result = delegateToAgent(assignment);

    return {
      success: true,
      assignment: result,
      message: `Task delegated to ${result.agentName}`
    };
  } catch (error) {
    console.error('Error in agent delegation:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
