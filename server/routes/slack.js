/**
 * Slack Integration API Routes
 * Manages AI extensions for Slack channels
 */

import { Router } from 'express';
import {
  slackAIExtensions,
  getEnabledExtensions,
  getExtensionById,
  getExtensionsByType,
  getExtensionsByCapability,
  getAllCommands,
  addAllExtensionsToChannel,
  addExtensionsToChannel,
  removeExtensionFromChannel,
  getChannelConfig,
  getAllConfiguredChannels,
  toggleExtensionInChannel,
  updateExtensionConfig,
  getChannelExtensionSummary,
  listAvailableExtensions
} from '../integrations/slack/index.js';

const router = Router();

/**
 * GET /api/slack/extensions
 * List all available AI extensions (10 extensions)
 */
router.get('/extensions', (req, res) => {
  try {
    const extensions = listAvailableExtensions();
    res.json({
      success: true,
      count: extensions.length,
      extensions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/slack/extensions/:id
 * Get specific extension by ID
 */
router.get('/extensions/:id', (req, res) => {
  try {
    const extension = getExtensionById(req.params.id);
    if (!extension) {
      return res.status(404).json({
        success: false,
        error: 'Extension not found'
      });
    }
    res.json({
      success: true,
      extension
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/slack/extensions/type/:type
 * Get extensions by type
 */
router.get('/extensions/type/:type', (req, res) => {
  try {
    const extensions = getExtensionsByType(req.params.type);
    res.json({
      success: true,
      count: extensions.length,
      type: req.params.type,
      extensions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/slack/commands
 * Get all available slash commands
 */
router.get('/commands', (req, res) => {
  try {
    const commands = getAllCommands();
    res.json({
      success: true,
      count: commands.length,
      commands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/slack/channels/:channelId/extensions
 * Add all 10 AI extensions to a channel
 */
router.post('/channels/:channelId/extensions', (req, res) => {
  try {
    const { channelId } = req.params;
    const { channelName } = req.body;

    const channelConfig = addAllExtensionsToChannel(channelId, channelName);

    res.json({
      success: true,
      message: `Added ${channelConfig.extensions.length} AI extensions to channel`,
      channel: channelConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/slack/channels/:channelId/extensions/add
 * Add specific extensions to a channel
 */
router.post('/channels/:channelId/extensions/add', (req, res) => {
  try {
    const { channelId } = req.params;
    const { extensionIds } = req.body;

    if (!extensionIds || !Array.isArray(extensionIds)) {
      return res.status(400).json({
        success: false,
        error: 'extensionIds must be an array'
      });
    }

    const channelConfig = addExtensionsToChannel(channelId, extensionIds);

    res.json({
      success: true,
      message: `Updated extensions for channel`,
      channel: channelConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/slack/channels/:channelId/extensions/:extensionId
 * Remove an extension from a channel
 */
router.delete('/channels/:channelId/extensions/:extensionId', (req, res) => {
  try {
    const { channelId, extensionId } = req.params;
    const removed = removeExtensionFromChannel(channelId, extensionId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Extension or channel not found'
      });
    }

    res.json({
      success: true,
      message: `Removed extension ${extensionId} from channel`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/slack/channels/:channelId
 * Get channel configuration
 */
router.get('/channels/:channelId', (req, res) => {
  try {
    const { channelId } = req.params;
    const config = getChannelConfig(channelId);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Channel not configured'
      });
    }

    res.json({
      success: true,
      channel: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/slack/channels/:channelId/summary
 * Get channel extension summary
 */
router.get('/channels/:channelId/summary', (req, res) => {
  try {
    const { channelId } = req.params;
    const summary = getChannelExtensionSummary(channelId);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/slack/channels
 * Get all configured channels
 */
router.get('/channels', (req, res) => {
  try {
    const channels = getAllConfiguredChannels();
    res.json({
      success: true,
      count: channels.length,
      channels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/slack/channels/:channelId/extensions/:extensionId/toggle
 * Toggle extension enabled/disabled
 */
router.patch('/channels/:channelId/extensions/:extensionId/toggle', (req, res) => {
  try {
    const { channelId, extensionId } = req.params;
    const newState = toggleExtensionInChannel(channelId, extensionId);

    if (newState === null) {
      return res.status(404).json({
        success: false,
        error: 'Channel or extension not found'
      });
    }

    res.json({
      success: true,
      extensionId,
      enabled: newState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/slack/channels/:channelId/extensions/:extensionId/config
 * Update extension configuration
 */
router.patch('/channels/:channelId/extensions/:extensionId/config', (req, res) => {
  try {
    const { channelId, extensionId } = req.params;
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'config must be an object'
      });
    }

    const updated = updateExtensionConfig(channelId, extensionId, config);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Channel or extension not found'
      });
    }

    res.json({
      success: true,
      message: 'Extension configuration updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
