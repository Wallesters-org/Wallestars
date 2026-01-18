// antigravity/integration/WallestarsIntegration.js
// Интеграционен слой между Antigravity и Wallestars Nexus
// Създаден: 2026-01-11

import { io } from 'socket.io-client';

/**
 * WallestarsIntegration Class
 * Свързва Antigravity Core с Wallestars Nexus модул
 */
export class WallestarsIntegration {
    constructor(antigravityCore) {
        this.core = antigravityCore;
        this.socket = null;
        this.connected = false;
        this.metrics = null;

        // Default configuration
        this.config = {
            baseUrl: process.env.WALLESTARS_URL || 'http://localhost:3000',
            wsUrl: process.env.WALLESTARS_WS_URL || 'ws://localhost:3001',
            apiVersion: 'v1',
            reconnectInterval: 5000,
            metricsInterval: 10000
        };
    }

    /**
     * Initialize connection to Wallestars
     */
    async connect() {
        try {
            // Test API connectivity
            const healthCheck = await this.checkHealth();
            if (!healthCheck.ok) {
                throw new Error(`Wallestars health check failed: ${healthCheck.error}`);
            }

            // Establish WebSocket connection
            this.socket = io(this.config.wsUrl, {
                transports: ['websocket'],
                auth: {
                    token: this.core?.auth?.getToken() || '',
                    userId: this.core?.auth?.getUserId() || 'anonymous'
                }
            });

            this.socket.on('connect', () => {
                this.connected = true;
                console.log('[Wallestars] WebSocket connected');
                this.emit('connected');
            });

            this.socket.on('disconnect', () => {
                this.connected = false;
                console.log('[Wallestars] WebSocket disconnected');
                this.emit('disconnected');
            });

            this.socket.on('system-info', (data) => {
                this.metrics = data;
                this.emit('metrics', data);
            });

            this.socket.on('screenshot', (data) => {
                this.emit('screenshot', data);
            });

            this.socket.on('activity-log', (data) => {
                this.emit('activity', data);
            });

            return { success: true, status: 'connected' };
        } catch (error) {
            console.error('[Wallestars] Connection error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check Wallestars server health
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/health`);
            const data = await response.json();
            return { ok: true, ...data };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    }

    /**
     * Get system metrics
     */
    async getSystemMetrics() {
        return this.metrics || await this.fetchMetrics();
    }

    async fetchMetrics() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/computer/info`);
            return await response.json();
        } catch (error) {
            console.error('[Wallestars] Metrics fetch failed:', error);
            return null;
        }
    }

    // =============== CLAUDE AI INTEGRATION ===============

    /**
     * Send message to Claude AI
     */
    async sendMessage(message, conversationHistory = []) {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/claude/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, conversationHistory })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    // =============== COMPUTER CONTROL ===============

    /**
     * Take screenshot
     */
    async takeScreenshot() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/computer/screenshot`);
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Click at coordinates
     */
    async click(x, y, button = 'left') {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/computer/click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x, y, button })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Type text
     */
    async type(text) {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/computer/type`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    // =============== ANDROID CONTROL ===============

    /**
     * List connected Android devices
     */
    async listDevices() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/android/devices`);
            return await response.json();
        } catch (error) {
            return { devices: [], error: error.message };
        }
    }

    /**
     * Tap on Android device
     */
    async tap(deviceId, x, y) {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/android/tap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, x, y })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    // =============== EVENT HANDLING ===============

    _listeners = {};

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    }

    emit(event, data) {
        if (this._listeners[event]) {
            this._listeners[event].forEach(cb => cb(data));
        }
    }

    // =============== CLEANUP ===============

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connected = false;
    }
}

// Export default instance factory
export function createWallestarsIntegration(antigravityCore) {
    return new WallestarsIntegration(antigravityCore);
}

export default WallestarsIntegration;
