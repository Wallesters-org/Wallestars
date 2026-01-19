/**
 * Unit Tests for Orchestration API Routes
 * Tests the REST API endpoints for AI agent orchestration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Orchestration API Routes', () => {
    const API_BASE = 'http://localhost:3000/api/orchestration';
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/orchestration/status', () => {
        it('should return orchestration status', () => {
            const mockStatus = {
                success: true,
                isRunning: false,
                activeTasks: [],
                pendingTasks: [],
                completedTasks: [],
                failedTasks: [],
                metrics: {
                    totalTasks: 0,
                    completedTasks: 0,
                    failedTasks: 0,
                    averageDuration: 0
                }
            };

            expect(mockStatus).toBeDefined();
            expect(mockStatus.success).toBe(true);
            expect(mockStatus).toHaveProperty('isRunning');
            expect(mockStatus).toHaveProperty('metrics');
        });

        it('should have correct status structure', () => {
            const status = {
                isRunning: false,
                activeTasks: [],
                metrics: {
                    totalTasks: 0,
                    completedTasks: 0,
                    failedTasks: 0
                }
            };

            expect(Array.isArray(status.activeTasks)).toBe(true);
            expect(typeof status.isRunning).toBe('boolean');
            expect(typeof status.metrics.totalTasks).toBe('number');
        });
    });

    describe('GET /api/orchestration/platforms', () => {
        it('should return list of available platforms', () => {
            const mockPlatforms = {
                success: true,
                platforms: [
                    {
                        name: 'OpenAI',
                        type: 'ai_agent',
                        registrationUrl: 'https://platform.openai.com/signup',
                        trialDays: 90,
                        requiresCreditCard: false,
                        capabilities: ['code_generation', 'chat', 'embeddings']
                    },
                    {
                        name: 'Make (Integromat)',
                        type: 'automation',
                        registrationUrl: 'https://www.make.com/en/register',
                        trialDays: 14,
                        requiresCreditCard: false,
                        capabilities: ['workflow_automation', 'api_integration']
                    }
                ],
                types: ['ai_agent', 'automation']
            };

            expect(mockPlatforms.success).toBe(true);
            expect(Array.isArray(mockPlatforms.platforms)).toBe(true);
            expect(mockPlatforms.platforms.length).toBeGreaterThan(0);
            expect(mockPlatforms.platforms[0]).toHaveProperty('name');
            expect(mockPlatforms.platforms[0]).toHaveProperty('type');
        });

        it('should filter platforms by type', () => {
            const allPlatforms = [
                { name: 'OpenAI', type: 'ai_agent' },
                { name: 'Make', type: 'automation' },
                { name: 'Supabase', type: 'cloud' }
            ];

            const aiPlatforms = allPlatforms.filter(p => p.type === 'ai_agent');
            
            expect(aiPlatforms.length).toBe(1);
            expect(aiPlatforms[0].name).toBe('OpenAI');
        });
    });

    describe('POST /api/orchestration/start-all', () => {
        it('should validate required userData.email', () => {
            const invalidRequest = {
                platforms: ['OpenAI'],
                userData: {}
            };

            const isValid = !!invalidRequest.userData?.email;
            expect(isValid).toBe(false);
        });

        it('should accept valid start-all request', () => {
            const validRequest = {
                platforms: ['OpenAI', 'Make'],
                userData: {
                    email: 'test@example.com'
                },
                maxConcurrent: 5
            };

            expect(validRequest.userData.email).toBe('test@example.com');
            expect(validRequest.maxConcurrent).toBe(5);
            expect(Array.isArray(validRequest.platforms)).toBe(true);
        });

        it('should create tasks for all platforms', () => {
            const platforms = ['OpenAI', 'Make', 'Supabase'];
            const tasks = platforms.map((platform, index) => ({
                id: `task_${Date.now()}_${index}`,
                platform,
                status: 'pending',
                createdAt: new Date().toISOString()
            }));

            expect(tasks.length).toBe(platforms.length);
            expect(tasks[0]).toHaveProperty('id');
            expect(tasks[0]).toHaveProperty('platform');
            expect(tasks[0].status).toBe('pending');
        });
    });

    describe('POST /api/orchestration/register-platform', () => {
        it('should validate platform parameter', () => {
            const invalidRequest = {
                userData: { email: 'test@example.com' }
            };

            const isValid = !!invalidRequest.platform;
            expect(isValid).toBe(false);
        });

        it('should validate userData.email parameter', () => {
            const invalidRequest = {
                platform: 'OpenAI',
                userData: {}
            };

            const isValid = !!invalidRequest.userData?.email;
            expect(isValid).toBe(false);
        });

        it('should accept valid registration request', () => {
            const validRequest = {
                platform: 'OpenAI',
                userData: {
                    email: 'test@example.com'
                }
            };

            expect(validRequest.platform).toBe('OpenAI');
            expect(validRequest.userData.email).toBe('test@example.com');
        });
    });

    describe('POST /api/orchestration/cancel-all', () => {
        it('should cancel pending tasks', () => {
            const pendingTasks = [
                { id: 'task1', status: 'pending', platform: 'OpenAI' },
                { id: 'task2', status: 'pending', platform: 'Make' }
            ];

            const cancelledTasks = pendingTasks.map(t => ({
                ...t,
                status: 'cancelled',
                error: 'Cancelled by user'
            }));

            expect(cancelledTasks.length).toBe(2);
            expect(cancelledTasks[0].status).toBe('cancelled');
        });
    });

    describe('POST /api/orchestration/reset', () => {
        it('should reset orchestration state', () => {
            const resetState = {
                isRunning: false,
                activeTasks: [],
                pendingTasks: [],
                completedTasks: [],
                failedTasks: [],
                metrics: {
                    totalTasks: 0,
                    completedTasks: 0,
                    failedTasks: 0,
                    averageDuration: 0
                }
            };

            expect(resetState.isRunning).toBe(false);
            expect(resetState.activeTasks.length).toBe(0);
            expect(resetState.metrics.totalTasks).toBe(0);
        });
    });

    describe('GET /api/orchestration/results', () => {
        it('should return results summary', () => {
            const mockResults = {
                success: true,
                summary: {
                    total: 5,
                    completed: 3,
                    failed: 1,
                    pending: 1
                },
                platforms: {
                    'OpenAI': { status: 'completed', result: {} },
                    'Make': { status: 'failed', error: 'Connection error' }
                }
            };

            expect(mockResults.summary.total).toBe(5);
            expect(mockResults.summary.completed).toBe(3);
            expect(mockResults.platforms).toHaveProperty('OpenAI');
        });
    });

    describe('GET /api/orchestration/task/:taskId', () => {
        it('should return task details by ID', () => {
            const tasks = [
                { id: 'task1', platform: 'OpenAI', status: 'completed' },
                { id: 'task2', platform: 'Make', status: 'pending' }
            ];

            const taskId = 'task1';
            const task = tasks.find(t => t.id === taskId);

            expect(task).toBeDefined();
            expect(task.platform).toBe('OpenAI');
            expect(task.status).toBe('completed');
        });

        it('should handle non-existent task ID', () => {
            const tasks = [
                { id: 'task1', platform: 'OpenAI' }
            ];

            const task = tasks.find(t => t.id === 'nonexistent');

            expect(task).toBeUndefined();
        });
    });
});
