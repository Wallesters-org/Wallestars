/**
 * Base Platform Adapter
 *
 * Abstract base class for platform-specific adapters.
 * All platform adapters should extend this class.
 */

class BasePlatformAdapter {
    constructor(config = {}) {
        this.platformName = config.platformName || 'Unknown';
        this.platformType = config.platformType || 'generic';
        this.registrationUrl = config.registrationUrl;
        this.apiEndpoint = config.apiEndpoint;
        this.capabilities = config.capabilities || [];

        // Browser automation client (Airtop, Puppeteer, etc.)
        this.browserClient = config.browserClient || null;

        // Credentials storage
        this.credentials = {};

        // Event callbacks
        this.onProgress = config.onProgress || (() => {});
        this.onError = config.onError || (() => {});
        this.onComplete = config.onComplete || (() => {});
    }

    /**
     * Initialize the adapter
     */
    async initialize() {
        throw new Error('initialize() must be implemented by subclass');
    }

    /**
     * Register a new account
     */
    async register(userData) {
        throw new Error('register() must be implemented by subclass');
    }

    /**
     * Complete email verification
     */
    async verifyEmail(verificationCode) {
        throw new Error('verifyEmail() must be implemented by subclass');
    }

    /**
     * Complete phone verification
     */
    async verifyPhone(verificationCode) {
        throw new Error('verifyPhone() must be implemented by subclass');
    }

    /**
     * Setup the platform after registration
     */
    async setup(setupConfig) {
        throw new Error('setup() must be implemented by subclass');
    }

    /**
     * Get API credentials
     */
    async getCredentials() {
        throw new Error('getCredentials() must be implemented by subclass');
    }

    /**
     * Test the integration
     */
    async testIntegration() {
        throw new Error('testIntegration() must be implemented by subclass');
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(this.apiEndpoint || this.registrationUrl, {
                method: 'HEAD',
                timeout: 10000
            });
            return {
                healthy: response.ok,
                status: response.status,
                latency: response.headers.get('x-response-time')
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }

    /**
     * Report progress
     */
    reportProgress(step, message, percentage) {
        this.onProgress({
            platform: this.platformName,
            step,
            message,
            percentage,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Report error
     */
    reportError(step, error) {
        this.onError({
            platform: this.platformName,
            step,
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Report completion
     */
    reportComplete(result) {
        this.onComplete({
            platform: this.platformName,
            result,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Wait for element in browser
     */
    async waitForElement(selector, timeout = 30000) {
        if (!this.browserClient) {
            throw new Error('Browser client not initialized');
        }
        // Implementation depends on browser client
        return this.browserClient.waitForSelector(selector, { timeout });
    }

    /**
     * Click element in browser
     */
    async clickElement(selector) {
        if (!this.browserClient) {
            throw new Error('Browser client not initialized');
        }
        return this.browserClient.click(selector);
    }

    /**
     * Fill form field
     */
    async fillField(selector, value) {
        if (!this.browserClient) {
            throw new Error('Browser client not initialized');
        }
        return this.browserClient.type(selector, value);
    }

    /**
     * Navigate to URL
     */
    async navigateTo(url) {
        if (!this.browserClient) {
            throw new Error('Browser client not initialized');
        }
        return this.browserClient.goto(url, { waitUntil: 'networkidle2' });
    }

    /**
     * Take screenshot
     */
    async takeScreenshot() {
        if (!this.browserClient) {
            throw new Error('Browser client not initialized');
        }
        return this.browserClient.screenshot({ encoding: 'base64' });
    }

    /**
     * Extract text from element
     */
    async extractText(selector) {
        if (!this.browserClient) {
            throw new Error('Browser client not initialized');
        }
        const element = await this.browserClient.$(selector);
        if (element) {
            return element.evaluate(el => el.textContent);
        }
        return null;
    }

    /**
     * Generate secure password
     */
    generatePassword(length = 16) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = BasePlatformAdapter;
