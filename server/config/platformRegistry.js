/**
 * AI Agents Orchestration Farm - Platform Registry
 *
 * Configuration for all supported free trial platforms with automation details
 */

const PLATFORM_CATEGORIES = {
  AI_ASSISTANT: 'AI Assistant',
  AI_DEVELOPMENT: 'AI Development',
  AUTOMATION: 'Automation',
  DATABASE: 'Database/Backend',
  DEPLOYMENT: 'Deployment',
  COMMUNICATION: 'Communication',
  PRODUCTIVITY: 'Productivity',
  PROJECT_MANAGEMENT: 'Project Management',
  MONITORING: 'Monitoring',
  SECURITY: 'Security'
};

const AUTH_TYPES = {
  EMAIL: 'email',
  EMAIL_OAUTH: 'email_oauth',
  GITHUB_OAUTH: 'github_oauth',
  GOOGLE_OAUTH: 'google_oauth',
  SSO: 'sso'
};

/**
 * Platform configurations with automation workflows
 */
const PLATFORMS = {
  // ============================================================================
  // AI & DEVELOPMENT PLATFORMS
  // ============================================================================

  'claude-ai': {
    name: 'Claude AI (Anthropic)',
    slug: 'claude-ai',
    category: PLATFORM_CATEGORIES.AI_ASSISTANT,
    description: 'Advanced AI assistant with Claude models for coding, analysis, and automation',
    website: 'https://claude.ai',
    signupUrl: 'https://claude.ai/signup',
    apiDocsUrl: 'https://docs.anthropic.com',
    trialDays: 0, // Free tier available
    requiresCreditCard: false,
    priority: 1,
    features: [
      'Chat conversations',
      'Code generation & review',
      'Analysis & research',
      'MCP protocol support',
      'Computer use capability',
      'Vision API'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL_OAUTH,
      supportsApiKey: true,
      mcpCompatible: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://claude.ai/signup' },
        { step: 2, action: 'oauth_flow', provider: 'google' },
        { step: 3, action: 'verify_email', optional: true },
        { step: 4, action: 'generate_api_key', target: 'https://console.anthropic.com/settings/keys' },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        baseUrl: 'https://api.anthropic.com/v1',
        authHeader: 'x-api-key'
      }
    }
  },

  'github-copilot': {
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    category: PLATFORM_CATEGORIES.AI_DEVELOPMENT,
    description: 'AI-powered code completion and suggestion tool',
    website: 'https://github.com/features/copilot',
    signupUrl: 'https://github.com/github-copilot/signup',
    apiDocsUrl: 'https://docs.github.com/en/copilot',
    trialDays: 30,
    requiresCreditCard: false,
    priority: 2,
    features: [
      'Code completion',
      'Chat in IDE',
      'PR review assistance',
      'CLI integration',
      'Voice coding'
    ],
    automation: {
      authType: AUTH_TYPES.GITHUB_OAUTH,
      requiresGitHubAccount: true,
      automationSteps: [
        { step: 1, action: 'github_oauth', scopes: ['copilot'] },
        { step: 2, action: 'enable_trial', target: 'https://github.com/settings/copilot' },
        { step: 3, action: 'configure_ide', ides: ['vscode', 'cursor'] },
        { step: 4, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'ide_extension',
        supportedIDEs: ['VS Code', 'JetBrains', 'Neovim', 'Cursor']
      }
    }
  },

  'cursor-ide': {
    name: 'Cursor IDE',
    slug: 'cursor-ide',
    category: PLATFORM_CATEGORIES.AI_DEVELOPMENT,
    description: 'AI-first code editor with built-in AI assistant',
    website: 'https://cursor.sh',
    signupUrl: 'https://cursor.sh/signup',
    trialDays: 14,
    requiresCreditCard: false,
    priority: 3,
    features: [
      'AI code editing',
      'Codebase chat',
      'Multi-file editing',
      'Composer mode',
      'Custom instructions'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL,
      desktopApp: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://cursor.sh/signup' },
        { step: 2, action: 'fill_form', fields: ['email', 'password'] },
        { step: 3, action: 'verify_email' },
        { step: 4, action: 'download_app', platforms: ['linux', 'macos', 'windows'] },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'desktop_app',
        downloadUrl: 'https://cursor.sh/download'
      }
    }
  },

  // ============================================================================
  // AUTOMATION PLATFORMS
  // ============================================================================

  'n8n-cloud': {
    name: 'n8n Cloud',
    slug: 'n8n-cloud',
    category: PLATFORM_CATEGORIES.AUTOMATION,
    description: 'Workflow automation platform with 400+ integrations',
    website: 'https://n8n.io',
    signupUrl: 'https://app.n8n.cloud/register',
    apiDocsUrl: 'https://docs.n8n.io/api/',
    trialDays: 14,
    requiresCreditCard: false,
    priority: 1,
    features: [
      'Visual workflow builder',
      '400+ integrations',
      'Custom code nodes',
      'AI nodes (Claude, GPT)',
      'Self-host option',
      'Webhook triggers'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL,
      supportsWebhook: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://app.n8n.cloud/register' },
        { step: 2, action: 'fill_form', fields: ['email', 'password', 'name'] },
        { step: 3, action: 'verify_email' },
        { step: 4, action: 'create_workspace' },
        { step: 5, action: 'generate_api_key', target: '/settings/api' },
        { step: 6, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        authHeader: 'X-N8N-API-KEY',
        webhookSupport: true
      }
    }
  },

  'zapier': {
    name: 'Zapier',
    slug: 'zapier',
    category: PLATFORM_CATEGORIES.AUTOMATION,
    description: 'No-code automation connecting 6000+ apps',
    website: 'https://zapier.com',
    signupUrl: 'https://zapier.com/sign-up',
    apiDocsUrl: 'https://platform.zapier.com/docs/api',
    trialDays: 14,
    requiresCreditCard: false,
    priority: 2,
    features: [
      '6000+ app integrations',
      'Multi-step Zaps',
      'Filters & paths',
      'Formatter tools',
      'Tables (database)',
      'Chatbots'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL_OAUTH,
      supportsWebhook: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://zapier.com/sign-up' },
        { step: 2, action: 'oauth_flow', provider: 'google', fallback: 'email' },
        { step: 3, action: 'onboarding_flow', skip: true },
        { step: 4, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'webhook',
        webhookUrl: 'https://hooks.zapier.com/hooks/catch/'
      }
    }
  },

  'make': {
    name: 'Make (Integromat)',
    slug: 'make',
    category: PLATFORM_CATEGORIES.AUTOMATION,
    description: 'Visual automation platform with advanced features',
    website: 'https://make.com',
    signupUrl: 'https://make.com/en/register',
    apiDocsUrl: 'https://developers.make.com/api-docs',
    trialDays: 14,
    requiresCreditCard: false,
    priority: 3,
    features: [
      'Visual scenario builder',
      'Advanced data transformation',
      'Error handling',
      'Scheduling',
      'API integration'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL,
      supportsWebhook: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://make.com/en/register' },
        { step: 2, action: 'fill_form', fields: ['email', 'password', 'country'] },
        { step: 3, action: 'verify_email' },
        { step: 4, action: 'generate_api_key' },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        baseUrl: 'https://api.make.com/api/v2'
      }
    }
  },

  // ============================================================================
  // DATABASE & BACKEND PLATFORMS
  // ============================================================================

  'supabase': {
    name: 'Supabase',
    slug: 'supabase',
    category: PLATFORM_CATEGORIES.DATABASE,
    description: 'Open source Firebase alternative with PostgreSQL',
    website: 'https://supabase.com',
    signupUrl: 'https://supabase.com/dashboard',
    apiDocsUrl: 'https://supabase.com/docs/reference',
    trialDays: 0, // Free tier
    requiresCreditCard: false,
    priority: 1,
    features: [
      'PostgreSQL database',
      'Authentication',
      'Storage',
      'Edge Functions',
      'Realtime subscriptions',
      'Row Level Security'
    ],
    automation: {
      authType: AUTH_TYPES.GITHUB_OAUTH,
      freeTier: true,
      automationSteps: [
        { step: 1, action: 'github_oauth', scopes: ['read:user', 'user:email'] },
        { step: 2, action: 'create_project', fields: ['name', 'region', 'password'] },
        { step: 3, action: 'wait_provisioning', timeout: 120000 },
        { step: 4, action: 'extract_credentials', keys: ['url', 'anon_key', 'service_role'] },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        authHeader: 'apikey',
        clientLibraries: ['@supabase/supabase-js']
      }
    }
  },

  'airtable': {
    name: 'Airtable',
    slug: 'airtable',
    category: PLATFORM_CATEGORIES.DATABASE,
    description: 'Spreadsheet-database hybrid with automation',
    website: 'https://airtable.com',
    signupUrl: 'https://airtable.com/signup',
    apiDocsUrl: 'https://airtable.com/developers/web/api',
    trialDays: 14,
    requiresCreditCard: false,
    priority: 2,
    features: [
      'Flexible tables',
      'Multiple views',
      'Automations',
      'API access',
      'Forms',
      'Apps marketplace'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL_OAUTH,
      supportsWebhook: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://airtable.com/signup' },
        { step: 2, action: 'oauth_flow', provider: 'google', fallback: 'email' },
        { step: 3, action: 'create_workspace' },
        { step: 4, action: 'generate_api_key', target: '/account' },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        baseUrl: 'https://api.airtable.com/v0',
        authHeader: 'Authorization',
        authPrefix: 'Bearer'
      }
    }
  },

  // ============================================================================
  // DEPLOYMENT PLATFORMS
  // ============================================================================

  'vercel': {
    name: 'Vercel',
    slug: 'vercel',
    category: PLATFORM_CATEGORIES.DEPLOYMENT,
    description: 'Frontend cloud platform for deploying web applications',
    website: 'https://vercel.com',
    signupUrl: 'https://vercel.com/signup',
    apiDocsUrl: 'https://vercel.com/docs/rest-api',
    trialDays: 0, // Free tier
    requiresCreditCard: false,
    priority: 1,
    features: [
      'Instant deploys',
      'Edge Functions',
      'Analytics',
      'CI/CD built-in',
      'Preview deployments',
      'Domain management'
    ],
    automation: {
      authType: AUTH_TYPES.GITHUB_OAUTH,
      freeTier: true,
      automationSteps: [
        { step: 1, action: 'github_oauth', scopes: ['repo'] },
        { step: 2, action: 'import_project', source: 'github' },
        { step: 3, action: 'configure_project' },
        { step: 4, action: 'generate_api_token', target: '/account/tokens' },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        baseUrl: 'https://api.vercel.com',
        authHeader: 'Authorization',
        authPrefix: 'Bearer'
      }
    }
  },

  'railway': {
    name: 'Railway',
    slug: 'railway',
    category: PLATFORM_CATEGORIES.DEPLOYMENT,
    description: 'Infrastructure platform for deploying any app',
    website: 'https://railway.app',
    signupUrl: 'https://railway.app/new',
    apiDocsUrl: 'https://docs.railway.app/reference/public-api',
    trialDays: 0, // Free credits
    requiresCreditCard: false,
    priority: 2,
    freeCredits: 5,
    features: [
      'One-click deploy',
      'Databases (Postgres, Redis, MySQL)',
      'Cron jobs',
      'Private networking',
      'Auto-scaling'
    ],
    automation: {
      authType: AUTH_TYPES.GITHUB_OAUTH,
      freeTier: true,
      automationSteps: [
        { step: 1, action: 'github_oauth' },
        { step: 2, action: 'create_project' },
        { step: 3, action: 'deploy_template', optional: true },
        { step: 4, action: 'generate_api_token', target: '/account/tokens' },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        baseUrl: 'https://backboard.railway.app/graphql/v2',
        authHeader: 'Authorization',
        authPrefix: 'Bearer'
      }
    }
  },

  // ============================================================================
  // COMMUNICATION PLATFORMS
  // ============================================================================

  'slack': {
    name: 'Slack',
    slug: 'slack',
    category: PLATFORM_CATEGORIES.COMMUNICATION,
    description: 'Business messaging platform with extensive API',
    website: 'https://slack.com',
    signupUrl: 'https://slack.com/get-started',
    apiDocsUrl: 'https://api.slack.com',
    trialDays: 0, // Free tier
    requiresCreditCard: false,
    priority: 1,
    features: [
      'Channels & DMs',
      'App integrations',
      'Workflows',
      'Huddles (voice/video)',
      'Bot platform',
      'Slash commands'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL_OAUTH,
      freeTier: true,
      botSupport: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://slack.com/get-started' },
        { step: 2, action: 'create_workspace', fields: ['email', 'workspace_name'] },
        { step: 3, action: 'verify_email' },
        { step: 4, action: 'create_app', target: 'https://api.slack.com/apps' },
        { step: 5, action: 'configure_bot', scopes: ['chat:write', 'commands'] },
        { step: 6, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'bot',
        baseUrl: 'https://slack.com/api',
        authHeader: 'Authorization',
        authPrefix: 'Bearer'
      }
    }
  },

  'discord': {
    name: 'Discord',
    slug: 'discord',
    category: PLATFORM_CATEGORIES.COMMUNICATION,
    description: 'Community platform with voice, video, and text',
    website: 'https://discord.com',
    signupUrl: 'https://discord.com/register',
    apiDocsUrl: 'https://discord.com/developers/docs',
    trialDays: 0, // Free
    requiresCreditCard: false,
    priority: 2,
    features: [
      'Servers & channels',
      'Voice channels',
      'Bot platform',
      'Webhooks',
      'Slash commands',
      'Forums'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL,
      freeTier: true,
      botSupport: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://discord.com/register' },
        { step: 2, action: 'fill_form', fields: ['email', 'username', 'password', 'dob'] },
        { step: 3, action: 'verify_email' },
        { step: 4, action: 'create_application', target: 'https://discord.com/developers/applications' },
        { step: 5, action: 'create_bot' },
        { step: 6, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'bot',
        baseUrl: 'https://discord.com/api/v10',
        authHeader: 'Authorization',
        authPrefix: 'Bot'
      }
    }
  },

  // ============================================================================
  // PRODUCTIVITY PLATFORMS
  // ============================================================================

  'notion': {
    name: 'Notion',
    slug: 'notion',
    category: PLATFORM_CATEGORIES.PRODUCTIVITY,
    description: 'All-in-one workspace for notes, docs, and databases',
    website: 'https://notion.so',
    signupUrl: 'https://notion.so/signup',
    apiDocsUrl: 'https://developers.notion.com',
    trialDays: 0, // Free tier
    requiresCreditCard: false,
    priority: 1,
    features: [
      'Pages & databases',
      'Templates',
      'API integration',
      'AI features',
      'Collaboration',
      'Embeds'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL_OAUTH,
      freeTier: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://notion.so/signup' },
        { step: 2, action: 'oauth_flow', provider: 'google', fallback: 'email' },
        { step: 3, action: 'create_integration', target: 'https://notion.so/my-integrations' },
        { step: 4, action: 'configure_permissions' },
        { step: 5, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        baseUrl: 'https://api.notion.com/v1',
        authHeader: 'Authorization',
        authPrefix: 'Bearer',
        versionHeader: 'Notion-Version'
      }
    }
  },

  'linear': {
    name: 'Linear',
    slug: 'linear',
    category: PLATFORM_CATEGORIES.PROJECT_MANAGEMENT,
    description: 'Issue tracking and project management for software teams',
    website: 'https://linear.app',
    signupUrl: 'https://linear.app/signup',
    apiDocsUrl: 'https://developers.linear.app',
    trialDays: 14,
    requiresCreditCard: false,
    priority: 2,
    features: [
      'Issues & projects',
      'Cycles/sprints',
      'Roadmaps',
      'GitHub sync',
      'API & webhooks',
      'Automations'
    ],
    automation: {
      authType: AUTH_TYPES.EMAIL_OAUTH,
      supportsWebhook: true,
      automationSteps: [
        { step: 1, action: 'navigate', target: 'https://linear.app/signup' },
        { step: 2, action: 'oauth_flow', provider: 'google', fallback: 'email' },
        { step: 3, action: 'create_workspace' },
        { step: 4, action: 'generate_api_key', target: '/settings/account/api' },
        { step: 5, action: 'configure_github_sync', optional: true },
        { step: 6, action: 'store_credentials' }
      ],
      integrationConfig: {
        type: 'api',
        baseUrl: 'https://api.linear.app/graphql',
        authHeader: 'Authorization'
      }
    }
  }
};

/**
 * Get all platforms
 */
function getAllPlatforms() {
  return Object.values(PLATFORMS);
}

/**
 * Get platforms by category
 */
function getPlatformsByCategory(category) {
  return Object.values(PLATFORMS).filter(p => p.category === category);
}

/**
 * Get platform by slug
 */
function getPlatformBySlug(slug) {
  return PLATFORMS[slug] || null;
}

/**
 * Get platforms with free tier
 */
function getFreeTierPlatforms() {
  return Object.values(PLATFORMS).filter(p => p.trialDays === 0 && !p.requiresCreditCard);
}

/**
 * Get platforms sorted by priority
 */
function getPlatformsByPriority() {
  return Object.values(PLATFORMS).sort((a, b) => a.priority - b.priority);
}

/**
 * Get platforms that support MCP
 */
function getMCPCompatiblePlatforms() {
  return Object.values(PLATFORMS).filter(p => p.automation?.mcpCompatible);
}

/**
 * Get platforms that support webhooks
 */
function getWebhookPlatforms() {
  return Object.values(PLATFORMS).filter(p => p.automation?.supportsWebhook);
}

/**
 * Get automation steps for a platform
 */
function getAutomationSteps(slug) {
  const platform = PLATFORMS[slug];
  return platform?.automation?.automationSteps || [];
}

/**
 * Generate orchestration batch for multiple platforms
 */
function generateOrchestrationBatch(platformSlugs, options = {}) {
  const batch = {
    id: `batch_${Date.now()}`,
    platforms: [],
    totalSteps: 0,
    estimatedDuration: 0,
    config: options
  };

  for (const slug of platformSlugs) {
    const platform = PLATFORMS[slug];
    if (platform) {
      const steps = platform.automation?.automationSteps || [];
      batch.platforms.push({
        slug,
        name: platform.name,
        steps: steps.length,
        priority: platform.priority
      });
      batch.totalSteps += steps.length;
      batch.estimatedDuration += steps.length * 30; // 30 seconds per step estimate
    }
  }

  // Sort by priority
  batch.platforms.sort((a, b) => a.priority - b.priority);

  return batch;
}

export {
  PLATFORMS,
  PLATFORM_CATEGORIES,
  AUTH_TYPES,
  getAllPlatforms,
  getPlatformsByCategory,
  getPlatformBySlug,
  getFreeTierPlatforms,
  getPlatformsByPriority,
  getMCPCompatiblePlatforms,
  getWebhookPlatforms,
  getAutomationSteps,
  generateOrchestrationBatch
};
