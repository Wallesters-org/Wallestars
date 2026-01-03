/**
 * Config Loader
 * 
 * Зарежда и валидира Eva конфигурация
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Зареждане на конфигурация от файл
 * 
 * @param {string} configPath - Път към config файл
 * @returns {Object} Заредена конфигурация
 */
export function loadConfig(configPath) {
  // Default path
  const defaultPath = process.env.EVA_CONFIG_PATH || 
                     resolve(process.cwd(), 'eva-core/config/eva-config.json');
  
  const path = configPath || defaultPath;

  try {
    console.log(`[Config] Зареждане на конфигурация от: ${path}`);
    const content = readFileSync(path, 'utf-8');
    const config = JSON.parse(content);
    
    console.log('[Config] ✓ Конфигурацията е заредена успешно');
    return validateConfig(config);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('[Config] ⚠ Config файл не е намерен - използва се default конфигурация');
      return getDefaultConfig();
    }
    
    console.error('[Config] Грешка при зареждане:', error);
    throw error;
  }
}

/**
 * Валидация на конфигурация
 */
function validateConfig(config) {
  // Basic validation
  if (!config.name) {
    console.warn('[Config] ⚠ Липсва име на Eva instance');
  }

  if (!config.platforms || config.platforms.length === 0) {
    console.warn('[Config] ⚠ Няма конфигурирани платформи');
  }

  return config;
}

/**
 * Default конфигурация
 */
function getDefaultConfig() {
  return {
    name: 'Eva Default',
    version: '1.0.0',
    platforms: ['instagram', 'telegram'],
    personalities: {
      default: 'friendly_professional'
    },
    rules: {
      respond_to_mentions: true,
      respond_to_dms: true,
      auto_like: false,
      auto_follow: false
    },
    limits: {
      max_responses_per_hour: 60,
      max_actions_per_hour: 100
    }
  };
}

export default loadConfig;
