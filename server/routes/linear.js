import express from 'express';
import { linearClient } from '../services/linearClient.js';

const router = express.Router();

const checkLinearConfig = (req, res, next) => {
  if (!linearClient.isConfigured()) {
    return res.status(503).json({
      error: 'Linear API not configured',
      message: 'LINEAR_API_KEY environment variable is not set'
    });
  }
  next();
};

router.use(checkLinearConfig);

// ==================== Issues ====================

router.post('/issues', async (req, res) => {
  try {
    const result = await linearClient.createIssue(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue', message: error.message });
  }
});

router.get('/issues/:issueId', async (req, res) => {
  try {
    const result = await linearClient.getIssue(req.params.issueId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting issue:', error);
    res.status(500).json({ error: 'Failed to get issue', message: error.message });
  }
});

router.patch('/issues/:issueId', async (req, res) => {
  try {
    const result = await linearClient.updateIssue(req.params.issueId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue', message: error.message });
  }
});

router.delete('/issues/:issueId', async (req, res) => {
  try {
    const result = await linearClient.deleteIssue(req.params.issueId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ error: 'Failed to delete issue', message: error.message });
  }
});

router.post('/issues/search', async (req, res) => {
  try {
    const { filter, first } = req.body;
    const result = await linearClient.searchIssues(filter, first);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching issues:', error);
    res.status(500).json({ error: 'Failed to search issues', message: error.message });
  }
});

// ==================== Comments ====================

router.post('/issues/:issueId/comments', async (req, res) => {
  try {
    const { body } = req.body;
    const result = await linearClient.addComment(req.params.issueId, body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment', message: error.message });
  }
});

// ==================== Teams ====================

router.get('/teams', async (req, res) => {
  try {
    const result = await linearClient.getTeams();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ error: 'Failed to get teams', message: error.message });
  }
});

router.get('/teams/:teamId', async (req, res) => {
  try {
    const result = await linearClient.getTeam(req.params.teamId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({ error: 'Failed to get team', message: error.message });
  }
});

// ==================== Projects ====================

router.get('/projects', async (req, res) => {
  try {
    const { first } = req.query;
    const result = await linearClient.getProjects(first ? parseInt(first) : undefined);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects', message: error.message });
  }
});

router.get('/projects/:projectId', async (req, res) => {
  try {
    const result = await linearClient.getProject(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project', message: error.message });
  }
});

// ==================== Cycles ====================

router.get('/teams/:teamId/cycles', async (req, res) => {
  try {
    const result = await linearClient.getCycles(req.params.teamId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting cycles:', error);
    res.status(500).json({ error: 'Failed to get cycles', message: error.message });
  }
});

// ==================== Users ====================

router.get('/me', async (req, res) => {
  try {
    const result = await linearClient.getCurrentUser();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user', message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await linearClient.getUsers();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users', message: error.message });
  }
});

// ==================== Labels ====================

router.get('/labels', async (req, res) => {
  try {
    const result = await linearClient.getLabels();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting labels:', error);
    res.status(500).json({ error: 'Failed to get labels', message: error.message });
  }
});

// ==================== Workflow States ====================

router.get('/workflow-states', async (req, res) => {
  try {
    const { teamId } = req.query;
    const result = await linearClient.getWorkflowStates(teamId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting workflow states:', error);
    res.status(500).json({ error: 'Failed to get workflow states', message: error.message });
  }
});

// ==================== GraphQL ====================

router.post('/graphql', async (req, res) => {
  try {
    const { query, variables } = req.body;
    const result = await linearClient.query(query, variables);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error executing GraphQL:', error);
    res.status(500).json({ error: 'Failed to execute GraphQL', message: error.message });
  }
});

export { router as linearRouter };
