/**
 * Eva Core - Примерен скрипт
 * 
 * Демонстрира как да се използва Eva Core за обработка на съобщения
 */

import { EvaCore } from '../src/index.js';

async function runExample() {
  console.log('='.repeat(60));
  console.log('EVA CORE - DEMONSTRATION');
  console.log('='.repeat(60));
  console.log('');

  // Създаване на Eva instance
  const eva = new EvaCore({
    configPath: './config/eva-config.template.json'
  });

  try {
    // Инициализация
    await eva.initialize();
    console.log('');

    // Пример 1: Instagram Direct Message
    console.log('--- ПРИМЕР 1: Instagram Direct Message ---');
    const result1 = await eva.process({
      platform: 'instagram',
      type: 'direct_message',
      userId: 'user123',
      data: {
        id: 'msg_001',
        from: '@john_doe',
        content: 'Здравейте! Имам въпрос относно вашия продукт.',
        timestamp: Date.now()
      }
    });
    console.log('Резултат:', JSON.stringify(result1, null, 2));
    console.log('');

    // Пример 2: Negative Comment
    console.log('--- ПРИМЕР 2: Negative Comment ---');
    const result2 = await eva.process({
      platform: 'instagram',
      type: 'comment',
      userId: 'user456',
      data: {
        id: 'comment_002',
        from: '@angry_user',
        content: 'Това не работи! Лошо качество!',
        timestamp: Date.now()
      }
    });
    console.log('Резултат:', JSON.stringify(result2, null, 2));
    console.log('');

    // Пример 3: Positive Mention
    console.log('--- ПРИМЕР 3: Positive Mention ---');
    const result3 = await eva.process({
      platform: 'instagram',
      type: 'mention',
      userId: 'user789',
      data: {
        id: 'mention_003',
        from: '@happy_customer',
        content: 'Страхотен продукт! Благодаря @yourcompany! 🎉',
        timestamp: Date.now()
      }
    });
    console.log('Резултат:', JSON.stringify(result3, null, 2));
    console.log('');

    // Пример 4: Telegram Message
    console.log('--- ПРИМЕР 4: Telegram Message ---');
    const result4 = await eva.process({
      platform: 'telegram',
      type: 'direct_message',
      userId: 'telegram_user_100',
      data: {
        message_id: 'tg_msg_004',
        from: {
          id: 123456789,
          username: 'telegram_user'
        },
        text: 'Can you help me with the setup?',
        timestamp: Date.now()
      }
    });
    console.log('Резултат:', JSON.stringify(result4, null, 2));
    console.log('');

    // Спиране на системата
    await eva.shutdown();

  } catch (error) {
    console.error('Грешка:', error);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('DEMONSTRATION COMPLETE');
  console.log('='.repeat(60));
}

// Изпълнение
runExample().catch(console.error);
