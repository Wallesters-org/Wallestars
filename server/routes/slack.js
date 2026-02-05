import express from 'express';
import { slackClient } from '../services/slackClient.js';

const router = express.Router();

const checkSlackConfig = (req, res, next) => {
  if (!slackClient.isConfigured()) {
    return res.status(503).json({
      error: 'Slack API not configured',
      message: 'SLACK_BOT_TOKEN environment variable is not set'
    });
  }
  next();
};

router.use(checkSlackConfig);

// ==================== Messages ====================

router.post('/messages', async (req, res) => {
  try {
    const { channel, text, ...options } = req.body;
    const result = await slackClient.postMessage(channel, text, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Failed to post message', message: error.message });
  }
});

router.put('/messages', async (req, res) => {
  try {
    const { channel, ts, text, ...options } = req.body;
    const result = await slackClient.updateMessage(channel, ts, text, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message', message: error.message });
  }
});

router.delete('/messages', async (req, res) => {
  try {
    const { channel, ts } = req.body;
    const result = await slackClient.deleteMessage(channel, ts);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message', message: error.message });
  }
});

router.get('/channels/:channel/history', async (req, res) => {
  try {
    const result = await slackClient.getHistory(req.params.channel, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history', message: error.message });
  }
});

// ==================== Channels ====================

router.get('/channels', async (req, res) => {
  try {
    const result = await slackClient.listChannels(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing channels:', error);
    res.status(500).json({ error: 'Failed to list channels', message: error.message });
  }
});

router.get('/channels/:channel', async (req, res) => {
  try {
    const result = await slackClient.getChannelInfo(req.params.channel);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting channel:', error);
    res.status(500).json({ error: 'Failed to get channel', message: error.message });
  }
});

router.post('/channels', async (req, res) => {
  try {
    const { name, isPrivate } = req.body;
    const result = await slackClient.createChannel(name, isPrivate);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel', message: error.message });
  }
});

router.post('/channels/:channel/join', async (req, res) => {
  try {
    const result = await slackClient.joinChannel(req.params.channel);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error joining channel:', error);
    res.status(500).json({ error: 'Failed to join channel', message: error.message });
  }
});

router.post('/channels/:channel/invite', async (req, res) => {
  try {
    const { users } = req.body;
    const result = await slackClient.inviteToChannel(req.params.channel, users);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error inviting to channel:', error);
    res.status(500).json({ error: 'Failed to invite to channel', message: error.message });
  }
});

// ==================== Users ====================

router.get('/users', async (req, res) => {
  try {
    const result = await slackClient.listUsers(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users', message: error.message });
  }
});

router.get('/users/:user', async (req, res) => {
  try {
    const result = await slackClient.getUserInfo(req.params.user);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

router.get('/users/email/:email', async (req, res) => {
  try {
    const result = await slackClient.lookupByEmail(req.params.email);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error looking up user:', error);
    res.status(500).json({ error: 'Failed to lookup user', message: error.message });
  }
});

// ==================== Reactions ====================

router.post('/reactions', async (req, res) => {
  try {
    const { channel, timestamp, name } = req.body;
    const result = await slackClient.addReaction(channel, timestamp, name);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction', message: error.message });
  }
});

// ==================== Files ====================

router.post('/files', async (req, res) => {
  try {
    const result = await slackClient.uploadFile(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file', message: error.message });
  }
});

router.get('/files', async (req, res) => {
  try {
    const result = await slackClient.listFiles(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files', message: error.message });
  }
});

// ==================== Auth ====================

router.get('/auth/test', async (req, res) => {
  try {
    const result = await slackClient.authTest();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error testing auth:', error);
    res.status(500).json({ error: 'Failed to test auth', message: error.message });
  }
});

export { router as slackRouter };
