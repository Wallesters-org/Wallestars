import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { claudeRouter } from './routes/claude.js';
import { computerUseRouter } from './routes/computerUse.js';
import { androidRouter } from './routes/android.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { 
  securityMiddleware, 
  sanitizeInput, 
  requestTimeout, 
  errorHandler 
} from './middleware/security.js';
import { 
  apiLimiter, 
  claudeLimiter,
  visionLimiter,
  computerUseLimiter 
} from './middleware/rateLimit.js';

dotenv.config();

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
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.static('dist'));

// Security middleware
app.use(securityMiddleware);
app.use(sanitizeInput);
app.use(requestTimeout(30000)); // 30 second timeout

// General API rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      computerUse: process.env.ENABLE_COMPUTER_USE === 'true',
      android: process.env.ENABLE_ANDROID === 'true'
    }
  });
});

// API Routes with specific rate limiters
app.use('/api/claude', claudeRouter);
app.use('/api/computer', computerUseLimiter, computerUseRouter);
app.use('/api/android', androidRouter);

// Socket.IO setup
setupSocketHandlers(io);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 WALLESTARS CONTROL CENTER 🌟                    ║
║                                                       ║
║   Server running on: http://localhost:${PORT}         ║
║   WebSocket ready on: ws://localhost:${PORT}          ║
║                                                       ║
║   Services Status:                                    ║
║   ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'} Claude API                                ║
║   ${process.env.ENABLE_COMPUTER_USE === 'true' ? '✅' : '❌'} Computer Use (Linux)                     ║
║   ${process.env.ENABLE_ANDROID === 'true' ? '✅' : '❌'} Android Control                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export { io };
