require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Validate API key on startup
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not set. API endpoints will not work.');
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-startup',
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Wallestars Claude Container',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      skills: '/api/skills'
    }
  });
});

// Chat endpoint - interact with Claude
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Build messages array from conversation history
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: messages
    });

    res.json({
      success: true,
      response: response.content[0].text,
      usage: response.usage,
      messageId: response.id
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

// Skills endpoint - Claude with specific capabilities
app.post('/api/skills', async (req, res) => {
  try {
    const { task, context = '', skill = 'general' } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Define system prompts for different skills
    const skillPrompts = {
      general: 'You are a helpful AI assistant.',
      coding: 'You are an expert software developer skilled in multiple programming languages. Provide clear, well-documented code solutions.',
      analysis: 'You are a data analyst expert. Provide detailed analysis and insights.',
      creative: 'You are a creative writing assistant. Help with brainstorming and content creation.',
      technical: 'You are a technical documentation expert. Provide clear and comprehensive explanations.'
    };

    const systemPrompt = skillPrompts[skill] || skillPrompts.general;

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: context ? `Context: ${context}\n\nTask: ${task}` : task
        }
      ]
    });

    res.json({
      success: true,
      response: response.content[0].text,
      skill: skill,
      usage: response.usage,
      messageId: response.id
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      error: 'Failed to process skill request',
      details: error.message
    });
  }
});

// List available skills
app.get('/api/skills', (req, res) => {
  res.json({
    skills: [
      { name: 'general', description: 'General purpose assistance' },
      { name: 'coding', description: 'Software development and coding assistance' },
      { name: 'analysis', description: 'Data analysis and insights' },
      { name: 'creative', description: 'Creative writing and brainstorming' },
      { name: 'technical', description: 'Technical documentation and explanations' }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wallestars Claude Container running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🛠️  Skills endpoint: http://localhost:${PORT}/api/skills`);
});

module.exports = app;
