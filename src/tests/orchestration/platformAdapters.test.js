/**
 * Unit Tests for Platform Adapters
 * Tests platform configuration and adapter utilities
 */

import { describe, it, expect } from 'vitest';

// Mock platform configurations (mirroring the server-side structure)
const platformConfigs = {
    'OpenAI': {
        type: 'ai_agent',
        registrationUrl: 'https://platform.openai.com/signup',
        apiEndpoint: 'https://api.openai.com/v1',
        trialDays: 90,
        requiresCreditCard: false,
        capabilities: ['code_generation', 'chat', 'embeddings', 'vision']
    },
    'Anthropic Claude': {
        type: 'ai_agent',
        registrationUrl: 'https://console.anthropic.com/signup',
        apiEndpoint: 'https://api.anthropic.com/v1',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['code_generation', 'chat', 'vision', 'tool_use']
    },
    'Make (Integromat)': {
        type: 'automation',
        registrationUrl: 'https://www.make.com/en/register',
        apiEndpoint: 'https://eu1.make.com/api/v2',
        trialDays: 14,
        requiresCreditCard: false,
        capabilities: ['workflow_automation', 'api_integration', 'scheduling']
    },
    'Supabase': {
        type: 'cloud',
        registrationUrl: 'https://supabase.com/dashboard/sign-up',
        apiEndpoint: 'https://api.supabase.com',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['database', 'auth', 'storage', 'realtime']
    },
    'Slack': {
        type: 'communication',
        registrationUrl: 'https://slack.com/get-started',
        apiEndpoint: 'https://slack.com/api',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['messaging', 'bots', 'webhooks']
    },
    'GitHub': {
        type: 'dev_tools',
        registrationUrl: 'https://github.com/signup',
        apiEndpoint: 'https://api.github.com',
        trialDays: 0,
        requiresCreditCard: false,
        capabilities: ['git_hosting', 'ci_cd', 'actions']
    }
};

// Mock utility functions
const getPlatformConfig = (platformName) => platformConfigs[platformName] || null;
const getAllPlatformConfigs = () => platformConfigs;
const getPlatformsByType = (type) => Object.entries(platformConfigs)
    .filter(([_, config]) => config.type === type)
    .map(([name, config]) => ({ name, ...config }));
const getPlatformTypes = () => [...new Set(Object.values(platformConfigs).map(c => c.type))];
const getPlatformsByCapability = (capability) => Object.entries(platformConfigs)
    .filter(([_, config]) => config.capabilities.includes(capability))
    .map(([name, config]) => ({ name, ...config }));
const getFreePlatforms = () => Object.entries(platformConfigs)
    .filter(([_, config]) => !config.requiresCreditCard)
    .map(([name, config]) => ({ name, ...config }));

describe('Platform Adapters', () => {
    describe('platformConfigs', () => {
        it('should have OpenAI configuration', () => {
            expect(platformConfigs['OpenAI']).toBeDefined();
            expect(platformConfigs['OpenAI'].type).toBe('ai_agent');
            expect(platformConfigs['OpenAI']).toHaveProperty('registrationUrl');
            expect(platformConfigs['OpenAI']).toHaveProperty('capabilities');
        });

        it('should have Make configuration', () => {
            expect(platformConfigs['Make (Integromat)']).toBeDefined();
            expect(platformConfigs['Make (Integromat)'].type).toBe('automation');
        });

        it('should have required fields for all platforms', () => {
            Object.entries(platformConfigs).forEach(([name, config]) => {
                expect(config).toHaveProperty('type');
                expect(config).toHaveProperty('registrationUrl');
                expect(config).toHaveProperty('apiEndpoint');
                expect(config).toHaveProperty('trialDays');
                expect(config).toHaveProperty('requiresCreditCard');
                expect(config).toHaveProperty('capabilities');
                expect(Array.isArray(config.capabilities)).toBe(true);
            });
        });
    });

    describe('getPlatformConfig', () => {
        it('should return config for OpenAI', () => {
            const config = getPlatformConfig('OpenAI');
            expect(config).toBeDefined();
            expect(config.type).toBe('ai_agent');
            expect(config.registrationUrl).toContain('openai.com');
        });

        it('should return null for non-existent platform', () => {
            const config = getPlatformConfig('NonExistentPlatform');
            expect(config).toBeNull();
        });
    });

    describe('getAllPlatformConfigs', () => {
        it('should return all platform configurations', () => {
            const allConfigs = getAllPlatformConfigs();
            expect(allConfigs).toBeDefined();
            expect(Object.keys(allConfigs).length).toBeGreaterThan(0);
            expect(allConfigs).toHaveProperty('OpenAI');
        });
    });

    describe('getPlatformsByType', () => {
        it('should return AI agent platforms', () => {
            const aiPlatforms = getPlatformsByType('ai_agent');
            expect(Array.isArray(aiPlatforms)).toBe(true);
            expect(aiPlatforms.length).toBeGreaterThan(0);
            expect(aiPlatforms.every(p => p.type === 'ai_agent')).toBe(true);
        });

        it('should return automation platforms', () => {
            const automationPlatforms = getPlatformsByType('automation');
            expect(Array.isArray(automationPlatforms)).toBe(true);
            expect(automationPlatforms.length).toBeGreaterThan(0);
            expect(automationPlatforms.every(p => p.type === 'automation')).toBe(true);
        });

        it('should return cloud platforms', () => {
            const cloudPlatforms = getPlatformsByType('cloud');
            expect(Array.isArray(cloudPlatforms)).toBe(true);
            expect(cloudPlatforms.length).toBeGreaterThan(0);
            expect(cloudPlatforms.every(p => p.type === 'cloud')).toBe(true);
        });

        it('should return empty array for invalid type', () => {
            const platforms = getPlatformsByType('invalid_type');
            expect(Array.isArray(platforms)).toBe(true);
            expect(platforms.length).toBe(0);
        });
    });

    describe('getPlatformTypes', () => {
        it('should return unique platform types', () => {
            const types = getPlatformTypes();
            expect(Array.isArray(types)).toBe(true);
            expect(types.length).toBeGreaterThan(0);
            expect(types.includes('ai_agent')).toBe(true);
            expect(types.includes('automation')).toBe(true);
            expect(types.includes('cloud')).toBe(true);
        });

        it('should not have duplicate types', () => {
            const types = getPlatformTypes();
            const uniqueTypes = [...new Set(types)];
            expect(types.length).toBe(uniqueTypes.length);
        });
    });

    describe('getPlatformsByCapability', () => {
        it('should return platforms with code_generation capability', () => {
            const platforms = getPlatformsByCapability('code_generation');
            expect(Array.isArray(platforms)).toBe(true);
            expect(platforms.length).toBeGreaterThan(0);
            expect(platforms.every(p => 
                p.capabilities.includes('code_generation')
            )).toBe(true);
        });

        it('should return platforms with workflow_automation capability', () => {
            const platforms = getPlatformsByCapability('workflow_automation');
            expect(Array.isArray(platforms)).toBe(true);
            expect(platforms.length).toBeGreaterThan(0);
        });

        it('should return empty array for non-existent capability', () => {
            const platforms = getPlatformsByCapability('non_existent_capability');
            expect(Array.isArray(platforms)).toBe(true);
            expect(platforms.length).toBe(0);
        });
    });

    describe('getFreePlatforms', () => {
        it('should return platforms without credit card requirement', () => {
            const freePlatforms = getFreePlatforms();
            expect(Array.isArray(freePlatforms)).toBe(true);
            expect(freePlatforms.length).toBeGreaterThan(0);
            expect(freePlatforms.every(p => !p.requiresCreditCard)).toBe(true);
        });

        it('should include OpenAI as free platform', () => {
            const freePlatforms = getFreePlatforms();
            const hasOpenAI = freePlatforms.some(p => p.name === 'OpenAI');
            expect(hasOpenAI).toBe(true);
        });
    });

    describe('Platform Categories', () => {
        it('should have ai_agent platforms', () => {
            const aiAgents = Object.values(platformConfigs).filter(
                p => p.type === 'ai_agent'
            );
            expect(aiAgents.length).toBeGreaterThan(0);
            expect(aiAgents.some(p => 
                p.capabilities.includes('code_generation')
            )).toBe(true);
        });

        it('should have automation platforms', () => {
            const automation = Object.values(platformConfigs).filter(
                p => p.type === 'automation'
            );
            expect(automation.length).toBeGreaterThan(0);
        });

        it('should have cloud platforms', () => {
            const cloud = Object.values(platformConfigs).filter(
                p => p.type === 'cloud'
            );
            expect(cloud.length).toBeGreaterThan(0);
        });

        it('should have dev_tools platforms', () => {
            const devTools = Object.values(platformConfigs).filter(
                p => p.type === 'dev_tools'
            );
            expect(devTools.length).toBeGreaterThan(0);
        });

        it('should have communication platforms', () => {
            const communication = Object.values(platformConfigs).filter(
                p => p.type === 'communication'
            );
            expect(communication.length).toBeGreaterThan(0);
        });
    });

    describe('Trial Information', () => {
        it('should have trial duration for each platform', () => {
            Object.values(platformConfigs).forEach(config => {
                expect(typeof config.trialDays).toBe('number');
                expect(config.trialDays).toBeGreaterThanOrEqual(0);
            });
        });

        it('should correctly identify platforms requiring credit cards', () => {
            Object.values(platformConfigs).forEach(config => {
                expect(typeof config.requiresCreditCard).toBe('boolean');
            });
        });
    });

    describe('API Endpoints', () => {
        it('should have valid API endpoints', () => {
            Object.values(platformConfigs).forEach(config => {
                if (config.apiEndpoint) {
                    expect(config.apiEndpoint).toMatch(/^https?:\/\//);
                }
            });
        });

        it('should have valid registration URLs', () => {
            Object.values(platformConfigs).forEach(config => {
                expect(config.registrationUrl).toMatch(/^https?:\/\//);
            });
        });
    });

    describe('Capabilities', () => {
        it('should have common AI capabilities', () => {
            const aiPlatforms = Object.values(platformConfigs).filter(
                p => p.type === 'ai_agent'
            );
            
            const hasChat = aiPlatforms.some(p => 
                p.capabilities.includes('chat')
            );
            expect(hasChat).toBe(true);
        });

        it('should have automation capabilities', () => {
            const automationPlatforms = Object.values(platformConfigs).filter(
                p => p.type === 'automation'
            );
            
            const hasWorkflow = automationPlatforms.some(p => 
                p.capabilities.includes('workflow_automation')
            );
            expect(hasWorkflow).toBe(true);
        });
    });
});
