import express from 'express';
import { gitlabClient } from '../services/gitlabClient.js';

const router = express.Router();

const checkGitLabConfig = (req, res, next) => {
  if (!gitlabClient.isConfigured()) {
    return res.status(503).json({
      error: 'GitLab API not configured',
      message: 'GITLAB_API_TOKEN environment variable is not set'
    });
  }
  next();
};

router.use(checkGitLabConfig);

// ==================== Projects ====================

router.get('/projects', async (req, res) => {
  try {
    const projects = await gitlabClient.listProjects(req.query);
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Failed to list projects', message: error.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await gitlabClient.getProject(req.params.id);
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project', message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const project = await gitlabClient.createProject(req.body);
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project', message: error.message });
  }
});

// ==================== Merge Requests ====================

router.get('/projects/:projectId/merge-requests', async (req, res) => {
  try {
    const mrs = await gitlabClient.listMergeRequests(req.params.projectId, req.query);
    res.json({ success: true, data: mrs });
  } catch (error) {
    console.error('Error listing merge requests:', error);
    res.status(500).json({ error: 'Failed to list merge requests', message: error.message });
  }
});

router.get('/projects/:projectId/merge-requests/:mrIid', async (req, res) => {
  try {
    const mr = await gitlabClient.getMergeRequest(req.params.projectId, req.params.mrIid);
    res.json({ success: true, data: mr });
  } catch (error) {
    console.error('Error getting merge request:', error);
    res.status(500).json({ error: 'Failed to get merge request', message: error.message });
  }
});

router.post('/projects/:projectId/merge-requests', async (req, res) => {
  try {
    const mr = await gitlabClient.createMergeRequest(req.params.projectId, req.body);
    res.json({ success: true, data: mr });
  } catch (error) {
    console.error('Error creating merge request:', error);
    res.status(500).json({ error: 'Failed to create merge request', message: error.message });
  }
});

router.put('/projects/:projectId/merge-requests/:mrIid/merge', async (req, res) => {
  try {
    const result = await gitlabClient.mergeMergeRequest(req.params.projectId, req.params.mrIid, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error merging:', error);
    res.status(500).json({ error: 'Failed to merge', message: error.message });
  }
});

// ==================== Issues ====================

router.get('/projects/:projectId/issues', async (req, res) => {
  try {
    const issues = await gitlabClient.listIssues(req.params.projectId, req.query);
    res.json({ success: true, data: issues });
  } catch (error) {
    console.error('Error listing issues:', error);
    res.status(500).json({ error: 'Failed to list issues', message: error.message });
  }
});

router.get('/projects/:projectId/issues/:issueIid', async (req, res) => {
  try {
    const issue = await gitlabClient.getIssue(req.params.projectId, req.params.issueIid);
    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Error getting issue:', error);
    res.status(500).json({ error: 'Failed to get issue', message: error.message });
  }
});

router.post('/projects/:projectId/issues', async (req, res) => {
  try {
    const issue = await gitlabClient.createIssue(req.params.projectId, req.body);
    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue', message: error.message });
  }
});

// ==================== Pipelines ====================

router.get('/projects/:projectId/pipelines', async (req, res) => {
  try {
    const pipelines = await gitlabClient.listPipelines(req.params.projectId, req.query);
    res.json({ success: true, data: pipelines });
  } catch (error) {
    console.error('Error listing pipelines:', error);
    res.status(500).json({ error: 'Failed to list pipelines', message: error.message });
  }
});

router.get('/projects/:projectId/pipelines/:pipelineId', async (req, res) => {
  try {
    const pipeline = await gitlabClient.getPipeline(req.params.projectId, req.params.pipelineId);
    res.json({ success: true, data: pipeline });
  } catch (error) {
    console.error('Error getting pipeline:', error);
    res.status(500).json({ error: 'Failed to get pipeline', message: error.message });
  }
});

router.post('/projects/:projectId/pipelines', async (req, res) => {
  try {
    const { ref, variables } = req.body;
    const pipeline = await gitlabClient.triggerPipeline(req.params.projectId, ref, variables);
    res.json({ success: true, data: pipeline });
  } catch (error) {
    console.error('Error triggering pipeline:', error);
    res.status(500).json({ error: 'Failed to trigger pipeline', message: error.message });
  }
});

router.post('/projects/:projectId/pipelines/:pipelineId/cancel', async (req, res) => {
  try {
    const result = await gitlabClient.cancelPipeline(req.params.projectId, req.params.pipelineId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error cancelling pipeline:', error);
    res.status(500).json({ error: 'Failed to cancel pipeline', message: error.message });
  }
});

router.post('/projects/:projectId/pipelines/:pipelineId/retry', async (req, res) => {
  try {
    const result = await gitlabClient.retryPipeline(req.params.projectId, req.params.pipelineId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error retrying pipeline:', error);
    res.status(500).json({ error: 'Failed to retry pipeline', message: error.message });
  }
});

// ==================== Branches ====================

router.get('/projects/:projectId/branches', async (req, res) => {
  try {
    const branches = await gitlabClient.listBranches(req.params.projectId);
    res.json({ success: true, data: branches });
  } catch (error) {
    console.error('Error listing branches:', error);
    res.status(500).json({ error: 'Failed to list branches', message: error.message });
  }
});

router.post('/projects/:projectId/branches', async (req, res) => {
  try {
    const { branch, ref } = req.body;
    const result = await gitlabClient.createBranch(req.params.projectId, branch, ref);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch', message: error.message });
  }
});

// ==================== Commits ====================

router.get('/projects/:projectId/commits', async (req, res) => {
  try {
    const commits = await gitlabClient.listCommits(req.params.projectId, req.query);
    res.json({ success: true, data: commits });
  } catch (error) {
    console.error('Error listing commits:', error);
    res.status(500).json({ error: 'Failed to list commits', message: error.message });
  }
});

// ==================== User ====================

router.get('/user', async (req, res) => {
  try {
    const user = await gitlabClient.getCurrentUser();
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

export { router as gitlabRouter };
