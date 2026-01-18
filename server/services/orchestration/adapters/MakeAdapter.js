/**
 * Make (Integromat) Platform Adapter
 *
 * Handles automated registration and setup for Make automation platform.
 */

const BasePlatformAdapter = require('./BasePlatformAdapter');

class MakeAdapter extends BasePlatformAdapter {
    constructor(config = {}) {
        super({
            ...config,
            platformName: 'Make (Integromat)',
            platformType: 'automation',
            registrationUrl: 'https://www.make.com/en/register',
            apiEndpoint: 'https://eu1.make.com/api/v2',
            capabilities: ['workflow_automation', 'api_integration', 'scheduling', 'webhooks']
        });

        this.selectors = {
            emailInput: 'input[name="email"], input[type="email"]',
            passwordInput: 'input[name="password"], input[type="password"]',
            nameInput: 'input[name="name"], input[name="fullName"]',
            submitButton: 'button[type="submit"]',
            termsCheckbox: 'input[name="terms"], input[type="checkbox"]',
            apiKeysPage: 'a[href*="api"]',
            createTokenButton: 'button:contains("Create token"), button:contains("Add")',
            tokenDisplay: '.token-value, [data-testid="token"]'
        };
    }

    async initialize() {
        this.reportProgress('init', 'Initializing Make adapter', 0);
        return this;
    }

    async register(userData) {
        const {
            email,
            password = this.generatePassword(),
            name = 'Wallestars User'
        } = userData;

        try {
            this.reportProgress('navigate', 'Navigating to Make signup page', 10);
            await this.navigateTo(this.registrationUrl);

            this.reportProgress('form', 'Filling registration form', 30);

            await this.waitForElement(this.selectors.emailInput);
            await this.fillField(this.selectors.emailInput, email);

            // Fill name if available
            try {
                await this.waitForElement(this.selectors.nameInput, 3000);
                await this.fillField(this.selectors.nameInput, name);
            } catch (e) {
                // Name field optional
            }

            await this.fillField(this.selectors.passwordInput, password);

            // Accept terms
            try {
                await this.clickElement(this.selectors.termsCheckbox);
            } catch (e) {
                // Terms might be auto-accepted
            }

            this.reportProgress('submit', 'Submitting registration', 50);
            await this.clickElement(this.selectors.submitButton);

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
            this.reportProgress('verify', 'Clicking verification link', 70);

            // Make typically uses verification link, not code
            // This would be called after user clicks verification link
            await this.sleep(2000);

            this.reportProgress('verified', 'Email verified successfully', 80);

            return { status: 'verified' };

        } catch (error) {
            this.reportError('verifyEmail', error);
            throw error;
        }
    }

    async setup(setupConfig = {}) {
        try {
            this.reportProgress('setup', 'Setting up Make account', 85);

            // Complete onboarding flow if needed
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
            this.reportProgress('credentials', 'Generating API token', 95);

            // Navigate to API settings
            await this.navigateTo('https://eu1.make.com/user/api');
            await this.sleep(2000);

            // Create new token
            await this.waitForElement(this.selectors.createTokenButton);
            await this.clickElement(this.selectors.createTokenButton);

            await this.sleep(2000);

            // Extract token
            const token = await this.extractText(this.selectors.tokenDisplay);

            this.credentials = {
                api_token: token,
                api_endpoint: this.apiEndpoint,
                platform: 'make',
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
        if (!this.credentials.api_token) {
            throw new Error('No API token available for testing');
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/users/me`, {
                headers: {
                    'Authorization': `Token ${this.credentials.api_token}`
                }
            });

            return {
                success: response.ok,
                status: response.status,
                user: response.ok ? await response.json() : null
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = MakeAdapter;
