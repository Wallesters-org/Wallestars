import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Salesforce API Client
 * Provides methods to interact with Salesforce's REST API
 * for managing leads, contacts, accounts, opportunities, and automation
 *
 * Supports OAuth 2.0 authentication (Username-Password Flow)
 * @see https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
 */
class SalesforceClient {
  constructor() {
    this.loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
    this.clientId = process.env.SALESFORCE_CLIENT_ID;
    this.clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    this.username = process.env.SALESFORCE_USERNAME;
    this.password = process.env.SALESFORCE_PASSWORD;
    this.securityToken = process.env.SALESFORCE_SECURITY_TOKEN || '';

    this.accessToken = null;
    this.instanceUrl = null;
    this.tokenExpiry = null;

    if (!this.clientId || !this.username || !this.password) {
      console.warn('⚠️ Salesforce credentials not fully configured. Salesforce API features will be disabled.');
    }

    this.client = axios.create({
      timeout: parseInt(process.env.SALESFORCE_API_TIMEOUT || '30000', 10)
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
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
    return !!(this.clientId && this.username && this.password);
  }

  /**
   * Authenticate with Salesforce and obtain access token
   * Uses OAuth 2.0 Username-Password Flow
   */
  async authenticate() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return; // Token still valid
    }

    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret || '',
      username: this.username,
      password: this.password + this.securityToken
    });

    const response = await axios.post(
      `${this.loginUrl}/services/oauth2/token`,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    this.accessToken = response.data.access_token;
    this.instanceUrl = response.data.instance_url;
    // Token typically valid for 2 hours, refresh 5 minutes early
    this.tokenExpiry = Date.now() + (115 * 60 * 1000);

    // Update axios defaults for subsequent requests
    this.client.defaults.baseURL = this.instanceUrl;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

    console.log('✅ Salesforce authentication successful');
  }

  /**
   * Ensure authenticated before making API calls
   */
  async ensureAuth() {
    await this.authenticate();
  }

  // ==================== Leads Management ====================

  /**
   * Create a new Lead
   * @param {Object} leadData - Lead data (FirstName, LastName, Company, Email, etc.)
   * @returns {Promise<Object>} Created lead with ID
   */
  async createLead(leadData) {
    await this.ensureAuth();
    const response = await this.client.post('/services/data/v59.0/sobjects/Lead/', leadData);
    return response.data;
  }

  /**
   * Get Lead by ID
   * @param {string} leadId - Salesforce Lead ID
   * @returns {Promise<Object>} Lead details
   */
  async getLead(leadId) {
    await this.ensureAuth();
    const response = await this.client.get(`/services/data/v59.0/sobjects/Lead/${leadId}`);
    return response.data;
  }

  /**
   * Update an existing Lead
   * @param {string} leadId - Salesforce Lead ID
   * @param {Object} leadData - Updated lead data
   * @returns {Promise<void>}
   */
  async updateLead(leadId, leadData) {
    await this.ensureAuth();
    await this.client.patch(`/services/data/v59.0/sobjects/Lead/${leadId}`, leadData);
    return { success: true, id: leadId };
  }

  /**
   * Delete a Lead
   * @param {string} leadId - Salesforce Lead ID
   * @returns {Promise<void>}
   */
  async deleteLead(leadId) {
    await this.ensureAuth();
    await this.client.delete(`/services/data/v59.0/sobjects/Lead/${leadId}`);
    return { success: true, id: leadId };
  }

  /**
   * Convert Lead to Account/Contact/Opportunity
   * @param {string} leadId - Lead ID to convert
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} Conversion result
   */
  async convertLead(leadId, options = {}) {
    await this.ensureAuth();
    const convertRequest = {
      leadId,
      convertedStatus: options.convertedStatus || 'Closed - Converted',
      doNotCreateOpportunity: options.doNotCreateOpportunity || false,
      opportunityName: options.opportunityName || null,
      ownerId: options.ownerId || null
    };

    // Use Composite API for lead conversion
    const response = await this.client.post('/services/data/v59.0/actions/standard/convertLead', {
      inputs: [convertRequest]
    });
    return response.data;
  }

  // ==================== Contacts Management ====================

  /**
   * Create a new Contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact with ID
   */
  async createContact(contactData) {
    await this.ensureAuth();
    const response = await this.client.post('/services/data/v59.0/sobjects/Contact/', contactData);
    return response.data;
  }

  /**
   * Get Contact by ID
   * @param {string} contactId - Salesforce Contact ID
   * @returns {Promise<Object>} Contact details
   */
  async getContact(contactId) {
    await this.ensureAuth();
    const response = await this.client.get(`/services/data/v59.0/sobjects/Contact/${contactId}`);
    return response.data;
  }

  /**
   * Update Contact
   * @param {string} contactId - Contact ID
   * @param {Object} contactData - Updated data
   * @returns {Promise<Object>}
   */
  async updateContact(contactId, contactData) {
    await this.ensureAuth();
    await this.client.patch(`/services/data/v59.0/sobjects/Contact/${contactId}`, contactData);
    return { success: true, id: contactId };
  }

  /**
   * Delete Contact
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>}
   */
  async deleteContact(contactId) {
    await this.ensureAuth();
    await this.client.delete(`/services/data/v59.0/sobjects/Contact/${contactId}`);
    return { success: true, id: contactId };
  }

  // ==================== Accounts Management ====================

  /**
   * Create a new Account
   * @param {Object} accountData - Account data (Name, Industry, etc.)
   * @returns {Promise<Object>} Created account with ID
   */
  async createAccount(accountData) {
    await this.ensureAuth();
    const response = await this.client.post('/services/data/v59.0/sobjects/Account/', accountData);
    return response.data;
  }

  /**
   * Get Account by ID
   * @param {string} accountId - Salesforce Account ID
   * @returns {Promise<Object>} Account details
   */
  async getAccount(accountId) {
    await this.ensureAuth();
    const response = await this.client.get(`/services/data/v59.0/sobjects/Account/${accountId}`);
    return response.data;
  }

  /**
   * Update Account
   * @param {string} accountId - Account ID
   * @param {Object} accountData - Updated data
   * @returns {Promise<Object>}
   */
  async updateAccount(accountId, accountData) {
    await this.ensureAuth();
    await this.client.patch(`/services/data/v59.0/sobjects/Account/${accountId}`, accountData);
    return { success: true, id: accountId };
  }

  /**
   * Delete Account
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>}
   */
  async deleteAccount(accountId) {
    await this.ensureAuth();
    await this.client.delete(`/services/data/v59.0/sobjects/Account/${accountId}`);
    return { success: true, id: accountId };
  }

  // ==================== Opportunities Management ====================

  /**
   * Create a new Opportunity
   * @param {Object} opportunityData - Opportunity data
   * @returns {Promise<Object>} Created opportunity with ID
   */
  async createOpportunity(opportunityData) {
    await this.ensureAuth();
    const response = await this.client.post('/services/data/v59.0/sobjects/Opportunity/', opportunityData);
    return response.data;
  }

  /**
   * Get Opportunity by ID
   * @param {string} opportunityId - Salesforce Opportunity ID
   * @returns {Promise<Object>} Opportunity details
   */
  async getOpportunity(opportunityId) {
    await this.ensureAuth();
    const response = await this.client.get(`/services/data/v59.0/sobjects/Opportunity/${opportunityId}`);
    return response.data;
  }

  /**
   * Update Opportunity
   * @param {string} opportunityId - Opportunity ID
   * @param {Object} opportunityData - Updated data
   * @returns {Promise<Object>}
   */
  async updateOpportunity(opportunityId, opportunityData) {
    await this.ensureAuth();
    await this.client.patch(`/services/data/v59.0/sobjects/Opportunity/${opportunityId}`, opportunityData);
    return { success: true, id: opportunityId };
  }

  /**
   * Delete Opportunity
   * @param {string} opportunityId - Opportunity ID
   * @returns {Promise<Object>}
   */
  async deleteOpportunity(opportunityId) {
    await this.ensureAuth();
    await this.client.delete(`/services/data/v59.0/sobjects/Opportunity/${opportunityId}`);
    return { success: true, id: opportunityId };
  }

  // ==================== SOQL Query ====================

  /**
   * Execute SOQL query
   * @param {string} query - SOQL query string
   * @returns {Promise<Object>} Query results
   */
  async query(query) {
    await this.ensureAuth();
    const response = await this.client.get('/services/data/v59.0/query/', {
      params: { q: query }
    });
    return response.data;
  }

  /**
   * Execute SOQL query with next records URL (pagination)
   * @param {string} nextRecordsUrl - Next records URL from previous query
   * @returns {Promise<Object>} Query results
   */
  async queryMore(nextRecordsUrl) {
    await this.ensureAuth();
    const response = await this.client.get(nextRecordsUrl);
    return response.data;
  }

  /**
   * Search using SOSL
   * @param {string} searchQuery - SOSL search query
   * @returns {Promise<Object>} Search results
   */
  async search(searchQuery) {
    await this.ensureAuth();
    const response = await this.client.get('/services/data/v59.0/search/', {
      params: { q: searchQuery }
    });
    return response.data;
  }

  // ==================== Tasks & Activities ====================

  /**
   * Create a Task
   * @param {Object} taskData - Task data (Subject, WhoId, WhatId, etc.)
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    await this.ensureAuth();
    const response = await this.client.post('/services/data/v59.0/sobjects/Task/', taskData);
    return response.data;
  }

  /**
   * Get Task by ID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Task details
   */
  async getTask(taskId) {
    await this.ensureAuth();
    const response = await this.client.get(`/services/data/v59.0/sobjects/Task/${taskId}`);
    return response.data;
  }

  /**
   * Update Task
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Updated data
   * @returns {Promise<Object>}
   */
  async updateTask(taskId, taskData) {
    await this.ensureAuth();
    await this.client.patch(`/services/data/v59.0/sobjects/Task/${taskId}`, taskData);
    return { success: true, id: taskId };
  }

  // ==================== Bulk Operations ====================

  /**
   * Create multiple records using Composite API
   * @param {string} objectType - Salesforce object type (Lead, Contact, etc.)
   * @param {Array} records - Array of records to create
   * @returns {Promise<Array>} Results for each record
   */
  async bulkCreate(objectType, records) {
    await this.ensureAuth();

    const compositeRequest = {
      allOrNone: false,
      records: records.map((record, index) => ({
        attributes: { type: objectType },
        ...record,
        referenceId: `ref${index}`
      }))
    };

    const response = await this.client.post(
      '/services/data/v59.0/composite/sobjects',
      compositeRequest
    );
    return response.data;
  }

  /**
   * Update multiple records using Composite API
   * @param {string} objectType - Salesforce object type
   * @param {Array} records - Array of records with Id field
   * @returns {Promise<Array>} Results for each record
   */
  async bulkUpdate(objectType, records) {
    await this.ensureAuth();

    const compositeRequest = {
      allOrNone: false,
      records: records.map(record => ({
        attributes: { type: objectType },
        ...record
      }))
    };

    const response = await this.client.patch(
      '/services/data/v59.0/composite/sobjects',
      compositeRequest
    );
    return response.data;
  }

  // ==================== Automation & Flows ====================

  /**
   * Invoke a Flow by API Name
   * @param {string} flowApiName - Flow API name
   * @param {Object} inputs - Flow input variables
   * @returns {Promise<Object>} Flow execution result
   */
  async invokeFlow(flowApiName, inputs = {}) {
    await this.ensureAuth();
    const response = await this.client.post(
      `/services/data/v59.0/actions/custom/flow/${flowApiName}`,
      { inputs: [inputs] }
    );
    return response.data;
  }

  /**
   * Get available Flows
   * @returns {Promise<Object>} List of available flows
   */
  async getFlows() {
    await this.ensureAuth();
    const response = await this.client.get('/services/data/v59.0/actions/custom/flow');
    return response.data;
  }

  // ==================== Metadata & Describe ====================

  /**
   * Describe an SObject
   * @param {string} objectName - Object API name
   * @returns {Promise<Object>} Object metadata
   */
  async describeObject(objectName) {
    await this.ensureAuth();
    const response = await this.client.get(`/services/data/v59.0/sobjects/${objectName}/describe`);
    return response.data;
  }

  /**
   * Get global describe (all objects)
   * @returns {Promise<Object>} Global describe information
   */
  async describeGlobal() {
    await this.ensureAuth();
    const response = await this.client.get('/services/data/v59.0/sobjects/');
    return response.data;
  }

  /**
   * Get API limits
   * @returns {Promise<Object>} Current API limits and usage
   */
  async getLimits() {
    await this.ensureAuth();
    const response = await this.client.get('/services/data/v59.0/limits/');
    return response.data;
  }

  // ==================== Reports & Dashboards ====================

  /**
   * Run a Report
   * @param {string} reportId - Report ID
   * @param {Object} options - Report options (filters, etc.)
   * @returns {Promise<Object>} Report results
   */
  async runReport(reportId, options = {}) {
    await this.ensureAuth();
    const response = await this.client.post(
      `/services/data/v59.0/analytics/reports/${reportId}`,
      options
    );
    return response.data;
  }

  /**
   * List Reports
   * @returns {Promise<Object>} List of available reports
   */
  async listReports() {
    await this.ensureAuth();
    const response = await this.client.get('/services/data/v59.0/analytics/reports');
    return response.data;
  }
}

// Export singleton instance
export const salesforceClient = new SalesforceClient();
export default SalesforceClient;
