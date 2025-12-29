const express = require('express');
const router = express.Router();
const { verifyEnterpriseUser } = require('../middleware/auth');
const { premiumApiLimiter } = require('../middleware/rateLimiter');

// In-memory storage for demo purposes
// In production, this would use a database
const sparkRequests = [];
let requestIdCounter = 1;

// Create a new spark premium request
router.post('/request', premiumApiLimiter, verifyEnterpriseUser, (req, res) => {
  const { sparkType, description, priority, metadata } = req.body;

  if (!sparkType) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'sparkType is required'
    });
  }

  const newRequest = {
    id: requestIdCounter++,
    userId: req.user.userId,
    sparkType,
    description: description || '',
    priority: priority || 'medium',
    metadata: metadata || {},
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  sparkRequests.push(newRequest);

  res.status(201).json({
    message: 'Spark premium request created successfully',
    request: newRequest
  });
});

// Get all spark premium requests for the user
router.get('/requests', premiumApiLimiter, verifyEnterpriseUser, (req, res) => {
  const userRequests = sparkRequests.filter(
    request => request.userId === req.user.userId
  );

  res.json({
    total: userRequests.length,
    requests: userRequests
  });
});

// Get a specific spark premium request
router.get('/request/:id', premiumApiLimiter, verifyEnterpriseUser, (req, res) => {
  const requestId = parseInt(req.params.id);
  const request = sparkRequests.find(r => r.id === requestId);

  if (!request) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Spark premium request not found'
    });
  }

  // Verify the request belongs to the user
  if (request.userId !== req.user.userId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have access to this request'
    });
  }

  res.json({ request });
});

// Update a spark premium request
router.patch('/request/:id', premiumApiLimiter, verifyEnterpriseUser, (req, res) => {
  const requestId = parseInt(req.params.id);
  const request = sparkRequests.find(r => r.id === requestId);

  if (!request) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Spark premium request not found'
    });
  }

  // Verify the request belongs to the user
  if (request.userId !== req.user.userId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have access to this request'
    });
  }

  const { description, priority, status, metadata } = req.body;

  if (description !== undefined) request.description = description;
  if (priority !== undefined) request.priority = priority;
  if (status !== undefined) request.status = status;
  if (metadata !== undefined) request.metadata = { ...request.metadata, ...metadata };
  
  request.updatedAt = new Date().toISOString();

  res.json({
    message: 'Spark premium request updated successfully',
    request
  });
});

// Delete a spark premium request
router.delete('/request/:id', premiumApiLimiter, verifyEnterpriseUser, (req, res) => {
  const requestId = parseInt(req.params.id);
  const requestIndex = sparkRequests.findIndex(r => r.id === requestId);

  if (requestIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Spark premium request not found'
    });
  }

  const request = sparkRequests[requestIndex];

  // Verify the request belongs to the user
  if (request.userId !== req.user.userId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have access to this request'
    });
  }

  sparkRequests.splice(requestIndex, 1);

  res.json({
    message: 'Spark premium request deleted successfully'
  });
});

module.exports = router;
