/**
 * Decision Engine
 * 
 * Вземa решения базирани на обработения контекст и конфигурирани правила.
 * - Определя какви действия да се изпълнят
 * - Избира подходящи стратегии за отговор
 * - Управлява приоритети и timing
 */

export class DecisionEngine {
  constructor(config) {
    this.config = config;
    this.rules = [];
    this.initialized = false;
  }

  async initialize() {
    console.log('[DecisionEngine] Инициализация...');
    this.loadRules();
    this.initialized = true;
  }

  /**
   * Зареждане на правила от конфигурацията
   */
  loadRules() {
    // Зареждане на default правила
    this.rules = [
      {
        id: 'direct_message_response',
        condition: (context) => context.type === 'direct_message',
        action: 'respond',
        priority: 9
      },
      {
        id: 'mention_response',
        condition: (context) => context.type === 'mention',
        action: 'respond',
        priority: 8
      },
      {
        id: 'negative_sentiment',
        condition: (context) => context.content.sentiment === 'negative',
        action: 'respond_priority',
        priority: 9
      },
      {
        id: 'positive_engagement',
        condition: (context) => context.content.sentiment === 'positive',
        action: 'like_and_respond',
        priority: 6
      },
      {
        id: 'comment_response',
        condition: (context) => context.type === 'comment',
        action: 'maybe_respond',
        priority: 5
      }
    ];

    console.log(`[DecisionEngine] Заредени ${this.rules.length} правила`);
  }

  /**
   * Вземане на решение базирано на контекст
   * 
   * @param {Object} context - Обработен контекст от ContextProcessor
   * @returns {Object} Решение с actions и meta данни
   */
  async decide(context) {
    console.log(`[DecisionEngine] Вземане на решение за ${context.type}`);

    // Намиране на приложими правила
    const applicableRules = this.findApplicableRules(context);
    
    if (applicableRules.length === 0) {
      console.log('[DecisionEngine] Няма приложими правила - default action');
      return this.getDefaultDecision(context);
    }

    // Сортиране по приоритет
    applicableRules.sort((a, b) => b.priority - a.priority);
    
    // Избор на главно правило
    const primaryRule = applicableRules[0];
    console.log(`[DecisionEngine] Избрано правило: ${primaryRule.id}`);

    // Генериране на решение
    const decision = await this.generateDecision(context, primaryRule, applicableRules);

    return decision;
  }

  /**
   * Намиране на правила които отговарят на контекста
   */
  findApplicableRules(context) {
    return this.rules.filter(rule => {
      try {
        return rule.condition(context);
      } catch (error) {
        console.error(`[DecisionEngine] Грешка при проверка на правило ${rule.id}:`, error);
        return false;
      }
    });
  }

  /**
   * Генериране на решение
   */
  async generateDecision(context, primaryRule, allRules) {
    const actions = this.determineActions(primaryRule.action, context);
    const timing = this.determineTiming(context, primaryRule);
    const strategy = this.determineStrategy(context, primaryRule);

    return {
      ruleId: primaryRule.id,
      shouldRespond: actions.includes('respond'),
      actions,
      timing,
      strategy,
      meta: {
        confidence: this.calculateConfidence(context, allRules),
        alternativeRules: allRules.slice(1).map(r => r.id),
        reasoning: this.generateReasoning(context, primaryRule)
      }
    };
  }

  /**
   * Определяне на действия базирани на action type
   */
  determineActions(actionType, context) {
    const actionMap = {
      'respond': ['respond'],
      'respond_priority': ['respond', 'mark_priority'],
      'like_and_respond': ['like', 'respond'],
      'maybe_respond': context.meta.priority > 6 ? ['respond'] : ['like'],
      'ignore': []
    };

    return actionMap[actionType] || ['log'];
  }

  /**
   * Определяне на timing за изпълнение
   */
  determineTiming(context, rule) {
    // Високо приоритетни - веднага
    if (context.meta.urgency === 'high' || rule.priority >= 9) {
      return {
        execute: 'immediate',
        delay: 0
      };
    }

    // Средно приоритетни - с малко закъснение (изглежда по-естествено)
    if (context.meta.urgency === 'medium' || rule.priority >= 6) {
      return {
        execute: 'delayed',
        delay: this.randomDelay(30, 120) // 30-120 секунди
      };
    }

    // Ниско приоритетни - може да се изпълни по-късно
    return {
      execute: 'scheduled',
      delay: this.randomDelay(300, 900) // 5-15 минути
    };
  }

  /**
   * Определяне на стратегия за отговор
   */
  determineStrategy(context, rule) {
    return {
      tone: this.determineTone(context),
      style: this.determineStyle(context),
      length: this.determineLength(context),
      personality: this.selectPersonality(context)
    };
  }

  /**
   * Определяне на тон
   */
  determineTone(context) {
    if (context.content.sentiment === 'negative') return 'empathetic';
    if (context.content.sentiment === 'positive') return 'enthusiastic';
    if (context.type === 'direct_message') return 'professional';
    return 'friendly';
  }

  /**
   * Определяне на стил
   */
  determineStyle(context) {
    const language = context.content.language;
    return {
      language,
      formality: context.type === 'direct_message' ? 'formal' : 'casual',
      emoji: language === 'bg' ? 'moderate' : 'light'
    };
  }

  /**
   * Определяне на дължина
   */
  determineLength(context) {
    if (context.type === 'comment') return 'short'; // 1-2 sentences
    if (context.type === 'direct_message') return 'medium'; // 2-4 sentences
    return 'short';
  }

  /**
   * Избор на personality profile
   */
  selectPersonality(context) {
    // TODO: Load from config
    return this.config?.personalities?.default || 'friendly_professional';
  }

  /**
   * Изчисляване на увереност
   */
  calculateConfidence(context, applicableRules) {
    if (applicableRules.length === 0) return 0.3;
    if (applicableRules.length === 1) return 0.9;
    
    // Повече правила = по-ниска увереност
    return Math.max(0.5, 1 - (applicableRules.length * 0.1));
  }

  /**
   * Генериране на reasoning
   */
  generateReasoning(context, rule) {
    return `Applied rule '${rule.id}' due to ${context.type} type and ${context.content.sentiment} sentiment`;
  }

  /**
   * Default решение
   */
  getDefaultDecision(context) {
    return {
      ruleId: 'default',
      shouldRespond: false,
      actions: ['log'],
      timing: {
        execute: 'immediate',
        delay: 0
      },
      strategy: {
        tone: 'neutral',
        style: { language: 'en', formality: 'casual', emoji: 'none' },
        length: 'short',
        personality: 'default'
      },
      meta: {
        confidence: 0.3,
        alternativeRules: [],
        reasoning: 'No applicable rules found - logging only'
      }
    };
  }

  /**
   * Helper за random delay
   */
  randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default DecisionEngine;
