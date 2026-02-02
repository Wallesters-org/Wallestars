import express from 'express';
import { salesforceClient } from '../services/salesforceClient.js';

const router = express.Router();

// Middleware to check if Salesforce API is configured
const checkSalesforceConfig = (req, res, next) => {
  // Skip config check for OAuth routes
  if (req.path.startsWith('/oauth')) {
    return next();
  }

  if (!salesforceClient.isConfigured()) {
    return res.status(503).json({
      error: 'Salesforce API not configured',
      message: 'Salesforce credentials are not set. Complete OAuth flow or set SALESFORCE_ACCESS_TOKEN.'
    });
  }
  next();
};

// Apply middleware to all routes
router.use(checkSalesforceConfig);

// ==================== OAuth Routes ====================

/**
 * GET /api/salesforce/oauth/authorize
 * Get OAuth authorization URL
 */
router.get('/oauth/authorize', (req, res) => {
  try {
    const authUrl = salesforceClient.getAuthorizationUrl();
    res.json({
      success: true,
      authorizationUrl: authUrl,
      message: 'Redirect user to this URL to authorize Salesforce access'
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      error: 'Failed to generate authorization URL',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/oauth/callback
 * OAuth callback handler
 */
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code, error, error_description } = req.query;

    if (error) {
      return res.status(400).json({
        error: 'OAuth authorization failed',
        message: error_description || error
      });
    }

    if (!code) {
      return res.status(400).json({
        error: 'Missing authorization code',
        message: 'No authorization code received from Salesforce'
      });
    }

    const tokenData = await salesforceClient.exchangeCodeForToken(code);
    res.json({
      success: true,
      message: 'Successfully authenticated with Salesforce',
      instanceUrl: tokenData.instance_url,
      // Don't expose tokens in response for security
      tokenReceived: !!tokenData.access_token
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      error: 'OAuth token exchange failed',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/oauth/refresh
 * Manually refresh access token
 */
router.post('/oauth/refresh', async (req, res) => {
  try {
    const tokenData = await salesforceClient.refreshAccessToken();
    res.json({
      success: true,
      message: 'Access token refreshed successfully',
      tokenReceived: !!tokenData.access_token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh access token',
      message: error.message
    });
  }
});

// ==================== Status & Info Routes ====================

/**
 * GET /api/salesforce/status
 * Get Salesforce connection status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    configured: salesforceClient.isConfigured(),
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL || null,
    apiVersion: process.env.SALESFORCE_API_VERSION || 'v59.0'
  });
});

/**
 * GET /api/salesforce/objects
 * List available Salesforce objects
 */
router.get('/objects', async (req, res) => {
  try {
    const objects = await salesforceClient.getAvailableObjects();
    res.json({
      success: true,
      count: objects.length,
      data: objects.map(obj => ({
        name: obj.name,
        label: obj.label,
        queryable: obj.queryable,
        createable: obj.createable,
        updateable: obj.updateable
      }))
    });
  } catch (error) {
    console.error('Error fetching objects:', error);
    res.status(500).json({
      error: 'Failed to fetch Salesforce objects',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/objects/:objectType/describe
 * Get object metadata
 */
router.get('/objects/:objectType/describe', async (req, res) => {
  try {
    const { objectType } = req.params;
    const metadata = await salesforceClient.describeObject(objectType);
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error describing object:', error);
    res.status(500).json({
      error: `Failed to describe ${req.params.objectType}`,
      message: error.message
    });
  }
});

// ==================== Generic Query Route ====================

/**
 * POST /api/salesforce/query
 * Execute a SOQL query
 */
router.post('/query', async (req, res) => {
  try {
    const { soql } = req.body;

    if (!soql) {
      return res.status(400).json({
        error: 'Missing SOQL query',
        message: 'Please provide a SOQL query in the request body'
      });
    }

    const result = await salesforceClient.query(soql);
    res.json({
      success: true,
      totalSize: result.totalSize,
      done: result.done,
      data: result.records
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      error: 'Query execution failed',
      message: error.message
    });
  }
});

// ==================== Lead Routes ====================

/**
 * GET /api/salesforce/leads
 * List all leads
 */
router.get('/leads', async (req, res) => {
  try {
    const { limit, where } = req.query;
    const leads = await salesforceClient.getLeads({
      limit: limit ? parseInt(limit) : 100,
      where
    });
    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      error: 'Failed to fetch leads',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/leads/:id
 * Get a specific lead
 */
router.get('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await salesforceClient.getLead(id);
    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      error: 'Failed to fetch lead',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/leads
 * Create a new lead
 */
router.post('/leads', async (req, res) => {
  try {
    const leadData = req.body;

    if (!leadData.LastName || !leadData.Company) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'LastName and Company are required for creating a lead'
      });
    }

    const result = await salesforceClient.createLead(leadData);
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      error: 'Failed to create lead',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/leads/automated
 * Create a lead with automation (follow-up task, etc.)
 */
router.post('/leads/automated', async (req, res) => {
  try {
    const { lead, automation } = req.body;

    if (!lead?.LastName || !lead?.Company) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'lead.LastName and lead.Company are required'
      });
    }

    const result = await salesforceClient.createLeadWithAutomation(lead, automation || {});
    res.status(201).json({
      success: true,
      message: 'Lead created with automation',
      data: result
    });
  } catch (error) {
    console.error('Error creating automated lead:', error);
    res.status(500).json({
      error: 'Failed to create lead with automation',
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/leads/:id
 * Update a lead
 */
router.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await salesforceClient.updateLead(id, updates);
    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      error: 'Failed to update lead',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/leads/:id/convert
 * Convert a lead to Account/Contact/Opportunity
 */
router.post('/leads/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body;
    const result = await salesforceClient.convertLead(id, options);
    res.json({
      success: true,
      message: 'Lead converted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(500).json({
      error: 'Failed to convert lead',
      message: error.message
    });
  }
});

/**
 * DELETE /api/salesforce/leads/:id
 * Delete a lead
 */
router.delete('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await salesforceClient.deleteRecord('Lead', id);
    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      error: 'Failed to delete lead',
      message: error.message
    });
  }
});

// ==================== Account Routes ====================

/**
 * GET /api/salesforce/accounts
 * List all accounts
 */
router.get('/accounts', async (req, res) => {
  try {
    const { limit, where } = req.query;
    const accounts = await salesforceClient.getAccounts({
      limit: limit ? parseInt(limit) : 100,
      where
    });
    res.json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      error: 'Failed to fetch accounts',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/accounts/:id
 * Get a specific account
 */
router.get('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = await salesforceClient.getAccount(id);
    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({
      error: 'Failed to fetch account',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/accounts
 * Create a new account
 */
router.post('/accounts', async (req, res) => {
  try {
    const accountData = req.body;

    if (!accountData.Name) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Name is required for creating an account'
      });
    }

    const result = await salesforceClient.createAccount(accountData);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      error: 'Failed to create account',
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/accounts/:id
 * Update an account
 */
router.patch('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await salesforceClient.updateAccount(id, updates);
    res.json({
      success: true,
      message: 'Account updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      error: 'Failed to update account',
      message: error.message
    });
  }
});

/**
 * DELETE /api/salesforce/accounts/:id
 * Delete an account
 */
router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await salesforceClient.deleteRecord('Account', id);
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message
    });
  }
});

// ==================== Contact Routes ====================

/**
 * GET /api/salesforce/contacts
 * List all contacts
 */
router.get('/contacts', async (req, res) => {
  try {
    const { limit, where } = req.query;
    const contacts = await salesforceClient.getContacts({
      limit: limit ? parseInt(limit) : 100,
      where
    });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/contacts/:id
 * Get a specific contact
 */
router.get('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await salesforceClient.getContact(id);
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      error: 'Failed to fetch contact',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/contacts
 * Create a new contact
 */
router.post('/contacts', async (req, res) => {
  try {
    const contactData = req.body;

    if (!contactData.LastName) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'LastName is required for creating a contact'
      });
    }

    const result = await salesforceClient.createContact(contactData);
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/contacts/:id
 * Update a contact
 */
router.patch('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await salesforceClient.updateContact(id, updates);
    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      error: 'Failed to update contact',
      message: error.message
    });
  }
});

/**
 * DELETE /api/salesforce/contacts/:id
 * Delete a contact
 */
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await salesforceClient.deleteRecord('Contact', id);
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: error.message
    });
  }
});

// ==================== Opportunity Routes ====================

/**
 * GET /api/salesforce/opportunities
 * List all opportunities
 */
router.get('/opportunities', async (req, res) => {
  try {
    const { limit, where, stage } = req.query;

    let opportunities;
    if (stage) {
      opportunities = await salesforceClient.getOpportunitiesByStage(stage);
    } else {
      opportunities = await salesforceClient.getOpportunities({
        limit: limit ? parseInt(limit) : 100,
        where
      });
    }

    res.json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({
      error: 'Failed to fetch opportunities',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/opportunities/:id
 * Get a specific opportunity
 */
router.get('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await salesforceClient.getOpportunity(id);
    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({
      error: 'Failed to fetch opportunity',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/opportunities
 * Create a new opportunity
 */
router.post('/opportunities', async (req, res) => {
  try {
    const opportunityData = req.body;

    if (!opportunityData.Name || !opportunityData.StageName || !opportunityData.CloseDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, StageName, and CloseDate are required for creating an opportunity'
      });
    }

    const result = await salesforceClient.createOpportunity(opportunityData);
    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({
      error: 'Failed to create opportunity',
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/opportunities/:id
 * Update an opportunity
 */
router.patch('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await salesforceClient.updateOpportunity(id, updates);
    res.json({
      success: true,
      message: 'Opportunity updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({
      error: 'Failed to update opportunity',
      message: error.message
    });
  }
});

/**
 * DELETE /api/salesforce/opportunities/:id
 * Delete an opportunity
 */
router.delete('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await salesforceClient.deleteRecord('Opportunity', id);
    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({
      error: 'Failed to delete opportunity',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/opportunities/bulk-update
 * Bulk update opportunities
 */
router.post('/opportunities/bulk-update', async (req, res) => {
  try {
    const { where, updates } = req.body;

    if (!where || !updates) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'where clause and updates object are required'
      });
    }

    const result = await salesforceClient.bulkUpdateOpportunities(where, updates);
    res.json({
      success: true,
      message: `Processed ${result.totalProcessed} opportunities`,
      data: result
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      error: 'Bulk update failed',
      message: error.message
    });
  }
});

// ==================== Task Routes ====================

/**
 * GET /api/salesforce/tasks
 * Get tasks for a record
 */
router.get('/tasks', async (req, res) => {
  try {
    const { whatId } = req.query;

    if (!whatId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'whatId query parameter is required'
      });
    }

    const tasks = await salesforceClient.getTasks(whatId);
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/tasks
 * Create a new task
 */
router.post('/tasks', async (req, res) => {
  try {
    const taskData = req.body;

    if (!taskData.Subject) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Subject is required for creating a task'
      });
    }

    const result = await salesforceClient.createTask(taskData);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      error: 'Failed to create task',
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/tasks/:id
 * Update a task
 */
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await salesforceClient.updateTask(id, updates);
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      error: 'Failed to update task',
      message: error.message
    });
  }
});

// ==================== Analytics Routes ====================

/**
 * GET /api/salesforce/analytics/pipeline
 * Get pipeline summary
 */
router.get('/analytics/pipeline', async (req, res) => {
  try {
    const summary = await salesforceClient.getPipelineSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({
      error: 'Failed to fetch pipeline summary',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/analytics/leads
 * Get lead conversion metrics
 */
router.get('/analytics/leads', async (req, res) => {
  try {
    const { days } = req.query;
    const metrics = await salesforceClient.getLeadMetrics(days ? parseInt(days) : 30);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching lead metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch lead metrics',
      message: error.message
    });
  }
});

// ==================== Generic Object Routes ====================

/**
 * GET /api/salesforce/records/:objectType
 * Get records of any object type
 */
router.get('/records/:objectType', async (req, res) => {
  try {
    const { objectType } = req.params;
    const { fields, where, limit } = req.query;

    const fieldList = fields ? fields.split(',') : ['Id', 'Name'];
    const records = await salesforceClient.getRecords(
      objectType,
      fieldList,
      where,
      limit ? parseInt(limit) : 100
    );

    res.json({
      success: true,
      objectType,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      error: `Failed to fetch ${req.params.objectType} records`,
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/records/:objectType/:id
 * Get a specific record of any type
 */
router.get('/records/:objectType/:id', async (req, res) => {
  try {
    const { objectType, id } = req.params;
    const { fields } = req.query;

    const record = await salesforceClient.getRecord(
      objectType,
      id,
      fields ? fields.split(',') : null
    );

    res.json({
      success: true,
      objectType,
      data: record
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      error: `Failed to fetch ${req.params.objectType} record`,
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/records/:objectType
 * Create a record of any type
 */
router.post('/records/:objectType', async (req, res) => {
  try {
    const { objectType } = req.params;
    const data = req.body;

    const result = await salesforceClient.createRecord(objectType, data);
    res.status(201).json({
      success: true,
      message: `${objectType} created successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({
      error: `Failed to create ${req.params.objectType}`,
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/records/:objectType/:id
 * Update a record of any type
 */
router.patch('/records/:objectType/:id', async (req, res) => {
  try {
    const { objectType, id } = req.params;
    const updates = req.body;

    const result = await salesforceClient.updateRecord(objectType, id, updates);
    res.json({
      success: true,
      message: `${objectType} updated successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({
      error: `Failed to update ${req.params.objectType}`,
      message: error.message
    });
  }
});

/**
 * DELETE /api/salesforce/records/:objectType/:id
 * Delete a record of any type
 */
router.delete('/records/:objectType/:id', async (req, res) => {
  try {
    const { objectType, id } = req.params;
    await salesforceClient.deleteRecord(objectType, id);
    res.json({
      success: true,
      message: `${objectType} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      error: `Failed to delete ${req.params.objectType}`,
      message: error.message
    });
  }
});

export { router as salesforceRouter };
