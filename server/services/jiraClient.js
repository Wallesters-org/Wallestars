import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Jira API Client
 * Project management and issue tracking
 *
 * @see https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 */
class JiraClient {
  constructor() {
    this.baseURL = process.env.JIRA_BASE_URL;
    this.email = process.env.JIRA_EMAIL;
    this.apiToken = process.env.JIRA_API_TOKEN;

    if (!this.baseURL || !this.email || !this.apiToken) {
      console.warn('⚠️ JIRA credentials not configured. Jira API features will be disabled.');
    }

    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: `${this.baseURL}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: parseInt(process.env.JIRA_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.errorMessages?.join(', ') ||
          error.response?.data?.message || error.message;
        console.error('Jira API Error:', errorMsg);
        throw new Error(`Jira API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!(this.baseURL && this.email && this.apiToken);
  }

  // ==================== Issues ====================

  /**
   * Create an issue
   * @param {Object} issueData - Issue data
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(issueData) {
    const response = await this.client.post('/issue', { fields: issueData });
    return response.data;
  }

  /**
   * Get an issue
   * @param {string} issueIdOrKey - Issue ID or key
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Issue details
   */
  async getIssue(issueIdOrKey, params = {}) {
    const response = await this.client.get(`/issue/${issueIdOrKey}`, { params });
    return response.data;
  }

  /**
   * Update an issue
   * @param {string} issueIdOrKey - Issue ID or key
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Update result
   */
  async updateIssue(issueIdOrKey, updateData) {
    const response = await this.client.put(`/issue/${issueIdOrKey}`, { fields: updateData });
    return response.data;
  }

  /**
   * Delete an issue
   * @param {string} issueIdOrKey - Issue ID or key
   * @returns {Promise<void>}
   */
  async deleteIssue(issueIdOrKey) {
    await this.client.delete(`/issue/${issueIdOrKey}`);
  }

  /**
   * Search issues using JQL
   * @param {string} jql - JQL query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchIssues(jql, options = {}) {
    const response = await this.client.post('/search', {
      jql,
      startAt: options.startAt || 0,
      maxResults: options.maxResults || 50,
      fields: options.fields || ['summary', 'status', 'assignee', 'priority', 'created', 'updated']
    });
    return response.data;
  }

  /**
   * Transition an issue
   * @param {string} issueIdOrKey - Issue ID or key
   * @param {string} transitionId - Transition ID
   * @param {Object} fields - Fields to update
   * @returns {Promise<void>}
   */
  async transitionIssue(issueIdOrKey, transitionId, fields = {}) {
    await this.client.post(`/issue/${issueIdOrKey}/transitions`, {
      transition: { id: transitionId },
      fields
    });
  }

  /**
   * Get available transitions
   * @param {string} issueIdOrKey - Issue ID or key
   * @returns {Promise<Object>} Available transitions
   */
  async getTransitions(issueIdOrKey) {
    const response = await this.client.get(`/issue/${issueIdOrKey}/transitions`);
    return response.data;
  }

  /**
   * Assign an issue
   * @param {string} issueIdOrKey - Issue ID or key
   * @param {string} accountId - Assignee account ID
   * @returns {Promise<void>}
   */
  async assignIssue(issueIdOrKey, accountId) {
    await this.client.put(`/issue/${issueIdOrKey}/assignee`, { accountId });
  }

  // ==================== Comments ====================

  /**
   * Add a comment
   * @param {string} issueIdOrKey - Issue ID or key
   * @param {string} body - Comment body
   * @returns {Promise<Object>} Created comment
   */
  async addComment(issueIdOrKey, body) {
    const response = await this.client.post(`/issue/${issueIdOrKey}/comment`, {
      body: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: body }]
        }]
      }
    });
    return response.data;
  }

  /**
   * Get comments
   * @param {string} issueIdOrKey - Issue ID or key
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Comments
   */
  async getComments(issueIdOrKey, params = {}) {
    const response = await this.client.get(`/issue/${issueIdOrKey}/comment`, { params });
    return response.data;
  }

  // ==================== Projects ====================

  /**
   * Get all projects
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Projects
   */
  async getProjects(params = {}) {
    const response = await this.client.get('/project/search', { params });
    return response.data;
  }

  /**
   * Get project
   * @param {string} projectIdOrKey - Project ID or key
   * @returns {Promise<Object>} Project details
   */
  async getProject(projectIdOrKey) {
    const response = await this.client.get(`/project/${projectIdOrKey}`);
    return response.data;
  }

  /**
   * Get project statuses
   * @param {string} projectIdOrKey - Project ID or key
   * @returns {Promise<Array>} Project statuses
   */
  async getProjectStatuses(projectIdOrKey) {
    const response = await this.client.get(`/project/${projectIdOrKey}/statuses`);
    return response.data;
  }

  // ==================== Users ====================

  /**
   * Search users
   * @param {string} query - Search query
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Users
   */
  async searchUsers(query, params = {}) {
    const response = await this.client.get('/user/search', {
      params: { query, ...params }
    });
    return response.data;
  }

  /**
   * Get current user
   * @returns {Promise<Object>} Current user
   */
  async getCurrentUser() {
    const response = await this.client.get('/myself');
    return response.data;
  }

  /**
   * Get user
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} User details
   */
  async getUser(accountId) {
    const response = await this.client.get('/user', {
      params: { accountId }
    });
    return response.data;
  }

  // ==================== Sprints (Agile) ====================

  /**
   * Get sprints for a board
   * @param {number} boardId - Board ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Sprints
   */
  async getSprints(boardId, params = {}) {
    const agileClient = axios.create({
      baseURL: `${this.baseURL}/rest/agile/1.0`,
      headers: this.client.defaults.headers
    });
    const response = await agileClient.get(`/board/${boardId}/sprint`, { params });
    return response.data;
  }

  /**
   * Get issues in sprint
   * @param {number} sprintId - Sprint ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Sprint issues
   */
  async getSprintIssues(sprintId, params = {}) {
    const agileClient = axios.create({
      baseURL: `${this.baseURL}/rest/agile/1.0`,
      headers: this.client.defaults.headers
    });
    const response = await agileClient.get(`/sprint/${sprintId}/issue`, { params });
    return response.data;
  }

  // ==================== Boards ====================

  /**
   * Get all boards
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Boards
   */
  async getBoards(params = {}) {
    const agileClient = axios.create({
      baseURL: `${this.baseURL}/rest/agile/1.0`,
      headers: this.client.defaults.headers
    });
    const response = await agileClient.get('/board', { params });
    return response.data;
  }

  /**
   * Get board configuration
   * @param {number} boardId - Board ID
   * @returns {Promise<Object>} Board configuration
   */
  async getBoardConfig(boardId) {
    const agileClient = axios.create({
      baseURL: `${this.baseURL}/rest/agile/1.0`,
      headers: this.client.defaults.headers
    });
    const response = await agileClient.get(`/board/${boardId}/configuration`);
    return response.data;
  }

  // ==================== Attachments ====================

  /**
   * Add attachment
   * @param {string} issueIdOrKey - Issue ID or key
   * @param {Buffer} file - File buffer
   * @param {string} filename - File name
   * @returns {Promise<Object>} Attachment result
   */
  async addAttachment(issueIdOrKey, file, filename) {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', file, filename);

    const response = await this.client.post(
      `/issue/${issueIdOrKey}/attachments`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'X-Atlassian-Token': 'no-check'
        }
      }
    );
    return response.data;
  }
}

export const jiraClient = new JiraClient();
export default JiraClient;
