import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Twilio API Client
 * SMS, voice, and communication platform
 *
 * @see https://www.twilio.com/docs/api
 */
class TwilioClient {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.baseURL = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;

    if (!this.accountSid || !this.authToken) {
      console.warn('⚠️ TWILIO credentials not configured. Twilio API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.accountSid,
        password: this.authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: parseInt(process.env.TWILIO_API_TIMEOUT || '30000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.message || error.message;
        console.error('Twilio API Error:', errorMsg);
        throw new Error(`Twilio API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!(this.accountSid && this.authToken);
  }

  /**
   * Convert object to URL encoded form data
   * @param {Object} data - Data object
   * @returns {string} URL encoded string
   */
  toFormData(data) {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  // ==================== Messages (SMS) ====================

  /**
   * Send an SMS message
   * @param {string} to - Recipient phone number
   * @param {string} body - Message body
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Message result
   */
  async sendSMS(to, body, options = {}) {
    const data = {
      To: to,
      From: options.from || this.phoneNumber,
      Body: body,
      ...options
    };

    const response = await this.client.post('/Messages.json', this.toFormData(data));
    return response.data;
  }

  /**
   * Get message details
   * @param {string} messageSid - Message SID
   * @returns {Promise<Object>} Message details
   */
  async getMessage(messageSid) {
    const response = await this.client.get(`/Messages/${messageSid}.json`);
    return response.data;
  }

  /**
   * List messages
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of messages
   */
  async listMessages(params = {}) {
    const response = await this.client.get('/Messages.json', { params });
    return response.data;
  }

  /**
   * Delete a message
   * @param {string} messageSid - Message SID
   * @returns {Promise<void>}
   */
  async deleteMessage(messageSid) {
    await this.client.delete(`/Messages/${messageSid}.json`);
  }

  // ==================== Calls (Voice) ====================

  /**
   * Make a phone call
   * @param {string} to - Recipient phone number
   * @param {string} url - TwiML URL
   * @param {Object} options - Call options
   * @returns {Promise<Object>} Call result
   */
  async makeCall(to, url, options = {}) {
    const data = {
      To: to,
      From: options.from || this.phoneNumber,
      Url: url,
      ...options
    };

    const response = await this.client.post('/Calls.json', this.toFormData(data));
    return response.data;
  }

  /**
   * Get call details
   * @param {string} callSid - Call SID
   * @returns {Promise<Object>} Call details
   */
  async getCall(callSid) {
    const response = await this.client.get(`/Calls/${callSid}.json`);
    return response.data;
  }

  /**
   * List calls
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of calls
   */
  async listCalls(params = {}) {
    const response = await this.client.get('/Calls.json', { params });
    return response.data;
  }

  /**
   * Update a call (e.g., to hang up)
   * @param {string} callSid - Call SID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated call
   */
  async updateCall(callSid, updates) {
    const response = await this.client.post(`/Calls/${callSid}.json`, this.toFormData(updates));
    return response.data;
  }

  // ==================== Phone Numbers ====================

  /**
   * List phone numbers
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of phone numbers
   */
  async listPhoneNumbers(params = {}) {
    const response = await this.client.get('/IncomingPhoneNumbers.json', { params });
    return response.data;
  }

  /**
   * Get phone number details
   * @param {string} phoneNumberSid - Phone number SID
   * @returns {Promise<Object>} Phone number details
   */
  async getPhoneNumber(phoneNumberSid) {
    const response = await this.client.get(`/IncomingPhoneNumbers/${phoneNumberSid}.json`);
    return response.data;
  }

  /**
   * Search available phone numbers
   * @param {string} countryCode - Country code (e.g., 'US')
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Available phone numbers
   */
  async searchAvailableNumbers(countryCode, params = {}) {
    const response = await this.client.get(
      `/AvailablePhoneNumbers/${countryCode}/Local.json`,
      { params }
    );
    return response.data;
  }

  // ==================== Recordings ====================

  /**
   * List recordings
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of recordings
   */
  async listRecordings(params = {}) {
    const response = await this.client.get('/Recordings.json', { params });
    return response.data;
  }

  /**
   * Get recording
   * @param {string} recordingSid - Recording SID
   * @returns {Promise<Object>} Recording details
   */
  async getRecording(recordingSid) {
    const response = await this.client.get(`/Recordings/${recordingSid}.json`);
    return response.data;
  }

  /**
   * Delete a recording
   * @param {string} recordingSid - Recording SID
   * @returns {Promise<void>}
   */
  async deleteRecording(recordingSid) {
    await this.client.delete(`/Recordings/${recordingSid}.json`);
  }

  // ==================== Account ====================

  /**
   * Get account info
   * @returns {Promise<Object>} Account details
   */
  async getAccount() {
    const response = await this.client.get('.json');
    return response.data;
  }

  /**
   * Get usage records
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Usage records
   */
  async getUsage(params = {}) {
    const response = await this.client.get('/Usage/Records.json', { params });
    return response.data;
  }

  // ==================== Verify (2FA) ====================

  /**
   * Send verification code
   * @param {string} to - Phone number
   * @param {string} channel - Channel (sms, call)
   * @returns {Promise<Object>} Verification result
   */
  async sendVerification(to, channel = 'sms') {
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!verifyServiceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID not configured');
    }

    const verifyClient = axios.create({
      baseURL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}`,
      auth: {
        username: this.accountSid,
        password: this.authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const response = await verifyClient.post('/Verifications', this.toFormData({
      To: to,
      Channel: channel
    }));
    return response.data;
  }

  /**
   * Check verification code
   * @param {string} to - Phone number
   * @param {string} code - Verification code
   * @returns {Promise<Object>} Check result
   */
  async checkVerification(to, code) {
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!verifyServiceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID not configured');
    }

    const verifyClient = axios.create({
      baseURL: `https://verify.twilio.com/v2/Services/${verifyServiceSid}`,
      auth: {
        username: this.accountSid,
        password: this.authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const response = await verifyClient.post('/VerificationCheck', this.toFormData({
      To: to,
      Code: code
    }));
    return response.data;
  }
}

export const twilioClient = new TwilioClient();
export default TwilioClient;
