import express from 'express';

const router = express.Router();

// Store for Slack messages (in production, use a database)
const slackMessages = [];
const slackChannels = [];

// Send message to Slack via webhook
router.post('/send', async (req, res) => {
  try {
    const { channel, message, username, icon_emoji } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({
        error: 'SLACK_WEBHOOK_URL not configured',
        hint: 'Please set SLACK_WEBHOOK_URL in your .env file'
      });
    }

    const payload = {
      text: message,
      channel: channel || undefined,
      username: username || 'Wallestars Bot',
      icon_emoji: icon_emoji || ':robot_face:'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack API error: ${errorText}`);
    }

    // Store sent message locally
    const sentMessage = {
      id: Date.now(),
      channel: channel || 'default',
      message,
      username: payload.username,
      direction: 'outgoing',
      timestamp: new Date().toISOString()
    };

    slackMessages.push(sentMessage);

    // Keep only last 100 messages
    if (slackMessages.length > 100) {
      slackMessages.shift();
    }

    console.log('💬 Slack message sent:', {
      channel: channel || 'default',
      message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    });

    // Emit to connected WebSocket clients
    if (global.io) {
      global.io.emit('slack:message-sent', sentMessage);
    }

    res.json({
      success: true,
      message: 'Message sent to Slack',
      sentMessage
    });
  } catch (error) {
    console.error('Slack send error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Receive message from Slack (webhook endpoint for Slack Events API)
router.post('/receive', (req, res) => {
  try {
    // Handle Slack URL verification challenge
    if (req.body.challenge) {
      return res.json({ challenge: req.body.challenge });
    }

    const { event } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event data required' });
    }

    // Process message event
    if (event.type === 'message' && !event.bot_id) {
      const receivedMessage = {
        id: Date.now(),
        channel: event.channel,
        message: event.text,
        user: event.user,
        direction: 'incoming',
        timestamp: new Date().toISOString(),
        slackTs: event.ts
      };

      slackMessages.push(receivedMessage);

      // Keep only last 100 messages
      if (slackMessages.length > 100) {
        slackMessages.shift();
      }

      console.log('📥 Slack message received:', {
        channel: event.channel,
        user: event.user,
        text: event.text?.substring(0, 50)
      });

      // Emit to connected WebSocket clients
      if (global.io) {
        global.io.emit('slack:message-received', receivedMessage);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Slack receive error:', error);
    res.status(500).json({ error: 'Failed to process Slack event' });
  }
});

// Get message history
router.get('/messages', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const channel = req.query.channel;

    let filteredMessages = slackMessages;
    if (channel) {
      filteredMessages = slackMessages.filter(m => m.channel === channel);
    }

    const result = filteredMessages.slice(-limit);

    res.json({
      count: result.length,
      total: filteredMessages.length,
      messages: result
    });
  } catch (error) {
    console.error('Error fetching Slack messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add channel
router.post('/channels', (req, res) => {
  try {
    const { name, webhookUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const channel = {
      id: Date.now(),
      name,
      webhookUrl: webhookUrl || null,
      createdAt: new Date().toISOString()
    };

    slackChannels.push(channel);

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    console.error('Error adding channel:', error);
    res.status(500).json({ error: 'Failed to add channel' });
  }
});

// Get channels
router.get('/channels', (req, res) => {
  try {
    res.json({
      count: slackChannels.length,
      channels: slackChannels
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Check Slack configuration status
router.get('/status', (req, res) => {
  try {
    const webhookConfigured = !!process.env.SLACK_WEBHOOK_URL;
    const botToken = !!process.env.SLACK_BOT_TOKEN;

    res.json({
      configured: webhookConfigured,
      features: {
        sendMessages: webhookConfigured,
        receiveMessages: botToken,
        channels: true
      },
      messagesCount: slackMessages.length,
      channelsCount: slackChannels.length
    });
  } catch (error) {
    console.error('Error checking Slack status:', error);
    res.status(500).json({ error: 'Failed to check Slack status' });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Slack API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      send: 'POST /api/slack/send',
      receive: 'POST /api/slack/receive',
      messages: 'GET /api/slack/messages',
      channels: 'GET/POST /api/slack/channels',
      status: 'GET /api/slack/status'
    }
  });
});

export const slackRouter = router;
