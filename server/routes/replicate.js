import express from 'express';
import { replicateClient } from '../services/replicateClient.js';

const router = express.Router();

const checkReplicateConfig = (req, res, next) => {
  if (!replicateClient.isConfigured()) {
    return res.status(503).json({
      error: 'Replicate API not configured',
      message: 'REPLICATE_API_TOKEN environment variable is not set'
    });
  }
  next();
};

router.use(checkReplicateConfig);

// ==================== Predictions ====================

router.post('/predictions', async (req, res) => {
  try {
    const { model, input, ...options } = req.body;
    const result = await replicateClient.createPrediction(model, input, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({ error: 'Failed to create prediction', message: error.message });
  }
});

router.get('/predictions', async (req, res) => {
  try {
    const result = await replicateClient.listPredictions(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing predictions:', error);
    res.status(500).json({ error: 'Failed to list predictions', message: error.message });
  }
});

router.get('/predictions/:predictionId', async (req, res) => {
  try {
    const result = await replicateClient.getPrediction(req.params.predictionId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting prediction:', error);
    res.status(500).json({ error: 'Failed to get prediction', message: error.message });
  }
});

router.post('/predictions/:predictionId/cancel', async (req, res) => {
  try {
    const result = await replicateClient.cancelPrediction(req.params.predictionId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error cancelling prediction:', error);
    res.status(500).json({ error: 'Failed to cancel prediction', message: error.message });
  }
});

router.post('/run', async (req, res) => {
  try {
    const { model, input, ...options } = req.body;
    const result = await replicateClient.run(model, input, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error running prediction:', error);
    res.status(500).json({ error: 'Failed to run prediction', message: error.message });
  }
});

// ==================== Models ====================

router.get('/models/:owner/:name', async (req, res) => {
  try {
    const result = await replicateClient.getModel(req.params.owner, req.params.name);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting model:', error);
    res.status(500).json({ error: 'Failed to get model', message: error.message });
  }
});

router.get('/models/:owner/:name/versions', async (req, res) => {
  try {
    const result = await replicateClient.listModelVersions(req.params.owner, req.params.name);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing model versions:', error);
    res.status(500).json({ error: 'Failed to list model versions', message: error.message });
  }
});

router.get('/models/:owner/:name/versions/:versionId', async (req, res) => {
  try {
    const result = await replicateClient.getModelVersion(
      req.params.owner,
      req.params.name,
      req.params.versionId
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting model version:', error);
    res.status(500).json({ error: 'Failed to get model version', message: error.message });
  }
});

router.post('/models', async (req, res) => {
  try {
    const result = await replicateClient.createModel(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Failed to create model', message: error.message });
  }
});

router.get('/models/search', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await replicateClient.searchModels(query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching models:', error);
    res.status(500).json({ error: 'Failed to search models', message: error.message });
  }
});

// ==================== Collections ====================

router.get('/collections', async (req, res) => {
  try {
    const result = await replicateClient.listCollections();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing collections:', error);
    res.status(500).json({ error: 'Failed to list collections', message: error.message });
  }
});

router.get('/collections/:collectionSlug', async (req, res) => {
  try {
    const result = await replicateClient.getCollection(req.params.collectionSlug);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting collection:', error);
    res.status(500).json({ error: 'Failed to get collection', message: error.message });
  }
});

// ==================== Deployments ====================

router.get('/deployments', async (req, res) => {
  try {
    const result = await replicateClient.listDeployments();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing deployments:', error);
    res.status(500).json({ error: 'Failed to list deployments', message: error.message });
  }
});

router.get('/deployments/:owner/:name', async (req, res) => {
  try {
    const result = await replicateClient.getDeployment(req.params.owner, req.params.name);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting deployment:', error);
    res.status(500).json({ error: 'Failed to get deployment', message: error.message });
  }
});

router.post('/deployments', async (req, res) => {
  try {
    const result = await replicateClient.createDeployment(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating deployment:', error);
    res.status(500).json({ error: 'Failed to create deployment', message: error.message });
  }
});

router.patch('/deployments/:owner/:name', async (req, res) => {
  try {
    const result = await replicateClient.updateDeployment(
      req.params.owner,
      req.params.name,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating deployment:', error);
    res.status(500).json({ error: 'Failed to update deployment', message: error.message });
  }
});

router.post('/deployments/:owner/:name/predictions', async (req, res) => {
  try {
    const { input } = req.body;
    const result = await replicateClient.createDeploymentPrediction(
      req.params.owner,
      req.params.name,
      input
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating deployment prediction:', error);
    res.status(500).json({ error: 'Failed to create deployment prediction', message: error.message });
  }
});

// ==================== Training ====================

router.post('/models/:owner/:name/versions/:version/trainings', async (req, res) => {
  try {
    const result = await replicateClient.createTraining(
      req.params.owner,
      req.params.name,
      req.params.version,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating training:', error);
    res.status(500).json({ error: 'Failed to create training', message: error.message });
  }
});

router.get('/trainings', async (req, res) => {
  try {
    const result = await replicateClient.listTrainings();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing trainings:', error);
    res.status(500).json({ error: 'Failed to list trainings', message: error.message });
  }
});

router.get('/trainings/:trainingId', async (req, res) => {
  try {
    const result = await replicateClient.getTraining(req.params.trainingId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting training:', error);
    res.status(500).json({ error: 'Failed to get training', message: error.message });
  }
});

router.post('/trainings/:trainingId/cancel', async (req, res) => {
  try {
    const result = await replicateClient.cancelTraining(req.params.trainingId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error cancelling training:', error);
    res.status(500).json({ error: 'Failed to cancel training', message: error.message });
  }
});

// ==================== Hardware ====================

router.get('/hardware', async (req, res) => {
  try {
    const result = await replicateClient.listHardware();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing hardware:', error);
    res.status(500).json({ error: 'Failed to list hardware', message: error.message });
  }
});

// ==================== Account ====================

router.get('/account', async (req, res) => {
  try {
    const result = await replicateClient.getAccount();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({ error: 'Failed to get account', message: error.message });
  }
});

export { router as replicateRouter };
