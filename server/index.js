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
import workersRouter, { setupWorkerSocketEvents } from './routes/workers.js';
import { workerOrchestrator } from './workers/index.js';

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
  const workerStatus = workerOrchestrator.getStatus();
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
      workers: workerStatus.orchestrator.isRunning
    },
    cpu: {
      current: workerStatus.summary.currentCpu,
      target: workerStatus.summary.targetCpu,
      mode: workerStatus.summary.workloadMode
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
app.use('/api/workers', workersRouter);

// SSE Route for MCP SuperAssistant
app.use('/sse', sseRouter);

// Socket.IO setup
setupSocketHandlers(io);
setupWorkerSocketEvents(io);

// Make io globally available for n8n webhooks
global.io = io;

// Auto-start workers for CPU monitoring (maintains 50%+ CPU)
const AUTO_START_WORKERS = process.env.AUTO_START_WORKERS !== 'false';
if (AUTO_START_WORKERS) {
  setTimeout(() => {
    console.log('🚀 Auto-starting worker orchestrator...');
    workerOrchestrator.startAll().catch(err => {
      console.error('Failed to auto-start workers:', err.message);
    });
  }, 2000); // Wait 2 seconds for server to fully initialize
}

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
║   - Worker Orchestrator (CPU 50%+ Target)            ║
║     - Slack Monitor Worker                           ║
║     - CPU Workload Manager                           ║
║     - PR Analysis Worker                             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
