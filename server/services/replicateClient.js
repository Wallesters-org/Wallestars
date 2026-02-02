import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Replicate API Client
 * AI model hosting and inference platform
 *
 * @see https://replicate.com/docs/reference/http
 */
class ReplicateClient {
  constructor() {
    this.baseURL = 'https://api.replicate.com/v1';
    this.apiToken = process.env.REPLICATE_API_TOKEN;

    if (!this.apiToken) {
      console.warn('⚠️ REPLICATE_API_TOKEN not configured. Replicate API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.REPLICATE_API_TIMEOUT || '120000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.detail || error.message;
        console.error('Replicate API Error:', errorMsg);
        throw new Error(`Replicate API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiToken;
  }

  // ==================== Predictions ====================

  /**
   * Create a prediction
   * @param {string} model - Model version or owner/name
   * @param {Object} input - Model input
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created prediction
   */
  async createPrediction(model, input, options = {}) {
    const payload = {
      input,
      ...options
    };

    // Check if model is a version ID or owner/name format
    if (model.includes(':')) {
      payload.version = model;
    } else {
      payload.model = model;
    }

    const response = await this.client.post('/predictions', payload);
    return response.data;
  }

  /**
   * Get a prediction
   * @param {string} predictionId - Prediction ID
   * @returns {Promise<Object>} Prediction details
   */
  async getPrediction(predictionId) {
    const response = await this.client.get(`/predictions/${predictionId}`);
    return response.data;
  }

  /**
   * Cancel a prediction
   * @param {string} predictionId - Prediction ID
   * @returns {Promise<Object>} Cancelled prediction
   */
  async cancelPrediction(predictionId) {
    const response = await this.client.post(`/predictions/${predictionId}/cancel`);
    return response.data;
  }

  /**
   * List predictions
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Predictions list
   */
  async listPredictions(params = {}) {
    const response = await this.client.get('/predictions', { params });
    return response.data;
  }

  /**
   * Run a prediction and wait for result
   * @param {string} model - Model version
   * @param {Object} input - Model input
   * @param {Object} options - Run options
   * @returns {Promise<Object>} Prediction result
   */
  async run(model, input, options = {}) {
    const prediction = await this.createPrediction(model, input, options);

    // Poll for completion
    const maxAttempts = options.maxAttempts || 300;
    const pollInterval = options.pollInterval || 1000;

    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getPrediction(prediction.id);

      if (result.status === 'succeeded') {
        return result;
      }

      if (result.status === 'failed' || result.status === 'canceled') {
        throw new Error(`Prediction ${result.status}: ${result.error || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Prediction timed out');
  }

  // ==================== Models ====================

  /**
   * Get a model
   * @param {string} owner - Model owner
   * @param {string} name - Model name
   * @returns {Promise<Object>} Model details
   */
  async getModel(owner, name) {
    const response = await this.client.get(`/models/${owner}/${name}`);
    return response.data;
  }

  /**
   * List model versions
   * @param {string} owner - Model owner
   * @param {string} name - Model name
   * @returns {Promise<Object>} Model versions
   */
  async listModelVersions(owner, name) {
    const response = await this.client.get(`/models/${owner}/${name}/versions`);
    return response.data;
  }

  /**
   * Get a specific model version
   * @param {string} owner - Model owner
   * @param {string} name - Model name
   * @param {string} versionId - Version ID
   * @returns {Promise<Object>} Version details
   */
  async getModelVersion(owner, name, versionId) {
    const response = await this.client.get(`/models/${owner}/${name}/versions/${versionId}`);
    return response.data;
  }

  /**
   * Create a model
   * @param {Object} modelData - Model data
   * @returns {Promise<Object>} Created model
   */
  async createModel(modelData) {
    const response = await this.client.post('/models', modelData);
    return response.data;
  }

  /**
   * Search models
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async searchModels(query) {
    const response = await this.client.get('/models', {
      params: { query }
    });
    return response.data;
  }

  // ==================== Collections ====================

  /**
   * Get a collection
   * @param {string} collectionSlug - Collection slug
   * @returns {Promise<Object>} Collection details
   */
  async getCollection(collectionSlug) {
    const response = await this.client.get(`/collections/${collectionSlug}`);
    return response.data;
  }

  /**
   * List collections
   * @returns {Promise<Object>} Collections list
   */
  async listCollections() {
    const response = await this.client.get('/collections');
    return response.data;
  }

  // ==================== Deployments ====================

  /**
   * Create a deployment
   * @param {Object} deploymentData - Deployment data
   * @returns {Promise<Object>} Created deployment
   */
  async createDeployment(deploymentData) {
    const response = await this.client.post('/deployments', deploymentData);
    return response.data;
  }

  /**
   * Get a deployment
   * @param {string} owner - Deployment owner
   * @param {string} name - Deployment name
   * @returns {Promise<Object>} Deployment details
   */
  async getDeployment(owner, name) {
    const response = await this.client.get(`/deployments/${owner}/${name}`);
    return response.data;
  }

  /**
   * Update a deployment
   * @param {string} owner - Deployment owner
   * @param {string} name - Deployment name
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated deployment
   */
  async updateDeployment(owner, name, updateData) {
    const response = await this.client.patch(`/deployments/${owner}/${name}`, updateData);
    return response.data;
  }

  /**
   * List deployments
   * @returns {Promise<Object>} Deployments list
   */
  async listDeployments() {
    const response = await this.client.get('/deployments');
    return response.data;
  }

  /**
   * Create prediction on deployment
   * @param {string} owner - Deployment owner
   * @param {string} name - Deployment name
   * @param {Object} input - Prediction input
   * @returns {Promise<Object>} Prediction result
   */
  async createDeploymentPrediction(owner, name, input) {
    const response = await this.client.post(
      `/deployments/${owner}/${name}/predictions`,
      { input }
    );
    return response.data;
  }

  // ==================== Training ====================

  /**
   * Create a training
   * @param {string} owner - Model owner
   * @param {string} name - Model name
   * @param {string} version - Model version
   * @param {Object} trainingData - Training data
   * @returns {Promise<Object>} Created training
   */
  async createTraining(owner, name, version, trainingData) {
    const response = await this.client.post(
      `/models/${owner}/${name}/versions/${version}/trainings`,
      trainingData
    );
    return response.data;
  }

  /**
   * Get a training
   * @param {string} trainingId - Training ID
   * @returns {Promise<Object>} Training details
   */
  async getTraining(trainingId) {
    const response = await this.client.get(`/trainings/${trainingId}`);
    return response.data;
  }

  /**
   * Cancel a training
   * @param {string} trainingId - Training ID
   * @returns {Promise<Object>} Cancelled training
   */
  async cancelTraining(trainingId) {
    const response = await this.client.post(`/trainings/${trainingId}/cancel`);
    return response.data;
  }

  /**
   * List trainings
   * @returns {Promise<Object>} Trainings list
   */
  async listTrainings() {
    const response = await this.client.get('/trainings');
    return response.data;
  }

  // ==================== Hardware ====================

  /**
   * List available hardware
   * @returns {Promise<Object>} Hardware list
   */
  async listHardware() {
    const response = await this.client.get('/hardware');
    return response.data;
  }

  // ==================== Account ====================

  /**
   * Get current account
   * @returns {Promise<Object>} Account details
   */
  async getAccount() {
    const response = await this.client.get('/account');
    return response.data;
  }
}

export const replicateClient = new ReplicateClient();
export default ReplicateClient;
