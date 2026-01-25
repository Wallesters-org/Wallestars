import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Chat with Claude
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
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

    const response = await anthropic.messages.create({
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

// Analyze image for QR Scanner
router.post('/analyze-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    // Extract base64 data and type
    const base64Data = image.split(',')[1];
    const imageType = image.split(';')[0].split(':')[1];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageType,
              data: base64Data
            }
          },
          {
            type: 'text',
            text: prompt || 'Analyze this image and provide key information.'
          }
        ]
      }]
    });

    const responseText = response.content[0].text.trim();

    // Try to extract JSON from response
    let extractedData;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        extractedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        extractedData = {
          title: 'Image Analysis',
          category: 'other',
          mainElements: [],
          text: responseText,
          colors: [],
          context: responseText,
          tags: []
        };
      }
    } else {
      extractedData = {
        title: 'Image Analysis',
        category: 'other',
        mainElements: [],
        text: responseText,
        colors: [],
        context: responseText,
        tags: []
      };
    }

    res.json({
      success: true,
      extractedData: extractedData,
      rawResponse: responseText
    });

  } catch (error) {
    console.error('Image Analysis Error:', error);
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
      streaming: true,
      qrScanner: true
    }
  });
});

export { router as claudeRouter };
