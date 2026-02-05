import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Notion API Client
 * Documentation and knowledge base platform
 *
 * @see https://developers.notion.com/reference
 */
class NotionClient {
  constructor() {
    this.baseURL = 'https://api.notion.com/v1';
    this.apiKey = process.env.NOTION_API_KEY;
    this.notionVersion = '2022-06-28';

    if (!this.apiKey) {
      console.warn('⚠️ NOTION_API_KEY not configured. Notion API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.notionVersion
      },
      timeout: parseInt(process.env.NOTION_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.message || error.message;
        console.error('Notion API Error:', errorMsg);
        throw new Error(`Notion API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiKey;
  }

  // ==================== Pages ====================

  /**
   * Get a page
   * @param {string} pageId - Page ID
   * @returns {Promise<Object>} Page object
   */
  async getPage(pageId) {
    const response = await this.client.get(`/pages/${pageId}`);
    return response.data;
  }

  /**
   * Create a page
   * @param {Object} pageData - Page data
   * @returns {Promise<Object>} Created page
   */
  async createPage(pageData) {
    const response = await this.client.post('/pages', pageData);
    return response.data;
  }

  /**
   * Update page properties
   * @param {string} pageId - Page ID
   * @param {Object} properties - Properties to update
   * @returns {Promise<Object>} Updated page
   */
  async updatePage(pageId, properties) {
    const response = await this.client.patch(`/pages/${pageId}`, { properties });
    return response.data;
  }

  /**
   * Archive a page
   * @param {string} pageId - Page ID
   * @returns {Promise<Object>} Archived page
   */
  async archivePage(pageId) {
    const response = await this.client.patch(`/pages/${pageId}`, { archived: true });
    return response.data;
  }

  // ==================== Databases ====================

  /**
   * Get a database
   * @param {string} databaseId - Database ID
   * @returns {Promise<Object>} Database object
   */
  async getDatabase(databaseId) {
    const response = await this.client.get(`/databases/${databaseId}`);
    return response.data;
  }

  /**
   * Query a database
   * @param {string} databaseId - Database ID
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} Query results
   */
  async queryDatabase(databaseId, query = {}) {
    const response = await this.client.post(`/databases/${databaseId}/query`, query);
    return response.data;
  }

  /**
   * Create a database
   * @param {Object} databaseData - Database data
   * @returns {Promise<Object>} Created database
   */
  async createDatabase(databaseData) {
    const response = await this.client.post('/databases', databaseData);
    return response.data;
  }

  /**
   * Update database
   * @param {string} databaseId - Database ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated database
   */
  async updateDatabase(databaseId, updates) {
    const response = await this.client.patch(`/databases/${databaseId}`, updates);
    return response.data;
  }

  // ==================== Blocks ====================

  /**
   * Get block children
   * @param {string} blockId - Block ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Block children
   */
  async getBlockChildren(blockId, params = {}) {
    const response = await this.client.get(`/blocks/${blockId}/children`, { params });
    return response.data;
  }

  /**
   * Append block children
   * @param {string} blockId - Block ID
   * @param {Array} children - Child blocks
   * @returns {Promise<Object>} Appended blocks
   */
  async appendBlockChildren(blockId, children) {
    const response = await this.client.patch(`/blocks/${blockId}/children`, { children });
    return response.data;
  }

  /**
   * Get a block
   * @param {string} blockId - Block ID
   * @returns {Promise<Object>} Block object
   */
  async getBlock(blockId) {
    const response = await this.client.get(`/blocks/${blockId}`);
    return response.data;
  }

  /**
   * Update a block
   * @param {string} blockId - Block ID
   * @param {Object} block - Block data
   * @returns {Promise<Object>} Updated block
   */
  async updateBlock(blockId, block) {
    const response = await this.client.patch(`/blocks/${blockId}`, block);
    return response.data;
  }

  /**
   * Delete a block
   * @param {string} blockId - Block ID
   * @returns {Promise<Object>} Deleted block
   */
  async deleteBlock(blockId) {
    const response = await this.client.delete(`/blocks/${blockId}`);
    return response.data;
  }

  // ==================== Search ====================

  /**
   * Search across workspace
   * @param {Object} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async search(query) {
    const response = await this.client.post('/search', query);
    return response.data;
  }

  // ==================== Users ====================

  /**
   * List all users
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of users
   */
  async listUsers(params = {}) {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  /**
   * Get a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  /**
   * Get bot user
   * @returns {Promise<Object>} Bot user object
   */
  async getMe() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  // ==================== Comments ====================

  /**
   * Get comments
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Comments
   */
  async getComments(params) {
    const response = await this.client.get('/comments', { params });
    return response.data;
  }

  /**
   * Create a comment
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} Created comment
   */
  async createComment(commentData) {
    const response = await this.client.post('/comments', commentData);
    return response.data;
  }

  // ==================== Helpers ====================

  /**
   * Create rich text array
   * @param {string} content - Text content
   * @param {Object} annotations - Text annotations
   * @returns {Array} Rich text array
   */
  createRichText(content, annotations = {}) {
    return [{
      type: 'text',
      text: { content },
      annotations: {
        bold: annotations.bold || false,
        italic: annotations.italic || false,
        strikethrough: annotations.strikethrough || false,
        underline: annotations.underline || false,
        code: annotations.code || false,
        color: annotations.color || 'default'
      }
    }];
  }

  /**
   * Create a paragraph block
   * @param {string} text - Paragraph text
   * @returns {Object} Paragraph block
   */
  createParagraph(text) {
    return {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: this.createRichText(text)
      }
    };
  }

  /**
   * Create a heading block
   * @param {string} text - Heading text
   * @param {number} level - Heading level (1, 2, or 3)
   * @returns {Object} Heading block
   */
  createHeading(text, level = 1) {
    const type = `heading_${level}`;
    return {
      object: 'block',
      type,
      [type]: {
        rich_text: this.createRichText(text)
      }
    };
  }
}

export const notionClient = new NotionClient();
export default NotionClient;
