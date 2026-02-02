import express from 'express';
import { airtopClient } from '../services/airtopClient.js';

const router = express.Router();

// Middleware to check if Airtop API is configured
const checkAirtopConfig = (req, res, next) => {
  if (!airtopClient.isConfigured()) {
    return res.status(503).json({
      error: 'Airtop API not configured',
      message: 'AIRTOP_API_KEY environment variable is not set'
    });
  }
  next();
};

router.use(checkAirtopConfig);

// ==================== Sessions ====================

/**
 * POST /api/airtop/sessions
 * Create a new browser session
 */
router.post('/sessions', async (req, res) => {
  try {
    const session = await airtopClient.createSession(req.body);
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session', message: error.message });
  }
});

/**
 * GET /api/airtop/sessions
 * List all sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await airtopClient.listSessions();
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions', message: error.message });
  }
});

/**
 * GET /api/airtop/sessions/:id
 * Get session details
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await airtopClient.getSession(req.params.id);
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session', message: error.message });
  }
});

/**
 * DELETE /api/airtop/sessions/:id
 * Close a session
 */
router.delete('/sessions/:id', async (req, res) => {
  try {
    const result = await airtopClient.closeSession(req.params.id);
    res.json({ success: true, message: 'Session closed', data: result });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({ error: 'Failed to close session', message: error.message });
  }
});

// ==================== Browser Actions ====================

/**
 * POST /api/airtop/sessions/:id/navigate
 * Navigate to URL
 */
router.post('/sessions/:id/navigate', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await airtopClient.navigate(req.params.id, url);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error navigating:', error);
    res.status(500).json({ error: 'Failed to navigate', message: error.message });
  }
});

/**
 * POST /api/airtop/sessions/:id/screenshot
 * Take screenshot
 */
router.post('/sessions/:id/screenshot', async (req, res) => {
  try {
    const result = await airtopClient.screenshot(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).json({ error: 'Failed to take screenshot', message: error.message });
  }
});

/**
 * POST /api/airtop/sessions/:id/click
 * Click element
 */
router.post('/sessions/:id/click', async (req, res) => {
  try {
    const result = await airtopClient.click(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error clicking:', error);
    res.status(500).json({ error: 'Failed to click', message: error.message });
  }
});

/**
 * POST /api/airtop/sessions/:id/type
 * Type text
 */
router.post('/sessions/:id/type', async (req, res) => {
  try {
    const result = await airtopClient.type(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error typing:', error);
    res.status(500).json({ error: 'Failed to type', message: error.message });
  }
});

/**
 * POST /api/airtop/sessions/:id/execute
 * Execute JavaScript
 */
router.post('/sessions/:id/execute', async (req, res) => {
  try {
    const { script } = req.body;
    const result = await airtopClient.executeScript(req.params.id, script);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error executing script:', error);
    res.status(500).json({ error: 'Failed to execute script', message: error.message });
  }
});

// ==================== AI Features ====================

/**
 * POST /api/airtop/sessions/:id/extract
 * Extract data using AI
 */
router.post('/sessions/:id/extract', async (req, res) => {
  try {
    const result = await airtopClient.extract(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error extracting:', error);
    res.status(500).json({ error: 'Failed to extract', message: error.message });
  }
});

/**
 * POST /api/airtop/sessions/:id/ai-action
 * Perform AI-guided action
 */
router.post('/sessions/:id/ai-action', async (req, res) => {
  try {
    const { instruction } = req.body;
    const result = await airtopClient.aiAction(req.params.id, instruction);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error performing AI action:', error);
    res.status(500).json({ error: 'Failed to perform AI action', message: error.message });
  }
});

/**
 * POST /api/airtop/sessions/:id/ai-query
 * Ask AI about page
 */
router.post('/sessions/:id/ai-query', async (req, res) => {
  try {
    const { question } = req.body;
    const result = await airtopClient.aiQuery(req.params.id, question);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error querying AI:', error);
    res.status(500).json({ error: 'Failed to query AI', message: error.message });
  }
});

// ==================== Page Content ====================

/**
 * GET /api/airtop/sessions/:id/content
 * Get page HTML content
 */
router.get('/sessions/:id/content', async (req, res) => {
  try {
    const result = await airtopClient.getPageContent(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({ error: 'Failed to get content', message: error.message });
  }
});

/**
 * GET /api/airtop/sessions/:id/text
 * Get page text content
 */
router.get('/sessions/:id/text', async (req, res) => {
  try {
    const result = await airtopClient.getPageText(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting text:', error);
    res.status(500).json({ error: 'Failed to get text', message: error.message });
  }
});

/**
 * POST /api/airtop/sessions/:id/wait
 * Wait for element
 */
router.post('/sessions/:id/wait', async (req, res) => {
  try {
    const { selector, timeout } = req.body;
    const result = await airtopClient.waitForElement(req.params.id, selector, timeout);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error waiting for element:', error);
    res.status(500).json({ error: 'Failed to wait for element', message: error.message });
  }
});

export { router as airtopRouter };
