# Wallestars Control Center

> Claude AI automation platform for Linux and Android with beautiful real-time visualization

## Description

Wallestars Control Center is a comprehensive platform that enables Claude AI to control Linux desktops, Android devices, and perform various automation tasks. This skill integrates Wallestars with OpenClaw, allowing you to access all Wallestars features from any messaging platform (Telegram, WhatsApp, Discord, Slack, etc.).

## Features

- **Claude Chat** - Chat with Claude AI through Wallestars
- **Computer Control** - Control Linux desktop (click, type, screenshot)
- **Android Control** - Control Android devices via ADB
- **QR Scanner** - Generate and scan QR codes with AI analysis
- **Smart Scan** - AI-powered document scanning (invoices, receipts, IDs)
- **Orchestration** - Multi-agent task orchestration
- **Prompt Generator** - Generate bilingual prompts (EN/BG)

## Setup

### Requirements

1. Wallestars server running (default: http://localhost:3000)
2. OpenClaw installed and configured
3. Network connectivity between OpenClaw and Wallestars

### Installation

1. Copy this skill folder to your OpenClaw workspace:
   ```bash
   cp -r openclaw-skill ~/.openclaw/workspace/skills/wallestars
   ```

2. Configure Wallestars URL in OpenClaw config:
   ```json
   {
     "skills": {
       "wallestars": {
         "apiUrl": "http://localhost:3000/api"
       }
     }
   }
   ```

3. Restart OpenClaw or reload skills

## Usage

### Chat Commands

All commands start with `/ws` prefix:

```
/ws help                    - Show all commands
/ws status                  - System status
/ws chat <message>          - Chat with Claude
/ws screenshot              - Take screenshot
/ws click <x> <y>           - Click at coordinates
/ws type <text>             - Type text
/ws android screenshot      - Android screenshot
/ws android tap <x> <y>     - Tap on Android
/ws qr generate <text>      - Generate QR code
/ws scan <image_url>        - Smart scan document
/ws orch status             - Orchestration status
/ws prompt <topic>          - Generate prompts
```

### Natural Language

You can also use natural language to interact with Wallestars. The skill will automatically detect your intent:

- "Take a screenshot of my desktop"
- "Click on the button at position 500, 300"
- "Generate a QR code for my website"
- "Analyze this invoice" (with attached image)
- "What's the orchestration status?"

### Skill Invocation

OpenClaw agents can invoke Wallestars skills directly:

```javascript
// Chat with Claude
await invoke('wallestars.chat', { message: 'Hello!' });

// Take screenshot
await invoke('wallestars.screenshot', { options: 'analyze' });

// Click on screen
await invoke('wallestars.click', { x: 500, y: 300 });

// Control Android
await invoke('wallestars.android', { command: 'tap', args: '500 300' });

// Generate QR code
await invoke('wallestars.qr', { action: 'generate', data: 'https://example.com' });

// Smart scan
await invoke('wallestars.scan', { imageUrl: 'https://...' });

// Orchestration
await invoke('wallestars.orchestration', { action: 'status' });
```

## API Endpoints

The skill exposes these endpoints on the Wallestars server:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/openclaw/status` | GET | Connection status |
| `/api/openclaw/connect` | POST | Connect to Gateway |
| `/api/openclaw/sessions` | GET | List sessions |
| `/api/openclaw/webhook` | POST | Webhook for messages |
| `/api/openclaw/skill/invoke` | POST | Invoke skills |
| `/api/openclaw/skill/manifest` | GET | Skill manifest |

## Webhook Payload

OpenClaw can send webhooks to Wallestars:

```json
{
  "type": "message",
  "sessionId": "session-123",
  "channel": "telegram",
  "userId": "user-456",
  "content": "/ws screenshot",
  "attachments": [],
  "metadata": {}
}
```

## Response Format

```json
{
  "success": true,
  "handled": true,
  "response": "Screenshot captured!",
  "image": "base64...",
  "data": {}
}
```

## Supported Channels

- Telegram
- WhatsApp
- Discord
- Slack
- Signal
- iMessage
- Microsoft Teams
- Matrix
- WebChat

## Security

- All API calls are authenticated via OpenClaw's session system
- Wallestars validates requests using session IDs
- Sensitive operations require explicit confirmation
- Rate limiting is applied to prevent abuse

## Troubleshooting

### Connection Issues

1. Verify Wallestars server is running:
   ```bash
   curl http://localhost:3000/api/status
   ```

2. Check OpenClaw Gateway status:
   ```bash
   openclaw status
   ```

3. Verify network connectivity between services

### Command Not Working

1. Check command syntax with `/ws help`
2. Verify Wallestars features are enabled
3. Check server logs for errors

## Contributing

- GitHub: https://github.com/Wallesters-org/Wallestars
- Issues: https://github.com/Wallesters-org/Wallestars/issues

## License

MIT License - See LICENSE file in the Wallestars repository

---

**Version:** 1.0.0
**Compatible with:** OpenClaw 2026.1+
**Maintained by:** Wallestars Team
