import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Vercel API Client
 * Deployment and hosting platform
 *
 * @see https://vercel.com/docs/rest-api
 */
class VercelClient {
  constructor() {
    this.baseURL = 'https://api.vercel.com';
    this.apiToken = process.env.VERCEL_API_TOKEN;
    this.teamId = process.env.VERCEL_TEAM_ID;

    if (!this.apiToken) {
      console.warn('⚠️ VERCEL_API_TOKEN not configured. Vercel API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.VERCEL_API_TIMEOUT || '60000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error('Vercel API Error:', errorMsg);
        throw new Error(`Vercel API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiToken;
  }

  /**
   * Add team ID to params if configured
   * @param {Object} params - Query parameters
   * @returns {Object} Parameters with team ID
   */
  withTeam(params = {}) {
    if (this.teamId) {
      return { ...params, teamId: this.teamId };
    }
    return params;
  }

  // ==================== Projects ====================

  /**
   * List all projects
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Projects list
   */
  async listProjects(params = {}) {
    const response = await this.client.get('/v9/projects', {
      params: this.withTeam(params)
    });
    return response.data;
  }

  /**
   * Get project
   * @param {string} projectId - Project ID or name
   * @returns {Promise<Object>} Project details
   */
  async getProject(projectId) {
    const response = await this.client.get(`/v9/projects/${projectId}`, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Create a project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  async createProject(projectData) {
    const response = await this.client.post('/v10/projects', projectData, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated project
   */
  async updateProject(projectId, updateData) {
    const response = await this.client.patch(`/v9/projects/${projectId}`, updateData, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Delete a project
   * @param {string} projectId - Project ID
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    await this.client.delete(`/v9/projects/${projectId}`, {
      params: this.withTeam()
    });
  }

  // ==================== Deployments ====================

  /**
   * List deployments
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Deployments list
   */
  async listDeployments(params = {}) {
    const response = await this.client.get('/v6/deployments', {
      params: this.withTeam(params)
    });
    return response.data;
  }

  /**
   * Get deployment
   * @param {string} deploymentId - Deployment ID or URL
   * @returns {Promise<Object>} Deployment details
   */
  async getDeployment(deploymentId) {
    const response = await this.client.get(`/v13/deployments/${deploymentId}`, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Create a deployment
   * @param {Object} deploymentData - Deployment data
   * @returns {Promise<Object>} Created deployment
   */
  async createDeployment(deploymentData) {
    const response = await this.client.post('/v13/deployments', deploymentData, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Cancel a deployment
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Cancelled deployment
   */
  async cancelDeployment(deploymentId) {
    const response = await this.client.patch(`/v12/deployments/${deploymentId}/cancel`, null, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Get deployment events/logs
   * @param {string} deploymentId - Deployment ID
   * @returns {Promise<Object>} Deployment events
   */
  async getDeploymentEvents(deploymentId) {
    const response = await this.client.get(`/v3/deployments/${deploymentId}/events`, {
      params: this.withTeam()
    });
    return response.data;
  }

  // ==================== Domains ====================

  /**
   * List domains
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Domains list
   */
  async listDomains(params = {}) {
    const response = await this.client.get('/v5/domains', {
      params: this.withTeam(params)
    });
    return response.data;
  }

  /**
   * Get domain
   * @param {string} domain - Domain name
   * @returns {Promise<Object>} Domain details
   */
  async getDomain(domain) {
    const response = await this.client.get(`/v5/domains/${domain}`, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Add a domain
   * @param {string} name - Domain name
   * @returns {Promise<Object>} Added domain
   */
  async addDomain(name) {
    const response = await this.client.post('/v5/domains', { name }, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Remove a domain
   * @param {string} domain - Domain name
   * @returns {Promise<void>}
   */
  async removeDomain(domain) {
    await this.client.delete(`/v6/domains/${domain}`, {
      params: this.withTeam()
    });
  }

  /**
   * Check domain availability
   * @param {string} name - Domain name
   * @returns {Promise<Object>} Availability result
   */
  async checkDomain(name) {
    const response = await this.client.get(`/v4/domains/status`, {
      params: { ...this.withTeam(), name }
    });
    return response.data;
  }

  // ==================== Environment Variables ====================

  /**
   * Get environment variables
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Environment variables
   */
  async getEnvVars(projectId) {
    const response = await this.client.get(`/v9/projects/${projectId}/env`, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Create environment variable
   * @param {string} projectId - Project ID
   * @param {Object} envData - Environment variable data
   * @returns {Promise<Object>} Created env var
   */
  async createEnvVar(projectId, envData) {
    const response = await this.client.post(`/v10/projects/${projectId}/env`, envData, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Delete environment variable
   * @param {string} projectId - Project ID
   * @param {string} envId - Environment variable ID
   * @returns {Promise<void>}
   */
  async deleteEnvVar(projectId, envId) {
    await this.client.delete(`/v9/projects/${projectId}/env/${envId}`, {
      params: this.withTeam()
    });
  }

  // ==================== Teams ====================

  /**
   * Get teams
   * @returns {Promise<Object>} Teams list
   */
  async getTeams() {
    const response = await this.client.get('/v2/teams');
    return response.data;
  }

  /**
   * Get team
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Team details
   */
  async getTeam(teamId) {
    const response = await this.client.get(`/v2/teams/${teamId}`);
    return response.data;
  }

  // ==================== User ====================

  /**
   * Get current user
   * @returns {Promise<Object>} Current user
   */
  async getCurrentUser() {
    const response = await this.client.get('/v2/user');
    return response.data;
  }

  // ==================== Logs ====================

  /**
   * Get deployment logs
   * @param {string} deploymentId - Deployment ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Logs
   */
  async getLogs(deploymentId, params = {}) {
    const response = await this.client.get(`/v2/deployments/${deploymentId}/logs`, {
      params: this.withTeam(params)
    });
    return response.data;
  }

  // ==================== Edge Config ====================

  /**
   * Get edge configs
   * @returns {Promise<Object>} Edge configs
   */
  async getEdgeConfigs() {
    const response = await this.client.get('/v1/edge-config', {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Get edge config
   * @param {string} edgeConfigId - Edge config ID
   * @returns {Promise<Object>} Edge config
   */
  async getEdgeConfig(edgeConfigId) {
    const response = await this.client.get(`/v1/edge-config/${edgeConfigId}`, {
      params: this.withTeam()
    });
    return response.data;
  }

  /**
   * Get edge config items
   * @param {string} edgeConfigId - Edge config ID
   * @returns {Promise<Object>} Edge config items
   */
  async getEdgeConfigItems(edgeConfigId) {
    const response = await this.client.get(`/v1/edge-config/${edgeConfigId}/items`, {
      params: this.withTeam()
    });
    return response.data;
  }
}

export const vercelClient = new VercelClient();
export default VercelClient;
