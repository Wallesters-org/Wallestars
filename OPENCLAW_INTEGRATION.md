# 🦞 OpenClaw (Clawdbot) Integration Guide

## Overview

Wallestars Control Center now integrates with **OpenClaw** (formerly Clawdbot), enabling access to all Wallestars features through multiple messaging platforms:

- **Telegram** - Bot API integration
- **WhatsApp** - Via WhatsApp Web/Baileys
- **Discord** - Bot API with discord.js
- **Slack** - Bolt framework
- **Signal** - Secure messaging
- **iMessage** - Apple ecosystem
- **Microsoft Teams** - Enterprise integration
- **Matrix** - Decentralized chat
- **WebChat** - Direct browser access

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  📱 Telegram  💬 WhatsApp  🎮 Discord  💼 Slack  🔒 Signal      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPENCLAW GATEWAY                              │
│              ws://127.0.0.1:18789                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Sessions │ │  Nodes   │ │  Skills  │ │  Tools   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WALLESTARS SERVER                             │
│                  http://localhost:3000                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              OpenClaw Integration Module                    │ │
│  │  /api/openclaw/webhook    - Message routing                │ │
│  │  /api/openclaw/skill/*    - Skill invocation               │ │
│  │  /api/openclaw/sessions   - Session management             │ │
│  │  /api/openclaw/status     - Connection status              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            │                                     │
│  ┌──────────────┬──────────┼──────────┬───────────────────────┐ │
│  │              │          │          │                       │ │
│  ▼              ▼          ▼          ▼                       ▼ │
│ Claude      Computer    Android      QR       Smart    Orchestration │
│  Chat       Control     Control    Scanner    Scan       Farm       │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

### 1. Install OpenClaw

```bash
# Install OpenClaw globally
npm install -g openclaw@latest

# Run onboarding wizard
openclaw onboard --install-daemon
```

### 2. Configure OpenClaw

Edit `~/.openclaw/openclaw.json`:

```json
{
  "agent": {
    "model": "anthropic/claude-opus-4-5"
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_TELEGRAM_BOT_TOKEN"
    },
    "discord": {
      "enabled": true,
      "token": "YOUR_DISCORD_BOT_TOKEN"
    }
  },
  "skills": {
    "wallestars": {
      "apiUrl": "http://localhost:3000/api"
    }
  }
}
```

### 3. Install Wallestars Skill

```bash
# Copy skill to OpenClaw workspace
cp -r /path/to/Wallestars/openclaw-skill ~/.openclaw/workspace/skills/wallestars
```

### 4. Start Both Services

```bash
# Terminal 1: Start Wallestars
cd /path/to/Wallestars
npm run dev

# Terminal 2: Start OpenClaw (if not running as daemon)
openclaw serve
```

## Chat Commands

All Wallestars commands start with `/ws`:

### General Commands

| Command | Description |
|---------|-------------|
| `/ws help` | Show all available commands |
| `/ws status` | Display system status |

### Claude Chat

| Command | Description |
|---------|-------------|
| `/ws chat <message>` | Send message to Claude AI |

### Computer Control

| Command | Description |
|---------|-------------|
| `/ws screenshot` | Capture Linux desktop screenshot |
| `/ws screenshot analyze` | Screenshot with AI analysis |
| `/ws click <x> <y>` | Click at screen coordinates |
| `/ws type <text>` | Type text on keyboard |

### Android Control

| Command | Description |
|---------|-------------|
| `/ws android status` | Check Android connection |
| `/ws android screenshot` | Capture Android screen |
| `/ws android tap <x> <y>` | Tap on Android screen |
| `/ws android swipe <x1> <y1> <x2> <y2>` | Swipe gesture |
| `/ws android shell <command>` | Execute ADB shell command |

### QR Code

| Command | Description |
|---------|-------------|
| `/ws qr generate <text>` | Generate QR code image |
| `/ws qr scan` | Scan QR from attached image |

### Smart Scan

| Command | Description |
|---------|-------------|
| `/ws scan <image_url>` | AI-powered document analysis |

### Orchestration

| Command | Description |
|---------|-------------|
| `/ws orch status` | Get orchestration farm status |
| `/ws orch agents` | List registered agents |
| `/ws orch submit <task>` | Submit task to orchestration |

### Prompt Generator

| Command | Description |
|---------|-------------|
| `/ws prompt <topic>` | Generate bilingual prompts (EN/BG) |

## Natural Language Support

Besides explicit commands, you can use natural language:

```
"Take a screenshot of my desktop"
→ Executes /ws screenshot

"Click on the button at 500, 300"
→ Executes /ws click 500 300

"Generate a QR code for https://example.com"
→ Executes /ws qr generate https://example.com

"What's the orchestration status?"
→ Executes /ws orch status
```

## API Endpoints

### Connection Management

```http
GET /api/openclaw/status
```
Returns connection status and available features.

```http
POST /api/openclaw/connect
Content-Type: application/json

{
  "gatewayUrl": "ws://127.0.0.1:18789"
}
```
Connect to OpenClaw Gateway.

```http
POST /api/openclaw/disconnect
```
Disconnect from Gateway.

### Session Management

```http
GET /api/openclaw/sessions
```
List active chat sessions.

```http
GET /api/openclaw/sessions/:sessionId/history?limit=50
```
Get message history for a session.

```http
POST /api/openclaw/sessions/:sessionId/send
Content-Type: application/json

{
  "content": "Hello from Wallestars!"
}
```
Send message to a session.

### Webhook

```http
POST /api/openclaw/webhook
Content-Type: application/json

{
  "type": "message",
  "sessionId": "session-123",
  "channel": "telegram",
  "userId": "user-456",
  "content": "/ws status",
  "attachments": [],
  "metadata": {}
}
```
Webhook endpoint for OpenClaw to send messages.

### Skill Invocation

```http
POST /api/openclaw/skill/invoke
Content-Type: application/json

{
  "skill": "wallestars.screenshot",
  "params": { "options": "analyze" },
  "context": { "sessionId": "...", "channel": "telegram" }
}
```
Invoke Wallestars skill programmatically.

```http
GET /api/openclaw/skill/manifest
```
Get skill manifest with all available capabilities.

## Skill Manifest

The Wallestars skill exposes these capabilities:

| Skill ID | Description |
|----------|-------------|
| `wallestars.chat` | Claude AI chat |
| `wallestars.screenshot` | Desktop screenshot |
| `wallestars.click` | Mouse click action |
| `wallestars.type` | Keyboard typing |
| `wallestars.android` | Android device control |
| `wallestars.qr` | QR code operations |
| `wallestars.scan` | Smart document scanning |
| `wallestars.orchestration` | Task orchestration |
| `wallestars.prompt` | Prompt generation |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENCLAW_GATEWAY_URL` | WebSocket URL for OpenClaw Gateway | `ws://127.0.0.1:18789` |
| `OPENCLAW_WORKSPACE` | OpenClaw workspace directory | `~/.openclaw/workspace` |

## Frontend Dashboard

Access the OpenClaw integration dashboard in Wallestars UI:

1. Navigate to **OpenClaw** in the sidebar
2. View connection status and active sessions
3. See connected device nodes
4. Send messages to sessions
5. Test webhook functionality

## Troubleshooting

### Connection Issues

1. **OpenClaw Gateway not running**
   ```bash
   openclaw status
   openclaw serve
   ```

2. **Wrong Gateway URL**
   - Default is `ws://127.0.0.1:18789`
   - Check OpenClaw configuration

3. **Firewall blocking**
   - Ensure port 18789 is accessible locally

### Message Not Processed

1. **Command prefix missing**
   - Ensure commands start with `/ws`

2. **Feature not enabled**
   - Check Wallestars server is running
   - Verify API endpoints are accessible

3. **Authentication issues**
   - Verify OpenClaw session is valid
   - Check user permissions

### Webhook Errors

1. **Test with curl**
   ```bash
   curl -X POST http://localhost:3000/api/openclaw/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"status"}'
   ```

2. **Check server logs**
   - Look for `[OpenClaw Webhook]` entries

## Security Considerations

1. **Session Authentication**
   - All requests are validated via OpenClaw sessions
   - Session IDs are verified before processing

2. **Rate Limiting**
   - Built-in rate limiting on sensitive operations
   - Configurable per-channel limits

3. **Sensitive Commands**
   - Commands like `shell` require explicit confirmation
   - Dangerous operations are logged

## References

- [OpenClaw Documentation](https://docs.openclaw.ai/)
- [OpenClaw GitHub](https://github.com/clawdbot/clawdbot)
- [Wallestars Repository](https://github.com/Wallesters-org/Wallestars)

---

**Version:** 1.0.0
**Last Updated:** February 2026
**Maintainer:** Wallestars Team
