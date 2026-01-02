/**
 * Retry Utility
 * 
 * Автоматично повторение при грешки
 */

export class RetryHelper {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.delayMs = options.delayMs || 1000;
    this.backoff = options.backoff || 'exponential'; // 'exponential' or 'linear'
  }

  /**
   * Изпълнение на функция с retry логика
   * 
   * @param {Function} fn - Функция за изпълнение
   * @param {Object} options - Опции за конкретна заявка
   * @returns {Promise} Резултат от функцията
   */
  async execute(fn, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = this.calculateDelay(attempt);
          console.log(
            `[RetryHelper] Attempt ${attempt + 1}/${maxRetries + 1} failed. ` +
            `Retrying in ${delay}ms...`
          );
          
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed after ${maxRetries + 1} attempts: ${lastError.message}`
    );
  }

  /**
   * Изчисляване на закъснение
   */
  calculateDelay(attempt) {
    if (this.backoff === 'exponential') {
      return this.delayMs * Math.pow(2, attempt);
    }
    return this.delayMs * (attempt + 1);
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default RetryHelper;
