// Eva Core - Basic Tests

import { EvaCore } from '../src/index.js';
import { test } from 'node:test';
import assert from 'node:assert';

test('Eva Core initialization', async (t) => {
  const eva = new EvaCore();
  
  await eva.initialize();
  assert.strictEqual(eva.initialized, true, 'Eva should be initialized');
  
  await eva.shutdown();
});

test('Process Instagram DM', async (t) => {
  const eva = new EvaCore();
  await eva.initialize();
  
  const result = await eva.process({
    platform: 'instagram',
    type: 'direct_message',
    userId: 'test_user',
    data: {
      id: 'test_msg',
      content: 'Test message',
      from: '@test_user'
    }
  });
  
  assert.strictEqual(result.success, true, 'Processing should succeed');
  assert.ok(result.context, 'Should have context');
  assert.ok(result.decision, 'Should have decision');
  
  await eva.shutdown();
});

test('Sentiment analysis', async (t) => {
  const eva = new EvaCore();
  await eva.initialize();
  
  // Positive sentiment
  const positiveResult = await eva.process({
    platform: 'instagram',
    type: 'comment',
    userId: 'user1',
    data: {
      id: 'msg1',
      content: 'This is great! Thanks!',
      from: '@user1'
    }
  });
  
  assert.strictEqual(
    positiveResult.context.content.sentiment, 
    'positive',
    'Should detect positive sentiment'
  );
  
  // Negative sentiment
  const negativeResult = await eva.process({
    platform: 'instagram',
    type: 'comment',
    userId: 'user2',
    data: {
      id: 'msg2',
      content: 'This is terrible! It does not work!',
      from: '@user2'
    }
  });
  
  assert.strictEqual(
    negativeResult.context.content.sentiment,
    'negative',
    'Should detect negative sentiment'
  );
  
  await eva.shutdown();
});

test('Decision making for different message types', async (t) => {
  const eva = new EvaCore();
  await eva.initialize();
  
  // Direct message should always respond
  const dmResult = await eva.process({
    platform: 'telegram',
    type: 'direct_message',
    userId: 'user_dm',
    data: {
      id: 'dm_1',
      text: 'Hello',
      from: { id: 123 }
    }
  });
  
  assert.strictEqual(
    dmResult.decision.shouldRespond,
    true,
    'Should respond to DMs'
  );
  
  // Regular comment might not always respond
  const commentResult = await eva.process({
    platform: 'instagram',
    type: 'comment',
    userId: 'user_comment',
    data: {
      id: 'comment_1',
      content: 'Nice',
      from: '@user_comment'
    }
  });
  
  assert.ok(commentResult.decision, 'Should have decision for comment');
  
  await eva.shutdown();
});

console.log('Running Eva Core tests...\n');
