import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { claudeRouter } from './routes/claude.js';
import { computerUseRouter } from './routes/computerUse.js';
import { androidRouter } from './routes/android.js';
import { setupSocketHandlers } from './socket/handlers.js';

dotenv.config();

// Helper function to validate API key
const isValidApiKey = (key) => {
  return key && 
         key !== 'your_api_key_here' && 
         key.startsWith('sk-ant-');
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      claude: isValidApiKey(process.env.ANTHROPIC_API_KEY),
      computerUse: process.env.ENABLE_COMPUTER_USE === 'true',
      android: process.env.ENABLE_ANDROID === 'true'
    }
  });
});

// API Routes
app.use('/api/claude', claudeRouter);
app.use('/api/computer', computerUseRouter);
app.use('/api/android', androidRouter);

// Socket.IO setup
setupSocketHandlers(io);

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
  const hasValidApiKey = isValidApiKey(process.env.ANTHROPIC_API_KEY);
  
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 WALLESTARS CONTROL CENTER 🌟                    ║
║                                                       ║
║   Server running on: http://localhost:${PORT}         ║
║   WebSocket ready on: ws://localhost:${PORT}          ║
║                                                       ║
║   Services Status:                                    ║
║   ${hasValidApiKey ? '✅' : '❌'} Claude API                                ║
║   ${process.env.ENABLE_COMPUTER_USE === 'true' ? '✅' : '❌'} Computer Use (Linux)                     ║
║   ${process.env.ENABLE_ANDROID === 'true' ? '✅' : '❌'} Android Control                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  if (!hasValidApiKey) {
    console.log(`
⚠️  WARNING: Claude API key not configured!
   Edit your .env file and add a valid API key.
   Get one at: https://console.anthropic.com
`);
  }
});

export { io };
