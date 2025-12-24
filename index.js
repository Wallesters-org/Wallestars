const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// Session store for tracking active sessions
const activeSessions = new Map();

// Helper function to generate CSRF token
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'wallestars-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'wallestars.sid'
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session tracking middleware
app.use((req, res, next) => {
  // Initialize session data if first visit
  if (!req.session.visitCount) {
    req.session.visitCount = 0;
    req.session.createdAt = new Date().toISOString();
    req.session.csrfToken = generateCSRFToken(); // Generate CSRF token for new sessions
  }
  req.session.visitCount++;
  req.session.lastVisit = new Date().toISOString();
  
  // Track active session
  activeSessions.set(req.sessionID, {
    id: req.sessionID,
    createdAt: req.session.createdAt,
    lastVisit: req.session.lastVisit,
    visitCount: req.session.visitCount,
    userAgent: req.get('user-agent')
  });
  
  next();
});

// CSRF protection middleware for state-changing operations
function csrfProtection(req, res, next) {
  // Only protect POST, PUT, DELETE, PATCH methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token || token !== req.session.csrfToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
}

// Session Management Routes
app.get('/api/session', (req, res) => {
  res.json({
    sessionId: req.sessionID,
    createdAt: req.session.createdAt,
    lastVisit: req.session.lastVisit,
    visitCount: req.session.visitCount,
    isNewSession: req.session.visitCount === 1,
    csrfToken: req.session.csrfToken
  });
});

app.get('/api/sessions', (req, res) => {
  // Clean up expired sessions (older than 24 hours)
  const now = new Date();
  const expiredThreshold = 24 * 60 * 60 * 1000;
  
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    const sessionAge = now - new Date(sessionData.createdAt);
    if (sessionAge > expiredThreshold) {
      activeSessions.delete(sessionId);
    }
  }
  
  res.json({
    totalActiveSessions: activeSessions.size,
    sessions: Array.from(activeSessions.values()).map(s => ({
      id: s.id.substring(0, 8) + '...', // Hide full session ID for security
      createdAt: s.createdAt,
      lastVisit: s.lastVisit,
      visitCount: s.visitCount
    }))
  });
});

app.post('/api/session/new', csrfProtection, (req, res) => {
  // Destroy current session and create a new one
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create new session' });
    }
    
    req.session.visitCount = 1;
    req.session.createdAt = new Date().toISOString();
    req.session.lastVisit = new Date().toISOString();
    req.session.csrfToken = generateCSRFToken(); // Generate new CSRF token for new session
    
    res.json({
      message: 'New session created successfully',
      sessionId: req.sessionID,
      createdAt: req.session.createdAt,
      csrfToken: req.session.csrfToken
    });
  });
});

app.delete('/api/session', csrfProtection, (req, res) => {
  const sessionId = req.sessionID;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to destroy session' });
    }
    
    activeSessions.delete(sessionId);
    res.json({ message: 'Session destroyed successfully' });
  });
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wallestars SAAS Platform</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
          max-width: 800px;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        .features {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
          margin-top: 2rem;
        }
        .feature {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
        }
        .status {
          display: inline-block;
          background: #4ade80;
          color: #065f46;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          margin-top: 1rem;
        }
        .session-info {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 1.5rem;
          margin-top: 2rem;
          text-align: left;
        }
        .session-info h3 {
          margin-bottom: 1rem;
          text-align: center;
        }
        .session-detail {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .session-detail:last-child {
          border-bottom: none;
        }
        .session-detail label {
          font-weight: 600;
          opacity: 0.8;
        }
        .session-detail .value {
          font-family: monospace;
          opacity: 0.9;
        }
        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        button {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        button:active {
          transform: translateY(0);
        }
        .refresh {
          background: #4ade80;
          color: #065f46;
          border-color: #4ade80;
        }
        .new-session {
          background: #fbbf24;
          color: #78350f;
          border-color: #fbbf24;
        }
        .destroy {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }
        @media (max-width: 768px) {
          h1 { font-size: 2rem; }
          .container { padding: 1rem; }
          .button-group { flex-direction: column; }
          button { width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌟 Wallestars</h1>
        <p>Your Modern SAAS Platform</p>
        <div class="status">✓ Connected</div>
        
        <div class="session-info">
          <h3>🔐 Session Information</h3>
          <div class="session-detail">
            <label>Session ID:</label>
            <span class="value" id="sessionId">Loading...</span>
          </div>
          <div class="session-detail">
            <label>Created At:</label>
            <span class="value" id="createdAt">Loading...</span>
          </div>
          <div class="session-detail">
            <label>Last Visit:</label>
            <span class="value" id="lastVisit">Loading...</span>
          </div>
          <div class="session-detail">
            <label>Visit Count:</label>
            <span class="value" id="visitCount">Loading...</span>
          </div>
          <div class="session-detail">
            <label>Status:</label>
            <span class="value" id="sessionStatus">Loading...</span>
          </div>
          
          <div class="button-group">
            <button class="refresh" onclick="refreshSession()">🔄 Refresh Session</button>
            <button class="new-session" onclick="createNewSession()">✨ New Session</button>
            <button class="destroy" onclick="destroySession()">🗑️ Destroy Session</button>
          </div>
        </div>
        
        <div class="features">
          <div class="feature">
            <h3>🚀 Fast Deployment</h3>
            <p>Quick and easy deployment process</p>
          </div>
          <div class="feature">
            <h3>🔒 Secure Sessions</h3>
            <p>Built with session management and security best practices</p>
          </div>
          <div class="feature">
            <h3>⚡ Scalable</h3>
            <p>Ready to grow with your needs</p>
          </div>
        </div>
      </div>
      
      <script>
        // Store CSRF token globally
        let csrfToken = null;
        
        // Load session information on page load
        async function loadSessionInfo() {
          try {
            const response = await fetch('/api/session');
            const data = await response.json();
            
            // Store CSRF token for later use
            csrfToken = data.csrfToken;
            
            document.getElementById('sessionId').textContent = data.sessionId.substring(0, 16) + '...';
            document.getElementById('createdAt').textContent = new Date(data.createdAt).toLocaleString();
            document.getElementById('lastVisit').textContent = new Date(data.lastVisit).toLocaleString();
            document.getElementById('visitCount').textContent = data.visitCount;
            document.getElementById('sessionStatus').textContent = data.isNewSession ? '🆕 New Session' : '✅ Active';
          } catch (error) {
            console.error('Failed to load session info:', error);
          }
        }
        
        async function refreshSession() {
          await loadSessionInfo();
          alert('Session information refreshed!');
        }
        
        async function createNewSession() {
          if (!confirm('This will create a new session. Continue?')) return;
          
          try {
            const response = await fetch('/api/session/new', {
              method: 'POST',
              headers: {
                'X-CSRF-Token': csrfToken
              }
            });
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to create new session');
            }
            
            alert(data.message);
            window.location.reload();
          } catch (error) {
            alert('Failed to create new session: ' + error.message);
          }
        }
        
        async function destroySession() {
          if (!confirm('This will destroy your current session. Continue?')) return;
          
          try {
            const response = await fetch('/api/session', {
              method: 'DELETE',
              headers: {
                'X-CSRF-Token': csrfToken
              }
            });
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to destroy session');
            }
            
            alert(data.message);
            window.location.reload();
          } catch (error) {
            alert('Failed to destroy session: ' + error.message);
          }
        }
        
        // Load session info when page loads
        loadSessionInfo();
      </script>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'Replit',
    activeSessions: activeSessions.size,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌟 Wallestars SAAS Platform running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Server ready at http://0.0.0.0:${PORT}`);
});
