/**
 * Platform Adapters Index
 *
 * Factory for creating platform-specific adapters.
 */

// Platform configurations for commonly used platforms
export const platformConfigs = {
    'OpenAI': {
        type: 'ai_agent',
        registrationUrl: 'https://platform.openai.com/signup',
        apiEndpoint: 'https://api.openai.com/v1',
        trialDays: 90,
        requiresCreditCard: false,
        capabilities: ['code_generation', 'chat', 'embeddings', 'vision']
    },
    'Anthropic Claude': {
        type: 'ai_agent',
        registrationUrl: 'https://console.anthropic.com/signup',
        apiEndpoint: 'https://api.anthropic.com/v1',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['code_generation', 'chat', 'vision', 'tool_use']
    },
    'Google AI Studio': {
        type: 'ai_agent',
        registrationUrl: 'https://aistudio.google.com/',
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['code_generation', 'chat', 'multimodal']
    },
    'Mistral AI': {
        type: 'ai_agent',
        registrationUrl: 'https://console.mistral.ai/signup',
        apiEndpoint: 'https://api.mistral.ai/v1',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['code_generation', 'chat', 'embeddings']
    },
    'Cohere': {
        type: 'ai_agent',
        registrationUrl: 'https://dashboard.cohere.com/signup',
        apiEndpoint: 'https://api.cohere.ai/v1',
        trialDays: 30,
        requiresCreditCard: false,
        capabilities: ['embeddings', 'rerank', 'chat']
    },
    'Groq': {
        type: 'ai_agent',
        registrationUrl: 'https://console.groq.com/signup',
        apiEndpoint: 'https://api.groq.com/openai/v1',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['chat', 'fast_inference']
    },
    'Perplexity': {
        type: 'ai_agent',
        registrationUrl: 'https://www.perplexity.ai/settings/api',
        apiEndpoint: 'https://api.perplexity.ai',
        trialDays: 0,
        requiresCreditCard: true,
        capabilities: ['chat', 'search', 'citations']
    },
    'Make (Integromat)': {
        type: 'automation',
        registrationUrl: 'https://www.make.com/en/register',
        apiEndpoint: 'https://eu1.make.com/api/v2',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['workflow_automation', 'api_integration', 'scheduling']
    },
    'Zapier': {
        type: 'automation',
        registrationUrl: 'https://zapier.com/sign-up',
        apiEndpoint: 'https://api.zapier.com/v1',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['workflow_automation', 'api_integration', 'triggers']
    },
    'N8n Cloud': {
        type: 'automation',
        registrationUrl: 'https://app.n8n.cloud/register',
        apiEndpoint: 'https://app.n8n.cloud/api/v1',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['workflow_automation', 'self_hosted', 'api_integration']
    },
    'Pipedream': {
        type: 'automation',
        registrationUrl: 'https://pipedream.com/auth/signup',
        apiEndpoint: 'https://api.pipedream.com/v1',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['workflow_automation', 'code_execution', 'api_integration']
    },
    'Supabase': {
        type: 'cloud',
        registrationUrl: 'https://supabase.com/dashboard/sign-up',
        apiEndpoint: 'https://api.supabase.com',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['database', 'auth', 'storage', 'realtime', 'edge_functions']
    },
    'Vercel': {
        type: 'cloud',
        registrationUrl: 'https://vercel.com/signup',
        apiEndpoint: 'https://api.vercel.com',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['hosting', 'serverless', 'edge_functions', 'ci_cd']
    },
    'Railway': {
        type: 'cloud',
        registrationUrl: 'https://railway.app/login',
        apiEndpoint: 'https://backboard.railway.app/graphql/v2',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['hosting', 'database', 'containers']
    },
    'Render': {
        type: 'cloud',
        registrationUrl: 'https://dashboard.render.com/register',
        apiEndpoint: 'https://api.render.com/v1',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['hosting', 'database', 'containers']
    },
    'Netlify': {
        type: 'cloud',
        registrationUrl: 'https://app.netlify.com/signup',
        apiEndpoint: 'https://api.netlify.com/api/v1',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['hosting', 'serverless', 'forms', 'ci_cd']
    },
    'Airtable': {
        type: 'dev_tools',
        registrationUrl: 'https://airtable.com/signup',
        apiEndpoint: 'https://api.airtable.com/v0',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['database', 'api_access', 'automation']
    },
    'Notion': {
        type: 'dev_tools',
        registrationUrl: 'https://www.notion.so/signup',
        apiEndpoint: 'https://api.notion.com/v1',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['documentation', 'database', 'api_access']
    },
    'Linear': {
        type: 'dev_tools',
        registrationUrl: 'https://linear.app/signup',
        apiEndpoint: 'https://api.linear.app/graphql',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['project_management', 'api_access', 'integrations']
    },
    'Slack': {
        type: 'communication',
        registrationUrl: 'https://slack.com/get-started',
        apiEndpoint: 'https://slack.com/api',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['messaging', 'bots', 'webhooks']
    },
    'Discord': {
        type: 'communication',
        registrationUrl: 'https://discord.com/register',
        apiEndpoint: 'https://discord.com/api/v10',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['messaging', 'bots', 'webhooks']
    },
    'Browserless': {
        type: 'automation',
        registrationUrl: 'https://www.browserless.io/sign-up',
        apiEndpoint: 'https://chrome.browserless.io',
        trialDays: 7,
        requiresCreditCard: false,
        capabilities: ['browser_automation', 'screenshots', 'pdf_generation']
    },
    'Airtop': {
        type: 'automation',
        registrationUrl: 'https://www.airtop.ai/signup',
        apiEndpoint: 'https://api.airtop.ai/v1',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['browser_automation', 'web_scraping', 'form_filling']
    },
    'Twilio': {
        type: 'communication',
        registrationUrl: 'https://www.twilio.com/try-twilio',
        apiEndpoint: 'https://api.twilio.com/2010-04-01',
        trialDays: 15,
        requiresCreditCard: false,
        capabilities: ['sms', 'voice', 'video']
    },
    'SendGrid': {
        type: 'communication',
        registrationUrl: 'https://signup.sendgrid.com/',
        apiEndpoint: 'https://api.sendgrid.com/v3',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['email', 'templates', 'analytics']
    },
    'GitHub': {
        type: 'dev_tools',
        registrationUrl: 'https://github.com/signup',
        apiEndpoint: 'https://api.github.com',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['git_hosting', 'ci_cd', 'actions', 'copilot']
    },
    'GitLab': {
        type: 'dev_tools',
        registrationUrl: 'https://gitlab.com/users/sign_up',
        apiEndpoint: 'https://gitlab.com/api/v4',
        trialDays: 30,
        requiresCreditCard: false,
        capabilities: ['git_hosting', 'ci_cd', 'devops']
    },
    'Resend': {
        type: 'communication',
        registrationUrl: 'https://resend.com/signup',
        apiEndpoint: 'https://api.resend.com',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['email', 'templates', 'react_email']
    },
    'Upstash': {
        type: 'cloud',
        registrationUrl: 'https://console.upstash.com/login',
        apiEndpoint: 'https://api.upstash.com',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['redis', 'kafka', 'qstash', 'vector']
    },
    'Neon': {
        type: 'cloud',
        registrationUrl: 'https://console.neon.tech/signup',
        apiEndpoint: 'https://console.neon.tech/api/v2',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['postgres', 'branching', 'serverless']
    },
    'PlanetScale': {
        type: 'cloud',
        registrationUrl: 'https://auth.planetscale.com/sign-up',
        apiEndpoint: 'https://api.planetscale.com/v1',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['mysql', 'branching', 'serverless']
    }
};

/**
 * Get platform configuration
 */
export function getPlatformConfig(platformName) {
    return platformConfigs[platformName] || null;
}

/**
 * Get all platform configurations
 */
export function getAllPlatformConfigs() {
    return platformConfigs;
}

/**
 * Get platforms by type
 */
export function getPlatformsByType(type) {
    return Object.entries(platformConfigs)
        .filter(([_, config]) => config.type === type)
        .map(([name, config]) => ({ name, ...config }));
}

/**
 * Get all platform types
 */
export function getPlatformTypes() {
    return [...new Set(Object.values(platformConfigs).map(c => c.type))];
}

/**
 * Search platforms by capability
 */
export function getPlatformsByCapability(capability) {
    return Object.entries(platformConfigs)
        .filter(([_, config]) => config.capabilities.includes(capability))
        .map(([name, config]) => ({ name, ...config }));
}

/**
 * Get platforms without credit card requirement
 */
export function getFreePlatforms() {
    return Object.entries(platformConfigs)
        .filter(([_, config]) => !config.requiresCreditCard)
        .map(([name, config]) => ({ name, ...config }));
}
