import express from 'express';
import { twilioClient } from '../services/twilioClient.js';

const router = express.Router();

const checkTwilioConfig = (req, res, next) => {
  if (!twilioClient.isConfigured()) {
    return res.status(503).json({
      error: 'Twilio API not configured',
      message: 'TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are not set'
    });
  }
  next();
};

router.use(checkTwilioConfig);

// ==================== Messages (SMS) ====================

router.post('/messages', async (req, res) => {
  try {
    const { to, body, ...options } = req.body;
    const result = await twilioClient.sendSMS(to, body, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS', message: error.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const result = await twilioClient.listMessages(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing messages:', error);
    res.status(500).json({ error: 'Failed to list messages', message: error.message });
  }
});

router.get('/messages/:messageSid', async (req, res) => {
  try {
    const result = await twilioClient.getMessage(req.params.messageSid);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: 'Failed to get message', message: error.message });
  }
});

router.delete('/messages/:messageSid', async (req, res) => {
  try {
    await twilioClient.deleteMessage(req.params.messageSid);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message', message: error.message });
  }
});

// ==================== Calls (Voice) ====================

router.post('/calls', async (req, res) => {
  try {
    const { to, url, ...options } = req.body;
    const result = await twilioClient.makeCall(to, url, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ error: 'Failed to make call', message: error.message });
  }
});

router.get('/calls', async (req, res) => {
  try {
    const result = await twilioClient.listCalls(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing calls:', error);
    res.status(500).json({ error: 'Failed to list calls', message: error.message });
  }
});

router.get('/calls/:callSid', async (req, res) => {
  try {
    const result = await twilioClient.getCall(req.params.callSid);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting call:', error);
    res.status(500).json({ error: 'Failed to get call', message: error.message });
  }
});

router.post('/calls/:callSid', async (req, res) => {
  try {
    const result = await twilioClient.updateCall(req.params.callSid, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating call:', error);
    res.status(500).json({ error: 'Failed to update call', message: error.message });
  }
});

// ==================== Phone Numbers ====================

router.get('/phone-numbers', async (req, res) => {
  try {
    const result = await twilioClient.listPhoneNumbers(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing phone numbers:', error);
    res.status(500).json({ error: 'Failed to list phone numbers', message: error.message });
  }
});

router.get('/phone-numbers/:phoneNumberSid', async (req, res) => {
  try {
    const result = await twilioClient.getPhoneNumber(req.params.phoneNumberSid);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting phone number:', error);
    res.status(500).json({ error: 'Failed to get phone number', message: error.message });
  }
});

router.get('/available-numbers/:countryCode', async (req, res) => {
  try {
    const result = await twilioClient.searchAvailableNumbers(req.params.countryCode, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching numbers:', error);
    res.status(500).json({ error: 'Failed to search numbers', message: error.message });
  }
});

// ==================== Recordings ====================

router.get('/recordings', async (req, res) => {
  try {
    const result = await twilioClient.listRecordings(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing recordings:', error);
    res.status(500).json({ error: 'Failed to list recordings', message: error.message });
  }
});

router.get('/recordings/:recordingSid', async (req, res) => {
  try {
    const result = await twilioClient.getRecording(req.params.recordingSid);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting recording:', error);
    res.status(500).json({ error: 'Failed to get recording', message: error.message });
  }
});

router.delete('/recordings/:recordingSid', async (req, res) => {
  try {
    await twilioClient.deleteRecording(req.params.recordingSid);
    res.json({ success: true, message: 'Recording deleted' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ error: 'Failed to delete recording', message: error.message });
  }
});

// ==================== Account ====================

router.get('/account', async (req, res) => {
  try {
    const result = await twilioClient.getAccount();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({ error: 'Failed to get account', message: error.message });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const result = await twilioClient.getUsage(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({ error: 'Failed to get usage', message: error.message });
  }
});

// ==================== Verify (2FA) ====================

router.post('/verify/send', async (req, res) => {
  try {
    const { to, channel } = req.body;
    const result = await twilioClient.sendVerification(to, channel);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending verification:', error);
    res.status(500).json({ error: 'Failed to send verification', message: error.message });
  }
});

router.post('/verify/check', async (req, res) => {
  try {
    const { to, code } = req.body;
    const result = await twilioClient.checkVerification(to, code);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error checking verification:', error);
    res.status(500).json({ error: 'Failed to check verification', message: error.message });
  }
});

export { router as twilioRouter };
