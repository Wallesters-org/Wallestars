/**
 * Eva Core - Главен входна точка
 * 
 * Този модул е централната част на Eva AI алгоритъма.
 * Координира всички компоненти и осигурява API за външна употреба.
 */

import { config } from 'dotenv';
import { ContextProcessor } from './core/ContextProcessor.js';
import { DecisionEngine } from './core/DecisionEngine.js';
import { ResponseGenerator } from './core/ResponseGenerator.js';
import { ActionExecutor } from './core/ActionExecutor.js';
import { loadConfig } from './utils/config-loader.js';

// Зареждане на environment variables
config();

/**
 * Eva Core Class
 * Главен клас за управление на Eva AI системата
 */
export class EvaCore {
  constructor(options = {}) {
    this.config = loadConfig(options.configPath);
    this.initialized = false;
    
    // Инициализация на компоненти
    this.contextProcessor = null;
    this.decisionEngine = null;
    this.responseGenerator = null;
    this.actionExecutor = null;
  }

  /**
   * Инициализация на Eva Core системата
   */
  async initialize() {
    if (this.initialized) {
      console.log('[Eva] Системата вече е инициализирана');
      return;
    }

    console.log('[Eva] Инициализация на Eva Core...');
    
    try {
      // Инициализация на всички компоненти
      this.contextProcessor = new ContextProcessor(this.config);
      this.decisionEngine = new DecisionEngine(this.config);
      this.responseGenerator = new ResponseGenerator(this.config);
      this.actionExecutor = new ActionExecutor(this.config);

      await this.contextProcessor.initialize();
      await this.decisionEngine.initialize();
      await this.responseGenerator.initialize();
      await this.actionExecutor.initialize();

      this.initialized = true;
      console.log('[Eva] ✓ Системата е инициализирана успешно');
    } catch (error) {
      console.error('[Eva] Грешка при инициализация:', error);
      throw error;
    }
  }

  /**
   * Обработка на входящо съобщение/събитие
   * 
   * @param {Object} input - Входни данни
   * @param {string} input.platform - Платформа (instagram, telegram, etc.)
   * @param {string} input.type - Тип събитие (message, comment, mention, etc.)
   * @param {Object} input.data - Данни за събитието
   * @param {string} input.userId - ID на потребителя
   * @returns {Object} Резултат от обработката
   */
  async process(input) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`[Eva] Обработка на ${input.type} от ${input.platform}`);

    try {
      // 1. Обработка на контекст
      const context = await this.contextProcessor.process({
        platform: input.platform,
        type: input.type,
        data: input.data,
        userId: input.userId
      });

      // 2. Вземане на решение
      const decision = await this.decisionEngine.decide(context);

      // 3. Генериране на отговор (ако е необходимо)
      let response = null;
      if (decision.shouldRespond) {
        response = await this.responseGenerator.generate(context, decision);
      }

      // 4. Изпълнение на действия
      const result = await this.actionExecutor.execute(decision, response);

      console.log('[Eva] ✓ Обработката е завършена успешно');
      
      return {
        success: true,
        context,
        decision,
        response,
        result
      };
    } catch (error) {
      console.error('[Eva] Грешка при обработка:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Спиране на Eva Core системата
   */
  async shutdown() {
    console.log('[Eva] Спиране на системата...');
    
    if (this.actionExecutor) {
      await this.actionExecutor.cleanup();
    }
    
    this.initialized = false;
    console.log('[Eva] ✓ Системата е спряна');
  }
}

// Export на default instance
export default EvaCore;

// Ако се изпълнява директно (не като модул)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Eva Core - AI Automation Engine');
  console.log('Версия: 1.0.0');
  console.log('');
  console.log('За използване като модул:');
  console.log('  import { EvaCore } from "@wallestars/eva-core"');
  console.log('');
  console.log('Пример:');
  console.log('  const eva = new EvaCore();');
  console.log('  await eva.initialize();');
  console.log('  const result = await eva.process({ ... });');
}
