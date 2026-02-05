import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * OpenAI API Client
 * GPT models, embeddings, and AI services
 *
 * @see https://platform.openai.com/docs/api-reference
 */
class OpenAIClient {
  constructor() {
    this.baseURL = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
    this.apiKey = process.env.OPENAI_API_KEY;

    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY not configured. OpenAI API features will be disabled.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.OPENAI_API_TIMEOUT || '120000', 10)
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error('OpenAI API Error:', errorMsg);
        throw new Error(`OpenAI API Error: ${errorMsg}`);
      }
    );
  }

  isConfigured() {
    return !!this.apiKey;
  }

  // ==================== Chat Completions ====================

  /**
   * Create a chat completion
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Model options
   * @returns {Promise<Object>} Completion result
   */
  async createChatCompletion(messages, options = {}) {
    const response = await this.client.post('/chat/completions', {
      model: options.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 4096,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stream: options.stream || false,
      ...options
    });
    return response.data;
  }

  /**
   * Create a simple chat message
   * @param {string} userMessage - User's message
   * @param {string} systemPrompt - System prompt
   * @param {Object} options - Model options
   * @returns {Promise<string>} Assistant's response
   */
  async chat(userMessage, systemPrompt = '', options = {}) {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userMessage });

    const result = await this.createChatCompletion(messages, options);
    return result.choices[0].message.content;
  }

  // ==================== Completions (Legacy) ====================

  /**
   * Create a text completion
   * @param {string} prompt - Input prompt
   * @param {Object} options - Model options
   * @returns {Promise<Object>} Completion result
   */
  async createCompletion(prompt, options = {}) {
    const response = await this.client.post('/completions', {
      model: options.model || 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature ?? 0.7,
      ...options
    });
    return response.data;
  }

  // ==================== Embeddings ====================

  /**
   * Create embeddings for text
   * @param {string|Array} input - Text or array of texts
   * @param {Object} options - Embedding options
   * @returns {Promise<Object>} Embeddings result
   */
  async createEmbedding(input, options = {}) {
    const response = await this.client.post('/embeddings', {
      model: options.model || 'text-embedding-3-small',
      input,
      encoding_format: options.encodingFormat || 'float',
      ...options
    });
    return response.data;
  }

  // ==================== Images ====================

  /**
   * Generate images from text
   * @param {string} prompt - Image description
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated images
   */
  async createImage(prompt, options = {}) {
    const response = await this.client.post('/images/generations', {
      model: options.model || 'dall-e-3',
      prompt,
      n: options.n || 1,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      response_format: options.responseFormat || 'url',
      ...options
    });
    return response.data;
  }

  /**
   * Edit an image
   * @param {Buffer} image - Original image
   * @param {string} prompt - Edit instructions
   * @param {Object} options - Edit options
   * @returns {Promise<Object>} Edited image
   */
  async editImage(image, prompt, options = {}) {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('image', image, 'image.png');
    formData.append('prompt', prompt);
    if (options.mask) formData.append('mask', options.mask, 'mask.png');
    if (options.n) formData.append('n', options.n.toString());
    if (options.size) formData.append('size', options.size);

    const response = await this.client.post('/images/edits', formData, {
      headers: formData.getHeaders()
    });
    return response.data;
  }

  // ==================== Audio ====================

  /**
   * Transcribe audio to text
   * @param {Buffer} audio - Audio file buffer
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audio, options = {}) {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', audio, options.filename || 'audio.mp3');
    formData.append('model', options.model || 'whisper-1');
    if (options.language) formData.append('language', options.language);
    if (options.prompt) formData.append('prompt', options.prompt);

    const response = await this.client.post('/audio/transcriptions', formData, {
      headers: formData.getHeaders()
    });
    return response.data;
  }

  /**
   * Generate speech from text
   * @param {string} text - Input text
   * @param {Object} options - Speech options
   * @returns {Promise<Buffer>} Audio buffer
   */
  async createSpeech(text, options = {}) {
    const response = await this.client.post('/audio/speech', {
      model: options.model || 'tts-1',
      input: text,
      voice: options.voice || 'alloy',
      response_format: options.format || 'mp3',
      speed: options.speed || 1.0
    }, {
      responseType: 'arraybuffer'
    });
    return response.data;
  }

  // ==================== Moderations ====================

  /**
   * Check content for moderation
   * @param {string} input - Content to check
   * @returns {Promise<Object>} Moderation result
   */
  async createModeration(input) {
    const response = await this.client.post('/moderations', { input });
    return response.data;
  }

  // ==================== Models ====================

  /**
   * List available models
   * @returns {Promise<Object>} List of models
   */
  async listModels() {
    const response = await this.client.get('/models');
    return response.data;
  }

  /**
   * Get model details
   * @param {string} modelId - Model ID
   * @returns {Promise<Object>} Model details
   */
  async getModel(modelId) {
    const response = await this.client.get(`/models/${modelId}`);
    return response.data;
  }

  // ==================== Assistants API ====================

  /**
   * Create an assistant
   * @param {Object} assistantData - Assistant configuration
   * @returns {Promise<Object>} Created assistant
   */
  async createAssistant(assistantData) {
    const response = await this.client.post('/assistants', assistantData, {
      headers: { 'OpenAI-Beta': 'assistants=v2' }
    });
    return response.data;
  }

  /**
   * List assistants
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} List of assistants
   */
  async listAssistants(params = {}) {
    const response = await this.client.get('/assistants', {
      params,
      headers: { 'OpenAI-Beta': 'assistants=v2' }
    });
    return response.data;
  }

  /**
   * Create a thread
   * @param {Object} threadData - Thread data
   * @returns {Promise<Object>} Created thread
   */
  async createThread(threadData = {}) {
    const response = await this.client.post('/threads', threadData, {
      headers: { 'OpenAI-Beta': 'assistants=v2' }
    });
    return response.data;
  }

  /**
   * Add message to thread
   * @param {string} threadId - Thread ID
   * @param {Object} message - Message data
   * @returns {Promise<Object>} Created message
   */
  async addMessageToThread(threadId, message) {
    const response = await this.client.post(`/threads/${threadId}/messages`, message, {
      headers: { 'OpenAI-Beta': 'assistants=v2' }
    });
    return response.data;
  }

  /**
   * Run assistant on thread
   * @param {string} threadId - Thread ID
   * @param {string} assistantId - Assistant ID
   * @param {Object} options - Run options
   * @returns {Promise<Object>} Run result
   */
  async runAssistant(threadId, assistantId, options = {}) {
    const response = await this.client.post(`/threads/${threadId}/runs`, {
      assistant_id: assistantId,
      ...options
    }, {
      headers: { 'OpenAI-Beta': 'assistants=v2' }
    });
    return response.data;
  }
}

export const openaiClient = new OpenAIClient();
export default OpenAIClient;
