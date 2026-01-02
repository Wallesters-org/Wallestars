/**
 * Response Generator
 * 
 * Генерира персонализирани отговори използвайки AI (OpenAI/Claude)
 * - Създава подходящи отговори базирани на контекст
 * - Използва personality profiles
 * - Адаптира стил и тон
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export class ResponseGenerator {
  constructor(config) {
    this.config = config;
    this.anthropic = null;
    this.openai = null;
    this.initialized = false;
  }

  async initialize() {
    console.log('[ResponseGenerator] Инициализация...');
    
    // Инициализация на AI клиенти
    if (process.env.CLAUDE_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY
      });
      console.log('[ResponseGenerator] ✓ Claude AI initialized');
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('[ResponseGenerator] ✓ OpenAI initialized');
    }

    if (!this.anthropic && !this.openai) {
      console.warn('[ResponseGenerator] ⚠ Няма налични AI API keys - използва се fallback mode');
    }

    this.initialized = true;
  }

  /**
   * Генериране на отговор
   * 
   * @param {Object} context - Контекст от ContextProcessor
   * @param {Object} decision - Решение от DecisionEngine
   * @returns {Object} Генериран отговор
   */
  async generate(context, decision) {
    console.log(`[ResponseGenerator] Генериране на ${decision.strategy.length} отговор с ${decision.strategy.tone} тон`);

    // Подготовка на prompt
    const prompt = this.buildPrompt(context, decision);

    // Генериране с AI или fallback
    let generatedText;
    if (this.anthropic) {
      generatedText = await this.generateWithClaude(prompt, decision);
    } else if (this.openai) {
      generatedText = await this.generateWithOpenAI(prompt, decision);
    } else {
      generatedText = this.generateFallback(context, decision);
    }

    // Post-processing
    const finalResponse = this.postProcess(generatedText, decision);

    return {
      text: finalResponse,
      meta: {
        prompt: prompt.substring(0, 200) + '...',
        model: this.getUsedModel(),
        tokens: generatedText.length,
        strategy: decision.strategy
      }
    };
  }

  /**
   * Създаване на prompt за AI
   */
  buildPrompt(context, decision) {
    const { strategy } = decision;
    const { content, user } = context;

    let prompt = `Ти си Eva - AI асистент за социални мрежи. Отговаряш на ${context.platform}.\n\n`;

    // Инструкции за тон
    prompt += `Тон: ${strategy.tone}\n`;
    prompt += `Стил: ${strategy.style.formality}\n`;
    prompt += `Дължина: ${strategy.length}\n`;
    prompt += `Език: ${strategy.style.language === 'bg' ? 'български' : 'английски'}\n\n`;

    // Контекст за съобщението
    prompt += `Получено съобщение:\n"${content.raw}"\n\n`;

    // Sentiment и keywords
    if (content.sentiment) {
      prompt += `Sentiment: ${content.sentiment}\n`;
    }
    if (content.keywords.length > 0) {
      prompt += `Ключови думи: ${content.keywords.join(', ')}\n`;
    }

    // Инструкции за отговор
    prompt += `\nГенерирай подходящ ${strategy.length} отговор който е:\n`;
    prompt += `- ${strategy.tone}\n`;
    prompt += `- ${strategy.style.formality}\n`;
    if (strategy.style.emoji !== 'none') {
      prompt += `- С умерена употреба на емоджита\n`;
    }
    prompt += `\nОтговор:`;

    return prompt;
  }

  /**
   * Генериране с Claude AI
   */
  async generateWithClaude(prompt, decision) {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: this.getMaxTokens(decision.strategy.length),
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('[ResponseGenerator] Грешка при Claude API:', error.message);
      return this.generateFallback(null, decision);
    }
  }

  /**
   * Генериране с OpenAI
   */
  async generateWithOpenAI(prompt, decision) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        max_tokens: this.getMaxTokens(decision.strategy.length),
        messages: [{
          role: 'system',
          content: 'Ти си Eva - AI асистент за социални мрежи.'
        }, {
          role: 'user',
          content: prompt
        }]
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('[ResponseGenerator] Грешка при OpenAI API:', error.message);
      return this.generateFallback(null, decision);
    }
  }

  /**
   * Fallback генериране (ако няма AI)
   */
  generateFallback(context, decision) {
    const { tone, style } = decision.strategy;

    const templates = {
      empathetic: {
        bg: 'Разбираме те и ще се погрижим за проблема. Благодарим за обратната връзка!',
        en: 'We understand your concern and will take care of it. Thank you for your feedback!'
      },
      enthusiastic: {
        bg: 'Благодарим за подкрепата! 🎉 Радваме се че ти харесва!',
        en: 'Thank you for your support! 🎉 We\'re glad you like it!'
      },
      professional: {
        bg: 'Благодарим за съобщението. Ще ти отговорим възможно най-скоро.',
        en: 'Thank you for your message. We will respond as soon as possible.'
      },
      friendly: {
        bg: 'Здравей! Благодарим че се свърза с нас 😊',
        en: 'Hi there! Thanks for reaching out 😊'
      }
    };

    const lang = style.language || 'en';
    return templates[tone]?.[lang] || templates.friendly[lang];
  }

  /**
   * Post-processing на генерирания текст
   */
  postProcess(text, decision) {
    let processed = text.trim();

    // Премахване на quotes ако има
    if (processed.startsWith('"') && processed.endsWith('"')) {
      processed = processed.slice(1, -1);
    }

    // Ограничаване на дължината според стратегията
    if (decision.strategy.length === 'short') {
      processed = this.truncateToSentences(processed, 2);
    } else if (decision.strategy.length === 'medium') {
      processed = this.truncateToSentences(processed, 4);
    }

    return processed;
  }

  /**
   * Truncate до N sentences
   */
  truncateToSentences(text, maxSentences) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, maxSentences).join(' ').trim();
  }

  /**
   * Определяне на max tokens според length
   */
  getMaxTokens(length) {
    const tokenMap = {
      short: 100,
      medium: 200,
      long: 400
    };
    return tokenMap[length] || 150;
  }

  /**
   * Get used model name
   */
  getUsedModel() {
    if (this.anthropic) return 'claude-3-5-sonnet';
    if (this.openai) return 'gpt-4';
    return 'fallback';
  }
}

export default ResponseGenerator;
