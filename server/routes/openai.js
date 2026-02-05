import express from 'express';
import { openaiClient } from '../services/openaiClient.js';

const router = express.Router();

const checkOpenAIConfig = (req, res, next) => {
  if (!openaiClient.isConfigured()) {
    return res.status(503).json({
      error: 'OpenAI API not configured',
      message: 'OPENAI_API_KEY environment variable is not set'
    });
  }
  next();
};

router.use(checkOpenAIConfig);

// ==================== Chat Completions ====================

router.post('/chat/completions', async (req, res) => {
  try {
    const { messages, ...options } = req.body;
    const result = await openaiClient.createChatCompletion(messages, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating chat completion:', error);
    res.status(500).json({ error: 'Failed to create chat completion', message: error.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, systemPrompt, ...options } = req.body;
    const result = await openaiClient.chat(message, systemPrompt, options);
    res.json({ success: true, data: { response: result } });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to chat', message: error.message });
  }
});

// ==================== Completions ====================

router.post('/completions', async (req, res) => {
  try {
    const { prompt, ...options } = req.body;
    const result = await openaiClient.createCompletion(prompt, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating completion:', error);
    res.status(500).json({ error: 'Failed to create completion', message: error.message });
  }
});

// ==================== Embeddings ====================

router.post('/embeddings', async (req, res) => {
  try {
    const { input, ...options } = req.body;
    const result = await openaiClient.createEmbedding(input, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating embedding:', error);
    res.status(500).json({ error: 'Failed to create embedding', message: error.message });
  }
});

// ==================== Images ====================

router.post('/images/generations', async (req, res) => {
  try {
    const { prompt, ...options } = req.body;
    const result = await openaiClient.createImage(prompt, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image', message: error.message });
  }
});

// ==================== Audio ====================

router.post('/audio/speech', async (req, res) => {
  try {
    const { text, ...options } = req.body;
    const audioBuffer = await openaiClient.createSpeech(text, options);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error creating speech:', error);
    res.status(500).json({ error: 'Failed to create speech', message: error.message });
  }
});

// ==================== Moderations ====================

router.post('/moderations', async (req, res) => {
  try {
    const { input } = req.body;
    const result = await openaiClient.createModeration(input);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating moderation:', error);
    res.status(500).json({ error: 'Failed to create moderation', message: error.message });
  }
});

// ==================== Models ====================

router.get('/models', async (req, res) => {
  try {
    const result = await openaiClient.listModels();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ error: 'Failed to list models', message: error.message });
  }
});

router.get('/models/:modelId', async (req, res) => {
  try {
    const result = await openaiClient.getModel(req.params.modelId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting model:', error);
    res.status(500).json({ error: 'Failed to get model', message: error.message });
  }
});

// ==================== Assistants ====================

router.post('/assistants', async (req, res) => {
  try {
    const result = await openaiClient.createAssistant(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({ error: 'Failed to create assistant', message: error.message });
  }
});

router.get('/assistants', async (req, res) => {
  try {
    const result = await openaiClient.listAssistants(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing assistants:', error);
    res.status(500).json({ error: 'Failed to list assistants', message: error.message });
  }
});

// ==================== Threads ====================

router.post('/threads', async (req, res) => {
  try {
    const result = await openaiClient.createThread(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Failed to create thread', message: error.message });
  }
});

router.post('/threads/:threadId/messages', async (req, res) => {
  try {
    const result = await openaiClient.addMessageToThread(req.params.threadId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message', message: error.message });
  }
});

router.post('/threads/:threadId/runs', async (req, res) => {
  try {
    const { assistantId, ...options } = req.body;
    const result = await openaiClient.runAssistant(req.params.threadId, assistantId, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error running assistant:', error);
    res.status(500).json({ error: 'Failed to run assistant', message: error.message });
  }
});

export { router as openaiRouter };
