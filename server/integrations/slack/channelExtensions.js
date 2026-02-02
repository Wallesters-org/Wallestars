/**
 * Slack Channel Extensions Manager
 * Manages AI extensions for Slack channels
 */

import { slackAIExtensions, getEnabledExtensions, getExtensionById } from './aiExtensions.js';

/**
 * Channel Extension Configuration
 * Maps channel IDs to their enabled AI extensions
 */
const channelExtensions = new Map();

/**
 * Default channel configuration with all 10 AI extensions
 */
const defaultChannelConfig = {
  channelId: null,
  channelName: null,
  extensions: [],
  createdAt: null,
  updatedAt: null,
  settings: {
    notifyOnAdd: true,
    maxConcurrentRequests: 5,
    rateLimit: {
      requests: 100,
      windowMs: 60000 // 1 minute
    }
  }
};

/**
 * Add all 10 AI extensions to a channel
 * @param {string} channelId - Slack channel ID
 * @param {string} channelName - Slack channel name
 * @returns {object} Channel configuration with all extensions
 */
export const addAllExtensionsToChannel = (channelId, channelName = 'Unknown') => {
  const enabledExtensions = getEnabledExtensions();

  const channelConfig = {
    ...defaultChannelConfig,
    channelId,
    channelName,
    extensions: enabledExtensions.map(ext => ({
      extensionId: ext.id,
      name: ext.name,
      enabled: true,
      addedAt: new Date().toISOString(),
      config: { ...ext.config }
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  channelExtensions.set(channelId, channelConfig);

  return channelConfig;
};

/**
 * Add specific extensions to a channel
 * @param {string} channelId - Slack channel ID
 * @param {string[]} extensionIds - Array of extension IDs to add
 * @returns {object} Updated channel configuration
 */
export const addExtensionsToChannel = (channelId, extensionIds) => {
  let channelConfig = channelExtensions.get(channelId);

  if (!channelConfig) {
    channelConfig = {
      ...defaultChannelConfig,
      channelId,
      extensions: [],
      createdAt: new Date().toISOString()
    };
  }

  const existingIds = channelConfig.extensions.map(e => e.extensionId);

  for (const extId of extensionIds) {
    if (!existingIds.includes(extId)) {
      const extension = getExtensionById(extId);
      if (extension) {
        channelConfig.extensions.push({
          extensionId: extension.id,
          name: extension.name,
          enabled: true,
          addedAt: new Date().toISOString(),
          config: { ...extension.config }
        });
      }
    }
  }

  channelConfig.updatedAt = new Date().toISOString();
  channelExtensions.set(channelId, channelConfig);

  return channelConfig;
};

/**
 * Remove extension from a channel
 * @param {string} channelId - Slack channel ID
 * @param {string} extensionId - Extension ID to remove
 * @returns {boolean} Success status
 */
export const removeExtensionFromChannel = (channelId, extensionId) => {
  const channelConfig = channelExtensions.get(channelId);

  if (!channelConfig) {
    return false;
  }

  const index = channelConfig.extensions.findIndex(e => e.extensionId === extensionId);

  if (index !== -1) {
    channelConfig.extensions.splice(index, 1);
    channelConfig.updatedAt = new Date().toISOString();
    channelExtensions.set(channelId, channelConfig);
    return true;
  }

  return false;
};

/**
 * Get channel configuration
 * @param {string} channelId - Slack channel ID
 * @returns {object|null} Channel configuration
 */
export const getChannelConfig = (channelId) => {
  return channelExtensions.get(channelId) || null;
};

/**
 * Get all configured channels
 * @returns {object[]} Array of channel configurations
 */
export const getAllConfiguredChannels = () => {
  return Array.from(channelExtensions.values());
};

/**
 * Toggle extension in a channel
 * @param {string} channelId - Slack channel ID
 * @param {string} extensionId - Extension ID to toggle
 * @returns {boolean|null} New enabled state or null if not found
 */
export const toggleExtensionInChannel = (channelId, extensionId) => {
  const channelConfig = channelExtensions.get(channelId);

  if (!channelConfig) {
    return null;
  }

  const extension = channelConfig.extensions.find(e => e.extensionId === extensionId);

  if (extension) {
    extension.enabled = !extension.enabled;
    channelConfig.updatedAt = new Date().toISOString();
    channelExtensions.set(channelId, channelConfig);
    return extension.enabled;
  }

  return null;
};

/**
 * Update extension config in a channel
 * @param {string} channelId - Slack channel ID
 * @param {string} extensionId - Extension ID
 * @param {object} config - New configuration
 * @returns {boolean} Success status
 */
export const updateExtensionConfig = (channelId, extensionId, config) => {
  const channelConfig = channelExtensions.get(channelId);

  if (!channelConfig) {
    return false;
  }

  const extension = channelConfig.extensions.find(e => e.extensionId === extensionId);

  if (extension) {
    extension.config = { ...extension.config, ...config };
    channelConfig.updatedAt = new Date().toISOString();
    channelExtensions.set(channelId, channelConfig);
    return true;
  }

  return false;
};

/**
 * Get channel extension summary
 * @param {string} channelId - Slack channel ID
 * @returns {object} Summary of extensions in channel
 */
export const getChannelExtensionSummary = (channelId) => {
  const channelConfig = channelExtensions.get(channelId);

  if (!channelConfig) {
    return {
      configured: false,
      totalExtensions: 0,
      enabledExtensions: 0,
      extensions: []
    };
  }

  const enabled = channelConfig.extensions.filter(e => e.enabled);

  return {
    configured: true,
    channelId: channelConfig.channelId,
    channelName: channelConfig.channelName,
    totalExtensions: channelConfig.extensions.length,
    enabledExtensions: enabled.length,
    extensions: channelConfig.extensions.map(e => ({
      id: e.extensionId,
      name: e.name,
      enabled: e.enabled
    })),
    createdAt: channelConfig.createdAt,
    updatedAt: channelConfig.updatedAt
  };
};

/**
 * List all available AI extensions
 * @returns {object[]} Array of available extensions
 */
export const listAvailableExtensions = () => {
  return slackAIExtensions.map(ext => ({
    id: ext.id,
    name: ext.name,
    description: ext.description,
    type: ext.type,
    provider: ext.provider,
    capabilities: ext.capabilities,
    commands: ext.commands,
    enabled: ext.enabled
  }));
};

export default {
  addAllExtensionsToChannel,
  addExtensionsToChannel,
  removeExtensionFromChannel,
  getChannelConfig,
  getAllConfiguredChannels,
  toggleExtensionInChannel,
  updateExtensionConfig,
  getChannelExtensionSummary,
  listAvailableExtensions
};
