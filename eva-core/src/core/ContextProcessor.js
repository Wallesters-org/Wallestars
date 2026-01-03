/**
 * Context Processor
 * 
 * Обработва входящи данни и създава контекст за вземане на решения.
 * - Анализира съобщения, коментари, mentions
 * - Зарежда потребителска история
 * - Извлича релевантна информация
 */

export class ContextProcessor {
  constructor(config) {
    this.config = config;
    this.initialized = false;
  }

  async initialize() {
    console.log('[ContextProcessor] Инициализация...');
    this.initialized = true;
  }

  /**
   * Обработка на входни данни и създаване на контекст
   * 
   * @param {Object} input - Входни данни
   * @returns {Object} Обработен контекст
   */
  async process(input) {
    const { platform, type, data, userId } = input;

    console.log(`[ContextProcessor] Обработка на ${type} от ${platform} за user ${userId}`);

    // Извличане на основна информация
    const basicContext = this.extractBasicInfo(data, platform);

    // Зареждане на потребителска история
    const userHistory = await this.loadUserHistory(userId, platform);

    // Зареждане на предишни взаимодействия
    const previousInteractions = await this.loadPreviousInteractions(userId, platform);

    // Анализ на sentiment
    const sentiment = this.analyzeSentiment(data.content || data.text);

    // Извличане на ключови думи
    const keywords = this.extractKeywords(data.content || data.text);

    // Определяне на приоритет
    const priority = this.calculatePriority({
      userHistory,
      sentiment,
      keywords,
      type
    });

    return {
      platform,
      type,
      userId,
      timestamp: new Date().toISOString(),
      basic: basicContext,
      user: {
        history: userHistory,
        previousInteractions,
        profile: await this.getUserProfile(userId, platform)
      },
      content: {
        raw: data.content || data.text,
        sentiment,
        keywords,
        language: this.detectLanguage(data.content || data.text)
      },
      meta: {
        priority,
        requiresResponse: this.requiresResponse(type, sentiment, priority),
        urgency: this.calculateUrgency(type, sentiment, userHistory)
      }
    };
  }

  /**
   * Извличане на основна информация
   */
  extractBasicInfo(data, platform) {
    return {
      messageId: data.id || data.message_id,
      platform,
      author: data.from || data.user || data.author,
      content: data.content || data.text || data.message,
      media: data.media || data.attachments || [],
      timestamp: data.timestamp || data.created_at || Date.now()
    };
  }

  /**
   * Зареждане на потребителска история
   * TODO: Интеграция със Supabase
   */
  async loadUserHistory(userId, platform) {
    // Временна имплементация
    // В продукция - query към database
    return {
      totalInteractions: 0,
      lastInteraction: null,
      averageResponseTime: null,
      engagementRate: 0
    };
  }

  /**
   * Зареждане на предишни взаимодействия
   */
  async loadPreviousInteractions(userId, platform) {
    // TODO: Интеграция със Supabase
    return [];
  }

  /**
   * Извличане на потребителски профил
   */
  async getUserProfile(userId, platform) {
    // TODO: Интеграция с платформени API
    return {
      id: userId,
      username: null,
      displayName: null,
      verified: false,
      followerCount: 0
    };
  }

  /**
   * Анализ на sentiment (просто правило-базиран за начало)
   */
  analyzeSentiment(text) {
    if (!text) return 'neutral';

    const lowercaseText = text.toLowerCase();
    
    // Български и английски положителни думи
    const positiveWords = ['благодаря', 'супер', 'страхотно', 'отлично', 'прекрасно', 'thanks', 'great', 'awesome', 'excellent', 'love'];
    // Негативни думи
    const negativeWords = ['лошо', 'зле', 'проблем', 'грешка', 'не работи', 'bad', 'terrible', 'problem', 'error', 'broken'];

    const positiveCount = positiveWords.filter(word => lowercaseText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowercaseText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Извличане на ключови думи
   */
  extractKeywords(text) {
    if (!text) return [];

    // Просто извличане - split по думи и филтриране
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'това', 'това', 'като'].includes(word));

    // Връщане на уникални думи
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Откриване на език
   */
  detectLanguage(text) {
    if (!text) return 'unknown';

    // Просто правило - проверка за кирилица
    const hasCyrillic = /[а-яА-Я]/.test(text);
    return hasCyrillic ? 'bg' : 'en';
  }

  /**
   * Изчисляване на приоритет
   */
  calculatePriority({ userHistory, sentiment, keywords, type }) {
    let priority = 5; // средно (1-10)

    // Тип събитие
    if (type === 'mention') priority += 2;
    if (type === 'direct_message') priority += 3;

    // Sentiment
    if (sentiment === 'negative') priority += 2;
    if (sentiment === 'positive') priority += 1;

    // Engagement history
    if (userHistory.engagementRate > 0.5) priority += 1;

    return Math.min(Math.max(priority, 1), 10);
  }

  /**
   * Проверка дали се изисква отговор
   */
  requiresResponse(type, sentiment, priority) {
    if (type === 'direct_message') return true;
    if (type === 'mention') return true;
    if (sentiment === 'negative') return true;
    if (priority >= 7) return true;
    return false;
  }

  /**
   * Изчисляване на спешност
   */
  calculateUrgency(type, sentiment, userHistory) {
    if (sentiment === 'negative' && type === 'direct_message') return 'high';
    if (type === 'mention') return 'medium';
    return 'low';
  }
}

export default ContextProcessor;
