/**
 * AI Agent Orchestration Farm
 * Main entry point for the orchestration system
 */

export {
  AgentOrchestrator,
  getOrchestrator,
  AGENT_STATE
} from './agent-orchestrator.js';

export {
  FarmManager,
  getFarmManager,
  WORKFLOW_TEMPLATES
} from './farm-manager.js';

export {
  platformsRegistry,
  getAllPlatforms,
  getPlatformsByTier,
  getPlatformsByCapability,
  getPlatform,
  isPlatformConfigured,
  getConfiguredPlatforms,
  getUnconfiguredPlatforms,
  PLATFORM_STATUS,
  PLATFORM_TIER
} from './platforms-registry.js';
