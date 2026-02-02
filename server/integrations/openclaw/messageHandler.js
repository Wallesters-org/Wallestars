/**
 * OpenClaw Message Handler for Wallestars
 *
 * Routes incoming messages from OpenClaw channels (Telegram, WhatsApp, Discord, etc.)
 * to appropriate Wallestars features and returns responses.
 */

import Anthropic from '@anthropic-ai/sdk';

// Command prefixes for Wallestars features
const COMMAND_PREFIX = '/ws';

/**
 * Wallestars Command Router
 * Maps chat commands to Wallestars API actions
 */
export class WallestarsCommandRouter {
  constructor(options = {}) {
    this.apiBaseUrl = options.apiBaseUrl || 'http://localhost:3000/api';
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  /**
   * Parse and route incoming message
   */
  async handleMessage(message) {
    const { content, sessionId, channel, userId } = message;

    // Check if message is a Wallestars command
    if (content.startsWith(COMMAND_PREFIX)) {
      return this.handleCommand(content.slice(COMMAND_PREFIX.length).trim(), message);
    }

    // Check for natural language Wallestars requests
    const intent = await this.detectIntent(content);
    if (intent.isWallestarsRequest) {
      return this.handleIntent(intent, message);
    }

    // Not a Wallestars message, return null to let OpenClaw handle it
    return null;
  }

  /**
   * Handle explicit Wallestars commands
   */
  async handleCommand(commandText, message) {
    const [command, ...args] = commandText.split(' ');
    const argsText = args.join(' ');

    try {
      switch (command.toLowerCase()) {
        case 'help':
          return this.getHelpMessage();

        case 'status':
          return this.getSystemStatus();

        case 'chat':
          return this.handleClaudeChat(argsText, message);

        case 'screenshot':
          return this.takeScreenshot(argsText);

        case 'click':
          return this.performClick(argsText);

        case 'type':
          return this.performType(argsText);

        case 'android':
          return this.handleAndroidCommand(argsText);

        case 'qr':
          return this.handleQRCommand(argsText);

        case 'scan':
          return this.handleSmartScan(argsText);

        case 'orchestration':
        case 'orch':
          return this.handleOrchestration(argsText);

        case 'prompt':
          return this.generatePrompt(argsText);

        default:
          return {
            success: false,
            response: `Unknown command: ${command}. Use /ws help for available commands.`
          };
      }
    } catch (error) {
      return {
        success: false,
        response: `Error executing command: ${error.message}`
      };
    }
  }

  /**
   * Detect intent from natural language
   */
  async detectIntent(content) {
    const lowercaseContent = content.toLowerCase();

    // Quick keyword detection
    const wallestarsKeywords = [
      'wallestars', 'computer control', 'android', 'screenshot',
      'qr code', 'scan', 'orchestration', 'automation'
    ];

    const hasKeyword = wallestarsKeywords.some(kw => lowercaseContent.includes(kw));

    if (!hasKeyword) {
      return { isWallestarsRequest: false };
    }

    // Use Claude for intent classification
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: `You are an intent classifier for Wallestars Control Center.
Classify if the user wants to:
- chat: Have a conversation with Claude AI
- screenshot: Take a screenshot
- click: Click on screen
- type: Type text
- android: Control Android device
- qr: QR code operations
- scan: Smart document scan
- orchestration: Task orchestration
- prompt: Generate prompts
- other: Not a Wallestars request

Respond ONLY with JSON: {"intent": "...", "params": "..."}`,
        messages: [{ role: 'user', content }]
      });

      const result = JSON.parse(response.content[0].text);
      return {
        isWallestarsRequest: result.intent !== 'other',
        intent: result.intent,
        params: result.params
      };
    } catch {
      return { isWallestarsRequest: hasKeyword };
    }
  }

  /**
   * Handle detected intent
   */
  async handleIntent(intent, message) {
    switch (intent.intent) {
      case 'chat':
        return this.handleClaudeChat(intent.params || message.content, message);
      case 'screenshot':
        return this.takeScreenshot(intent.params);
      case 'click':
        return this.performClick(intent.params);
      case 'type':
        return this.performType(intent.params);
      case 'android':
        return this.handleAndroidCommand(intent.params);
      case 'qr':
        return this.handleQRCommand(intent.params);
      case 'scan':
        return this.handleSmartScan(intent.params);
      case 'orchestration':
        return this.handleOrchestration(intent.params);
      case 'prompt':
        return this.generatePrompt(intent.params);
      default:
        return null;
    }
  }

  /**
   * Get help message
   */
  getHelpMessage() {
    return {
      success: true,
      response: `🎮 **Wallestars Control Center Commands**

**Chat & AI:**
\`/ws chat <message>\` - Chat with Claude AI
\`/ws prompt <topic>\` - Generate prompts (EN/BG)

**Computer Control:**
\`/ws screenshot\` - Take screenshot
\`/ws click <x> <y>\` - Click at coordinates
\`/ws type <text>\` - Type text

**Android Control:**
\`/ws android screenshot\` - Android screenshot
\`/ws android tap <x> <y>\` - Tap on screen
\`/ws android swipe <x1> <y1> <x2> <y2>\` - Swipe gesture
\`/ws android shell <command>\` - ADB shell command

**Scanning:**
\`/ws qr generate <text>\` - Generate QR code
\`/ws qr scan\` - Scan QR from last image
\`/ws scan <image_url>\` - Smart document scan

**Orchestration:**
\`/ws orch status\` - Get orchestration status
\`/ws orch submit <task>\` - Submit task
\`/ws orch agents\` - List agents

**System:**
\`/ws status\` - System status
\`/ws help\` - This help message`
    };
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/status`);
      const status = await response.json();

      return {
        success: true,
        response: `📊 **Wallestars Status**

🖥️ Server: ${status.server || 'Online'}
🤖 Claude API: ${status.claude || 'Connected'}
🐧 Linux Control: ${status.linux || 'Ready'}
📱 Android: ${status.android || 'Not connected'}
🔄 Orchestration: ${status.orchestration || 'Idle'}
📡 WebSocket: ${status.websocket || 'Active'}`
      };
    } catch (error) {
      return {
        success: true,
        response: `📊 **Wallestars Status**

🖥️ Server: Online (API error: ${error.message})
Please check server logs for details.`
      };
    }
  }

  /**
   * Handle Claude chat
   */
  async handleClaudeChat(userMessage, context) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/claude/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: context.sessionId,
          channel: context.channel
        })
      });

      const data = await response.json();

      return {
        success: data.success,
        response: data.success ? data.response : `Error: ${data.error}`
      };
    } catch (error) {
      return {
        success: false,
        response: `Failed to chat with Claude: ${error.message}`
      };
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(params) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/computer/screenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyze: params?.includes('analyze') })
      });

      const data = await response.json();

      if (data.success && data.screenshot) {
        return {
          success: true,
          response: '📸 Screenshot captured!',
          image: data.screenshot,
          analysis: data.analysis
        };
      }

      return {
        success: false,
        response: `Screenshot failed: ${data.error || 'Unknown error'}`
      };
    } catch (error) {
      return {
        success: false,
        response: `Screenshot error: ${error.message}`
      };
    }
  }

  /**
   * Perform click action
   */
  async performClick(coords) {
    const [x, y] = coords.split(' ').map(Number);

    if (isNaN(x) || isNaN(y)) {
      return {
        success: false,
        response: 'Invalid coordinates. Usage: /ws click <x> <y>'
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/computer/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
      });

      const data = await response.json();

      return {
        success: data.success,
        response: data.success
          ? `🖱️ Clicked at (${x}, ${y})`
          : `Click failed: ${data.error}`
      };
    } catch (error) {
      return {
        success: false,
        response: `Click error: ${error.message}`
      };
    }
  }

  /**
   * Perform type action
   */
  async performType(text) {
    if (!text) {
      return {
        success: false,
        response: 'No text provided. Usage: /ws type <text>'
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/computer/type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      return {
        success: data.success,
        response: data.success
          ? `⌨️ Typed: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
          : `Type failed: ${data.error}`
      };
    } catch (error) {
      return {
        success: false,
        response: `Type error: ${error.message}`
      };
    }
  }

  /**
   * Handle Android commands
   */
  async handleAndroidCommand(commandText) {
    const [subCommand, ...args] = commandText.split(' ');
    const argsText = args.join(' ');

    try {
      let endpoint, body;

      switch (subCommand?.toLowerCase()) {
        case 'screenshot':
          endpoint = '/android/screenshot';
          body = {};
          break;

        case 'tap':
          const [tapX, tapY] = args.map(Number);
          if (isNaN(tapX) || isNaN(tapY)) {
            return { success: false, response: 'Usage: /ws android tap <x> <y>' };
          }
          endpoint = '/android/tap';
          body = { x: tapX, y: tapY };
          break;

        case 'swipe':
          const [x1, y1, x2, y2] = args.map(Number);
          if ([x1, y1, x2, y2].some(isNaN)) {
            return { success: false, response: 'Usage: /ws android swipe <x1> <y1> <x2> <y2>' };
          }
          endpoint = '/android/swipe';
          body = { startX: x1, startY: y1, endX: x2, endY: y2 };
          break;

        case 'shell':
          endpoint = '/android/shell';
          body = { command: argsText };
          break;

        case 'status':
          endpoint = '/android/status';
          body = null;
          break;

        default:
          return {
            success: false,
            response: 'Unknown Android command. Options: screenshot, tap, swipe, shell, status'
          };
      }

      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...(body && { body: JSON.stringify(body) })
      });

      const data = await response.json();

      if (subCommand === 'screenshot' && data.success && data.screenshot) {
        return {
          success: true,
          response: '📱 Android screenshot captured!',
          image: data.screenshot
        };
      }

      return {
        success: data.success,
        response: data.success
          ? `📱 Android ${subCommand}: Success`
          : `Android ${subCommand} failed: ${data.error}`
      };
    } catch (error) {
      return {
        success: false,
        response: `Android error: ${error.message}`
      };
    }
  }

  /**
   * Handle QR commands
   */
  async handleQRCommand(commandText) {
    const [subCommand, ...args] = commandText.split(' ');
    const argsText = args.join(' ');

    try {
      switch (subCommand?.toLowerCase()) {
        case 'generate':
          if (!argsText) {
            return { success: false, response: 'Usage: /ws qr generate <text>' };
          }

          const genResponse = await fetch(`${this.apiBaseUrl}/qr/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: argsText })
          });

          const genData = await genResponse.json();

          return {
            success: genData.success,
            response: genData.success ? '📱 QR Code generated!' : `QR generation failed: ${genData.error}`,
            image: genData.qrCode
          };

        case 'scan':
          return {
            success: true,
            response: 'Send an image to scan for QR codes. Reply with an image or use /ws qr scan <image_url>'
          };

        default:
          return {
            success: false,
            response: 'QR commands: generate <text>, scan'
          };
      }
    } catch (error) {
      return {
        success: false,
        response: `QR error: ${error.message}`
      };
    }
  }

  /**
   * Handle Smart Scan
   */
  async handleSmartScan(imageUrl) {
    if (!imageUrl) {
      return {
        success: true,
        response: 'Send an image to analyze with Smart Scan. Supported: invoices, receipts, documents, IDs.'
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/scan/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      const data = await response.json();

      return {
        success: data.success,
        response: data.success
          ? `📄 **Smart Scan Results**\n\nType: ${data.documentType}\n\n${JSON.stringify(data.extractedData, null, 2)}`
          : `Scan failed: ${data.error}`
      };
    } catch (error) {
      return {
        success: false,
        response: `Smart Scan error: ${error.message}`
      };
    }
  }

  /**
   * Handle Orchestration commands
   */
  async handleOrchestration(commandText) {
    const [subCommand, ...args] = commandText.split(' ');
    const argsText = args.join(' ');

    try {
      switch (subCommand?.toLowerCase()) {
        case 'status':
          const statusResponse = await fetch(`${this.apiBaseUrl}/orchestration/status`);
          const statusData = await statusResponse.json();

          return {
            success: true,
            response: `🔄 **Orchestration Status**

Active Agents: ${statusData.activeAgents || 0}
Queued Tasks: ${statusData.queuedTasks || 0}
Running Tasks: ${statusData.runningTasks || 0}
Completed: ${statusData.completedTasks || 0}`
          };

        case 'agents':
          const agentsResponse = await fetch(`${this.apiBaseUrl}/orchestration/agents`);
          const agentsData = await agentsResponse.json();

          const agentsList = agentsData.agents?.map(a =>
            `• ${a.name} (${a.type}) - ${a.status}`
          ).join('\n') || 'No agents registered';

          return {
            success: true,
            response: `🤖 **Registered Agents**\n\n${agentsList}`
          };

        case 'submit':
          if (!argsText) {
            return { success: false, response: 'Usage: /ws orch submit <task description>' };
          }

          const submitResponse = await fetch(`${this.apiBaseUrl}/orchestration/tasks/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'chat-command',
              description: argsText,
              priority: 5
            })
          });

          const submitData = await submitResponse.json();

          return {
            success: submitData.success,
            response: submitData.success
              ? `✅ Task submitted! ID: ${submitData.taskId}`
              : `Submit failed: ${submitData.error}`
          };

        default:
          return {
            success: false,
            response: 'Orchestration commands: status, agents, submit <task>'
          };
      }
    } catch (error) {
      return {
        success: false,
        response: `Orchestration error: ${error.message}`
      };
    }
  }

  /**
   * Generate prompt
   */
  async generatePrompt(topic) {
    if (!topic) {
      return {
        success: false,
        response: 'Usage: /ws prompt <topic>'
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/prompt/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language: 'both' })
      });

      const data = await response.json();

      return {
        success: data.success,
        response: data.success
          ? `✨ **Generated Prompt**\n\n${data.prompt}`
          : `Prompt generation failed: ${data.error}`
      };
    } catch (error) {
      return {
        success: false,
        response: `Prompt error: ${error.message}`
      };
    }
  }
}

export default WallestarsCommandRouter;
