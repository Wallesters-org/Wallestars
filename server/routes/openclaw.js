/**
 * OpenClaw Integration API Routes
 *
 * Provides REST API endpoints for OpenClaw integration,
 * webhook handling, and multi-channel message routing.
 */

import express from 'express';
import { getOpenClawClient } from '../integrations/openclaw/index.js';
import WallestarsCommandRouter from '../integrations/openclaw/messageHandler.js';

const router = express.Router();
const commandRouter = new WallestarsCommandRouter();

// OpenClaw client instance
let openclawClient = null;

/**
 * Initialize OpenClaw client on first request or server start
 */
async function ensureClient() {
  if (!openclawClient) {
    openclawClient = getOpenClawClient();
    try {
      await openclawClient.connect();
    } catch (error) {
      console.warn('[OpenClaw] Could not connect to Gateway:', error.message);
    }
  }
  return openclawClient;
}

/**
 * GET /api/openclaw/status
 * Get OpenClaw connection status
 */
router.get('/status', async (req, res) => {
  try {
    const client = await ensureClient();
    const status = client.getStatus();

    res.json({
      success: true,
      status: {
        ...status,
        wallestarsFeatures: {
          claudeChat: true,
          computerControl: true,
          androidControl: true,
          qrScanner: true,
          smartScan: true,
          orchestration: true,
          promptGenerator: true
        }
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      status: { connected: false }
    });
  }
});

/**
 * POST /api/openclaw/connect
 * Manually connect to OpenClaw Gateway
 */
router.post('/connect', async (req, res) => {
  try {
    const { gatewayUrl } = req.body;
    openclawClient = getOpenClawClient({ gatewayUrl });
    await openclawClient.connect();

    res.json({
      success: true,
      message: 'Connected to OpenClaw Gateway',
      status: openclawClient.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/openclaw/disconnect
 * Disconnect from OpenClaw Gateway
 */
router.post('/disconnect', async (req, res) => {
  try {
    if (openclawClient) {
      openclawClient.disconnect();
    }

    res.json({
      success: true,
      message: 'Disconnected from OpenClaw Gateway'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/openclaw/sessions
 * List active OpenClaw sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const client = await ensureClient();

    if (!client.connected) {
      return res.json({
        success: false,
        error: 'Not connected to OpenClaw Gateway',
        sessions: []
      });
    }

    const sessions = await client.listSessions();

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/openclaw/sessions/:sessionId/history
 * Get session message history
 */
router.get('/sessions/:sessionId/history', async (req, res) => {
  try {
    const client = await ensureClient();
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    if (!client.connected) {
      return res.json({
        success: false,
        error: 'Not connected to OpenClaw Gateway'
      });
    }

    const history = await client.getSessionHistory(sessionId, parseInt(limit));

    res.json({
      success: true,
      sessionId,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/openclaw/sessions/:sessionId/send
 * Send message to a session
 */
router.post('/sessions/:sessionId/send', async (req, res) => {
  try {
    const client = await ensureClient();
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!client.connected) {
      return res.status(503).json({
        success: false,
        error: 'Not connected to OpenClaw Gateway'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    await client.sendMessage(sessionId, content);

    res.json({
      success: true,
      message: 'Message sent',
      sessionId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/openclaw/nodes
 * List connected device nodes
 */
router.get('/nodes', async (req, res) => {
  try {
    const client = await ensureClient();

    if (!client.connected) {
      return res.json({
        success: false,
        error: 'Not connected to OpenClaw Gateway',
        nodes: []
      });
    }

    const nodes = await client.listNodes();

    res.json({
      success: true,
      nodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/openclaw/webhook
 * Webhook endpoint for OpenClaw to call Wallestars
 * This allows OpenClaw skills/agents to interact with Wallestars
 */
router.post('/webhook', async (req, res) => {
  try {
    const {
      type,
      sessionId,
      channel,
      userId,
      content,
      attachments,
      metadata
    } = req.body;

    console.log(`[OpenClaw Webhook] ${type} from ${channel}:${userId}`);

    // Handle different webhook types
    switch (type) {
      case 'message':
        // Route message through command handler
        const result = await commandRouter.handleMessage({
          content,
          sessionId,
          channel,
          userId,
          attachments,
          metadata
        });

        if (result) {
          res.json({
            success: true,
            handled: true,
            response: result.response,
            image: result.image,
            data: result.data
          });
        } else {
          // Message not handled by Wallestars
          res.json({
            success: true,
            handled: false,
            message: 'Message not a Wallestars command'
          });
        }
        break;

      case 'image':
        // Handle image messages (for QR scanning, Smart Scan, etc.)
        if (attachments && attachments.length > 0) {
          const imageResult = await commandRouter.handleSmartScan(attachments[0].url);
          res.json({
            success: true,
            handled: true,
            ...imageResult
          });
        } else {
          res.json({
            success: false,
            error: 'No image attachment found'
          });
        }
        break;

      case 'command':
        // Direct command execution
        const cmdResult = await commandRouter.handleCommand(content, {
          sessionId,
          channel,
          userId
        });

        res.json({
          success: true,
          handled: true,
          ...cmdResult
        });
        break;

      case 'status':
        // Status check from OpenClaw
        res.json({
          success: true,
          wallestars: {
            status: 'online',
            version: '1.0.0',
            features: ['chat', 'computer-control', 'android', 'qr', 'scan', 'orchestration']
          }
        });
        break;

      default:
        res.json({
          success: false,
          error: `Unknown webhook type: ${type}`
        });
    }
  } catch (error) {
    console.error('[OpenClaw Webhook] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/openclaw/skill/invoke
 * Invoke a Wallestars feature as an OpenClaw skill
 */
router.post('/skill/invoke', async (req, res) => {
  try {
    const { skill, params, context } = req.body;

    console.log(`[OpenClaw Skill] Invoking: ${skill}`);

    let result;

    switch (skill) {
      case 'wallestars.chat':
        result = await commandRouter.handleClaudeChat(params.message, context);
        break;

      case 'wallestars.screenshot':
        result = await commandRouter.takeScreenshot(params.options);
        break;

      case 'wallestars.click':
        result = await commandRouter.performClick(`${params.x} ${params.y}`);
        break;

      case 'wallestars.type':
        result = await commandRouter.performType(params.text);
        break;

      case 'wallestars.android':
        result = await commandRouter.handleAndroidCommand(
          `${params.command} ${params.args || ''}`
        );
        break;

      case 'wallestars.qr':
        result = await commandRouter.handleQRCommand(
          `${params.action} ${params.data || ''}`
        );
        break;

      case 'wallestars.scan':
        result = await commandRouter.handleSmartScan(params.imageUrl);
        break;

      case 'wallestars.orchestration':
        result = await commandRouter.handleOrchestration(
          `${params.action} ${params.task || ''}`
        );
        break;

      case 'wallestars.prompt':
        result = await commandRouter.generatePrompt(params.topic);
        break;

      default:
        result = {
          success: false,
          response: `Unknown skill: ${skill}`
        };
    }

    res.json({
      success: true,
      skill,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/openclaw/skill/manifest
 * Return Wallestars skill manifest for OpenClaw
 */
router.get('/skill/manifest', (req, res) => {
  res.json({
    name: 'wallestars',
    version: '1.0.0',
    description: 'Wallestars Control Center - Claude AI automation for Linux and Android',
    author: 'Wallestars Team',
    homepage: 'https://github.com/Wallesters-org/Wallestars',
    skills: [
      {
        id: 'wallestars.chat',
        name: 'Claude Chat',
        description: 'Chat with Claude AI through Wallestars',
        params: {
          message: { type: 'string', required: true, description: 'Message to send' }
        }
      },
      {
        id: 'wallestars.screenshot',
        name: 'Screenshot',
        description: 'Capture screenshot from Linux desktop',
        params: {
          options: { type: 'string', description: 'Options: analyze' }
        }
      },
      {
        id: 'wallestars.click',
        name: 'Click',
        description: 'Click at screen coordinates',
        params: {
          x: { type: 'number', required: true, description: 'X coordinate' },
          y: { type: 'number', required: true, description: 'Y coordinate' }
        }
      },
      {
        id: 'wallestars.type',
        name: 'Type',
        description: 'Type text on the keyboard',
        params: {
          text: { type: 'string', required: true, description: 'Text to type' }
        }
      },
      {
        id: 'wallestars.android',
        name: 'Android Control',
        description: 'Control Android device via ADB',
        params: {
          command: { type: 'string', required: true, description: 'Command: screenshot, tap, swipe, shell' },
          args: { type: 'string', description: 'Command arguments' }
        }
      },
      {
        id: 'wallestars.qr',
        name: 'QR Code',
        description: 'Generate or scan QR codes',
        params: {
          action: { type: 'string', required: true, description: 'Action: generate, scan' },
          data: { type: 'string', description: 'Data for QR code generation' }
        }
      },
      {
        id: 'wallestars.scan',
        name: 'Smart Scan',
        description: 'AI-powered document scanning and analysis',
        params: {
          imageUrl: { type: 'string', required: true, description: 'URL of image to scan' }
        }
      },
      {
        id: 'wallestars.orchestration',
        name: 'Orchestration',
        description: 'Multi-agent task orchestration',
        params: {
          action: { type: 'string', required: true, description: 'Action: status, agents, submit' },
          task: { type: 'string', description: 'Task description for submit' }
        }
      },
      {
        id: 'wallestars.prompt',
        name: 'Prompt Generator',
        description: 'Generate bilingual prompts (EN/BG)',
        params: {
          topic: { type: 'string', required: true, description: 'Topic for prompt generation' }
        }
      }
    ],
    webhookUrl: '/api/openclaw/webhook',
    channels: ['telegram', 'whatsapp', 'discord', 'slack', 'signal', 'imessage', 'teams']
  });
});

export default router;
