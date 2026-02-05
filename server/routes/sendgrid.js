import express from 'express';
import { sendgridClient } from '../services/sendgridClient.js';

const router = express.Router();

const checkSendGridConfig = (req, res, next) => {
  if (!sendgridClient.isConfigured()) {
    return res.status(503).json({
      error: 'SendGrid API not configured',
      message: 'SENDGRID_API_KEY environment variable is not set'
    });
  }
  next();
};

router.use(checkSendGridConfig);

// ==================== Mail Send ====================

router.post('/mail/send', async (req, res) => {
  try {
    const result = await sendgridClient.sendEmail(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
});

router.post('/mail/simple', async (req, res) => {
  try {
    const { to, subject, body, isHtml } = req.body;
    const result = await sendgridClient.send(to, subject, body, isHtml);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
});

router.post('/mail/template', async (req, res) => {
  try {
    const { to, templateId, templateData } = req.body;
    const result = await sendgridClient.sendTemplate(to, templateId, templateData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending template email:', error);
    res.status(500).json({ error: 'Failed to send template email', message: error.message });
  }
});

// ==================== Contacts ====================

router.put('/contacts', async (req, res) => {
  try {
    const { contacts } = req.body;
    const result = await sendgridClient.upsertContacts(contacts);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error upserting contacts:', error);
    res.status(500).json({ error: 'Failed to upsert contacts', message: error.message });
  }
});

router.post('/contacts/search', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await sendgridClient.searchContacts(query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ error: 'Failed to search contacts', message: error.message });
  }
});

router.get('/contacts/:contactId', async (req, res) => {
  try {
    const result = await sendgridClient.getContact(req.params.contactId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({ error: 'Failed to get contact', message: error.message });
  }
});

router.delete('/contacts', async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await sendgridClient.deleteContacts(ids);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting contacts:', error);
    res.status(500).json({ error: 'Failed to delete contacts', message: error.message });
  }
});

router.get('/contacts/count', async (req, res) => {
  try {
    const result = await sendgridClient.getContactCount();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting contact count:', error);
    res.status(500).json({ error: 'Failed to get contact count', message: error.message });
  }
});

// ==================== Lists ====================

router.get('/lists', async (req, res) => {
  try {
    const result = await sendgridClient.getLists(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting lists:', error);
    res.status(500).json({ error: 'Failed to get lists', message: error.message });
  }
});

router.post('/lists', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await sendgridClient.createList(name);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list', message: error.message });
  }
});

router.delete('/lists/:listId', async (req, res) => {
  try {
    await sendgridClient.deleteList(req.params.listId);
    res.json({ success: true, message: 'List deleted' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list', message: error.message });
  }
});

router.put('/lists/:listId/contacts', async (req, res) => {
  try {
    const { contactIds } = req.body;
    const result = await sendgridClient.addContactsToList(req.params.listId, contactIds);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding contacts to list:', error);
    res.status(500).json({ error: 'Failed to add contacts to list', message: error.message });
  }
});

// ==================== Templates ====================

router.get('/templates', async (req, res) => {
  try {
    const result = await sendgridClient.getTemplates(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates', message: error.message });
  }
});

router.get('/templates/:templateId', async (req, res) => {
  try {
    const result = await sendgridClient.getTemplate(req.params.templateId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Failed to get template', message: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const result = await sendgridClient.createTemplate(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template', message: error.message });
  }
});

// ==================== Stats ====================

router.get('/stats', async (req, res) => {
  try {
    const result = await sendgridClient.getStats(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats', message: error.message });
  }
});

router.get('/stats/categories', async (req, res) => {
  try {
    const result = await sendgridClient.getCategoryStats(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting category stats:', error);
    res.status(500).json({ error: 'Failed to get category stats', message: error.message });
  }
});

// ==================== Suppressions ====================

router.get('/suppressions', async (req, res) => {
  try {
    const result = await sendgridClient.getSuppressions(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting suppressions:', error);
    res.status(500).json({ error: 'Failed to get suppressions', message: error.message });
  }
});

router.post('/suppressions', async (req, res) => {
  try {
    const { emails } = req.body;
    const result = await sendgridClient.addSuppressions(emails);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error adding suppressions:', error);
    res.status(500).json({ error: 'Failed to add suppressions', message: error.message });
  }
});

router.get('/bounces', async (req, res) => {
  try {
    const result = await sendgridClient.getBounces(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting bounces:', error);
    res.status(500).json({ error: 'Failed to get bounces', message: error.message });
  }
});

router.get('/spam-reports', async (req, res) => {
  try {
    const result = await sendgridClient.getSpamReports(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting spam reports:', error);
    res.status(500).json({ error: 'Failed to get spam reports', message: error.message });
  }
});

export { router as sendgridRouter };
