import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Hostinger API Client
 * Provides methods to interact with Hostinger's RESTful API
 * for managing VPS, billing, subscriptions, and payments
 * 
 * @see https://developers.hostinger.com/
 */
class HostingerClient {
  constructor() {
    this.baseURL = process.env.HOSTINGER_API_BASE_URL || 'https://api.hostinger.com';
    this.apiToken = process.env.HOSTINGER_API_TOKEN;
    
    if (!this.apiToken) {
      console.warn('⚠️ HOSTINGER_API_TOKEN not configured. Hostinger API features will be disabled.');
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: parseInt(process.env.HOSTINGER_API_TIMEOUT || '30000', 10) // Configurable timeout
    });
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.message || error.message;
        console.error('Hostinger API Error:', errorMsg);
        throw new Error(`Hostinger API Error: ${errorMsg}`);
      }
    );
  }
  
  /**
   * Check if the API client is properly configured
   */
  isConfigured() {
    return !!this.apiToken;
  }
  
  // ==================== VPS Management ====================
  
  /**
   * List all VPS instances
   * @returns {Promise<Array>} List of VPS instances
   */
  async listVPS() {
    const response = await this.client.get('/api/vps/v1/instances');
    return response.data;
  }
  
  /**
   * Get VPS instance details
   * @param {string} instanceId - VPS instance ID
   * @returns {Promise<Object>} VPS instance details
   */
  async getVPSDetails(instanceId) {
    const response = await this.client.get(`/api/vps/v1/instances/${instanceId}`);
    return response.data;
  }
  
  /**
   * Get VPS instance metrics
   * @param {string} instanceId - VPS instance ID
   * @returns {Promise<Object>} VPS metrics (CPU, RAM, disk usage)
   */
  async getVPSMetrics(instanceId) {
    const response = await this.client.get(`/api/vps/v1/instances/${instanceId}/metrics`);
    return response.data;
  }
  
  /**
   * Restart VPS instance
   * @param {string} instanceId - VPS instance ID
   * @returns {Promise<Object>} Operation result
   */
  async restartVPS(instanceId) {
    const response = await this.client.post(`/api/vps/v1/instances/${instanceId}/restart`);
    return response.data;
  }
  
  // ==================== Billing & Subscriptions ====================
  
  /**
   * List all subscriptions
   * @returns {Promise<Array>} List of active subscriptions
   */
  async listSubscriptions() {
    const response = await this.client.get('/api/billing/v1/subscriptions');
    return response.data;
  }
  
  /**
   * Get subscription details
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Subscription details
   */
  async getSubscription(subscriptionId) {
    const response = await this.client.get(`/api/billing/v1/subscriptions/${subscriptionId}`);
    return response.data;
  }
  
  /**
   * Renew a subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} options - Renewal options (period, etc.)
   * @returns {Promise<Object>} Renewal result
   */
  async renewSubscription(subscriptionId, options = {}) {
    const response = await this.client.post(`/api/billing/v1/subscriptions/${subscriptionId}/renew`, options);
    return response.data;
  }
  
  /**
   * Cancel a subscription
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSubscription(subscriptionId) {
    const response = await this.client.post(`/api/billing/v1/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  }
  
  // ==================== Payment Methods ====================
  
  /**
   * List payment methods
   * @returns {Promise<Array>} List of saved payment methods
   */
  async listPaymentMethods() {
    const response = await this.client.get('/api/billing/v1/payment-methods');
    return response.data;
  }
  
  /**
   * Get payment method details
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Payment method details
   */
  async getPaymentMethod(paymentMethodId) {
    const response = await this.client.get(`/api/billing/v1/payment-methods/${paymentMethodId}`);
    return response.data;
  }
  
  /**
   * Add a new payment method
   * @param {Object} paymentData - Payment method data
   * @returns {Promise<Object>} Created payment method
   */
  async addPaymentMethod(paymentData) {
    const response = await this.client.post('/api/billing/v1/payment-methods', paymentData);
    return response.data;
  }
  
  /**
   * Remove a payment method
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Deletion result
   */
  async removePaymentMethod(paymentMethodId) {
    const response = await this.client.delete(`/api/billing/v1/payment-methods/${paymentMethodId}`);
    return response.data;
  }
  
  // ==================== Invoices & Orders ====================
  
  /**
   * List invoices
   * @param {Object} params - Query parameters (limit, offset, etc.)
   * @returns {Promise<Array>} List of invoices
   */
  async listInvoices(params = {}) {
    const response = await this.client.get('/api/billing/v1/invoices', { params });
    return response.data;
  }
  
  /**
   * Get invoice details
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  async getInvoice(invoiceId) {
    const response = await this.client.get(`/api/billing/v1/invoices/${invoiceId}`);
    return response.data;
  }
  
  /**
   * Download invoice PDF
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Buffer>} Invoice PDF as buffer
   */
  async downloadInvoice(invoiceId) {
    const response = await this.client.get(`/api/billing/v1/invoices/${invoiceId}/download`, {
      responseType: 'arraybuffer'
    });
    return response.data;
  }
  
  /**
   * List orders
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of orders
   */
  async listOrders(params = {}) {
    const response = await this.client.get('/api/billing/v1/orders', { params });
    return response.data;
  }
  
  /**
   * Get order details
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(orderId) {
    const response = await this.client.get(`/api/billing/v1/orders/${orderId}`);
    return response.data;
  }
  
  // ==================== Account Information ====================
  
  /**
   * Get account balance
   * @returns {Promise<Object>} Account balance information
   */
  async getAccountBalance() {
    const response = await this.client.get('/api/billing/v1/balance');
    return response.data;
  }
  
  /**
   * Get account information
   * @returns {Promise<Object>} Account details
   */
  async getAccountInfo() {
    const response = await this.client.get('/api/account/v1/info');
    return response.data;
  }
}

// Export singleton instance
export const hostingerClient = new HostingerClient();
export default HostingerClient;
