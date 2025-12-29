const express = require('express');
const sparkPremiumRouter = require('./routes/sparkPremium');
const sparkExamplesRouter = require('./routes/sparkExamples');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Wallestars - Spark Premium Request API',
    version: '1.0.0',
    endpoints: {
      sparkPremium: '/api/spark-premium',
      sparkExamples: '/api/spark-examples'
    }
  });
});

// Routes
app.use('/api/spark-premium', sparkPremiumRouter);
app.use('/api/spark-examples', sparkExamplesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Wallestars Spark Premium API running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for API documentation`);
});

module.exports = app;
