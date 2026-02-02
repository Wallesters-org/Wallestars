import express from 'express';
import { salesforceClient } from '../services/salesforceClient.js';

const router = express.Router();

// Middleware to check if Salesforce API is configured
const checkSalesforceConfig = (req, res, next) => {
  if (!salesforceClient.isConfigured()) {
    return res.status(503).json({
      error: 'Salesforce API not configured',
      message: 'Salesforce credentials (CLIENT_ID, USERNAME, PASSWORD) are not set'
    });
  }
  next();
};

// Apply middleware to all routes
router.use(checkSalesforceConfig);

// ==================== Authentication ====================

/**
 * POST /api/salesforce/auth
 * Manually trigger authentication (useful for testing)
 */
router.post('/auth', async (req, res) => {
  try {
    await salesforceClient.authenticate();
    res.json({
      success: true,
      message: 'Salesforce authentication successful',
      instanceUrl: salesforceClient.instanceUrl
    });
  } catch (error) {
    console.error('Salesforce auth error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

// ==================== Leads Routes ====================

/**
 * POST /api/salesforce/leads
 * Create a new Lead
 */
router.post('/leads', async (req, res) => {
  try {
    const result = await salesforceClient.createLead(req.body);

    // Emit to WebSocket for real-time updates
    if (global.io) {
      global.io.emit('salesforce:lead:created', { id: result.id, data: req.body });
    }

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
 * GET /api/salesforce/leads/:id
 * Get Lead by ID
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
 * PATCH /api/salesforce/leads/:id
 * Update Lead
 */
router.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.updateLead(id, req.body);

    if (global.io) {
      global.io.emit('salesforce:lead:updated', { id, data: req.body });
    }

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
 * DELETE /api/salesforce/leads/:id
 * Delete Lead
 */
router.delete('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.deleteLead(id);

    if (global.io) {
      global.io.emit('salesforce:lead:deleted', { id });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      error: 'Failed to delete lead',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/leads/:id/convert
 * Convert Lead to Account/Contact/Opportunity
 */
router.post('/leads/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.convertLead(id, req.body);

    if (global.io) {
      global.io.emit('salesforce:lead:converted', { id, result });
    }

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

// ==================== Contacts Routes ====================

/**
 * POST /api/salesforce/contacts
 * Create a new Contact
 */
router.post('/contacts', async (req, res) => {
  try {
    const result = await salesforceClient.createContact(req.body);

    if (global.io) {
      global.io.emit('salesforce:contact:created', { id: result.id, data: req.body });
    }

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
 * GET /api/salesforce/contacts/:id
 * Get Contact by ID
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
 * PATCH /api/salesforce/contacts/:id
 * Update Contact
 */
router.patch('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.updateContact(id, req.body);

    if (global.io) {
      global.io.emit('salesforce:contact:updated', { id, data: req.body });
    }

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
 * Delete Contact
 */
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.deleteContact(id);

    if (global.io) {
      global.io.emit('salesforce:contact:deleted', { id });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: error.message
    });
  }
});

// ==================== Accounts Routes ====================

/**
 * POST /api/salesforce/accounts
 * Create a new Account
 */
router.post('/accounts', async (req, res) => {
  try {
    const result = await salesforceClient.createAccount(req.body);

    if (global.io) {
      global.io.emit('salesforce:account:created', { id: result.id, data: req.body });
    }

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
 * GET /api/salesforce/accounts/:id
 * Get Account by ID
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
 * PATCH /api/salesforce/accounts/:id
 * Update Account
 */
router.patch('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.updateAccount(id, req.body);

    if (global.io) {
      global.io.emit('salesforce:account:updated', { id, data: req.body });
    }

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
 * Delete Account
 */
router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.deleteAccount(id);

    if (global.io) {
      global.io.emit('salesforce:account:deleted', { id });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error.message
    });
  }
});

// ==================== Opportunities Routes ====================

/**
 * POST /api/salesforce/opportunities
 * Create a new Opportunity
 */
router.post('/opportunities', async (req, res) => {
  try {
    const result = await salesforceClient.createOpportunity(req.body);

    if (global.io) {
      global.io.emit('salesforce:opportunity:created', { id: result.id, data: req.body });
    }

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
 * GET /api/salesforce/opportunities/:id
 * Get Opportunity by ID
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
 * PATCH /api/salesforce/opportunities/:id
 * Update Opportunity
 */
router.patch('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.updateOpportunity(id, req.body);

    if (global.io) {
      global.io.emit('salesforce:opportunity:updated', { id, data: req.body });
    }

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
 * Delete Opportunity
 */
router.delete('/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.deleteOpportunity(id);

    if (global.io) {
      global.io.emit('salesforce:opportunity:deleted', { id });
    }

    res.json({
      success: true,
      message: 'Opportunity deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({
      error: 'Failed to delete opportunity',
      message: error.message
    });
  }
});

// ==================== Tasks Routes ====================

/**
 * POST /api/salesforce/tasks
 * Create a new Task
 */
router.post('/tasks', async (req, res) => {
  try {
    const result = await salesforceClient.createTask(req.body);

    if (global.io) {
      global.io.emit('salesforce:task:created', { id: result.id, data: req.body });
    }

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
 * GET /api/salesforce/tasks/:id
 * Get Task by ID
 */
router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await salesforceClient.getTask(id);
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      error: 'Failed to fetch task',
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/tasks/:id
 * Update Task
 */
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await salesforceClient.updateTask(id, req.body);

    if (global.io) {
      global.io.emit('salesforce:task:updated', { id, data: req.body });
    }

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

// ==================== Query Routes ====================

/**
 * POST /api/salesforce/query
 * Execute SOQL query
 */
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        error: 'Query required',
        message: 'SOQL query string is required in request body'
      });
    }

    const result = await salesforceClient.query(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({
      error: 'Failed to execute query',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/search
 * Execute SOSL search
 */
router.post('/search', async (req, res) => {
  try {
    const { searchQuery } = req.body;
    if (!searchQuery) {
      return res.status(400).json({
        error: 'Search query required',
        message: 'SOSL search query string is required in request body'
      });
    }

    const result = await salesforceClient.search(searchQuery);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing search:', error);
    res.status(500).json({
      error: 'Failed to execute search',
      message: error.message
    });
  }
});

// ==================== Bulk Operations Routes ====================

/**
 * POST /api/salesforce/bulk/create
 * Bulk create records
 */
router.post('/bulk/create', async (req, res) => {
  try {
    const { objectType, records } = req.body;
    if (!objectType || !records || !Array.isArray(records)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'objectType (string) and records (array) are required'
      });
    }

    const result = await salesforceClient.bulkCreate(objectType, records);

    if (global.io) {
      global.io.emit('salesforce:bulk:created', { objectType, count: records.length });
    }

    res.status(201).json({
      success: true,
      message: `${records.length} ${objectType} records created`,
      data: result
    });
  } catch (error) {
    console.error('Error in bulk create:', error);
    res.status(500).json({
      error: 'Failed to bulk create records',
      message: error.message
    });
  }
});

/**
 * PATCH /api/salesforce/bulk/update
 * Bulk update records
 */
router.patch('/bulk/update', async (req, res) => {
  try {
    const { objectType, records } = req.body;
    if (!objectType || !records || !Array.isArray(records)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'objectType (string) and records (array with Id field) are required'
      });
    }

    const result = await salesforceClient.bulkUpdate(objectType, records);

    if (global.io) {
      global.io.emit('salesforce:bulk:updated', { objectType, count: records.length });
    }

    res.json({
      success: true,
      message: `${records.length} ${objectType} records updated`,
      data: result
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      error: 'Failed to bulk update records',
      message: error.message
    });
  }
});

// ==================== Automation Routes ====================

/**
 * POST /api/salesforce/flows/:flowName/invoke
 * Invoke a Salesforce Flow
 */
router.post('/flows/:flowName/invoke', async (req, res) => {
  try {
    const { flowName } = req.params;
    const inputs = req.body;

    const result = await salesforceClient.invokeFlow(flowName, inputs);

    if (global.io) {
      global.io.emit('salesforce:flow:invoked', { flowName, inputs });
    }

    res.json({
      success: true,
      message: `Flow '${flowName}' invoked successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error invoking flow:', error);
    res.status(500).json({
      error: 'Failed to invoke flow',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/flows
 * List available Flows
 */
router.get('/flows', async (req, res) => {
  try {
    const flows = await salesforceClient.getFlows();
    res.json({
      success: true,
      data: flows
    });
  } catch (error) {
    console.error('Error listing flows:', error);
    res.status(500).json({
      error: 'Failed to list flows',
      message: error.message
    });
  }
});

// ==================== Metadata Routes ====================

/**
 * GET /api/salesforce/describe/:objectName
 * Describe an SObject
 */
router.get('/describe/:objectName', async (req, res) => {
  try {
    const { objectName } = req.params;
    const metadata = await salesforceClient.describeObject(objectName);
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error describing object:', error);
    res.status(500).json({
      error: 'Failed to describe object',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/describe
 * Get global describe (all objects)
 */
router.get('/describe', async (req, res) => {
  try {
    const metadata = await salesforceClient.describeGlobal();
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error getting global describe:', error);
    res.status(500).json({
      error: 'Failed to get global describe',
      message: error.message
    });
  }
});

/**
 * GET /api/salesforce/limits
 * Get API limits
 */
router.get('/limits', async (req, res) => {
  try {
    const limits = await salesforceClient.getLimits();
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    console.error('Error getting limits:', error);
    res.status(500).json({
      error: 'Failed to get API limits',
      message: error.message
    });
  }
});

// ==================== Reports Routes ====================

/**
 * GET /api/salesforce/reports
 * List available Reports
 */
router.get('/reports', async (req, res) => {
  try {
    const reports = await salesforceClient.listReports();
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({
      error: 'Failed to list reports',
      message: error.message
    });
  }
});

/**
 * POST /api/salesforce/reports/:reportId/run
 * Run a Report
 */
router.post('/reports/:reportId/run', async (req, res) => {
  try {
    const { reportId } = req.params;
    const options = req.body;

    const result = await salesforceClient.runReport(reportId, options);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error running report:', error);
    res.status(500).json({
      error: 'Failed to run report',
      message: error.message
    });
  }
});

export { router as salesforceRouter };
