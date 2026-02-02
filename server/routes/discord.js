import express from 'express';
import { discordClient } from '../services/discordClient.js';

const router = express.Router();

const checkDiscordConfig = (req, res, next) => {
  if (!discordClient.isConfigured()) {
    return res.status(503).json({
      error: 'Discord API not configured',
      message: 'DISCORD_BOT_TOKEN environment variable is not set'
    });
  }
  next();
};

router.use(checkDiscordConfig);

// ==================== Messages ====================

router.post('/channels/:channelId/messages', async (req, res) => {
  try {
    const result = await discordClient.sendMessage(req.params.channelId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', message: error.message });
  }
});

router.patch('/channels/:channelId/messages/:messageId', async (req, res) => {
  try {
    const result = await discordClient.editMessage(
      req.params.channelId,
      req.params.messageId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message', message: error.message });
  }
});

router.delete('/channels/:channelId/messages/:messageId', async (req, res) => {
  try {
    await discordClient.deleteMessage(req.params.channelId, req.params.messageId);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message', message: error.message });
  }
});

router.get('/channels/:channelId/messages', async (req, res) => {
  try {
    const result = await discordClient.getMessages(req.params.channelId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages', message: error.message });
  }
});

// ==================== Channels ====================

router.get('/channels/:channelId', async (req, res) => {
  try {
    const result = await discordClient.getChannel(req.params.channelId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting channel:', error);
    res.status(500).json({ error: 'Failed to get channel', message: error.message });
  }
});

router.patch('/channels/:channelId', async (req, res) => {
  try {
    const result = await discordClient.modifyChannel(req.params.channelId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error modifying channel:', error);
    res.status(500).json({ error: 'Failed to modify channel', message: error.message });
  }
});

router.delete('/channels/:channelId', async (req, res) => {
  try {
    const result = await discordClient.deleteChannel(req.params.channelId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ error: 'Failed to delete channel', message: error.message });
  }
});

// ==================== Guilds ====================

router.get('/guilds/:guildId', async (req, res) => {
  try {
    const result = await discordClient.getGuild(req.params.guildId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting guild:', error);
    res.status(500).json({ error: 'Failed to get guild', message: error.message });
  }
});

router.get('/guilds/:guildId/channels', async (req, res) => {
  try {
    const result = await discordClient.getGuildChannels(req.params.guildId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting guild channels:', error);
    res.status(500).json({ error: 'Failed to get guild channels', message: error.message });
  }
});

router.post('/guilds/:guildId/channels', async (req, res) => {
  try {
    const result = await discordClient.createGuildChannel(req.params.guildId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating guild channel:', error);
    res.status(500).json({ error: 'Failed to create guild channel', message: error.message });
  }
});

router.get('/guilds/:guildId/members', async (req, res) => {
  try {
    const result = await discordClient.getGuildMembers(req.params.guildId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting guild members:', error);
    res.status(500).json({ error: 'Failed to get guild members', message: error.message });
  }
});

router.get('/guilds/:guildId/members/:userId', async (req, res) => {
  try {
    const result = await discordClient.getGuildMember(req.params.guildId, req.params.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting guild member:', error);
    res.status(500).json({ error: 'Failed to get guild member', message: error.message });
  }
});

// ==================== Users ====================

router.get('/users/@me', async (req, res) => {
  try {
    const result = await discordClient.getCurrentUser();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user', message: error.message });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const result = await discordClient.getUser(req.params.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

router.get('/users/@me/guilds', async (req, res) => {
  try {
    const result = await discordClient.getCurrentUserGuilds();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user guilds:', error);
    res.status(500).json({ error: 'Failed to get user guilds', message: error.message });
  }
});

// ==================== Reactions ====================

router.put('/channels/:channelId/messages/:messageId/reactions/:emoji/@me', async (req, res) => {
  try {
    await discordClient.addReaction(req.params.channelId, req.params.messageId, req.params.emoji);
    res.json({ success: true, message: 'Reaction added' });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction', message: error.message });
  }
});

router.delete('/channels/:channelId/messages/:messageId/reactions/:emoji/@me', async (req, res) => {
  try {
    await discordClient.removeReaction(req.params.channelId, req.params.messageId, req.params.emoji);
    res.json({ success: true, message: 'Reaction removed' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction', message: error.message });
  }
});

// ==================== Webhooks ====================

router.post('/webhooks/:webhookId/:webhookToken', async (req, res) => {
  try {
    const result = await discordClient.executeWebhook(
      req.params.webhookId,
      req.params.webhookToken,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error executing webhook:', error);
    res.status(500).json({ error: 'Failed to execute webhook', message: error.message });
  }
});

// ==================== Embeds ====================

router.post('/embeds/create', async (req, res) => {
  try {
    const embed = discordClient.createEmbed(req.body);
    res.json({ success: true, data: embed });
  } catch (error) {
    console.error('Error creating embed:', error);
    res.status(500).json({ error: 'Failed to create embed', message: error.message });
  }
});

export { router as discordRouter };
