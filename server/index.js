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
import tasksRouter from './routes/tasks.js';
import agentsRouter from './routes/agents.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { getTaskOrchestrator } from './services/taskOrchestrator.js';

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
      documentScanner: !!process.env.ANTHROPIC_API_KEY
    }
  });
});

// API Routes
app.use('/api/claude', claudeRouter);
app.use('/api/computer', computerUseRouter);
app.use('/api/android', androidRouter);
app.use('/api/document-scanner', documentScannerRouter);
app.use('/api/webhooks/n8n', n8nWebhooksRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/agents', agentsRouter);

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

httpServer.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 WALLESTARS NEXUS CONTROL CENTER 🌟              ║
║                                                       ║
║   Server running on: http://localhost:${PORT}         ║
║   WebSocket ready on: ws://localhost:${PORT}          ║
║                                                       ║
║   Services Status:                                    ║
║   ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'} Claude API                                ║
║   ${process.env.ENABLE_COMPUTER_USE === 'true' ? '✅' : '❌'} Computer Use (Linux)                     ║
║   ${process.env.ENABLE_ANDROID === 'true' ? '✅' : '❌'} Android Control                            ║
║   ✅ Task Orchestration & Agent Management            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Initialize Task Orchestrator
  try {
    const orchestrator = getTaskOrchestrator();
    await orchestrator.initialize();
    
    // Setup event handlers for real-time updates
    orchestrator.on('taskAssigned', ({ task, agent }) => {
      io.emit('task:assigned', { task, agent });
      console.log(`📋 Task ${task.id} assigned to ${agent.name}`);
    });
    
    orchestrator.on('taskUpdated', ({ task }) => {
      io.emit('task:updated', { task });
      console.log(`📊 Task ${task.id} updated: ${task.progress}%`);
    });
    
    orchestrator.on('taskFailed', ({ task, reason }) => {
      io.emit('task:failed', { task, reason });
      console.error(`❌ Task ${task.id} failed: ${reason}`);
    });
    
    orchestrator.on('slaViolation', ({ task }) => {
      io.emit('task:sla-violation', { task });
      console.warn(`⚠️  SLA violation for task ${task.id}`);
    });
    
    orchestrator.on('agentOverload', ({ agent }) => {
      io.emit('agent:overload', { agent });
      console.warn(`⚠️  Agent ${agent.id} is overloaded`);
    });
    
    console.log('✅ Task Orchestrator initialized successfully');
    
    const metrics = orchestrator.getMetrics();
    console.log(`📊 Tasks: ${metrics.completedTasks}/${metrics.totalTasks} completed`);
    console.log(`🤖 Active agents: ${metrics.activeAgents}`);
  } catch (error) {
    console.error('❌ Failed to initialize Task Orchestrator:', error);
  }
});

export { io };
