const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌟 Wallestars</h1>
        <p>Your Modern SAAS Platform</p>
        <div class="status">✓ Deployed on Replit</div>
        <div class="features">
          <div class="feature">
            <h3>🚀 Fast Deployment</h3>
            <p>Quick and easy deployment process</p>
          </div>
          <div class="feature">
            <h3>🔒 Secure</h3>
            <p>Built with security best practices</p>
          </div>
          <div class="feature">
            <h3>⚡ Scalable</h3>
            <p>Ready to grow with your needs</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'Replit'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌟 Wallestars SAAS Platform running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Server ready at http://0.0.0.0:${PORT}`);
});
