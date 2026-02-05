import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Airtop API Client
 * AI-powered browser automation platform
 *
 * @see https://docs.airtop.ai/
 */
class AirtopClient {
  constructor() {
    this.baseURL = process.env.AIRTOP_API_BASE_URL || 'https://api.airtop.ai/v1';
    this.apiKey = process.env.AIRTOP_API_KEY;

    if (!this.apiKey) {
      console.warn('⚠️ AIRTOP_API_KEY not configured. Airtop API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: parseInt(process.env.AIRTOP_API_TIMEOUT || '60000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.message || error.message;
        console.error('Airtop API Error:', errorMsg);
        throw new Error(`Airtop API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiKey;
  }

  // ==================== Browser Sessions ====================

  /**
   * Create a new browser session
   * @param {Object} options - Session configuration
   * @returns {Promise<Object>} Session details
   */
  async createSession(options = {}) {
    const response = await this.client.post('/sessions', {
      profile: options.profile || 'default',
      proxy: options.proxy,
      viewport: options.viewport || { width: 1920, height: 1080 },
      timeout: options.timeout || 300000,
      ...options
    });
    return response.data;
  }

  /**
   * Get session details
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session details
   */
  async getSession(sessionId) {
    const response = await this.client.get(`/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * List all active sessions
   * @returns {Promise<Array>} List of sessions
   */
  async listSessions() {
    const response = await this.client.get('/sessions');
    return response.data;
  }

  /**
   * Close a browser session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Result
   */
  async closeSession(sessionId) {
    const response = await this.client.delete(`/sessions/${sessionId}`);
    return response.data;
  }

  // ==================== Browser Actions ====================

  /**
   * Navigate to a URL
   * @param {string} sessionId - Session ID
   * @param {string} url - Target URL
   * @returns {Promise<Object>} Navigation result
   */
  async navigate(sessionId, url) {
    const response = await this.client.post(`/sessions/${sessionId}/navigate`, { url });
    return response.data;
  }

  /**
   * Take a screenshot
   * @param {string} sessionId - Session ID
   * @param {Object} options - Screenshot options
   * @returns {Promise<Object>} Screenshot data
   */
  async screenshot(sessionId, options = {}) {
    const response = await this.client.post(`/sessions/${sessionId}/screenshot`, {
      fullPage: options.fullPage || false,
      format: options.format || 'png',
      ...options
    });
    return response.data;
  }

  /**
   * Click an element
   * @param {string} sessionId - Session ID
   * @param {Object} target - Click target (selector or coordinates)
   * @returns {Promise<Object>} Action result
   */
  async click(sessionId, target) {
    const response = await this.client.post(`/sessions/${sessionId}/click`, target);
    return response.data;
  }

  /**
   * Type text
   * @param {string} sessionId - Session ID
   * @param {Object} input - Text input details
   * @returns {Promise<Object>} Action result
   */
  async type(sessionId, input) {
    const response = await this.client.post(`/sessions/${sessionId}/type`, input);
    return response.data;
  }

  /**
   * Execute JavaScript in the browser
   * @param {string} sessionId - Session ID
   * @param {string} script - JavaScript code
   * @returns {Promise<Object>} Execution result
   */
  async executeScript(sessionId, script) {
    const response = await this.client.post(`/sessions/${sessionId}/execute`, { script });
    return response.data;
  }

  // ==================== AI Features ====================

  /**
   * Extract data from page using AI
   * @param {string} sessionId - Session ID
   * @param {Object} extraction - Extraction configuration
   * @returns {Promise<Object>} Extracted data
   */
  async extract(sessionId, extraction) {
    const response = await this.client.post(`/sessions/${sessionId}/extract`, extraction);
    return response.data;
  }

  /**
   * Perform AI-guided action
   * @param {string} sessionId - Session ID
   * @param {string} instruction - Natural language instruction
   * @returns {Promise<Object>} Action result
   */
  async aiAction(sessionId, instruction) {
    const response = await this.client.post(`/sessions/${sessionId}/ai-action`, { instruction });
    return response.data;
  }

  /**
   * Ask AI about the current page
   * @param {string} sessionId - Session ID
   * @param {string} question - Question about the page
   * @returns {Promise<Object>} AI response
   */
  async aiQuery(sessionId, question) {
    const response = await this.client.post(`/sessions/${sessionId}/ai-query`, { question });
    return response.data;
  }

  // ==================== Page Content ====================

  /**
   * Get page HTML content
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Page HTML
   */
  async getPageContent(sessionId) {
    const response = await this.client.get(`/sessions/${sessionId}/content`);
    return response.data;
  }

  /**
   * Get page text content
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Page text
   */
  async getPageText(sessionId) {
    const response = await this.client.get(`/sessions/${sessionId}/text`);
    return response.data;
  }

  /**
   * Wait for element
   * @param {string} sessionId - Session ID
   * @param {string} selector - CSS selector
   * @param {number} timeout - Wait timeout
   * @returns {Promise<Object>} Element found result
   */
  async waitForElement(sessionId, selector, timeout = 30000) {
    const response = await this.client.post(`/sessions/${sessionId}/wait`, {
      selector,
      timeout
    });
    return response.data;
  }
}

export const airtopClient = new AirtopClient();
export default AirtopClient;
