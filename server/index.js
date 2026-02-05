import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { claudeRouter } from './routes/claude.js';
import { computerUseRouter } from './routes/computerUse.js';
import { androidRouter } from './routes/android.js';
import { documentScannerRouter } from './routes/documentScanner.js';
import { n8nWebhooksRouter } from './routes/n8nWebhooks.js';
import { sseRouter } from './routes/sse.js';
import { hostingerRouter } from './routes/hostinger.js';
import { orchestrationRouter } from './routes/orchestration.js';
import { setupSocketHandlers } from './socket/handlers.js';

// New integrations
import { airtopRouter } from './routes/airtop.js';
import { gitlabRouter } from './routes/gitlab.js';
import { slackRouter } from './routes/slack.js';
import { discordRouter } from './routes/discord.js';
import { openaiRouter } from './routes/openai.js';
import { notionRouter } from './routes/notion.js';
import { twilioRouter } from './routes/twilio.js';
import { sendgridRouter } from './routes/sendgrid.js';
import { jiraRouter } from './routes/jira.js';
import { linearRouter } from './routes/linear.js';
import { vercelRouter } from './routes/vercel.js';
import { replicateRouter } from './routes/replicate.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:3006'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for MCP SuperAssistant
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('dist'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      computerUse: process.env.ENABLE_COMPUTER_USE === 'true',
      android: process.env.ENABLE_ANDROID === 'true',
      documentScanner: !!process.env.ANTHROPIC_API_KEY,
      hostinger: !!process.env.HOSTINGER_API_TOKEN,
      orchestration: true,
      // New integrations
      airtop: !!process.env.AIRTOP_API_KEY,
      gitlab: !!process.env.GITLAB_API_TOKEN,
      slack: !!process.env.SLACK_BOT_TOKEN,
      discord: !!process.env.DISCORD_BOT_TOKEN,
      openai: !!process.env.OPENAI_API_KEY,
      notion: !!process.env.NOTION_API_KEY,
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      sendgrid: !!process.env.SENDGRID_API_KEY,
      jira: !!(process.env.JIRA_BASE_URL && process.env.JIRA_API_TOKEN),
      linear: !!process.env.LINEAR_API_KEY,
      vercel: !!process.env.VERCEL_API_TOKEN,
      replicate: !!process.env.REPLICATE_API_TOKEN
    }
  });
});

// API Routes
app.use('/api/claude', claudeRouter);
app.use('/api/computer', computerUseRouter);
app.use('/api/android', androidRouter);
app.use('/api/document-scanner', documentScannerRouter);
app.use('/api/webhooks/n8n', n8nWebhooksRouter);
app.use('/api/hostinger', hostingerRouter);
app.use('/api/orchestration', orchestrationRouter);

// New integration routes
app.use('/api/airtop', airtopRouter);
app.use('/api/gitlab', gitlabRouter);
app.use('/api/slack', slackRouter);
app.use('/api/discord', discordRouter);
app.use('/api/openai', openaiRouter);
app.use('/api/notion', notionRouter);
app.use('/api/twilio', twilioRouter);
app.use('/api/sendgrid', sendgridRouter);
app.use('/api/jira', jiraRouter);
app.use('/api/linear', linearRouter);
app.use('/api/vercel', vercelRouter);
app.use('/api/replicate', replicateRouter);

// SSE Route for MCP SuperAssistant
app.use('/sse', sseRouter);

// Socket.IO setup
setupSocketHandlers(io);

// Make io globally available for n8n webhooks
global.io = io;

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 WALLESTARS NEXUS CONTROL CENTER 🌟              ║
║                                                       ║
║   Server running on: http://localhost:${PORT}         ║
║   WebSocket ready on: ws://localhost:${PORT}          ║
║   SSE endpoint on:    http://localhost:${PORT}/sse    ║
║                                                       ║
║   Features enabled:                                   ║
║   - Claude AI Assistant                              ║
║   - MCP SSE Integration                              ║
║   - AI Agent Orchestration Farm                      ║
║   - Hostinger VPS Management                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
