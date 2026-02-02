import express from 'express';
import { jiraClient } from '../services/jiraClient.js';

const router = express.Router();

const checkJiraConfig = (req, res, next) => {
  if (!jiraClient.isConfigured()) {
    return res.status(503).json({
      error: 'Jira API not configured',
      message: 'JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables are not set'
    });
  }
  next();
};

router.use(checkJiraConfig);

// ==================== Issues ====================

router.post('/issues', async (req, res) => {
  try {
    const result = await jiraClient.createIssue(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue', message: error.message });
  }
});

router.get('/issues/:issueIdOrKey', async (req, res) => {
  try {
    const result = await jiraClient.getIssue(req.params.issueIdOrKey, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting issue:', error);
    res.status(500).json({ error: 'Failed to get issue', message: error.message });
  }
});

router.put('/issues/:issueIdOrKey', async (req, res) => {
  try {
    const result = await jiraClient.updateIssue(req.params.issueIdOrKey, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue', message: error.message });
  }
});

router.delete('/issues/:issueIdOrKey', async (req, res) => {
  try {
    await jiraClient.deleteIssue(req.params.issueIdOrKey);
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ error: 'Failed to delete issue', message: error.message });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { jql, ...options } = req.body;
    const result = await jiraClient.searchIssues(jql, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching issues:', error);
    res.status(500).json({ error: 'Failed to search issues', message: error.message });
  }
});

router.post('/issues/:issueIdOrKey/transitions', async (req, res) => {
  try {
    const { transitionId, fields } = req.body;
    await jiraClient.transitionIssue(req.params.issueIdOrKey, transitionId, fields);
    res.json({ success: true, message: 'Issue transitioned' });
  } catch (error) {
    console.error('Error transitioning issue:', error);
    res.status(500).json({ error: 'Failed to transition issue', message: error.message });
  }
});

router.get('/issues/:issueIdOrKey/transitions', async (req, res) => {
  try {
    const result = await jiraClient.getTransitions(req.params.issueIdOrKey);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting transitions:', error);
    res.status(500).json({ error: 'Failed to get transitions', message: error.message });
  }
});

router.put('/issues/:issueIdOrKey/assignee', async (req, res) => {
  try {
    const { accountId } = req.body;
    await jiraClient.assignIssue(req.params.issueIdOrKey, accountId);
    res.json({ success: true, message: 'Issue assigned' });
  } catch (error) {
    console.error('Error assigning issue:', error);
    res.status(500).json({ error: 'Failed to assign issue', message: error.message });
  }
});

// ==================== Comments ====================

router.post('/issues/:issueIdOrKey/comments', async (req, res) => {
  try {
    const { body } = req.body;
    const result = await jiraClient.addComment(req.params.issueIdOrKey, body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment', message: error.message });
  }
});

router.get('/issues/:issueIdOrKey/comments', async (req, res) => {
  try {
    const result = await jiraClient.getComments(req.params.issueIdOrKey, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Failed to get comments', message: error.message });
  }
});

// ==================== Projects ====================

router.get('/projects', async (req, res) => {
  try {
    const result = await jiraClient.getProjects(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects', message: error.message });
  }
});

router.get('/projects/:projectIdOrKey', async (req, res) => {
  try {
    const result = await jiraClient.getProject(req.params.projectIdOrKey);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project', message: error.message });
  }
});

router.get('/projects/:projectIdOrKey/statuses', async (req, res) => {
  try {
    const result = await jiraClient.getProjectStatuses(req.params.projectIdOrKey);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting project statuses:', error);
    res.status(500).json({ error: 'Failed to get project statuses', message: error.message });
  }
});

// ==================== Users ====================

router.get('/users/search', async (req, res) => {
  try {
    const { query, ...params } = req.query;
    const result = await jiraClient.searchUsers(query, params);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users', message: error.message });
  }
});

router.get('/myself', async (req, res) => {
  try {
    const result = await jiraClient.getCurrentUser();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user', message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { accountId } = req.query;
    const result = await jiraClient.getUser(accountId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

// ==================== Sprints (Agile) ====================

router.get('/boards/:boardId/sprints', async (req, res) => {
  try {
    const result = await jiraClient.getSprints(req.params.boardId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting sprints:', error);
    res.status(500).json({ error: 'Failed to get sprints', message: error.message });
  }
});

router.get('/sprints/:sprintId/issues', async (req, res) => {
  try {
    const result = await jiraClient.getSprintIssues(req.params.sprintId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting sprint issues:', error);
    res.status(500).json({ error: 'Failed to get sprint issues', message: error.message });
  }
});

// ==================== Boards ====================

router.get('/boards', async (req, res) => {
  try {
    const result = await jiraClient.getBoards(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting boards:', error);
    res.status(500).json({ error: 'Failed to get boards', message: error.message });
  }
});

router.get('/boards/:boardId/configuration', async (req, res) => {
  try {
    const result = await jiraClient.getBoardConfig(req.params.boardId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting board config:', error);
    res.status(500).json({ error: 'Failed to get board config', message: error.message });
  }
});

export { router as jiraRouter };
