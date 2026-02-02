import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Slack API Client
 * Team communication and collaboration platform
 *
 * @see https://api.slack.com/
 */
class SlackClient {
  constructor() {
    this.baseURL = 'https://slack.com/api';
    this.botToken = process.env.SLACK_BOT_TOKEN;
    this.signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (!this.botToken) {
      console.warn('⚠️ SLACK_BOT_TOKEN not configured. Slack API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.botToken}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.SLACK_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => {
        if (response.data && !response.data.ok) {
          throw new Error(`Slack API Error: ${response.data.error}`);
        }
        return response;
      },
      error => {
        const errorMsg = error.response?.data?.error || error.message;
        console.error('Slack API Error:', errorMsg);
        throw new Error(`Slack API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.botToken;
  }

  // ==================== Messages ====================

  /**
   * Send a message to a channel
   * @param {string} channel - Channel ID or name
   * @param {string} text - Message text
   * @param {Object} options - Additional options (blocks, attachments)
   * @returns {Promise<Object>} Message result
   */
  async postMessage(channel, text, options = {}) {
    const response = await this.client.post('/chat.postMessage', {
      channel,
      text,
      ...options
    });
    return response.data;
  }

  /**
   * Update a message
   * @param {string} channel - Channel ID
   * @param {string} ts - Message timestamp
   * @param {string} text - New message text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Update result
   */
  async updateMessage(channel, ts, text, options = {}) {
    const response = await this.client.post('/chat.update', {
      channel,
      ts,
      text,
      ...options
    });
    return response.data;
  }

  /**
   * Delete a message
   * @param {string} channel - Channel ID
   * @param {string} ts - Message timestamp
   * @returns {Promise<Object>} Delete result
   */
  async deleteMessage(channel, ts) {
    const response = await this.client.post('/chat.delete', { channel, ts });
    return response.data;
  }

  /**
   * Get message history
   * @param {string} channel - Channel ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Messages
   */
  async getHistory(channel, params = {}) {
    const response = await this.client.get('/conversations.history', {
      params: { channel, ...params }
    });
    return response.data;
  }

  // ==================== Channels ====================

  /**
   * List channels
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of channels
   */
  async listChannels(params = {}) {
    const response = await this.client.get('/conversations.list', { params });
    return response.data;
  }

  /**
   * Get channel info
   * @param {string} channel - Channel ID
   * @returns {Promise<Object>} Channel info
   */
  async getChannelInfo(channel) {
    const response = await this.client.get('/conversations.info', {
      params: { channel }
    });
    return response.data;
  }

  /**
   * Create a channel
   * @param {string} name - Channel name
   * @param {boolean} isPrivate - Whether channel is private
   * @returns {Promise<Object>} Created channel
   */
  async createChannel(name, isPrivate = false) {
    const response = await this.client.post('/conversations.create', {
      name,
      is_private: isPrivate
    });
    return response.data;
  }

  /**
   * Join a channel
   * @param {string} channel - Channel ID
   * @returns {Promise<Object>} Join result
   */
  async joinChannel(channel) {
    const response = await this.client.post('/conversations.join', { channel });
    return response.data;
  }

  /**
   * Invite users to a channel
   * @param {string} channel - Channel ID
   * @param {string|Array} users - User IDs
   * @returns {Promise<Object>} Invite result
   */
  async inviteToChannel(channel, users) {
    const userList = Array.isArray(users) ? users.join(',') : users;
    const response = await this.client.post('/conversations.invite', {
      channel,
      users: userList
    });
    return response.data;
  }

  // ==================== Users ====================

  /**
   * List users
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of users
   */
  async listUsers(params = {}) {
    const response = await this.client.get('/users.list', { params });
    return response.data;
  }

  /**
   * Get user info
   * @param {string} user - User ID
   * @returns {Promise<Object>} User info
   */
  async getUserInfo(user) {
    const response = await this.client.get('/users.info', {
      params: { user }
    });
    return response.data;
  }

  /**
   * Look up user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User info
   */
  async lookupByEmail(email) {
    const response = await this.client.get('/users.lookupByEmail', {
      params: { email }
    });
    return response.data;
  }

  // ==================== Reactions ====================

  /**
   * Add a reaction to a message
   * @param {string} channel - Channel ID
   * @param {string} timestamp - Message timestamp
   * @param {string} name - Emoji name
   * @returns {Promise<Object>} Reaction result
   */
  async addReaction(channel, timestamp, name) {
    const response = await this.client.post('/reactions.add', {
      channel,
      timestamp,
      name
    });
    return response.data;
  }

  // ==================== Files ====================

  /**
   * Upload a file
   * @param {Object} fileData - File data and metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(fileData) {
    const response = await this.client.post('/files.upload', fileData);
    return response.data;
  }

  /**
   * List files
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of files
   */
  async listFiles(params = {}) {
    const response = await this.client.get('/files.list', { params });
    return response.data;
  }

  // ==================== Auth ====================

  /**
   * Test authentication
   * @returns {Promise<Object>} Auth info
   */
  async authTest() {
    const response = await this.client.post('/auth.test');
    return response.data;
  }
}

export const slackClient = new SlackClient();
export default SlackClient;
