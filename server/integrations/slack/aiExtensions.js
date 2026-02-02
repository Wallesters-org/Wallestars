/**
 * Slack AI Extensions Configuration
 * 10 AI Extensions for Slack Channel Integration
 */

export const slackAIExtensions = [
  {
    id: 'claude-assistant',
    name: 'Claude AI Assistant',
    description: 'Anthropic Claude AI for intelligent conversations, code generation, and analysis',
    type: 'ai_agent',
    provider: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1',
    capabilities: ['chat', 'code_generation', 'analysis', 'tool_use', 'vision'],
    commands: ['/claude', '/ask-claude'],
    enabled: true,
    config: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.7
    }
  },
  {
    id: 'openai-gpt',
    name: 'OpenAI GPT',
    description: 'OpenAI GPT for natural language processing and creative tasks',
    type: 'ai_agent',
    provider: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1',
    capabilities: ['chat', 'code_generation', 'embeddings', 'vision', 'function_calling'],
    commands: ['/gpt', '/openai'],
    enabled: true,
    config: {
      model: 'gpt-4o',
      maxTokens: 4096,
      temperature: 0.7
    }
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    description: 'AI-powered code suggestions and automation for development tasks',
    type: 'dev_assistant',
    provider: 'GitHub',
    apiEndpoint: 'https://api.github.com/copilot',
    capabilities: ['code_completion', 'code_review', 'pull_request_summary', 'issue_analysis'],
    commands: ['/copilot', '/code-review'],
    enabled: true,
    config: {
      autoSuggest: true,
      contextWindow: 8000
    }
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    description: 'Google Gemini AI for multimodal understanding and generation',
    type: 'ai_agent',
    provider: 'Google',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
    capabilities: ['chat', 'vision', 'code_generation', 'multimodal'],
    commands: ['/gemini', '/google-ai'],
    enabled: true,
    config: {
      model: 'gemini-2.0-flash',
      maxOutputTokens: 4096
    }
  },
  {
    id: 'notion-ai',
    name: 'Notion AI',
    description: 'AI-powered workspace automation and document generation',
    type: 'productivity',
    provider: 'Notion',
    apiEndpoint: 'https://api.notion.com/v1',
    capabilities: ['document_generation', 'summarization', 'task_management', 'database_queries'],
    commands: ['/notion', '/doc-gen'],
    enabled: true,
    config: {
      workspace: 'default',
      autoSync: true
    }
  },
  {
    id: 'perplexity-search',
    name: 'Perplexity AI Search',
    description: 'AI-powered research and real-time web search assistant',
    type: 'search_assistant',
    provider: 'Perplexity',
    apiEndpoint: 'https://api.perplexity.ai',
    capabilities: ['web_search', 'research', 'citations', 'fact_checking'],
    commands: ['/search', '/perplexity', '/research'],
    enabled: true,
    config: {
      model: 'llama-3.1-sonar-large-128k-online',
      searchDepth: 'comprehensive'
    }
  },
  {
    id: 'midjourney-art',
    name: 'Midjourney AI Art',
    description: 'AI image generation and creative visual content',
    type: 'image_generation',
    provider: 'Midjourney',
    apiEndpoint: 'https://api.midjourney.com',
    capabilities: ['image_generation', 'image_variation', 'upscaling', 'style_transfer'],
    commands: ['/imagine', '/midjourney', '/art'],
    enabled: true,
    config: {
      version: 'v6',
      quality: 'high',
      stylize: 100
    }
  },
  {
    id: 'make-automation',
    name: 'Make (Integromat) Automation',
    description: 'Workflow automation and integration orchestration',
    type: 'automation',
    provider: 'Make',
    apiEndpoint: 'https://eu1.make.com/api/v2',
    capabilities: ['workflow_automation', 'api_integration', 'scheduling', 'data_transformation'],
    commands: ['/automate', '/make', '/workflow'],
    enabled: true,
    config: {
      region: 'eu1',
      maxScenarios: 10
    }
  },
  {
    id: 'huggingface-models',
    name: 'Hugging Face Models',
    description: 'Access to thousands of open-source AI models',
    type: 'ai_platform',
    provider: 'Hugging Face',
    apiEndpoint: 'https://api-inference.huggingface.co',
    capabilities: ['text_generation', 'translation', 'sentiment_analysis', 'classification', 'embeddings'],
    commands: ['/hf', '/huggingface', '/model'],
    enabled: true,
    config: {
      defaultModel: 'meta-llama/Llama-2-70b-chat-hf',
      useGPU: true
    }
  },
  {
    id: 'replicate-ai',
    name: 'Replicate AI',
    description: 'Run and deploy machine learning models via API',
    type: 'ml_platform',
    provider: 'Replicate',
    apiEndpoint: 'https://api.replicate.com/v1',
    capabilities: ['model_inference', 'image_generation', 'audio_generation', 'video_generation'],
    commands: ['/replicate', '/ml', '/generate'],
    enabled: true,
    config: {
      webhookEnabled: true,
      defaultVersion: 'latest'
    }
  }
];

/**
 * Get all enabled AI extensions
 */
export const getEnabledExtensions = () => {
  return slackAIExtensions.filter(ext => ext.enabled);
};

/**
 * Get extension by ID
 */
export const getExtensionById = (id) => {
  return slackAIExtensions.find(ext => ext.id === id);
};

/**
 * Get extensions by type
 */
export const getExtensionsByType = (type) => {
  return slackAIExtensions.filter(ext => ext.type === type);
};

/**
 * Get extensions by capability
 */
export const getExtensionsByCapability = (capability) => {
  return slackAIExtensions.filter(ext => ext.capabilities.includes(capability));
};

/**
 * Get all available slash commands
 */
export const getAllCommands = () => {
  return slackAIExtensions.flatMap(ext => ext.commands);
};

/**
 * Find extension by command
 */
export const getExtensionByCommand = (command) => {
  return slackAIExtensions.find(ext => ext.commands.includes(command));
};

export default slackAIExtensions;
