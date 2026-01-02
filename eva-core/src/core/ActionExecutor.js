/**
 * Action Executor
 * 
 * Изпълнява решенията взети от Decision Engine
 * - Изпраща отговори
 * - Изпълнява социални действия (like, follow, etc.)
 * - Управлява timing и scheduling
 */

export class ActionExecutor {
  constructor(config) {
    this.config = config;
    this.pendingActions = [];
    this.initialized = false;
  }

  async initialize() {
    console.log('[ActionExecutor] Инициализация...');
    this.initialized = true;
  }

  /**
   * Изпълнение на действия
   * 
   * @param {Object} decision - Решение от DecisionEngine
   * @param {Object} response - Генериран отговор (ако има)
   * @returns {Object} Резултат от изпълнението
   */
  async execute(decision, response) {
    console.log(`[ActionExecutor] Изпълнение на ${decision.actions.length} действия`);

    const results = [];

    // Проверка за timing
    if (decision.timing.execute === 'delayed' || decision.timing.execute === 'scheduled') {
      return this.scheduleExecution(decision, response);
    }

    // Immediate execution
    for (const action of decision.actions) {
      try {
        const result = await this.executeAction(action, decision, response);
        results.push(result);
      } catch (error) {
        console.error(`[ActionExecutor] Грешка при изпълнение на ${action}:`, error);
        results.push({
          action,
          success: false,
          error: error.message
        });
      }
    }

    return {
      executed: true,
      timing: decision.timing,
      results
    };
  }

  /**
   * Изпълнение на единично действие
   */
  async executeAction(action, decision, response) {
    console.log(`[ActionExecutor] Изпълнение: ${action}`);

    switch (action) {
      case 'respond':
        return this.sendResponse(response, decision);
      
      case 'like':
        return this.performLike(decision);
      
      case 'follow':
        return this.performFollow(decision);
      
      case 'mark_priority':
        return this.markAsPriority(decision);
      
      case 'log':
        return this.logInteraction(decision);
      
      default:
        console.warn(`[ActionExecutor] Непознато действие: ${action}`);
        return {
          action,
          success: false,
          error: 'Unknown action type'
        };
    }
  }

  /**
   * Изпращане на отговор
   */
  async sendResponse(response, decision) {
    if (!response) {
      return {
        action: 'respond',
        success: false,
        error: 'No response provided'
      };
    }

    console.log(`[ActionExecutor] Изпращане на отговор: "${response.text.substring(0, 50)}..."`);

    // TODO: Интеграция с платформени API
    // За момента само логваме
    
    return {
      action: 'respond',
      success: true,
      data: {
        text: response.text,
        model: response.meta.model,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Харесване на съдържание
   */
  async performLike(decision) {
    console.log('[ActionExecutor] Харесване на съдържание');

    // TODO: Интеграция с платформени API
    
    return {
      action: 'like',
      success: true,
      data: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Последване на потребител
   */
  async performFollow(decision) {
    console.log('[ActionExecutor] Последване на потребител');

    // TODO: Интеграция с платформени API
    
    return {
      action: 'follow',
      success: true,
      data: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Маркиране като приоритет
   */
  async markAsPriority(decision) {
    console.log('[ActionExecutor] Маркиране като приоритет');

    // TODO: Съхраняване в database
    
    return {
      action: 'mark_priority',
      success: true,
      data: {
        priority: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Логване на взаимодействие
   */
  async logInteraction(decision) {
    console.log('[ActionExecutor] Логване на взаимодействие');

    // TODO: Съхраняване в database
    
    return {
      action: 'log',
      success: true,
      data: {
        ruleId: decision.ruleId,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Закъснено/Планирано изпълнение
   */
  async scheduleExecution(decision, response) {
    const delay = decision.timing.delay * 1000; // секунди -> милисекунди
    
    console.log(`[ActionExecutor] Планиране на изпълнение след ${decision.timing.delay}s`);

    const scheduledAction = {
      decision,
      response,
      scheduledFor: Date.now() + delay
    };

    this.pendingActions.push(scheduledAction);

    // Планиране с setTimeout
    setTimeout(async () => {
      console.log('[ActionExecutor] Изпълнение на планирано действие');
      await this.execute(
        { ...decision, timing: { execute: 'immediate', delay: 0 } },
        response
      );
      
      // Премахване от pending
      this.pendingActions = this.pendingActions.filter(a => a !== scheduledAction);
    }, delay);

    return {
      executed: false,
      scheduled: true,
      timing: decision.timing,
      scheduledFor: new Date(scheduledAction.scheduledFor).toISOString()
    };
  }

  /**
   * Cleanup на pending actions
   */
  async cleanup() {
    console.log(`[ActionExecutor] Cleanup - ${this.pendingActions.length} pending actions`);
    this.pendingActions = [];
  }
}

export default ActionExecutor;
