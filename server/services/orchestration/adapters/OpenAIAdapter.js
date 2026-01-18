/**
 * OpenAI Platform Adapter
 *
 * Handles automated registration and setup for OpenAI platform.
 */

const BasePlatformAdapter = require('./BasePlatformAdapter');

class OpenAIAdapter extends BasePlatformAdapter {
    constructor(config = {}) {
        super({
            ...config,
            platformName: 'OpenAI',
            platformType: 'ai_agent',
            registrationUrl: 'https://platform.openai.com/signup',
            apiEndpoint: 'https://api.openai.com/v1',
            capabilities: ['code_generation', 'chat', 'api_access', 'embeddings', 'fine_tuning', 'vision']
        });

        this.selectors = {
            signupButton: '[data-testid="signup-button"], a[href*="signup"]',
            emailInput: 'input[name="email"], input[type="email"]',
            passwordInput: 'input[name="password"], input[type="password"]',
            submitButton: 'button[type="submit"]',
            verificationCodeInput: 'input[name="code"], input[placeholder*="code"]',
            apiKeyPage: 'a[href*="api-keys"]',
            createKeyButton: 'button:contains("Create new secret key")',
            apiKeyDisplay: '[data-testid="api-key"], .api-key'
        };
    }

    async initialize() {
        this.reportProgress('init', 'Initializing OpenAI adapter', 0);
        // Additional initialization if needed
        return this;
    }

    async register(userData) {
        const { email, password = this.generatePassword() } = userData;

        try {
            this.reportProgress('navigate', 'Navigating to OpenAI signup page', 10);
            await this.navigateTo(this.registrationUrl);

            this.reportProgress('form', 'Filling registration form', 30);
            await this.waitForElement(this.selectors.emailInput);
            await this.fillField(this.selectors.emailInput, email);

            // Check if password field exists (might use magic link)
            try {
                await this.waitForElement(this.selectors.passwordInput, 5000);
                await this.fillField(this.selectors.passwordInput, password);
            } catch (e) {
                // Password field might not exist for magic link flow
            }

            this.reportProgress('submit', 'Submitting registration', 50);
            await this.clickElement(this.selectors.submitButton);

            // Wait for verification page or dashboard
            await this.sleep(3000);

            this.reportProgress('verify', 'Awaiting email verification', 60);

            return {
                status: 'awaiting_verification',
                email,
                password,
                verificationType: 'email',
                registrationUrl: this.registrationUrl
            };

        } catch (error) {
            this.reportError('register', error);
            throw error;
        }
    }

    async verifyEmail(verificationCode) {
        try {
            this.reportProgress('verify', 'Entering verification code', 70);

            await this.waitForElement(this.selectors.verificationCodeInput);
            await this.fillField(this.selectors.verificationCodeInput, verificationCode);
            await this.clickElement(this.selectors.submitButton);

            await this.sleep(3000);

            this.reportProgress('verified', 'Email verified successfully', 80);

            return { status: 'verified' };

        } catch (error) {
            this.reportError('verifyEmail', error);
            throw error;
        }
    }

    async setup(setupConfig = {}) {
        try {
            this.reportProgress('setup', 'Setting up OpenAI account', 85);

            // Navigate to API keys page
            await this.navigateTo('https://platform.openai.com/api-keys');
            await this.sleep(2000);

            this.reportProgress('setup', 'Account setup complete', 90);

            return { status: 'setup_complete' };

        } catch (error) {
            this.reportError('setup', error);
            throw error;
        }
    }

    async getCredentials() {
        try {
            this.reportProgress('credentials', 'Generating API key', 95);

            // Navigate to API keys page
            await this.navigateTo('https://platform.openai.com/api-keys');
            await this.sleep(2000);

            // Click create new key button
            await this.waitForElement(this.selectors.createKeyButton);
            await this.clickElement(this.selectors.createKeyButton);

            await this.sleep(2000);

            // Extract API key
            const apiKeyElement = await this.waitForElement(this.selectors.apiKeyDisplay);
            const apiKey = await this.extractText(this.selectors.apiKeyDisplay);

            this.credentials = {
                api_key: apiKey,
                platform: 'openai',
                created_at: new Date().toISOString()
            };

            this.reportComplete(this.credentials);

            return this.credentials;

        } catch (error) {
            this.reportError('getCredentials', error);
            throw error;
        }
    }

    async testIntegration() {
        if (!this.credentials.api_key) {
            throw new Error('No API key available for testing');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.credentials.api_key}`
                }
            });

            return {
                success: response.ok,
                status: response.status,
                models: response.ok ? (await response.json()).data : null
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = OpenAIAdapter;
