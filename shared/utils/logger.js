/**
 * Logger Utility
 * 
 * Централизирано логване за всички компоненти
 */

export class Logger {
  constructor(component) {
    this.component = component;
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.log(`[${this.component}] ℹ️  ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.component}] ⚠️  ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (this.shouldLog('error')) {
      console.error(`[${this.component}] ❌ ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.debug(`[${this.component}] 🐛 ${message}`, ...args);
    }
  }

  success(message, ...args) {
    if (this.shouldLog('info')) {
      console.log(`[${this.component}] ✅ ${message}`, ...args);
    }
  }

  shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevel = levels.indexOf(this.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel <= currentLevel;
  }
}

export default Logger;
