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
import categorizationRouter from './routes/categorization.js';
import { setupSocketHandlers } from './socket/handlers.js';

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
      categorization: !!process.env.ANTHROPIC_API_KEY
    }
  });
});

// API Routes
app.use('/api/claude', claudeRouter);
app.use('/api/computer', computerUseRouter);
app.use('/api/android', androidRouter);
app.use('/api/document-scanner', documentScannerRouter);
app.use('/api/categorization', categorizationRouter);
app.use('/api/webhooks/n8n', n8nWebhooksRouter);

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
║   Services Status:                                    ║
║   ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'} Claude API                                ║
║   ${process.env.ENABLE_COMPUTER_USE === 'true' ? '✅' : '❌'} Computer Use (Linux)                     ║
║   ${process.env.ENABLE_ANDROID === 'true' ? '✅' : '❌'} Android Control                            ║
║   ✅ SSE (MCP SuperAssistant)                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export { io };
