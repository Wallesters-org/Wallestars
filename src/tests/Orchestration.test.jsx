import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Orchestration from '../pages/Orchestration';

// Mock fetch globally
global.fetch = vi.fn();

// Mock socket context
vi.mock('../context/SocketContext', () => ({
    useSocket: () => ({
        socket: {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
        },
        connected: true,
    }),
}));

describe('Orchestration Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch.mockClear();
    });

    it('renders orchestration heading', async () => {
        // Mock API responses
        global.fetch.mockImplementation((url) => {
            if (url.includes('/platforms')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        platforms: [
                            {
                                name: 'OpenAI',
                                type: 'ai_agent',
                                capabilities: ['code_generation', 'chat'],
                                trialDays: 90,
                                requiresCreditCard: false
                            }
                        ]
                    })
                });
            }
            if (url.includes('/status')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        isRunning: false,
                        activeTasks: [],
                        pendingTasks: [],
                        completedTasks: [],
                        failedTasks: [],
                        metrics: {}
                    })
                });
            }
            return Promise.reject(new Error('Not found'));
        });

        render(<Orchestration />);

        await waitFor(() => {
            expect(screen.getByText(/AI Agents Orchestration Farm/i)).toBeInTheDocument();
        });
    });

    it('displays platform count correctly', async () => {
        global.fetch.mockImplementation((url) => {
            if (url.includes('/platforms')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        platforms: [
                            { name: 'OpenAI', type: 'ai_agent', capabilities: [], trialDays: 90, requiresCreditCard: false },
                            { name: 'Anthropic Claude', type: 'ai_agent', capabilities: [], trialDays: 14, requiresCreditCard: false },
                            { name: 'Make', type: 'automation', capabilities: [], trialDays: 14, requiresCreditCard: false }
                        ]
                    })
                });
            }
            if (url.includes('/status')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        isRunning: false,
                        activeTasks: [],
                        pendingTasks: [],
                        completedTasks: [],
                        failedTasks: [],
                        metrics: {}
                    })
                });
            }
            return Promise.reject(new Error('Not found'));
        });

        render(<Orchestration />);

        await waitFor(() => {
            // Check if platform count is displayed (should be 3)
            const platformCountElements = screen.getAllByText('3');
            expect(platformCountElements.length).toBeGreaterThan(0);
        });
    });

    it('displays email input field', async () => {
        global.fetch.mockImplementation((url) => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    platforms: [],
                    activeTasks: [],
                    pendingTasks: [],
                    completedTasks: [],
                    failedTasks: [],
                    isRunning: false
                })
            });
        });

        render(<Orchestration />);

        await waitFor(() => {
            const emailInput = screen.getByPlaceholderText(/your@email.com/i);
            expect(emailInput).toBeInTheDocument();
        });
    });

    it('displays Start All button', async () => {
        global.fetch.mockImplementation((url) => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    platforms: [],
                    activeTasks: [],
                    pendingTasks: [],
                    completedTasks: [],
                    failedTasks: [],
                    isRunning: false
                })
            });
        });

        render(<Orchestration />);

        await waitFor(() => {
            const startButton = screen.getByRole('button', { name: /Start All/i });
            expect(startButton).toBeInTheDocument();
        });
    });

    it('renders platform cards when platforms are available', async () => {
        global.fetch.mockImplementation((url) => {
            if (url.includes('/platforms')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        platforms: [
                            {
                                name: 'OpenAI',
                                type: 'ai_agent',
                                capabilities: ['code_generation', 'chat'],
                                trialDays: 90,
                                requiresCreditCard: false
                            },
                            {
                                name: 'Make (Integromat)',
                                type: 'automation',
                                capabilities: ['workflow_automation'],
                                trialDays: 14,
                                requiresCreditCard: false
                            }
                        ]
                    })
                });
            }
            if (url.includes('/status')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        isRunning: false,
                        activeTasks: [],
                        pendingTasks: [],
                        completedTasks: [],
                        failedTasks: [],
                        metrics: {}
                    })
                });
            }
            return Promise.reject(new Error('Not found'));
        });

        render(<Orchestration />);

        await waitFor(() => {
            expect(screen.getByText('OpenAI')).toBeInTheDocument();
            expect(screen.getByText('Make (Integromat)')).toBeInTheDocument();
        });
    });

    it('allows searching platforms', async () => {
        global.fetch.mockImplementation((url) => {
            if (url.includes('/platforms')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        platforms: [
                            {
                                name: 'OpenAI',
                                type: 'ai_agent',
                                capabilities: ['code_generation'],
                                trialDays: 90,
                                requiresCreditCard: false
                            },
                            {
                                name: 'Anthropic Claude',
                                type: 'ai_agent',
                                capabilities: ['chat'],
                                trialDays: 14,
                                requiresCreditCard: false
                            }
                        ]
                    })
                });
            }
            if (url.includes('/status')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        isRunning: false,
                        activeTasks: [],
                        pendingTasks: [],
                        completedTasks: [],
                        failedTasks: [],
                        metrics: {}
                    })
                });
            }
            return Promise.reject(new Error('Not found'));
        });

        render(<Orchestration />);

        await waitFor(() => {
            expect(screen.getByText('OpenAI')).toBeInTheDocument();
        });

        // Find and type in search input
        const searchInput = screen.getByPlaceholderText(/Search platforms/i);
        fireEvent.change(searchInput, { target: { value: 'OpenAI' } });

        // Wait for filter to apply
        await waitFor(() => {
            expect(screen.getByText('OpenAI')).toBeInTheDocument();
            expect(screen.queryByText('Anthropic Claude')).not.toBeInTheDocument();
        });
    });
});

describe('Orchestration API Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch.mockClear();
    });

    it('calls platforms API on mount', async () => {
        global.fetch.mockImplementation((url) => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    platforms: [],
                    isRunning: false,
                    activeTasks: [],
                    pendingTasks: [],
                    completedTasks: [],
                    failedTasks: []
                })
            });
        });

        render(<Orchestration />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/orchestration/platforms'));
        });
    });

    it('calls status API on mount', async () => {
        global.fetch.mockImplementation((url) => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    platforms: [],
                    isRunning: false,
                    activeTasks: [],
                    pendingTasks: [],
                    completedTasks: [],
                    failedTasks: []
                })
            });
        });

        render(<Orchestration />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/orchestration/status'));
        });
    });
});
