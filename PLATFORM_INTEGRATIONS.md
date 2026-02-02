# 🔌 Platform Integrations Guide

## Overview

This document provides detailed implementation plans for integrating Wallestars Control Center with multiple messaging and AI platforms.

---

## 🤖 EvaAI Integration

### Platform Overview
**EvaAI** is an AI companion platform providing conversational AI capabilities.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Wallestars Backend                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐      ┌──────────────┐               │
│  │    Claude    │◄────►│    EvaAI     │               │
│  │   Sonnet 4.5 │      │    Client    │               │
│  └──────────────┘      └──────────────┘               │
│         │                      │                        │
│         └──────────┬───────────┘                        │
│                    ▼                                    │
│         ┌────────────────────┐                         │
│         │  AI Orchestrator   │                         │
│         │  (Multi-AI Logic)  │                         │
│         └────────────────────┘                         │
│                    │                                    │
└────────────────────┼────────────────────────────────────┘
                     │
                     ▼
              WebSocket / REST API
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Frontend Dashboard                      │
│  - Dual AI Chat Interface                              │
│  - Response Comparison                                  │
│  - Context Switching                                    │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 1. Backend Setup

**File: `server/integrations/evaai/client.js`**
```javascript
import axios from 'axios';

export class EvaAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.evaai.example.com/v1'; // Update with actual URL
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async sendMessage(message, context = {}) {
    try {
      const response = await this.client.post('/chat', {
        message,
        context,
        model: 'eva-latest'
      });
      return response.data;
    } catch (error) {
      console.error('EvaAI Error:', error);
      throw error;
    }
  }

  async getModels() {
    const response = await this.client.get('/models');
    return response.data;
  }
}
```

**File: `server/integrations/evaai/routes.js`**
```javascript
import express from 'express';
import { EvaAIClient } from './client.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const evaClient = new EvaAIClient(process.env.EVAAI_API_KEY);
    const response = await evaClient.sendMessage(message, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### 2. Frontend Components

**File: `src/pages/EvaAI.jsx`**
```javascript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send } from 'lucide-react';

export default function EvaAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const response = await fetch('/api/evaai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });
    const data = await response.json();
    setMessages([...messages, { user: input, eva: data.response }]);
    setInput('');
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6" />
          EvaAI Chat
        </h1>
        {/* Chat interface */}
      </div>
    </div>
  );
}
```

#### 3. Environment Configuration

Add to `.env`:
```bash
EVAAI_API_KEY=your_evaai_api_key_here
EVAAI_ENABLED=true
```

### Features to Implement
- [x] Basic API client
- [ ] Message streaming
- [ ] Context management
- [ ] Response comparison with Claude
- [ ] Conversation history
- [ ] Settings panel

---

## 💬 Telegram Bot Integration

### Platform Overview
**Telegram Bot API** enables automated bot interactions on Telegram.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Telegram Platform                      │
│                                                         │
│  User → Bot (@WallestarsBot) → Webhook                │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS POST
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Wallestars Backend                         │
│  ┌────────────────────────────────────────┐            │
│  │   Telegram Bot Handler                 │            │
│  │   - /start, /help, /chat, /control     │            │
│  └────────────────┬───────────────────────┘            │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────┐            │
│  │   Claude AI Processor                  │            │
│  │   - Analyze commands                   │            │
│  │   - Execute actions                    │            │
│  │   - Generate responses                 │            │
│  └────────────────┬───────────────────────┘            │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────┐            │
│  │   Response Sender                      │            │
│  └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 1. Bot Setup

```bash
# Talk to @BotFather on Telegram
/newbot
# Name: Wallestars Control Bot
# Username: @WallestarsBot

# Get your bot token
# Add to .env: TELEGRAM_BOT_TOKEN=your_token_here
```

#### 2. Backend Implementation

**File: `server/integrations/telegram/bot.js`**
```javascript
import TelegramBot from 'node-telegram-bot-api';
import { claudeClient } from '../../claude/client.js';

export class WallestarsBot {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupHandlers();
  }

  setupHandlers() {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId,
        '🌟 Welcome to Wallestars Control Center!\n\n' +
        'Available commands:\n' +
        '/chat - Chat with Claude AI\n' +
        '/control - Computer control\n' +
        '/status - System status\n' +
        '/screenshot - Take screenshot\n' +
        '/help - Show help'
      );
    });

    // Chat command
    this.bot.onText(/\/chat (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userMessage = match[1];

      try {
        const response = await claudeClient.sendMessage(userMessage);
        this.bot.sendMessage(chatId, response);
      } catch (error) {
        this.bot.sendMessage(chatId, '❌ Error: ' + error.message);
      }
    });

    // Control command
    this.bot.onText(/\/control (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const command = match[1];

      // Execute computer control command
      // Send result back to user
    });

    // Screenshot command
    this.bot.onText(/\/screenshot/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        // Capture screenshot
        const screenshot = await captureScreenshot();
        this.bot.sendPhoto(chatId, screenshot, {
          caption: '📸 Current desktop screenshot'
        });
      } catch (error) {
        this.bot.sendMessage(chatId, '❌ Failed to capture screenshot');
      }
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;

      const status =
        '📊 **System Status**\n\n' +
        '✅ Claude API: Online\n' +
        '✅ Computer Use: Active\n' +
        '⏰ Uptime: 5h 23m\n' +
        '💾 Memory: 2.1GB / 8GB';

      this.bot.sendMessage(chatId, status, { parse_mode: 'Markdown' });
    });
  }

  start() {
    console.log('🤖 Telegram bot started');
  }
}
```

**File: `server/integrations/telegram/index.js`**
```javascript
import { WallestarsBot } from './bot.js';
import dotenv from 'dotenv';

dotenv.config();

let bot = null;

export function startTelegramBot() {
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ENABLED === 'true') {
    bot = new WallestarsBot(process.env.TELEGRAM_BOT_TOKEN);
    bot.start();
  }
}

export function getTelegramBot() {
  return bot;
}
```

#### 3. Add to Main Server

**File: `server/index.js`** (add this):
```javascript
import { startTelegramBot } from './integrations/telegram/index.js';

// After server starts
startTelegramBot();
```

#### 4. Frontend Dashboard

**File: `src/pages/TelegramBot.jsx`**
```javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Activity } from 'lucide-react';

export default function TelegramBot() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    messagesProcessed: 0
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Telegram Bot
        </h1>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
          />
          <StatCard
            icon={MessageCircle}
            label="Active Chats"
            value={stats.activeChats}
          />
          <StatCard
            icon={Activity}
            label="Messages"
            value={stats.messagesProcessed}
          />
        </div>

        {/* Recent interactions */}
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Recent Interactions</h3>
          {/* List of recent bot interactions */}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-effect p-4 rounded-lg">
      <Icon className="w-8 h-8 text-primary-400 mb-2" />
      <p className="text-sm text-dark-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
```

#### 5. Environment Configuration

Add to `.env`:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ENABLED=true
TELEGRAM_ADMIN_ID=your_telegram_user_id
```

### Bot Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Initialize bot | `/start` |
| `/help` | Show help | `/help` |
| `/chat <message>` | Chat with Claude | `/chat explain quantum computing` |
| `/control <action>` | Computer control | `/control open browser` |
| `/screenshot` | Capture screen | `/screenshot` |
| `/status` | System status | `/status` |
| `/android <command>` | Android control | `/android unlock` |
| `/settings` | Bot settings | `/settings` |

---

## 📱 WhatsApp Business API Integration

### Platform Overview
**WhatsApp Business API** allows businesses to interact with users at scale.

### Setup Options

1. **Cloud API** (Recommended)
   - Easy setup via Meta Business
   - No infrastructure needed
   - Pay-per-message pricing

2. **On-Premises API**
   - Self-hosted solution
   - More control
   - Fixed costs

### Implementation Steps

#### 1. Setup Cloud API

```bash
# Register at: https://business.facebook.com/
# Create WhatsApp Business Account
# Get access token and phone number ID
```

#### 2. Backend Client

**File: `server/integrations/whatsapp/client.js`**
```javascript
import axios from 'axios';

export class WhatsAppClient {
  constructor(token, phoneNumberId) {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
    this.apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}`;
  }

  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp Error:', error);
      throw error;
    }
  }

  async sendTemplate(to, templateName, language = 'en') {
    // Send template message
  }

  async sendMedia(to, mediaUrl, caption) {
    // Send image/video/document
  }
}
```

#### 3. Webhook Handler

**File: `server/integrations/whatsapp/webhook.js`**
```javascript
import express from 'express';
import { WhatsAppClient } from './client.js';
import { claudeClient } from '../../claude/client.js';

const router = express.Router();

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(async (entry) => {
        const changes = entry.changes[0];
        const value = changes.value;

        if (value.messages) {
          const message = value.messages[0];
          const from = message.from;
          const text = message.text?.body;

          if (text) {
            // Process with Claude
            const response = await claudeClient.sendMessage(text);

            // Send response via WhatsApp
            const whatsapp = new WhatsAppClient(
              process.env.WHATSAPP_TOKEN,
              process.env.WHATSAPP_PHONE_NUMBER_ID
            );
            await whatsapp.sendMessage(from, response);
          }
        }
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500);
  }
});

export default router;
```

---

## 🎮 Discord Bot Integration

### Implementation

**File: `server/integrations/discord/bot.js`**
```javascript
import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';

export class WallestarsDiscordBot {
  constructor(token) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.token = token;
    this.setupCommands();
  }

  setupCommands() {
    this.client.on('ready', () => {
      console.log(`🤖 Discord bot logged in as ${this.client.user.tag}`);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      if (message.content.startsWith('!claude ')) {
        const query = message.content.slice(8);
        // Process with Claude and reply
      }
    });
  }

  start() {
    this.client.login(this.token);
  }
}
```

### Slash Commands

```javascript
const commands = [
  new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with Claude AI')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Your message')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check system status'),
];
```

---

## ☁️ Salesforce CRM Integration

### Platform Overview
**Salesforce** is the world's leading CRM platform for sales, service, and marketing automation.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Salesforce Cloud                        │
│                                                         │
│  Leads ─ Contacts ─ Accounts ─ Opportunities ─ Tasks    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ OAuth 2.0 + REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Wallestars Backend                         │
│  ┌────────────────────────────────────────┐            │
│  │   Salesforce Client                    │            │
│  │   - Authentication (OAuth 2.0)         │            │
│  │   - CRUD Operations                    │            │
│  │   - SOQL Queries                       │            │
│  │   - Bulk Operations                    │            │
│  │   - Flow Automation                    │            │
│  └────────────────┬───────────────────────┘            │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────┐            │
│  │   Express Routes (/api/salesforce)     │            │
│  └────────────────┬───────────────────────┘            │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────┐            │
│  │   WebSocket Events (Real-time)         │            │
│  └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 N8N Automation                          │
│  - Lead creation webhooks                              │
│  - Opportunity tracking                                 │
│  - Hourly sync reports                                  │
│  - Bulk import workflows                               │
└─────────────────────────────────────────────────────────┘
```

### Setup Steps

#### 1. Salesforce Connected App Setup

1. **Log in to Salesforce** → Setup → Apps → App Manager
2. **Create New Connected App**:
   - Connected App Name: `Wallestars Integration`
   - API Name: `Wallestars_Integration`
   - Enable OAuth Settings: ✓
   - Callback URL: `https://your-domain.com/oauth/callback`
   - Selected OAuth Scopes:
     - Full access (`full`)
     - Perform requests at any time (`refresh_token`, `offline_access`)
     - Access and manage your data (`api`)

3. **Get Credentials**:
   - Consumer Key (Client ID)
   - Consumer Secret (Client Secret)

4. **Get Security Token**:
   - Personal Settings → Reset My Security Token
   - Token will be emailed to you

#### 2. Environment Configuration

Add to `.env`:
```bash
# Salesforce API Configuration (OAuth 2.0 Username-Password Flow)
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_connected_app_client_id
SALESFORCE_CLIENT_SECRET=your_connected_app_client_secret
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_PASSWORD=your_salesforce_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_API_TIMEOUT=30000
```

**Note**: For sandbox environments, use `https://test.salesforce.com` as the login URL.

### API Endpoints

#### Leads Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/salesforce/leads` | Create a new lead |
| `GET` | `/api/salesforce/leads/:id` | Get lead by ID |
| `PATCH` | `/api/salesforce/leads/:id` | Update a lead |
| `DELETE` | `/api/salesforce/leads/:id` | Delete a lead |
| `POST` | `/api/salesforce/leads/:id/convert` | Convert lead to account/contact |

#### Contacts Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/salesforce/contacts` | Create a new contact |
| `GET` | `/api/salesforce/contacts/:id` | Get contact by ID |
| `PATCH` | `/api/salesforce/contacts/:id` | Update a contact |
| `DELETE` | `/api/salesforce/contacts/:id` | Delete a contact |

#### Accounts Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/salesforce/accounts` | Create a new account |
| `GET` | `/api/salesforce/accounts/:id` | Get account by ID |
| `PATCH` | `/api/salesforce/accounts/:id` | Update an account |
| `DELETE` | `/api/salesforce/accounts/:id` | Delete an account |

#### Opportunities Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/salesforce/opportunities` | Create a new opportunity |
| `GET` | `/api/salesforce/opportunities/:id` | Get opportunity by ID |
| `PATCH` | `/api/salesforce/opportunities/:id` | Update an opportunity |
| `DELETE` | `/api/salesforce/opportunities/:id` | Delete an opportunity |

#### Query & Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/salesforce/query` | Execute SOQL query |
| `POST` | `/api/salesforce/search` | Execute SOSL search |

#### Bulk Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/salesforce/bulk/create` | Create multiple records |
| `PATCH` | `/api/salesforce/bulk/update` | Update multiple records |

#### Automation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/salesforce/flows` | List available flows |
| `POST` | `/api/salesforce/flows/:flowName/invoke` | Invoke a Salesforce Flow |

#### Metadata & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/salesforce/describe` | Global describe (all objects) |
| `GET` | `/api/salesforce/describe/:objectName` | Describe specific object |
| `GET` | `/api/salesforce/limits` | Get API limits |
| `GET` | `/api/salesforce/reports` | List reports |
| `POST` | `/api/salesforce/reports/:reportId/run` | Run a report |

### Usage Examples

#### Create a Lead

```bash
curl -X POST http://localhost:3000/api/salesforce/leads \
  -H "Content-Type: application/json" \
  -d '{
    "FirstName": "John",
    "LastName": "Doe",
    "Company": "Acme Corp",
    "Email": "john.doe@acme.com",
    "Phone": "+1234567890",
    "LeadSource": "Web",
    "Status": "New"
  }'
```

#### Query Leads

```bash
curl -X POST http://localhost:3000/api/salesforce/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT Id, Name, Email, Status FROM Lead WHERE CreatedDate = LAST_N_DAYS:7"
  }'
```

#### Bulk Create Leads

```bash
curl -X POST http://localhost:3000/api/salesforce/bulk/create \
  -H "Content-Type: application/json" \
  -d '{
    "objectType": "Lead",
    "records": [
      {"LastName": "Smith", "Company": "Tech Inc"},
      {"LastName": "Johnson", "Company": "Data Corp"}
    ]
  }'
```

### N8N Workflow Integration

The Salesforce automation workflow (`n8n-workflows/salesforce-automation.json`) provides:

1. **Webhook Endpoints**:
   - `/webhook/salesforce-lead` - Create leads via webhook
   - `/webhook/salesforce-opportunity` - Create opportunities via webhook
   - `/webhook/salesforce-task` - Create tasks via webhook
   - `/webhook/salesforce-bulk-leads` - Bulk import leads

2. **Hourly Sync**:
   - Queries recent leads and opportunities
   - Sends health report to Wallestars dashboard
   - Tracks pipeline metrics

3. **Real-time Notifications**:
   - WebSocket events for CRUD operations
   - Alerts sent to Wallestars dashboard

### WebSocket Events

The integration emits real-time events via Socket.IO:

| Event | Description |
|-------|-------------|
| `salesforce:lead:created` | New lead created |
| `salesforce:lead:updated` | Lead updated |
| `salesforce:lead:deleted` | Lead deleted |
| `salesforce:lead:converted` | Lead converted |
| `salesforce:contact:created` | New contact created |
| `salesforce:contact:updated` | Contact updated |
| `salesforce:contact:deleted` | Contact deleted |
| `salesforce:account:created` | New account created |
| `salesforce:account:updated` | Account updated |
| `salesforce:account:deleted` | Account deleted |
| `salesforce:opportunity:created` | New opportunity created |
| `salesforce:opportunity:updated` | Opportunity updated |
| `salesforce:opportunity:deleted` | Opportunity deleted |
| `salesforce:task:created` | New task created |
| `salesforce:task:updated` | Task updated |
| `salesforce:bulk:created` | Bulk records created |
| `salesforce:bulk:updated` | Bulk records updated |
| `salesforce:flow:invoked` | Flow invoked |

### Features Implemented

- [x] OAuth 2.0 Username-Password Flow authentication
- [x] Auto-refresh token management
- [x] Lead CRUD operations
- [x] Contact CRUD operations
- [x] Account CRUD operations
- [x] Opportunity CRUD operations
- [x] Task management
- [x] SOQL query execution
- [x] SOSL search
- [x] Bulk create/update operations
- [x] Salesforce Flow invocation
- [x] Object metadata describe
- [x] API limits monitoring
- [x] Report execution
- [x] Real-time WebSocket events
- [x] N8N workflow automation

---

## 🔧 Environment Variables Summary

Add all these to your `.env` file:

```bash
# EvaAI
EVAAI_API_KEY=your_evaai_key
EVAAI_ENABLED=true

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_ENABLED=true
TELEGRAM_ADMIN_ID=your_user_id

# WhatsApp
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_ENABLED=true

# Discord
DISCORD_BOT_TOKEN=your_discord_token
DISCORD_ENABLED=true

# Slack
SLACK_BOT_TOKEN=your_slack_token
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_ENABLED=true

# Microsoft Teams
TEAMS_APP_ID=your_app_id
TEAMS_APP_PASSWORD=your_app_password
TEAMS_ENABLED=true

# Salesforce
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_connected_app_client_id
SALESFORCE_CLIENT_SECRET=your_connected_app_client_secret
SALESFORCE_USERNAME=your_salesforce_username
SALESFORCE_PASSWORD=your_salesforce_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_API_TIMEOUT=30000
```

---

## 🚀 Quick Start Guide

1. **Choose a platform** to integrate first (recommended: Telegram)
2. **Create account/bot** on the platform
3. **Get API credentials**
4. **Add to `.env` file**
5. **Copy implementation code** from this guide
6. **Test locally** with `npm run dev`
7. **Deploy to VPS** when ready

---

## 📚 Resources

- **Telegram Bot API**: https://core.telegram.org/bots/api
- **WhatsApp Cloud API**: https://developers.facebook.com/docs/whatsapp
- **Discord.js**: https://discord.js.org/
- **Slack Bolt**: https://slack.dev/bolt-js/
- **Microsoft Bot Framework**: https://dev.botframework.com/
- **Salesforce REST API**: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
- **Salesforce SOQL/SOSL**: https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/

---

**Last Updated:** February 2, 2026
**Maintained By:** Wallestars Development Team
