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

---

## 🌐 Airtop Integration

### Platform Overview
**Airtop** is an AI-powered browser automation platform that enables intelligent web interactions, scraping, and session management.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Wallestars Backend                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐      ┌──────────────┐               │
│  │    Claude    │◄────►│   Airtop     │               │
│  │     AI       │      │   Browser    │               │
│  └──────────────┘      └──────────────┘               │
│         │                      │                        │
│         └──────────┬───────────┘                        │
│                    ▼                                    │
│         ┌────────────────────┐                         │
│         │  Browser Sessions  │                         │
│         │  (AI-controlled)   │                         │
│         └────────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 1. Backend Setup

**File: `server/integrations/airtop/client.js`**
```javascript
import axios from 'axios';

export class AirtopClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.airtop.ai/v1';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createSession(options = {}) {
    const response = await this.client.post('/sessions', {
      browser: options.browser || 'chromium',
      headless: options.headless ?? true,
      ...options
    });
    return response.data;
  }

  async navigateTo(sessionId, url) {
    const response = await this.client.post(`/sessions/${sessionId}/navigate`, { url });
    return response.data;
  }

  async executeAction(sessionId, action) {
    const response = await this.client.post(`/sessions/${sessionId}/action`, action);
    return response.data;
  }

  async getScreenshot(sessionId) {
    const response = await this.client.get(`/sessions/${sessionId}/screenshot`);
    return response.data;
  }

  async closeSession(sessionId) {
    await this.client.delete(`/sessions/${sessionId}`);
  }
}
```

#### 2. Environment Configuration

```bash
AIRTOP_API_KEY=your_airtop_api_key_here
AIRTOP_ENABLED=true
```

### Features
- [x] Browser session management
- [x] AI-powered navigation
- [x] Screenshot capture
- [x] Web scraping capabilities
- [ ] Multi-browser support
- [ ] Proxy integration

---

## 🦊 GitLab Integration

### Platform Overview
**GitLab** is a complete DevOps platform with Git repository management, CI/CD, and project management.

### Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitLab Platform                        │
│  - Repositories                                         │
│  - CI/CD Pipelines                                      │
│  - Container Registry                                   │
│  - Issue Tracking                                       │
└────────────────────┬────────────────────────────────────┘
                     │ REST API v4
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Wallestars Backend                         │
│  ┌────────────────────────────────────────┐            │
│  │   GitLab API Client                    │            │
│  │   - Repository management              │            │
│  │   - Pipeline triggers                  │            │
│  │   - Issue automation                   │            │
│  └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### 1. Backend Client

**File: `server/integrations/gitlab/client.js`**
```javascript
import axios from 'axios';

export class GitLabClient {
  constructor(token, baseUrl = 'https://gitlab.com') {
    this.token = token;
    this.baseUrl = `${baseUrl}/api/v4`;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'PRIVATE-TOKEN': this.token,
        'Content-Type': 'application/json'
      }
    });
  }

  async getProjects() {
    const response = await this.client.get('/projects');
    return response.data;
  }

  async getProject(projectId) {
    const response = await this.client.get(`/projects/${projectId}`);
    return response.data;
  }

  async triggerPipeline(projectId, ref = 'main') {
    const response = await this.client.post(`/projects/${projectId}/pipeline`, { ref });
    return response.data;
  }

  async createIssue(projectId, title, description) {
    const response = await this.client.post(`/projects/${projectId}/issues`, {
      title,
      description
    });
    return response.data;
  }

  async getMergeRequests(projectId) {
    const response = await this.client.get(`/projects/${projectId}/merge_requests`);
    return response.data;
  }
}
```

#### 2. Environment Configuration

```bash
GITLAB_TOKEN=your_gitlab_personal_access_token_here
GITLAB_URL=https://gitlab.com
GITLAB_ENABLED=true
```

### Features
- [x] Repository management
- [x] Pipeline triggers
- [x] Issue creation
- [x] Merge request handling
- [ ] Webhook integration
- [ ] Container registry access

---

## 🔮 Perplexity AI Integration

### Platform Overview
**Perplexity AI** is an AI-powered search engine that provides accurate, cited responses.

### Implementation

**File: `server/integrations/perplexity/client.js`**
```javascript
import axios from 'axios';

export class PerplexityClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.perplexity.ai';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async search(query, options = {}) {
    const response = await this.client.post('/chat/completions', {
      model: options.model || 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: query }]
    });
    return response.data;
  }
}
```

### Environment Configuration
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_ENABLED=true
```

---

## 🤗 Hugging Face Integration

### Platform Overview
**Hugging Face** provides model hosting, inference APIs, and the transformers library.

### Implementation

```javascript
import { HfInference } from '@huggingface/inference';

export class HuggingFaceClient {
  constructor(apiKey) {
    this.hf = new HfInference(apiKey);
  }

  async textGeneration(prompt, model = 'gpt2') {
    return await this.hf.textGeneration({ model, inputs: prompt });
  }

  async embeddings(text, model = 'sentence-transformers/all-MiniLM-L6-v2') {
    return await this.hf.featureExtraction({ model, inputs: text });
  }

  async imageToText(imageUrl) {
    return await this.hf.imageToText({ model: 'Salesforce/blip-image-captioning-base', data: imageUrl });
  }
}
```

### Environment Configuration
```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_ENABLED=true
```

---

## 🌊 Cohere Integration

### Platform Overview
**Cohere** provides enterprise AI with chat, embeddings, and reranking capabilities.

### Implementation

```javascript
import { CohereClient } from 'cohere-ai';

export class CohereIntegration {
  constructor(apiKey) {
    this.cohere = new CohereClient({ token: apiKey });
  }

  async chat(message) {
    return await this.cohere.chat({ message });
  }

  async embed(texts) {
    return await this.cohere.embed({ texts, model: 'embed-english-v3.0' });
  }

  async rerank(query, documents) {
    return await this.cohere.rerank({ query, documents, model: 'rerank-english-v2.0' });
  }
}
```

### Environment Configuration
```bash
COHERE_API_KEY=your_cohere_api_key_here
COHERE_ENABLED=true
```

---

## 🌪️ Mistral AI Integration

### Platform Overview
**Mistral AI** offers high-performance open-weight models with function calling.

### Implementation

```javascript
import MistralClient from '@mistralai/mistralai';

export class MistralIntegration {
  constructor(apiKey) {
    this.client = new MistralClient(apiKey);
  }

  async chat(messages, model = 'mistral-large-latest') {
    return await this.client.chat({ model, messages });
  }

  async embed(texts) {
    return await this.client.embeddings({ model: 'mistral-embed', input: texts });
  }
}
```

### Environment Configuration
```bash
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_ENABLED=true
```

---

## 💎 Google Gemini Integration

### Platform Overview
**Google Gemini** is Google's multimodal AI model with vision and reasoning capabilities.

### Implementation

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async chat(message, model = 'gemini-pro') {
    const model = this.genAI.getGenerativeModel({ model });
    const result = await model.generateContent(message);
    return result.response.text();
  }

  async analyzeImage(imageData, prompt) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    return await model.generateContent([prompt, imageData]);
  }
}
```

### Environment Configuration
```bash
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
GOOGLE_GEMINI_ENABLED=true
```

---

## 🚀 Microsoft Copilot Integration

### Platform Overview
**Microsoft Copilot** provides AI assistance with web search and code generation.

### Environment Configuration
```bash
MICROSOFT_COPILOT_API_KEY=your_microsoft_copilot_api_key_here
MICROSOFT_COPILOT_ENABLED=true
```

---

## ⌨️ Cursor AI Integration

### Platform Overview
**Cursor** is an AI-powered code editor with intelligent code completion.

### Environment Configuration
```bash
CURSOR_API_KEY=your_cursor_api_key_here
CURSOR_ENABLED=true
```

---

## 💻 Replit Integration

### Platform Overview
**Replit** provides cloud-based development environment with AI assistance.

### Environment Configuration
```bash
REPLIT_API_KEY=your_replit_api_key_here
REPLIT_ENABLED=true
```

---

## ▲ Vercel AI Integration

### Platform Overview
**Vercel AI SDK** provides tools for building AI-powered applications.

### Implementation

```javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateWithVercel(prompt) {
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt
  });
  return text;
}
```

### Environment Configuration
```bash
VERCEL_API_KEY=your_vercel_api_key_here
VERCEL_ENABLED=true
```

---

## ⚡ Groq Integration

### Platform Overview
**Groq** provides ultra-fast inference with LPU (Language Processing Unit) technology.

### Implementation

```javascript
import Groq from 'groq-sdk';

export class GroqClient {
  constructor(apiKey) {
    this.groq = new Groq({ apiKey });
  }

  async chat(messages, model = 'llama-3.1-70b-versatile') {
    return await this.groq.chat.completions.create({
      model,
      messages
    });
  }
}
```

### Environment Configuration
```bash
GROQ_API_KEY=your_groq_api_key_here
GROQ_ENABLED=true
```

---

## 🔧 Complete Environment Variables Summary

Add all these to your `.env` file:

```bash
# Airtop
AIRTOP_API_KEY=your_airtop_api_key
AIRTOP_ENABLED=true

# GitLab
GITLAB_TOKEN=your_gitlab_token
GITLAB_URL=https://gitlab.com
GITLAB_ENABLED=true

# Perplexity AI
PERPLEXITY_API_KEY=your_perplexity_key
PERPLEXITY_ENABLED=true

# Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_key
HUGGINGFACE_ENABLED=true

# Cohere
COHERE_API_KEY=your_cohere_key
COHERE_ENABLED=true

# Mistral AI
MISTRAL_API_KEY=your_mistral_key
MISTRAL_ENABLED=true

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_key
GOOGLE_GEMINI_ENABLED=true

# Microsoft Copilot
MICROSOFT_COPILOT_API_KEY=your_copilot_key
MICROSOFT_COPILOT_ENABLED=true

# Cursor
CURSOR_API_KEY=your_cursor_key
CURSOR_ENABLED=true

# Replit
REPLIT_API_KEY=your_replit_key
REPLIT_ENABLED=true

# Vercel AI
VERCEL_API_KEY=your_vercel_key
VERCEL_ENABLED=true

# Groq
GROQ_API_KEY=your_groq_key
GROQ_ENABLED=true
```

---

**Last Updated:** February 2, 2026
**Maintained By:** Wallestars Development Team
