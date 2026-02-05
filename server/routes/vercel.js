import express from 'express';
import { vercelClient } from '../services/vercelClient.js';

const router = express.Router();

const checkVercelConfig = (req, res, next) => {
  if (!vercelClient.isConfigured()) {
    return res.status(503).json({
      error: 'Vercel API not configured',
      message: 'VERCEL_API_TOKEN environment variable is not set'
    });
  }
  next();
};

router.use(checkVercelConfig);

// ==================== Projects ====================

router.get('/projects', async (req, res) => {
  try {
    const result = await vercelClient.listProjects(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Failed to list projects', message: error.message });
  }
});

router.get('/projects/:projectId', async (req, res) => {
  try {
    const result = await vercelClient.getProject(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project', message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const result = await vercelClient.createProject(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project', message: error.message });
  }
});

router.patch('/projects/:projectId', async (req, res) => {
  try {
    const result = await vercelClient.updateProject(req.params.projectId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project', message: error.message });
  }
});

router.delete('/projects/:projectId', async (req, res) => {
  try {
    await vercelClient.deleteProject(req.params.projectId);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project', message: error.message });
  }
});

// ==================== Deployments ====================

router.get('/deployments', async (req, res) => {
  try {
    const result = await vercelClient.listDeployments(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing deployments:', error);
    res.status(500).json({ error: 'Failed to list deployments', message: error.message });
  }
});

router.get('/deployments/:deploymentId', async (req, res) => {
  try {
    const result = await vercelClient.getDeployment(req.params.deploymentId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting deployment:', error);
    res.status(500).json({ error: 'Failed to get deployment', message: error.message });
  }
});

router.post('/deployments', async (req, res) => {
  try {
    const result = await vercelClient.createDeployment(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating deployment:', error);
    res.status(500).json({ error: 'Failed to create deployment', message: error.message });
  }
});

router.patch('/deployments/:deploymentId/cancel', async (req, res) => {
  try {
    const result = await vercelClient.cancelDeployment(req.params.deploymentId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error cancelling deployment:', error);
    res.status(500).json({ error: 'Failed to cancel deployment', message: error.message });
  }
});

router.get('/deployments/:deploymentId/events', async (req, res) => {
  try {
    const result = await vercelClient.getDeploymentEvents(req.params.deploymentId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting deployment events:', error);
    res.status(500).json({ error: 'Failed to get deployment events', message: error.message });
  }
});

router.get('/deployments/:deploymentId/logs', async (req, res) => {
  try {
    const result = await vercelClient.getLogs(req.params.deploymentId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting deployment logs:', error);
    res.status(500).json({ error: 'Failed to get deployment logs', message: error.message });
  }
});

// ==================== Domains ====================

router.get('/domains', async (req, res) => {
  try {
    const result = await vercelClient.listDomains(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error listing domains:', error);
    res.status(500).json({ error: 'Failed to list domains', message: error.message });
  }
});

router.get('/domains/:domain', async (req, res) => {
  try {
    const result = await vercelClient.getDomain(req.params.domain);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting domain:', error);
    res.status(500).json({ error: 'Failed to get domain', message: error.message });
  }
});

router.post('/domains', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await vercelClient.addDomain(name);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding domain:', error);
    res.status(500).json({ error: 'Failed to add domain', message: error.message });
  }
});

router.delete('/domains/:domain', async (req, res) => {
  try {
    await vercelClient.removeDomain(req.params.domain);
    res.json({ success: true, message: 'Domain removed' });
  } catch (error) {
    console.error('Error removing domain:', error);
    res.status(500).json({ error: 'Failed to remove domain', message: error.message });
  }
});

router.get('/domains/status/:name', async (req, res) => {
  try {
    const result = await vercelClient.checkDomain(req.params.name);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error checking domain:', error);
    res.status(500).json({ error: 'Failed to check domain', message: error.message });
  }
});

// ==================== Environment Variables ====================

router.get('/projects/:projectId/env', async (req, res) => {
  try {
    const result = await vercelClient.getEnvVars(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting env vars:', error);
    res.status(500).json({ error: 'Failed to get env vars', message: error.message });
  }
});

router.post('/projects/:projectId/env', async (req, res) => {
  try {
    const result = await vercelClient.createEnvVar(req.params.projectId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating env var:', error);
    res.status(500).json({ error: 'Failed to create env var', message: error.message });
  }
});

router.delete('/projects/:projectId/env/:envId', async (req, res) => {
  try {
    await vercelClient.deleteEnvVar(req.params.projectId, req.params.envId);
    res.json({ success: true, message: 'Env var deleted' });
  } catch (error) {
    console.error('Error deleting env var:', error);
    res.status(500).json({ error: 'Failed to delete env var', message: error.message });
  }
});

// ==================== Teams ====================

router.get('/teams', async (req, res) => {
  try {
    const result = await vercelClient.getTeams();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ error: 'Failed to get teams', message: error.message });
  }
});

router.get('/teams/:teamId', async (req, res) => {
  try {
    const result = await vercelClient.getTeam(req.params.teamId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({ error: 'Failed to get team', message: error.message });
  }
});

// ==================== User ====================

router.get('/user', async (req, res) => {
  try {
    const result = await vercelClient.getCurrentUser();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

// ==================== Edge Config ====================

router.get('/edge-config', async (req, res) => {
  try {
    const result = await vercelClient.getEdgeConfigs();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting edge configs:', error);
    res.status(500).json({ error: 'Failed to get edge configs', message: error.message });
  }
});

router.get('/edge-config/:edgeConfigId', async (req, res) => {
  try {
    const result = await vercelClient.getEdgeConfig(req.params.edgeConfigId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting edge config:', error);
    res.status(500).json({ error: 'Failed to get edge config', message: error.message });
  }
});

router.get('/edge-config/:edgeConfigId/items', async (req, res) => {
  try {
    const result = await vercelClient.getEdgeConfigItems(req.params.edgeConfigId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting edge config items:', error);
    res.status(500).json({ error: 'Failed to get edge config items', message: error.message });
  }
});

export { router as vercelRouter };
