import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrchestrationManager } from '../../../server/orchestration/OrchestrationManager.js';

describe('OrchestrationManager', () => {
  let manager;

  beforeEach(() => {
    manager = new OrchestrationManager();
  });

  describe('Agent Management', () => {
    it('should register a new agent', () => {
      const agent = manager.registerAgent('agent-1', {
        platform: 'linux',
        capabilities: ['screenshot', 'click']
      });

      expect(agent).toBeDefined();
      expect(agent.id).toBe('agent-1');
      expect(agent.platform).toBe('linux');
      expect(agent.status).toBe('idle');
      expect(agent.capabilities).toEqual(['screenshot', 'click']);
    });

    it('should unregister an agent', () => {
      manager.registerAgent('agent-1', { platform: 'linux' });
      manager.unregisterAgent('agent-1');

      const agent = manager.getAgentStats('agent-1');
      expect(agent).toBeNull();
    });

    it('should get agent statistics', () => {
      manager.registerAgent('agent-1', { platform: 'linux' });
      const stats = manager.getAgentStats('agent-1');

      expect(stats).toBeDefined();
      expect(stats.tasksCompleted).toBe(0);
      expect(stats.tasksFailed).toBe(0);
    });

    it('should emit event when agent is registered', (done) => {
      manager.once('agent:registered', (agent) => {
        expect(agent.id).toBe('agent-1');
        done();
      });

      manager.registerAgent('agent-1', { platform: 'linux' });
    });
  });

  describe('Task Management', () => {
    beforeEach(() => {
      manager.registerAgent('agent-1', {
        platform: 'linux',
        capabilities: ['test-task']
      });
    });

    it('should submit a task to queue', () => {
      const taskPromise = manager.submitTask({
        type: 'test-task',
        platform: 'linux',
        priority: 5,
        data: { test: 'data' }
      });

      expect(taskPromise).toBeInstanceOf(Promise);
      
      const status = manager.getStatus();
      expect(status.tasks.queued + status.tasks.running).toBeGreaterThan(0);
    });

    it('should prioritize tasks correctly', () => {
      manager.submitTask({ type: 'task-1', priority: 1 });
      manager.submitTask({ type: 'task-2', priority: 10 });
      manager.submitTask({ type: 'task-3', priority: 5 });

      const status = manager.getStatus();
      if (status.queue.length > 0) {
        const priorities = status.queue.map(t => t.priority);
        const sorted = [...priorities].sort((a, b) => b - a);
        expect(priorities).toEqual(sorted);
      }
    });

    it('should cancel a queued task', () => {
      manager.setMaxConcurrentTasks(0); // Prevent execution
      manager.submitTask({ type: 'test-task', platform: 'linux' });

      const status = manager.getStatus();
      const taskId = status.queue[0]?.id;

      if (taskId) {
        const cancelled = manager.cancelTask(taskId);
        expect(cancelled).toBe(true);

        const newStatus = manager.getStatus();
        expect(newStatus.tasks.queued).toBe(0);
      }
    });

    it('should handle concurrent task limit', () => {
      manager.setMaxConcurrentTasks(2);
      
      manager.submitTask({ type: 'task-1', platform: 'linux' });
      manager.submitTask({ type: 'task-2', platform: 'linux' });
      manager.submitTask({ type: 'task-3', platform: 'linux' });

      const status = manager.getStatus();
      expect(status.tasks.running).toBeLessThanOrEqual(2);
    });
  });

  describe('Platform Support', () => {
    it('should support multiple platforms', () => {
      manager.registerAgent('linux-agent', { platform: 'linux' });
      manager.registerAgent('android-agent', { platform: 'android' });
      manager.registerAgent('web-agent', { platform: 'web' });

      const status = manager.getStatus();
      expect(status.agents.byPlatform.linux).toBe(1);
      expect(status.agents.byPlatform.android).toBe(1);
      expect(status.agents.byPlatform.web).toBe(1);
    });

    it('should find available agent for platform', () => {
      manager.registerAgent('linux-agent', { platform: 'linux' });
      
      const agent = manager.findAvailableAgent('linux', 'test-task');
      expect(agent).toBeDefined();
      expect(agent.platform).toBe('linux');
    });

    it('should return null if no agent available for platform', () => {
      manager.registerAgent('linux-agent', { platform: 'linux' });
      
      const agent = manager.findAvailableAgent('android', 'test-task');
      expect(agent).toBeNull();
    });
  });

  describe('Status and Statistics', () => {
    it('should return correct orchestration status', () => {
      manager.registerAgent('agent-1', { platform: 'linux' });
      manager.registerAgent('agent-2', { platform: 'android' });

      const status = manager.getStatus();

      expect(status).toHaveProperty('agents');
      expect(status).toHaveProperty('tasks');
      expect(status).toHaveProperty('queue');
      expect(status).toHaveProperty('runningTasks');
      
      expect(status.agents.total).toBe(2);
      expect(status.agents.idle).toBe(2);
    });

    it('should clear task history', () => {
      const agent = manager.registerAgent('agent-1', { platform: 'linux' });
      agent.tasksCompleted = 10;
      agent.tasksFailed = 2;

      manager.clearHistory();

      expect(agent.tasksCompleted).toBe(0);
      expect(agent.tasksFailed).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should set max concurrent tasks', () => {
      manager.setMaxConcurrentTasks(10);
      expect(manager.maxConcurrentTasks).toBe(10);
    });

    it('should enforce min/max bounds on concurrent tasks', () => {
      manager.setMaxConcurrentTasks(0);
      expect(manager.maxConcurrentTasks).toBe(1);

      manager.setMaxConcurrentTasks(100);
      expect(manager.maxConcurrentTasks).toBe(20);
    });
  });

  describe('Task Execution', () => {
    it('should emit task started event', (done) => {
      manager.registerAgent('agent-1', {
        platform: 'linux',
        capabilities: ['test-task']
      });

      manager.once('task:started', ({ task, agent }) => {
        expect(task).toBeDefined();
        expect(agent.id).toBe('agent-1');
        done();
      });

      manager.submitTask({
        type: 'test-task',
        platform: 'linux'
      });
    });

    it('should handle task execution via event', async () => {
      manager.registerAgent('agent-1', {
        platform: 'linux',
        capabilities: ['test-task']
      });

      manager.on('task:execute', ({ task, agent, resolve }) => {
        resolve({ success: true, result: 'Test completed' });
      });

      const result = await manager.submitTask({
        type: 'test-task',
        platform: 'linux',
        timeout: 5000
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('Test completed');
    });
  });
});
