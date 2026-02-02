import express from 'express';
import { notionClient } from '../services/notionClient.js';

const router = express.Router();

const checkNotionConfig = (req, res, next) => {
  if (!notionClient.isConfigured()) {
    return res.status(503).json({
      error: 'Notion API not configured',
      message: 'NOTION_API_KEY environment variable is not set'
    });
  }
  next();
};

router.use(checkNotionConfig);

// ==================== Pages ====================

router.get('/pages/:pageId', async (req, res) => {
  try {
    const page = await notionClient.getPage(req.params.pageId);
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error getting page:', error);
    res.status(500).json({ error: 'Failed to get page', message: error.message });
  }
});

router.post('/pages', async (req, res) => {
  try {
    const page = await notionClient.createPage(req.body);
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page', message: error.message });
  }
});

router.patch('/pages/:pageId', async (req, res) => {
  try {
    const page = await notionClient.updatePage(req.params.pageId, req.body);
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page', message: error.message });
  }
});

router.delete('/pages/:pageId', async (req, res) => {
  try {
    const page = await notionClient.archivePage(req.params.pageId);
    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error archiving page:', error);
    res.status(500).json({ error: 'Failed to archive page', message: error.message });
  }
});

// ==================== Databases ====================

router.get('/databases/:databaseId', async (req, res) => {
  try {
    const database = await notionClient.getDatabase(req.params.databaseId);
    res.json({ success: true, data: database });
  } catch (error) {
    console.error('Error getting database:', error);
    res.status(500).json({ error: 'Failed to get database', message: error.message });
  }
});

router.post('/databases/:databaseId/query', async (req, res) => {
  try {
    const results = await notionClient.queryDatabase(req.params.databaseId, req.body);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: 'Failed to query database', message: error.message });
  }
});

router.post('/databases', async (req, res) => {
  try {
    const database = await notionClient.createDatabase(req.body);
    res.json({ success: true, data: database });
  } catch (error) {
    console.error('Error creating database:', error);
    res.status(500).json({ error: 'Failed to create database', message: error.message });
  }
});

router.patch('/databases/:databaseId', async (req, res) => {
  try {
    const database = await notionClient.updateDatabase(req.params.databaseId, req.body);
    res.json({ success: true, data: database });
  } catch (error) {
    console.error('Error updating database:', error);
    res.status(500).json({ error: 'Failed to update database', message: error.message });
  }
});

// ==================== Blocks ====================

router.get('/blocks/:blockId/children', async (req, res) => {
  try {
    const children = await notionClient.getBlockChildren(req.params.blockId, req.query);
    res.json({ success: true, data: children });
  } catch (error) {
    console.error('Error getting block children:', error);
    res.status(500).json({ error: 'Failed to get block children', message: error.message });
  }
});

router.patch('/blocks/:blockId/children', async (req, res) => {
  try {
    const { children } = req.body;
    const result = await notionClient.appendBlockChildren(req.params.blockId, children);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error appending block children:', error);
    res.status(500).json({ error: 'Failed to append block children', message: error.message });
  }
});

router.get('/blocks/:blockId', async (req, res) => {
  try {
    const block = await notionClient.getBlock(req.params.blockId);
    res.json({ success: true, data: block });
  } catch (error) {
    console.error('Error getting block:', error);
    res.status(500).json({ error: 'Failed to get block', message: error.message });
  }
});

router.patch('/blocks/:blockId', async (req, res) => {
  try {
    const block = await notionClient.updateBlock(req.params.blockId, req.body);
    res.json({ success: true, data: block });
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ error: 'Failed to update block', message: error.message });
  }
});

router.delete('/blocks/:blockId', async (req, res) => {
  try {
    const block = await notionClient.deleteBlock(req.params.blockId);
    res.json({ success: true, data: block });
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ error: 'Failed to delete block', message: error.message });
  }
});

// ==================== Search ====================

router.post('/search', async (req, res) => {
  try {
    const results = await notionClient.search(req.body);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search', message: error.message });
  }
});

// ==================== Users ====================

router.get('/users', async (req, res) => {
  try {
    const users = await notionClient.listUsers(req.query);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users', message: error.message });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const user = await notionClient.getUser(req.params.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

router.get('/users/me', async (req, res) => {
  try {
    const user = await notionClient.getMe();
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user', message: error.message });
  }
});

// ==================== Comments ====================

router.get('/comments', async (req, res) => {
  try {
    const comments = await notionClient.getComments(req.query);
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Failed to get comments', message: error.message });
  }
});

router.post('/comments', async (req, res) => {
  try {
    const comment = await notionClient.createComment(req.body);
    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment', message: error.message });
  }
});

export { router as notionRouter };
