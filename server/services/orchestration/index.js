/**
 * AI Agents Orchestration Module
 *
 * Main entry point for the orchestration system.
 */

const { OrchestrationEngine, getOrchestrationEngine } = require('./OrchestrationEngine');
const { ParallelCoordinator, createCoordinator } = require('./ParallelCoordinator');
const adapters = require('./adapters');

module.exports = {
    // Core engine
    OrchestrationEngine,
    getOrchestrationEngine,

    // Parallel coordinator
    ParallelCoordinator,
    createCoordinator,

    // Platform adapters
    ...adapters
};
