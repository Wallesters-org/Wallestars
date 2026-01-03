/**
 * Rate Limiter Utility
 * 
 * Управление на rate limiting за API заявки
 */

export class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.requests = [];
  }

  /**
   * Проверка дали заявката е разрешена
   */
  async checkLimit(key = 'default') {
    const now = Date.now();
    
    // Премахване на стари заявки
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.windowMs
    );

    // Филтриране по key
    const keyRequests = this.requests.filter(req => req.key === key);

    if (keyRequests.length >= this.maxRequests) {
      const oldestRequest = keyRequests[0];
      const waitTime = this.windowMs - (now - oldestRequest.timestamp);
      
      throw new Error(
        `Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    // Добавяне на текуща заявка
    this.requests.push({ key, timestamp: now });
    
    return true;
  }

  /**
   * Изчистване на лимити за конкретен key
   */
  clearKey(key) {
    this.requests = this.requests.filter(req => req.key !== key);
  }

  /**
   * Изчистване на всички лимити
   */
  clearAll() {
    this.requests = [];
  }

  /**
   * Получаване на текущ брой заявки
   */
  getCurrentCount(key = 'default') {
    const now = Date.now();
    return this.requests.filter(
      req => req.key === key && now - req.timestamp < this.windowMs
    ).length;
  }

  /**
   * Получаване на оставащи заявки
   */
  getRemainingRequests(key = 'default') {
    return Math.max(0, this.maxRequests - this.getCurrentCount(key));
  }
}

export default RateLimiter;
