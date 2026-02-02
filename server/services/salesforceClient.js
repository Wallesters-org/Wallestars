import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Salesforce API Client
 * Provides methods to interact with Salesforce REST API
 * for managing Leads, Accounts, Contacts, Opportunities, and Custom Objects
 *
 * Supports both OAuth2 authentication and direct access token usage
 *
 * @see https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
 */
class SalesforceClient {
  constructor() {
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL;
    this.clientId = process.env.SALESFORCE_CLIENT_ID;
    this.clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    this.accessToken = process.env.SALESFORCE_ACCESS_TOKEN;
    this.refreshToken = process.env.SALESFORCE_REFRESH_TOKEN;
    this.apiVersion = process.env.SALESFORCE_API_VERSION || 'v59.0';
    this.redirectUri = process.env.SALESFORCE_REDIRECT_URI || 'http://localhost:3000/api/salesforce/oauth/callback';

    this.tokenExpiresAt = null;
    this.client = null;

    if (!this.instanceUrl || (!this.accessToken && !this.clientId)) {
      console.warn('⚠️ Salesforce credentials not fully configured. Salesforce API features will be disabled.');
    } else {
      this._initializeClient();
    }
  }

  /**
   * Initialize the axios client with current access token
   */
  _initializeClient() {
    if (!this.instanceUrl || !this.accessToken) {
      return;
    }

    this.client = axios.create({
      baseURL: `${this.instanceUrl}/services/data/${this.apiVersion}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: parseInt(process.env.SALESFORCE_API_TIMEOUT || '30000', 10)
    });

    // Add response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      response => response,
      async error => {
        // Handle token expiration
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request with new token
            error.config.headers['Authorization'] = `Bearer ${this.accessToken}`;
            return axios(error.config);
          } catch (refreshError) {
            console.error('Failed to refresh Salesforce token:', refreshError.message);
          }
        }

        const errorMsg = error.response?.data?.[0]?.message ||
                         error.response?.data?.error_description ||
                         error.message;
        console.error('Salesforce API Error:', errorMsg);
        throw new Error(`Salesforce API Error: ${errorMsg}`);
      }
    );
  }

  /**
   * Check if the API client is properly configured
   */
  isConfigured() {
    return !!(this.instanceUrl && this.accessToken);
  }

  /**
   * Get OAuth2 authorization URL for user consent
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl() {
    const baseUrl = this.instanceUrl?.replace(/\.my\.salesforce\.com.*/, '.my.salesforce.com')
                    || 'https://login.salesforce.com';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'api refresh_token offline_access'
    });
    return `${baseUrl}/services/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from OAuth callback
   * @returns {Promise<Object>} Token response with access_token, refresh_token, instance_url
   */
  async exchangeCodeForToken(code) {
    const baseUrl = this.instanceUrl?.replace(/\.my\.salesforce\.com.*/, '.my.salesforce.com')
                    || 'https://login.salesforce.com';

    const response = await axios.post(`${baseUrl}/services/oauth2/token`, null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      }
    });

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
    this.instanceUrl = response.data.instance_url;
    this._initializeClient();

    return response.data;
  }

  /**
   * Refresh the access token using refresh token
   * @returns {Promise<Object>} New token data
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const baseUrl = this.instanceUrl?.replace(/\.my\.salesforce\.com.*/, '.my.salesforce.com')
                    || 'https://login.salesforce.com';

    const response = await axios.post(`${baseUrl}/services/oauth2/token`, null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }
    });

    this.accessToken = response.data.access_token;
    if (response.data.refresh_token) {
      this.refreshToken = response.data.refresh_token;
    }
    this._initializeClient();

    return response.data;
  }

  // ==================== Generic CRUD Operations ====================

  /**
   * Query records using SOQL
   * @param {string} soql - SOQL query string
   * @returns {Promise<Object>} Query results with records array
   */
  async query(soql) {
    const response = await this.client.get('/query', {
      params: { q: soql }
    });
    return response.data;
  }

  /**
   * Get all records of a specific object type
   * @param {string} objectType - Salesforce object type (e.g., 'Lead', 'Account')
   * @param {Array<string>} fields - Fields to retrieve
   * @param {string} whereClause - Optional WHERE clause
   * @param {number} limit - Maximum records to return
   * @returns {Promise<Array>} Array of records
   */
  async getRecords(objectType, fields = ['Id', 'Name'], whereClause = '', limit = 100) {
    const fieldList = fields.join(', ');
    let soql = `SELECT ${fieldList} FROM ${objectType}`;
    if (whereClause) {
      soql += ` WHERE ${whereClause}`;
    }
    soql += ` LIMIT ${limit}`;

    const result = await this.query(soql);
    return result.records;
  }

  /**
   * Get a single record by ID
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @param {Array<string>} fields - Optional specific fields to retrieve
   * @returns {Promise<Object>} Record data
   */
  async getRecord(objectType, recordId, fields = null) {
    let url = `/sobjects/${objectType}/${recordId}`;
    if (fields && fields.length > 0) {
      url += `?fields=${fields.join(',')}`;
    }
    const response = await this.client.get(url);
    return response.data;
  }

  /**
   * Create a new record
   * @param {string} objectType - Salesforce object type
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record info with id
   */
  async createRecord(objectType, data) {
    const response = await this.client.post(`/sobjects/${objectType}`, data);
    return response.data;
  }

  /**
   * Update an existing record
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  async updateRecord(objectType, recordId, data) {
    await this.client.patch(`/sobjects/${objectType}/${recordId}`, data);
    return { success: true, id: recordId };
  }

  /**
   * Delete a record
   * @param {string} objectType - Salesforce object type
   * @param {string} recordId - Record ID
   * @returns {Promise<void>}
   */
  async deleteRecord(objectType, recordId) {
    await this.client.delete(`/sobjects/${objectType}/${recordId}`);
    return { success: true, id: recordId };
  }

  /**
   * Upsert a record using external ID
   * @param {string} objectType - Salesforce object type
   * @param {string} externalIdField - External ID field name
   * @param {string} externalIdValue - External ID value
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Upsert result
   */
  async upsertRecord(objectType, externalIdField, externalIdValue, data) {
    const response = await this.client.patch(
      `/sobjects/${objectType}/${externalIdField}/${externalIdValue}`,
      data
    );
    return response.data || { success: true };
  }

  // ==================== Lead Management ====================

  /**
   * Get all leads
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of leads
   */
  async getLeads(options = {}) {
    const fields = options.fields || [
      'Id', 'FirstName', 'LastName', 'Email', 'Company', 'Phone',
      'Status', 'LeadSource', 'Rating', 'CreatedDate', 'LastModifiedDate'
    ];
    return this.getRecords('Lead', fields, options.where, options.limit || 100);
  }

  /**
   * Get a single lead by ID
   * @param {string} leadId - Lead ID
   * @returns {Promise<Object>} Lead record
   */
  async getLead(leadId) {
    return this.getRecord('Lead', leadId);
  }

  /**
   * Create a new lead
   * @param {Object} leadData - Lead data (FirstName, LastName, Email, Company, etc.)
   * @returns {Promise<Object>} Created lead info
   */
  async createLead(leadData) {
    return this.createRecord('Lead', leadData);
  }

  /**
   * Update a lead
   * @param {string} leadId - Lead ID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async updateLead(leadId, data) {
    return this.updateRecord('Lead', leadId, data);
  }

  /**
   * Convert a lead to Account/Contact/Opportunity
   * @param {string} leadId - Lead ID
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} Conversion result
   */
  async convertLead(leadId, options = {}) {
    const convertRequest = {
      leadId,
      convertedStatus: options.convertedStatus || 'Closed - Converted',
      doNotCreateOpportunity: options.doNotCreateOpportunity || false,
      opportunityName: options.opportunityName,
      accountId: options.existingAccountId,
      contactId: options.existingContactId
    };

    const response = await this.client.post('/actions/standard/convertLead', {
      inputs: [convertRequest]
    });
    return response.data;
  }

  // ==================== Account Management ====================

  /**
   * Get all accounts
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of accounts
   */
  async getAccounts(options = {}) {
    const fields = options.fields || [
      'Id', 'Name', 'Type', 'Industry', 'Phone', 'Website',
      'BillingCity', 'BillingCountry', 'AnnualRevenue', 'NumberOfEmployees',
      'CreatedDate', 'LastModifiedDate'
    ];
    return this.getRecords('Account', fields, options.where, options.limit || 100);
  }

  /**
   * Get a single account by ID
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Account record
   */
  async getAccount(accountId) {
    return this.getRecord('Account', accountId);
  }

  /**
   * Create a new account
   * @param {Object} accountData - Account data
   * @returns {Promise<Object>} Created account info
   */
  async createAccount(accountData) {
    return this.createRecord('Account', accountData);
  }

  /**
   * Update an account
   * @param {string} accountId - Account ID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async updateAccount(accountId, data) {
    return this.updateRecord('Account', accountId, data);
  }

  // ==================== Contact Management ====================

  /**
   * Get all contacts
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of contacts
   */
  async getContacts(options = {}) {
    const fields = options.fields || [
      'Id', 'FirstName', 'LastName', 'Email', 'Phone', 'Title',
      'AccountId', 'Department', 'MailingCity', 'MailingCountry',
      'CreatedDate', 'LastModifiedDate'
    ];
    return this.getRecords('Contact', fields, options.where, options.limit || 100);
  }

  /**
   * Get a single contact by ID
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>} Contact record
   */
  async getContact(contactId) {
    return this.getRecord('Contact', contactId);
  }

  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact info
   */
  async createContact(contactData) {
    return this.createRecord('Contact', contactData);
  }

  /**
   * Update a contact
   * @param {string} contactId - Contact ID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async updateContact(contactId, data) {
    return this.updateRecord('Contact', contactId, data);
  }

  // ==================== Opportunity Management ====================

  /**
   * Get all opportunities
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of opportunities
   */
  async getOpportunities(options = {}) {
    const fields = options.fields || [
      'Id', 'Name', 'AccountId', 'Amount', 'StageName', 'Probability',
      'CloseDate', 'Type', 'LeadSource', 'IsClosed', 'IsWon',
      'CreatedDate', 'LastModifiedDate'
    ];
    return this.getRecords('Opportunity', fields, options.where, options.limit || 100);
  }

  /**
   * Get a single opportunity by ID
   * @param {string} opportunityId - Opportunity ID
   * @returns {Promise<Object>} Opportunity record
   */
  async getOpportunity(opportunityId) {
    return this.getRecord('Opportunity', opportunityId);
  }

  /**
   * Create a new opportunity
   * @param {Object} opportunityData - Opportunity data
   * @returns {Promise<Object>} Created opportunity info
   */
  async createOpportunity(opportunityData) {
    return this.createRecord('Opportunity', opportunityData);
  }

  /**
   * Update an opportunity
   * @param {string} opportunityId - Opportunity ID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async updateOpportunity(opportunityId, data) {
    return this.updateRecord('Opportunity', opportunityId, data);
  }

  /**
   * Get opportunities by stage
   * @param {string} stageName - Stage name (e.g., 'Prospecting', 'Closed Won')
   * @returns {Promise<Array>} Array of opportunities
   */
  async getOpportunitiesByStage(stageName) {
    return this.getOpportunities({
      where: `StageName = '${stageName}'`
    });
  }

  // ==================== Task & Activity Management ====================

  /**
   * Get tasks for a record
   * @param {string} whatId - Related record ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasks(whatId) {
    const fields = ['Id', 'Subject', 'Status', 'Priority', 'ActivityDate', 'WhatId', 'WhoId', 'Description'];
    return this.getRecords('Task', fields, `WhatId = '${whatId}'`);
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task info
   */
  async createTask(taskData) {
    return this.createRecord('Task', taskData);
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async updateTask(taskId, data) {
    return this.updateRecord('Task', taskId, data);
  }

  // ==================== Automation Triggers ====================

  /**
   * Create a lead and trigger automation workflow
   * @param {Object} leadData - Lead data
   * @param {Object} automationOptions - Automation settings
   * @returns {Promise<Object>} Lead creation result with automation status
   */
  async createLeadWithAutomation(leadData, automationOptions = {}) {
    // Create the lead
    const lead = await this.createLead(leadData);

    // Create follow-up task if specified
    if (automationOptions.createFollowUpTask) {
      const daysUntilFollowUp = automationOptions.followUpDays || 3;
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + daysUntilFollowUp);

      await this.createTask({
        Subject: automationOptions.taskSubject || `Follow up with ${leadData.FirstName || ''} ${leadData.LastName || ''}`,
        Status: 'Not Started',
        Priority: automationOptions.taskPriority || 'Normal',
        ActivityDate: followUpDate.toISOString().split('T')[0],
        WhoId: lead.id,
        Description: automationOptions.taskDescription || 'Automated follow-up task created by Wallestars'
      });

      lead.automationResult = { followUpTaskCreated: true };
    }

    return lead;
  }

  /**
   * Bulk update opportunities based on criteria
   * @param {string} whereClause - Filter criteria
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Bulk update results
   */
  async bulkUpdateOpportunities(whereClause, updates) {
    const opportunities = await this.getOpportunities({ where: whereClause });
    const results = [];

    for (const opp of opportunities) {
      try {
        await this.updateOpportunity(opp.Id, updates);
        results.push({ id: opp.Id, success: true });
      } catch (error) {
        results.push({ id: opp.Id, success: false, error: error.message });
      }
    }

    return {
      totalProcessed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results
    };
  }

  // ==================== Reporting & Analytics ====================

  /**
   * Get pipeline summary
   * @returns {Promise<Object>} Pipeline metrics by stage
   */
  async getPipelineSummary() {
    const soql = `
      SELECT StageName, COUNT(Id) OppCount, SUM(Amount) TotalAmount
      FROM Opportunity
      WHERE IsClosed = false
      GROUP BY StageName
    `;
    const result = await this.query(soql);
    return result.records;
  }

  /**
   * Get lead conversion metrics
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>} Lead metrics
   */
  async getLeadMetrics(days = 30) {
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);
    const filterDate = dateFilter.toISOString().split('T')[0];

    const totalLeadsQuery = await this.query(
      `SELECT COUNT(Id) Total FROM Lead WHERE CreatedDate >= ${filterDate}`
    );

    const convertedLeadsQuery = await this.query(
      `SELECT COUNT(Id) Converted FROM Lead WHERE IsConverted = true AND ConvertedDate >= ${filterDate}`
    );

    return {
      period: `Last ${days} days`,
      totalLeads: totalLeadsQuery.records[0]?.Total || 0,
      convertedLeads: convertedLeadsQuery.records[0]?.Converted || 0,
      conversionRate: totalLeadsQuery.records[0]?.Total > 0
        ? ((convertedLeadsQuery.records[0]?.Converted || 0) / totalLeadsQuery.records[0].Total * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // ==================== Metadata & Schema ====================

  /**
   * Get object metadata/describe
   * @param {string} objectType - Salesforce object type
   * @returns {Promise<Object>} Object metadata
   */
  async describeObject(objectType) {
    const response = await this.client.get(`/sobjects/${objectType}/describe`);
    return response.data;
  }

  /**
   * Get all available objects
   * @returns {Promise<Array>} List of available objects
   */
  async getAvailableObjects() {
    const response = await this.client.get('/sobjects');
    return response.data.sobjects;
  }

  /**
   * Get record types for an object
   * @param {string} objectType - Salesforce object type
   * @returns {Promise<Array>} Record types
   */
  async getRecordTypes(objectType) {
    const describe = await this.describeObject(objectType);
    return describe.recordTypeInfos;
  }
}

// Export singleton instance
export const salesforceClient = new SalesforceClient();
export default SalesforceClient;
