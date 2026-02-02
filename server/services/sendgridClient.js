import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * SendGrid API Client
 * Email delivery and marketing platform
 *
 * @see https://docs.sendgrid.com/api-reference
 */
class SendGridClient {
  constructor() {
    this.baseURL = 'https://api.sendgrid.com/v3';
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL;
    this.fromName = process.env.SENDGRID_FROM_NAME;

    if (!this.apiKey) {
      console.warn('⚠️ SENDGRID_API_KEY not configured. SendGrid API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.SENDGRID_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
        console.error('SendGrid API Error:', errorMsg);
        throw new Error(`SendGrid API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiKey;
  }

  // ==================== Mail Send ====================

  /**
   * Send an email
   * @param {Object} emailData - Email data
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(emailData) {
    const payload = {
      personalizations: [{
        to: Array.isArray(emailData.to)
          ? emailData.to.map(e => typeof e === 'string' ? { email: e } : e)
          : [{ email: emailData.to }],
        cc: emailData.cc?.map(e => typeof e === 'string' ? { email: e } : e),
        bcc: emailData.bcc?.map(e => typeof e === 'string' ? { email: e } : e),
        subject: emailData.subject,
        dynamic_template_data: emailData.templateData
      }],
      from: {
        email: emailData.from || this.fromEmail,
        name: emailData.fromName || this.fromName
      },
      reply_to: emailData.replyTo ? { email: emailData.replyTo } : undefined,
      subject: emailData.subject,
      content: emailData.html
        ? [{ type: 'text/html', value: emailData.html }]
        : emailData.text
          ? [{ type: 'text/plain', value: emailData.text }]
          : undefined,
      template_id: emailData.templateId,
      attachments: emailData.attachments
    };

    const response = await this.client.post('/mail/send', payload);
    return { success: true, statusCode: response.status };
  }

  /**
   * Send a simple email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML or text)
   * @param {boolean} isHtml - Whether body is HTML
   * @returns {Promise<Object>} Send result
   */
  async send(to, subject, body, isHtml = true) {
    return this.sendEmail({
      to,
      subject,
      [isHtml ? 'html' : 'text']: body
    });
  }

  /**
   * Send using a template
   * @param {string} to - Recipient email
   * @param {string} templateId - SendGrid template ID
   * @param {Object} templateData - Template variables
   * @returns {Promise<Object>} Send result
   */
  async sendTemplate(to, templateId, templateData = {}) {
    return this.sendEmail({
      to,
      templateId,
      templateData
    });
  }

  // ==================== Contacts ====================

  /**
   * Add or update contacts
   * @param {Array} contacts - Contact objects
   * @returns {Promise<Object>} Result
   */
  async upsertContacts(contacts) {
    const response = await this.client.put('/marketing/contacts', { contacts });
    return response.data;
  }

  /**
   * Search contacts
   * @param {string} query - SGQL query
   * @returns {Promise<Object>} Search results
   */
  async searchContacts(query) {
    const response = await this.client.post('/marketing/contacts/search', { query });
    return response.data;
  }

  /**
   * Get contact by ID
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>} Contact data
   */
  async getContact(contactId) {
    const response = await this.client.get(`/marketing/contacts/${contactId}`);
    return response.data;
  }

  /**
   * Delete contacts
   * @param {Array} ids - Contact IDs to delete
   * @returns {Promise<Object>} Result
   */
  async deleteContacts(ids) {
    const response = await this.client.delete('/marketing/contacts', {
      params: { ids: ids.join(',') }
    });
    return response.data;
  }

  /**
   * Get contact count
   * @returns {Promise<Object>} Contact count
   */
  async getContactCount() {
    const response = await this.client.get('/marketing/contacts/count');
    return response.data;
  }

  // ==================== Lists ====================

  /**
   * Get all lists
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Lists
   */
  async getLists(params = {}) {
    const response = await this.client.get('/marketing/lists', { params });
    return response.data;
  }

  /**
   * Create a list
   * @param {string} name - List name
   * @returns {Promise<Object>} Created list
   */
  async createList(name) {
    const response = await this.client.post('/marketing/lists', { name });
    return response.data;
  }

  /**
   * Delete a list
   * @param {string} listId - List ID
   * @returns {Promise<void>}
   */
  async deleteList(listId) {
    await this.client.delete(`/marketing/lists/${listId}`);
  }

  /**
   * Add contacts to list
   * @param {string} listId - List ID
   * @param {Array} contactIds - Contact IDs
   * @returns {Promise<Object>} Result
   */
  async addContactsToList(listId, contactIds) {
    const response = await this.client.put(`/marketing/lists/${listId}/contacts`, {
      contact_ids: contactIds
    });
    return response.data;
  }

  // ==================== Templates ====================

  /**
   * Get all templates
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Templates
   */
  async getTemplates(params = {}) {
    const response = await this.client.get('/templates', {
      params: { generations: 'dynamic', ...params }
    });
    return response.data;
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template
   */
  async getTemplate(templateId) {
    const response = await this.client.get(`/templates/${templateId}`);
    return response.data;
  }

  /**
   * Create a template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    const response = await this.client.post('/templates', {
      name: templateData.name,
      generation: 'dynamic'
    });
    return response.data;
  }

  // ==================== Stats ====================

  /**
   * Get global stats
   * @param {Object} params - Query parameters (start_date, end_date)
   * @returns {Promise<Object>} Stats
   */
  async getStats(params) {
    const response = await this.client.get('/stats', { params });
    return response.data;
  }

  /**
   * Get category stats
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Category stats
   */
  async getCategoryStats(params) {
    const response = await this.client.get('/categories/stats', { params });
    return response.data;
  }

  // ==================== Suppressions ====================

  /**
   * Get global suppressions (unsubscribes)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Suppressions
   */
  async getSuppressions(params = {}) {
    const response = await this.client.get('/suppression/unsubscribes', { params });
    return response.data;
  }

  /**
   * Add to suppression list
   * @param {Array} emails - Email addresses
   * @returns {Promise<Object>} Result
   */
  async addSuppressions(emails) {
    const response = await this.client.post('/asm/suppressions/global', {
      recipient_emails: emails
    });
    return response.data;
  }

  /**
   * Get bounces
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Bounces
   */
  async getBounces(params = {}) {
    const response = await this.client.get('/suppression/bounces', { params });
    return response.data;
  }

  /**
   * Get spam reports
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Spam reports
   */
  async getSpamReports(params = {}) {
    const response = await this.client.get('/suppression/spam_reports', { params });
    return response.data;
  }
}

export const sendgridClient = new SendGridClient();
export default SendGridClient;
