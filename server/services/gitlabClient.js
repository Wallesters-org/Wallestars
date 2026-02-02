import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * GitLab API Client
 * Git repository management, CI/CD, and DevOps platform
 *
 * @see https://docs.gitlab.com/ee/api/
 */
class GitLabClient {
  constructor() {
    this.baseURL = process.env.GITLAB_API_BASE_URL || 'https://gitlab.com/api/v4';
    this.apiToken = process.env.GITLAB_API_TOKEN;

    if (!this.apiToken) {
      console.warn('⚠️ GITLAB_API_TOKEN not configured. GitLab API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'PRIVATE-TOKEN': this.apiToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: parseInt(process.env.GITLAB_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.message || error.message;
        console.error('GitLab API Error:', errorMsg);
        throw new Error(`GitLab API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiToken;
  }

  // ==================== Projects ====================

  /**
   * List projects
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of projects
   */
  async listProjects(params = {}) {
    const response = await this.client.get('/projects', { params });
    return response.data;
  }

  /**
   * Get project details
   * @param {string} projectId - Project ID or path
   * @returns {Promise<Object>} Project details
   */
  async getProject(projectId) {
    const response = await this.client.get(`/projects/${encodeURIComponent(projectId)}`);
    return response.data;
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  async createProject(projectData) {
    const response = await this.client.post('/projects', projectData);
    return response.data;
  }

  // ==================== Merge Requests ====================

  /**
   * List merge requests
   * @param {string} projectId - Project ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of merge requests
   */
  async listMergeRequests(projectId, params = {}) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/merge_requests`,
      { params }
    );
    return response.data;
  }

  /**
   * Get merge request details
   * @param {string} projectId - Project ID
   * @param {number} mrIid - Merge request IID
   * @returns {Promise<Object>} Merge request details
   */
  async getMergeRequest(projectId, mrIid) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`
    );
    return response.data;
  }

  /**
   * Create a merge request
   * @param {string} projectId - Project ID
   * @param {Object} mrData - Merge request data
   * @returns {Promise<Object>} Created merge request
   */
  async createMergeRequest(projectId, mrData) {
    const response = await this.client.post(
      `/projects/${encodeURIComponent(projectId)}/merge_requests`,
      mrData
    );
    return response.data;
  }

  /**
   * Merge a merge request
   * @param {string} projectId - Project ID
   * @param {number} mrIid - Merge request IID
   * @param {Object} options - Merge options
   * @returns {Promise<Object>} Merge result
   */
  async mergeMergeRequest(projectId, mrIid, options = {}) {
    const response = await this.client.put(
      `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/merge`,
      options
    );
    return response.data;
  }

  // ==================== Issues ====================

  /**
   * List issues
   * @param {string} projectId - Project ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of issues
   */
  async listIssues(projectId, params = {}) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/issues`,
      { params }
    );
    return response.data;
  }

  /**
   * Get issue details
   * @param {string} projectId - Project ID
   * @param {number} issueIid - Issue IID
   * @returns {Promise<Object>} Issue details
   */
  async getIssue(projectId, issueIid) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/issues/${issueIid}`
    );
    return response.data;
  }

  /**
   * Create an issue
   * @param {string} projectId - Project ID
   * @param {Object} issueData - Issue data
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(projectId, issueData) {
    const response = await this.client.post(
      `/projects/${encodeURIComponent(projectId)}/issues`,
      issueData
    );
    return response.data;
  }

  // ==================== Pipelines ====================

  /**
   * List pipelines
   * @param {string} projectId - Project ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of pipelines
   */
  async listPipelines(projectId, params = {}) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/pipelines`,
      { params }
    );
    return response.data;
  }

  /**
   * Get pipeline details
   * @param {string} projectId - Project ID
   * @param {number} pipelineId - Pipeline ID
   * @returns {Promise<Object>} Pipeline details
   */
  async getPipeline(projectId, pipelineId) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}`
    );
    return response.data;
  }

  /**
   * Trigger a new pipeline
   * @param {string} projectId - Project ID
   * @param {string} ref - Branch or tag
   * @param {Object} variables - Pipeline variables
   * @returns {Promise<Object>} Created pipeline
   */
  async triggerPipeline(projectId, ref, variables = {}) {
    const response = await this.client.post(
      `/projects/${encodeURIComponent(projectId)}/pipeline`,
      { ref, variables }
    );
    return response.data;
  }

  /**
   * Cancel a pipeline
   * @param {string} projectId - Project ID
   * @param {number} pipelineId - Pipeline ID
   * @returns {Promise<Object>} Cancelled pipeline
   */
  async cancelPipeline(projectId, pipelineId) {
    const response = await this.client.post(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/cancel`
    );
    return response.data;
  }

  /**
   * Retry a pipeline
   * @param {string} projectId - Project ID
   * @param {number} pipelineId - Pipeline ID
   * @returns {Promise<Object>} Retried pipeline
   */
  async retryPipeline(projectId, pipelineId) {
    const response = await this.client.post(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/retry`
    );
    return response.data;
  }

  // ==================== Branches ====================

  /**
   * List branches
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} List of branches
   */
  async listBranches(projectId) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/repository/branches`
    );
    return response.data;
  }

  /**
   * Create a branch
   * @param {string} projectId - Project ID
   * @param {string} branch - Branch name
   * @param {string} ref - Source branch or commit
   * @returns {Promise<Object>} Created branch
   */
  async createBranch(projectId, branch, ref) {
    const response = await this.client.post(
      `/projects/${encodeURIComponent(projectId)}/repository/branches`,
      { branch, ref }
    );
    return response.data;
  }

  // ==================== Commits ====================

  /**
   * List commits
   * @param {string} projectId - Project ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of commits
   */
  async listCommits(projectId, params = {}) {
    const response = await this.client.get(
      `/projects/${encodeURIComponent(projectId)}/repository/commits`,
      { params }
    );
    return response.data;
  }

  /**
   * Get user info
   * @returns {Promise<Object>} Current user info
   */
  async getCurrentUser() {
    const response = await this.client.get('/user');
    return response.data;
  }
}

export const gitlabClient = new GitLabClient();
export default GitLabClient;
