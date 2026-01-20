/**
 * AI Platforms Registry
 * Registry of free trial AI platforms that can be added to the workspace
 * Each platform configuration includes setup, authentication, and usage details
 */

export const PLATFORM_STATUS = {
  AVAILABLE: 'available',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  RATE_LIMITED: 'rate_limited',
  ERROR: 'error'
};

export const PLATFORM_TIER = {
  FREE_TRIAL: 'free_trial',
  FREE_TIER: 'free_tier',
  PAID: 'paid'
};

/**
 * Registry of AI platforms with free trials/tiers
 * Add new platforms here to expand the orchestration farm
 */
export const platformsRegistry = {
  // ===== CORE AI ASSISTANTS =====
  anthropic_claude: {
    id: 'anthropic_claude',
    name: 'Anthropic Claude',
    description: 'Advanced AI assistant with strong reasoning capabilities',
    tier: PLATFORM_TIER.FREE_TIER,
    trialCredits: '$5 free API credits',
    signupUrl: 'https://console.anthropic.com/signup',
    apiBaseUrl: 'https://api.anthropic.com/v1',
    authType: 'api_key',
    envVarName: 'ANTHROPIC_API_KEY',
    models: ['claude-sonnet-4-20250514', 'claude-opus-4-5-20251101', 'claude-3-haiku-20240307'],
    capabilities: ['chat', 'reasoning', 'code', 'analysis', 'computer_use'],
    rateLimit: { requests: 60, window: '1m' },
    priority: 1,
    setupInstructions: [
      'Go to console.anthropic.com/signup',
      'Create account with email verification',
      'Navigate to API Keys section',
      'Generate new API key',
      'Add to .env as ANTHROPIC_API_KEY'
    ]
  },

  openai_gpt: {
    id: 'openai_gpt',
    name: 'OpenAI GPT',
    description: 'Powerful language models including GPT-4',
    tier: PLATFORM_TIER.FREE_TIER,
    trialCredits: '$5 free API credits (new accounts)',
    signupUrl: 'https://platform.openai.com/signup',
    apiBaseUrl: 'https://api.openai.com/v1',
    authType: 'api_key',
    envVarName: 'OPENAI_API_KEY',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    capabilities: ['chat', 'code', 'vision', 'function_calling'],
    rateLimit: { requests: 60, window: '1m' },
    priority: 2,
    setupInstructions: [
      'Go to platform.openai.com/signup',
      'Create account and verify phone number',
      'Navigate to API Keys',
      'Create new secret key',
      'Add to .env as OPENAI_API_KEY'
    ]
  },

  google_gemini: {
    id: 'google_gemini',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI with generous free tier',
    tier: PLATFORM_TIER.FREE_TIER,
    trialCredits: '60 requests/minute free',
    signupUrl: 'https://aistudio.google.com/',
    apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    authType: 'api_key',
    envVarName: 'GOOGLE_API_KEY',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    capabilities: ['chat', 'vision', 'code', 'multimodal'],
    rateLimit: { requests: 60, window: '1m' },
    priority: 3,
    setupInstructions: [
      'Go to aistudio.google.com',
      'Sign in with Google account',
      'Click "Get API Key"',
      'Create API key in new project',
      'Add to .env as GOOGLE_API_KEY'
    ]
  },

  // ===== CODING ASSISTANTS =====
  github_copilot: {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    description: 'AI pair programmer for code completion',
    tier: PLATFORM_TIER.FREE_TRIAL,
    trialCredits: '30-day free trial',
    signupUrl: 'https://github.com/features/copilot',
    apiBaseUrl: 'https://api.github.com',
    authType: 'oauth',
    envVarName: 'GITHUB_TOKEN',
    models: ['copilot'],
    capabilities: ['code_completion', 'code_review', 'pr_automation'],
    rateLimit: { requests: 100, window: '1m' },
    priority: 4,
    setupInstructions: [
      'Go to github.com/features/copilot',
      'Start free trial with GitHub account',
      'Install Copilot extension in IDE',
      'Generate personal access token',
      'Add to .env as GITHUB_TOKEN'
    ]
  },

  codeium: {
    id: 'codeium',
    name: 'Codeium',
    description: 'Free AI code completion for individuals',
    tier: PLATFORM_TIER.FREE_TIER,
    trialCredits: 'Unlimited free for individuals',
    signupUrl: 'https://codeium.com/',
    apiBaseUrl: 'https://api.codeium.com',
    authType: 'api_key',
    envVarName: 'CODEIUM_API_KEY',
    models: ['codeium'],
    capabilities: ['code_completion', 'chat', 'search'],
    rateLimit: { requests: 1000, window: '1h' },
    priority: 5,
    setupInstructions: [
      'Go to codeium.com',
      'Sign up for free account',
      'Get API key from dashboard',
      'Add to .env as CODEIUM_API_KEY'
    ]
  },

  // ===== SPECIALIZED AI TOOLS =====
  huggingface: {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Open-source ML models and inference API',
    tier: PLATFORM_TIER.FREE_TIER,
    trialCredits: 'Free inference API with limits',
    signupUrl: 'https://huggingface.co/join',
    apiBaseUrl: 'https://api-inference.huggingface.co',
    authType: 'api_key',
    envVarName: 'HUGGINGFACE_API_KEY',
    models: ['meta-llama/Llama-2-70b-chat-hf', 'mistralai/Mistral-7B-v0.1', 'codellama/CodeLlama-34b-Instruct-hf'],
    capabilities: ['text_generation', 'embeddings', 'classification', 'image_generation'],
    rateLimit: { requests: 30, window: '1m' },
    priority: 6,
    setupInstructions: [
      'Go to huggingface.co/join',
      'Create account',
      'Go to Settings > Access Tokens',
      'Create new token with read access',
      'Add to .env as HUGGINGFACE_API_KEY'
    ]
  },

  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast LLM inference with free tier',
    tier: PLATFORM_TIER.FREE_TIER,
    trialCredits: 'Free tier with rate limits',
    signupUrl: 'https://console.groq.com/',
    apiBaseUrl: 'https://api.groq.com/openai/v1',
    authType: 'api_key',
    envVarName: 'GROQ_API_KEY',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    capabilities: ['chat', 'code', 'fast_inference'],
    rateLimit: { requests: 30, window: '1m' },
    priority: 7,
    setupInstructions: [
      'Go to console.groq.com',
      'Sign up with email or Google',
      'Navigate to API Keys',
      'Create new API key',
      'Add to .env as GROQ_API_KEY'
    ]
  },

  together_ai: {
    id: 'together_ai',
    name: 'Together AI',
    description: 'Open-source models with free credits',
    tier: PLATFORM_TIER.FREE_TRIAL,
    trialCredits: '$25 free credits',
    signupUrl: 'https://api.together.xyz/',
    apiBaseUrl: 'https://api.together.xyz/v1',
    authType: 'api_key',
    envVarName: 'TOGETHER_API_KEY',
    models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x22B-Instruct-v0.1'],
    capabilities: ['chat', 'code', 'embeddings', 'image_generation'],
    rateLimit: { requests: 60, window: '1m' },
    priority: 8,
    setupInstructions: [
      'Go to api.together.xyz',
      'Sign up for account',
      'Get $25 free credits',
      'Copy API key from dashboard',
      'Add to .env as TOGETHER_API_KEY'
    ]
  },

  perplexity: {
    id: 'perplexity',
    name: 'Perplexity AI',
    description: 'AI search engine with real-time data',
    tier: PLATFORM_TIER.FREE_TIER,
    trialCredits: 'Free tier available',
    signupUrl: 'https://www.perplexity.ai/',
    apiBaseUrl: 'https://api.perplexity.ai',
    authType: 'api_key',
    envVarName: 'PERPLEXITY_API_KEY',
    models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online'],
    capabilities: ['search', 'chat', 'real_time_data'],
    rateLimit: { requests: 20, window: '1m' },
    priority: 9,
    setupInstructions: [
      'Go to perplexity.ai',
      'Create account',
      'Navigate to API settings',
      'Generate API key',
      'Add to .env as PERPLEXITY_API_KEY'
    ]
  },

  replicate: {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run open-source ML models in the cloud',
    tier: PLATFORM_TIER.FREE_TRIAL,
    trialCredits: 'Free credits for new users',
    signupUrl: 'https://replicate.com/',
    apiBaseUrl: 'https://api.replicate.com/v1',
    authType: 'api_key',
    envVarName: 'REPLICATE_API_TOKEN',
    models: ['meta/llama-2-70b-chat', 'stability-ai/sdxl', 'openai/whisper'],
    capabilities: ['text_generation', 'image_generation', 'audio_transcription'],
    rateLimit: { requests: 60, window: '1m' },
    priority: 10,
    setupInstructions: [
      'Go to replicate.com',
      'Sign up with GitHub',
      'Go to Account Settings',
      'Copy API token',
      'Add to .env as REPLICATE_API_TOKEN'
    ]
  }
};

/**
 * Get all platforms as array
 */
export function getAllPlatforms() {
  return Object.values(platformsRegistry).sort((a, b) => a.priority - b.priority);
}

/**
 * Get platforms by tier
 */
export function getPlatformsByTier(tier) {
  return getAllPlatforms().filter(p => p.tier === tier);
}

/**
 * Get platforms by capability
 */
export function getPlatformsByCapability(capability) {
  return getAllPlatforms().filter(p => p.capabilities.includes(capability));
}

/**
 * Get platform by ID
 */
export function getPlatform(id) {
  return platformsRegistry[id] || null;
}

/**
 * Check if platform is configured (has API key in env)
 */
export function isPlatformConfigured(platformId) {
  const platform = getPlatform(platformId);
  if (!platform) return false;
  return !!process.env[platform.envVarName];
}

/**
 * Get all configured platforms
 */
export function getConfiguredPlatforms() {
  return getAllPlatforms().filter(p => isPlatformConfigured(p.id));
}

/**
 * Get all unconfigured platforms (available for setup)
 */
export function getUnconfiguredPlatforms() {
  return getAllPlatforms().filter(p => !isPlatformConfigured(p.id));
}

export default platformsRegistry;
