/**
 * Agent Registry - Defines available agents and their capabilities
 * Based on AGENT_DELEGATION_SYSTEM.md documentation
 */

export const AGENT_REGISTRY = {
  'antigravity-main': {
    id: 'antigravity-main',
    name: 'Antigravity Main Agent',
    status: 'active',
    capabilities: ['infrastructure', 'testing', 'cicd', 'deployment'],
    priority: 1,
    maxConcurrentTasks: 3
  },
  'agent-security-cleanup': {
    id: 'agent-security-cleanup',
    name: 'Security Cleanup Agent',
    status: 'available',
    capabilities: ['security', 'credentials', 'audit'],
    priority: 1,
    maxConcurrentTasks: 1
  },
  'agent-vps-deploy': {
    id: 'agent-vps-deploy',
    name: 'VPS Deployment Agent',
    status: 'available',
    capabilities: ['deployment', 'vps', 'infrastructure'],
    priority: 2,
    maxConcurrentTasks: 1
  },
  'agent-qr-feature': {
    id: 'agent-qr-feature',
    name: 'QR Scanner Feature Agent',
    status: 'available',
    capabilities: ['feature', 'frontend', 'ai'],
    priority: 3,
    maxConcurrentTasks: 1
  },
  'agent-n8n-integration': {
    id: 'agent-n8n-integration',
    name: 'N8N Integration Agent',
    status: 'available',
    capabilities: ['workflow', 'automation', 'integration'],
    priority: 2,
    maxConcurrentTasks: 1
  },
  'agent-copilot-config': {
    id: 'agent-copilot-config',
    name: 'Copilot Configuration Agent',
    status: 'available',
    capabilities: ['configuration', 'github', 'copilot'],
    priority: 3,
    maxConcurrentTasks: 1
  },
  'agent-devcontainer': {
    id: 'agent-devcontainer',
    name: 'DevContainer Agent',
    status: 'available',
    capabilities: ['devcontainer', 'vscode', 'configuration'],
    priority: 3,
    maxConcurrentTasks: 1
  },
  'agent-testing-setup': {
    id: 'agent-testing-setup',
    name: 'Testing Infrastructure Agent',
    status: 'available',
    capabilities: ['testing', 'quality', 'ci'],
    priority: 2,
    maxConcurrentTasks: 1
  },
  'agent-docs-complete': {
    id: 'agent-docs-complete',
    name: 'Documentation Agent',
    status: 'available',
    capabilities: ['documentation', 'markdown', 'guides'],
    priority: 2,
    maxConcurrentTasks: 1
  }
};

/**
 * Task type to capability mapping
 */
export const TASK_TYPE_MAPPING = {
  security: ['security', 'credentials', 'audit'],
  deployment: ['deployment', 'vps', 'infrastructure'],
  feature: ['feature', 'frontend', 'backend'],
  testing: ['testing', 'quality', 'ci'],
  documentation: ['documentation', 'markdown', 'guides'],
  configuration: ['configuration', 'github', 'copilot'],
  workflow: ['workflow', 'automation', 'integration'],
  infrastructure: ['infrastructure', 'cicd', 'deployment']
};

/**
 * Get available agents by capability
 */
export function getAgentsByCapability(capability) {
  return Object.values(AGENT_REGISTRY)
    .filter(agent => 
      agent.status === 'active' || agent.status === 'available'
    )
    .filter(agent => agent.capabilities.includes(capability))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get agent by ID
 */
export function getAgentById(agentId) {
  return AGENT_REGISTRY[agentId];
}

/**
 * Get all active agents
 */
export function getActiveAgents() {
  return Object.values(AGENT_REGISTRY)
    .filter(agent => agent.status === 'active' || agent.status === 'available');
}

/**
 * Update agent status
 */
export function updateAgentStatus(agentId, status) {
  if (AGENT_REGISTRY[agentId]) {
    AGENT_REGISTRY[agentId].status = status;
    return true;
  }
  return false;
}
