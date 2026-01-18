import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Lazy initialization to ensure dotenv has loaded
let anthropic = null;
function getAnthropicClient() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

// Chat with Claude
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: messages,
    });

    res.json({
      success: true,
      response: response.content[0].text,
      usage: response.usage,
      conversationHistory: [
        ...messages,
        { role: 'assistant', content: response.content[0].text }
      ]
    });
  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Claude Computer Use - Full automation
router.post('/computer-use', async (req, res) => {
  try {
    const { task, screenshot } = req.body;

    const messages = [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: screenshot,
          },
        },
        {
          type: 'text',
          text: `You are controlling a computer. Current task: ${task}\n\nAnalyze the screenshot and decide what action to take next. Respond with JSON: {"action": "click|type|key", "x": 100, "y": 100, "text": "...", "explanation": "..."}`
        }
      ]
    }];

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: messages,
    });

    const actionText = response.content[0].text;
    let action;

    try {
      action = JSON.parse(actionText);
    } catch {
      action = {
        action: 'none',
        explanation: actionText
      };
    }

    res.json({
      success: true,
      action: action,
      rawResponse: actionText
    });
  } catch (error) {
    console.error('Computer Use Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get model capabilities
router.get('/capabilities', (req, res) => {
  res.json({
    models: [
      {
        id: 'claude-sonnet-4-5-20250929',
        name: 'Claude Sonnet 4.5',
        capabilities: ['chat', 'computer-use', 'vision', 'coding']
      },
      {
        id: 'claude-opus-4-5-20251101',
        name: 'Claude Opus 4.5',
        capabilities: ['chat', 'computer-use', 'vision', 'coding', 'advanced-reasoning']
      }
    ],
    features: {
      computerUse: process.env.ENABLE_COMPUTER_USE === 'true',
      android: process.env.ENABLE_ANDROID === 'true',
      vision: true,
      streaming: true
    }
  });
});

export { router as claudeRouter };
