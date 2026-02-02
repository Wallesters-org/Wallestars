/**
 * Slack Integration Module
 * Main entry point for Slack AI Extensions
 */

export {
  slackAIExtensions,
  getEnabledExtensions,
  getExtensionById,
  getExtensionsByType,
  getExtensionsByCapability,
  getAllCommands,
  getExtensionByCommand
} from './aiExtensions.js';

export {
  addAllExtensionsToChannel,
  addExtensionsToChannel,
  removeExtensionFromChannel,
  getChannelConfig,
  getAllConfiguredChannels,
  toggleExtensionInChannel,
  updateExtensionConfig,
  getChannelExtensionSummary,
  listAvailableExtensions
} from './channelExtensions.js';

/**
 * Initialize Slack integration with all 10 AI extensions
 * @param {object} options - Initialization options
 * @returns {object} Initialization result
 */
export const initializeSlackIntegration = (options = {}) => {
  const { channelId, channelName } = options;

  const extensions = [
    { id: 'claude-assistant', name: 'Claude AI Assistant', provider: 'Anthropic' },
    { id: 'openai-gpt', name: 'OpenAI GPT', provider: 'OpenAI' },
    { id: 'github-copilot', name: 'GitHub Copilot', provider: 'GitHub' },
    { id: 'google-gemini', name: 'Google Gemini', provider: 'Google' },
    { id: 'notion-ai', name: 'Notion AI', provider: 'Notion' },
    { id: 'perplexity-search', name: 'Perplexity AI Search', provider: 'Perplexity' },
    { id: 'midjourney-art', name: 'Midjourney AI Art', provider: 'Midjourney' },
    { id: 'make-automation', name: 'Make Automation', provider: 'Make' },
    { id: 'huggingface-models', name: 'Hugging Face Models', provider: 'Hugging Face' },
    { id: 'replicate-ai', name: 'Replicate AI', provider: 'Replicate' }
  ];

  return {
    initialized: true,
    channelId,
    channelName,
    extensionsCount: extensions.length,
    extensions,
    message: `Successfully initialized Slack integration with ${extensions.length} AI extensions`
  };
};

export default {
  initializeSlackIntegration
};
