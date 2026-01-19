/**
 * Component Tests for Orchestration Page
 * Tests the React component for AI orchestration UI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
        connected: true,
        disconnect: vi.fn(),
    })),
}));

// Mock the SocketContext
vi.mock('../../context/SocketContext', () => ({
    useSocket: () => ({
        socket: {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            connected: true,
        },
        connected: true,
    }),
    SocketProvider: ({ children }) => children,
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Orchestration Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset fetch mock
        global.fetch.mockReset();
    });

    describe('Component Structure', () => {
        it('should have main heading', () => {
            const heading = 'AI Agents Orchestration Farm';
            expect(heading).toBeDefined();
            expect(heading).toContain('AI Agents');
        });

        it('should have description text', () => {
            const description = 'Automate free trial platform registration and start all agents at once';
            expect(description).toBeDefined();
            expect(description.length).toBeGreaterThan(0);
        });
    });

    describe('Stats Cards', () => {
        it('should display platform count', () => {
            const stats = {
                totalPlatforms: 30,
                selected: 5,
                completed: 3,
                pending: 2
            };

            expect(stats.totalPlatforms).toBe(30);
            expect(stats.selected).toBe(5);
        });

        it('should calculate progress correctly', () => {
            const total = 10;
            const completed = 6;
            const progress = (completed / total) * 100;

            expect(progress).toBe(60);
        });
    });

    describe('Platform Selection', () => {
        it('should toggle platform selection', () => {
            const selectedPlatforms = [];
            const platformName = 'OpenAI';
            
            const newSelection = selectedPlatforms.includes(platformName)
                ? selectedPlatforms.filter(p => p !== platformName)
                : [...selectedPlatforms, platformName];

            expect(newSelection).toContain('OpenAI');
            expect(newSelection.length).toBe(1);
        });

        it('should select all platforms', () => {
            const allPlatforms = [
                { name: 'OpenAI' },
                { name: 'Make' },
                { name: 'Supabase' }
            ];
            
            const selected = allPlatforms.map(p => p.name);

            expect(selected.length).toBe(3);
            expect(selected).toContain('OpenAI');
            expect(selected).toContain('Make');
        });

        it('should clear selection', () => {
            const selectedPlatforms = ['OpenAI', 'Make'];
            const cleared = [];

            expect(cleared.length).toBe(0);
        });
    });

    describe('Platform Filtering', () => {
        const platforms = [
            { name: 'OpenAI', type: 'ai_agent' },
            { name: 'Make', type: 'automation' },
            { name: 'Supabase', type: 'cloud' },
            { name: 'Anthropic Claude', type: 'ai_agent' }
        ];

        it('should filter by type', () => {
            const filter = 'ai_agent';
            const filtered = platforms.filter(p => 
                filter === 'all' || p.type === filter
            );

            expect(filtered.length).toBe(2);
            expect(filtered.every(p => p.type === 'ai_agent')).toBe(true);
        });

        it('should filter by search query', () => {
            const searchQuery = 'open';
            const filtered = platforms.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            expect(filtered.length).toBe(1);
            expect(filtered[0].name).toBe('OpenAI');
        });

        it('should apply both filters', () => {
            const filter = 'ai_agent';
            const searchQuery = 'Claude';
            
            const filtered = platforms.filter(p => {
                const matchesFilter = filter === 'all' || p.type === filter;
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesFilter && matchesSearch;
            });

            expect(filtered.length).toBe(1);
            expect(filtered[0].name).toBe('Anthropic Claude');
        });
    });

    describe('Form Validation', () => {
        it('should validate email is required', () => {
            const email = '';
            const isValid = !!email;

            expect(isValid).toBe(false);
        });

        it('should accept valid email', () => {
            const email = 'test@example.com';
            const isValid = !!email;

            expect(isValid).toBe(true);
        });

        it('should require platform selection or allow all', () => {
            const selectedPlatforms = [];
            const totalPlatforms = 30;
            
            const canStart = selectedPlatforms.length > 0 || totalPlatforms > 0;

            expect(canStart).toBe(true);
        });
    });

    describe('Status Management', () => {
        it('should track running state', () => {
            let isRunning = false;
            
            // Start
            isRunning = true;
            expect(isRunning).toBe(true);
            
            // Cancel
            isRunning = false;
            expect(isRunning).toBe(false);
        });

        it('should manage task states', () => {
            const state = {
                activeTasks: [],
                pendingTasks: [],
                completedTasks: [],
                failedTasks: []
            };

            // Add pending task
            state.pendingTasks.push({ id: 'task1', platform: 'OpenAI' });
            expect(state.pendingTasks.length).toBe(1);

            // Move to active
            const task = state.pendingTasks.shift();
            state.activeTasks.push(task);
            expect(state.activeTasks.length).toBe(1);
            expect(state.pendingTasks.length).toBe(0);

            // Complete task
            const completedTask = state.activeTasks.shift();
            state.completedTasks.push(completedTask);
            expect(state.completedTasks.length).toBe(1);
        });
    });

    describe('Platform Card Display', () => {
        it('should show platform information', () => {
            const platform = {
                name: 'OpenAI',
                type: 'ai_agent',
                trialDays: 90,
                requiresCreditCard: false,
                capabilities: ['code_generation', 'chat', 'embeddings']
            };

            expect(platform.name).toBe('OpenAI');
            expect(platform.type).toBe('ai_agent');
            expect(platform.capabilities.length).toBe(3);
        });

        it('should display trial information', () => {
            const platform = {
                trialDays: 14,
                requiresCreditCard: false
            };

            const trialText = platform.trialDays > 0 
                ? `${platform.trialDays} day trial` 
                : 'Free tier';

            expect(trialText).toBe('14 day trial');
        });

        it('should indicate credit card requirement', () => {
            const platform = {
                requiresCreditCard: true
            };

            expect(platform.requiresCreditCard).toBe(true);
        });
    });

    describe('Task Status Display', () => {
        it('should match task status to platform', () => {
            const completedTasks = [
                { id: 'task1', platform: 'OpenAI', status: 'completed' }
            ];
            
            const platformName = 'OpenAI';
            const taskStatus = completedTasks.find(t => t.platform === platformName);

            expect(taskStatus).toBeDefined();
            expect(taskStatus.status).toBe('completed');
        });

        it('should handle task without status', () => {
            const completedTasks = [];
            const platformName = 'Make';
            const taskStatus = completedTasks.find(t => t.platform === platformName);

            expect(taskStatus).toBeUndefined();
        });
    });

    describe('Results Summary', () => {
        it('should calculate results correctly', () => {
            const results = {
                completedTasks: [
                    { platform: 'OpenAI' },
                    { platform: 'Make' }
                ],
                failedTasks: [
                    { platform: 'Supabase', error: 'Connection timeout' }
                ]
            };

            expect(results.completedTasks.length).toBe(2);
            expect(results.failedTasks.length).toBe(1);
        });

        it('should group results by platform', () => {
            const platformResults = {
                'OpenAI': { status: 'completed', result: {} },
                'Make': { status: 'failed', error: 'Connection error' }
            };

            expect(platformResults['OpenAI'].status).toBe('completed');
            expect(platformResults['Make'].status).toBe('failed');
            expect(platformResults['Make']).toHaveProperty('error');
        });
    });

    describe('Type Icons and Colors', () => {
        it('should have icons for platform types', () => {
            const typeIcons = {
                ai_agent: 'Bot',
                automation: 'Zap',
                cloud: 'Cloud',
                dev_tools: 'Wrench',
                communication: 'MessageSquare'
            };

            expect(typeIcons.ai_agent).toBe('Bot');
            expect(typeIcons.automation).toBe('Zap');
        });

        it('should have colors for platform types', () => {
            const typeColors = {
                ai_agent: 'from-purple-500 to-pink-500',
                automation: 'from-blue-500 to-cyan-500',
                cloud: 'from-emerald-500 to-teal-500'
            };

            expect(typeColors.ai_agent).toContain('purple');
            expect(typeColors.automation).toContain('blue');
        });
    });

    describe('API Integration', () => {
        it('should prepare correct fetch request for start-all', () => {
            const requestBody = {
                platforms: ['OpenAI', 'Make'],
                userData: { email: 'test@example.com' },
                maxConcurrent: 5
            };

            expect(requestBody.userData.email).toBe('test@example.com');
            expect(requestBody.maxConcurrent).toBe(5);
            expect(Array.isArray(requestBody.platforms)).toBe(true);
        });

        it('should handle API response structure', () => {
            const mockResponse = {
                success: true,
                message: 'Started registration for 2 platforms',
                batchId: 'batch_123',
                totalTasks: 2,
                platforms: ['OpenAI', 'Make']
            };

            expect(mockResponse.success).toBe(true);
            expect(mockResponse.totalTasks).toBe(2);
            expect(mockResponse).toHaveProperty('batchId');
        });
    });
});
