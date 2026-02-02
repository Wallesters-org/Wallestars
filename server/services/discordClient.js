import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Discord API Client
 * Community and team communication platform
 *
 * @see https://discord.com/developers/docs/reference
 */
class DiscordClient {
  constructor() {
    this.baseURL = 'https://discord.com/api/v10';
    this.botToken = process.env.DISCORD_BOT_TOKEN;

    if (!this.botToken) {
      console.warn('⚠️ DISCORD_BOT_TOKEN not configured. Discord API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bot ${this.botToken}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.DISCORD_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.message || error.message;
        console.error('Discord API Error:', errorMsg);
        throw new Error(`Discord API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.botToken;
  }

  // ==================== Messages ====================

  /**
   * Send a message to a channel
   * @param {string} channelId - Channel ID
   * @param {Object} message - Message content
   * @returns {Promise<Object>} Sent message
   */
  async sendMessage(channelId, message) {
    const payload = typeof message === 'string' ? { content: message } : message;
    const response = await this.client.post(`/channels/${channelId}/messages`, payload);
    return response.data;
  }

  /**
   * Edit a message
   * @param {string} channelId - Channel ID
   * @param {string} messageId - Message ID
   * @param {Object} message - New message content
   * @returns {Promise<Object>} Updated message
   */
  async editMessage(channelId, messageId, message) {
    const payload = typeof message === 'string' ? { content: message } : message;
    const response = await this.client.patch(
      `/channels/${channelId}/messages/${messageId}`,
      payload
    );
    return response.data;
  }

  /**
   * Delete a message
   * @param {string} channelId - Channel ID
   * @param {string} messageId - Message ID
   * @returns {Promise<void>}
   */
  async deleteMessage(channelId, messageId) {
    await this.client.delete(`/channels/${channelId}/messages/${messageId}`);
  }

  /**
   * Get messages from a channel
   * @param {string} channelId - Channel ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Messages
   */
  async getMessages(channelId, params = {}) {
    const response = await this.client.get(`/channels/${channelId}/messages`, { params });
    return response.data;
  }

  // ==================== Channels ====================

  /**
   * Get channel info
   * @param {string} channelId - Channel ID
   * @returns {Promise<Object>} Channel info
   */
  async getChannel(channelId) {
    const response = await this.client.get(`/channels/${channelId}`);
    return response.data;
  }

  /**
   * Modify a channel
   * @param {string} channelId - Channel ID
   * @param {Object} data - Channel data
   * @returns {Promise<Object>} Updated channel
   */
  async modifyChannel(channelId, data) {
    const response = await this.client.patch(`/channels/${channelId}`, data);
    return response.data;
  }

  /**
   * Delete a channel
   * @param {string} channelId - Channel ID
   * @returns {Promise<Object>} Deleted channel
   */
  async deleteChannel(channelId) {
    const response = await this.client.delete(`/channels/${channelId}`);
    return response.data;
  }

  // ==================== Guilds (Servers) ====================

  /**
   * Get guild info
   * @param {string} guildId - Guild ID
   * @returns {Promise<Object>} Guild info
   */
  async getGuild(guildId) {
    const response = await this.client.get(`/guilds/${guildId}`);
    return response.data;
  }

  /**
   * Get guild channels
   * @param {string} guildId - Guild ID
   * @returns {Promise<Array>} List of channels
   */
  async getGuildChannels(guildId) {
    const response = await this.client.get(`/guilds/${guildId}/channels`);
    return response.data;
  }

  /**
   * Create a guild channel
   * @param {string} guildId - Guild ID
   * @param {Object} channelData - Channel data
   * @returns {Promise<Object>} Created channel
   */
  async createGuildChannel(guildId, channelData) {
    const response = await this.client.post(`/guilds/${guildId}/channels`, channelData);
    return response.data;
  }

  /**
   * Get guild members
   * @param {string} guildId - Guild ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of members
   */
  async getGuildMembers(guildId, params = {}) {
    const response = await this.client.get(`/guilds/${guildId}/members`, { params });
    return response.data;
  }

  /**
   * Get guild member
   * @param {string} guildId - Guild ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Member info
   */
  async getGuildMember(guildId, userId) {
    const response = await this.client.get(`/guilds/${guildId}/members/${userId}`);
    return response.data;
  }

  // ==================== Users ====================

  /**
   * Get current user
   * @returns {Promise<Object>} Current user info
   */
  async getCurrentUser() {
    const response = await this.client.get('/users/@me');
    return response.data;
  }

  /**
   * Get user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User info
   */
  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  /**
   * Get user guilds
   * @returns {Promise<Array>} List of guilds
   */
  async getCurrentUserGuilds() {
    const response = await this.client.get('/users/@me/guilds');
    return response.data;
  }

  // ==================== Reactions ====================

  /**
   * Add reaction to a message
   * @param {string} channelId - Channel ID
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji (URL encoded)
   * @returns {Promise<void>}
   */
  async addReaction(channelId, messageId, emoji) {
    await this.client.put(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`
    );
  }

  /**
   * Remove own reaction
   * @param {string} channelId - Channel ID
   * @param {string} messageId - Message ID
   * @param {string} emoji - Emoji
   * @returns {Promise<void>}
   */
  async removeReaction(channelId, messageId, emoji) {
    await this.client.delete(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`
    );
  }

  // ==================== Webhooks ====================

  /**
   * Execute a webhook
   * @param {string} webhookId - Webhook ID
   * @param {string} webhookToken - Webhook token
   * @param {Object} message - Message content
   * @returns {Promise<Object>} Message result
   */
  async executeWebhook(webhookId, webhookToken, message) {
    const response = await this.client.post(
      `/webhooks/${webhookId}/${webhookToken}`,
      message
    );
    return response.data;
  }

  // ==================== Embeds Builder ====================

  /**
   * Create an embed object
   * @param {Object} options - Embed options
   * @returns {Object} Embed object
   */
  createEmbed(options) {
    return {
      title: options.title,
      description: options.description,
      url: options.url,
      color: options.color || 0x5865F2,
      timestamp: options.timestamp || new Date().toISOString(),
      footer: options.footer,
      image: options.image,
      thumbnail: options.thumbnail,
      author: options.author,
      fields: options.fields || []
    };
  }
}

export const discordClient = new DiscordClient();
export default DiscordClient;
