/**
 * OpenClaw (Clawdbot) Integration for Wallestars Control Center
 *
 * This module provides bidirectional integration between Wallestars and OpenClaw,
 * enabling multi-platform messaging (Telegram, WhatsApp, Discord, Slack, etc.)
 * to control Wallestars features.
 *
 * @see https://docs.openclaw.ai/
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';

// OpenClaw Gateway default configuration
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
const OPENCLAW_WORKSPACE = process.env.OPENCLAW_WORKSPACE || '~/.openclaw/workspace';

/**
 * OpenClaw Gateway Client
 * Connects to the local OpenClaw WebSocket Gateway for bidirectional communication
 */
export class OpenClawClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.gatewayUrl = options.gatewayUrl || OPENCLAW_GATEWAY_URL;
    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectDelay = options.reconnectDelay || 5000;
    this.sessions = new Map();
    this.pendingRequests = new Map();
    this.requestId = 0;
  }

  /**
   * Connect to OpenClaw Gateway
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.gatewayUrl);

        this.ws.on('open', () => {
          console.log('[OpenClaw] Connected to Gateway at', this.gatewayUrl);
          this.connected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve(true);
        });

        this.ws.on('message', (data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', () => {
          console.log('[OpenClaw] Disconnected from Gateway');
          this.connected = false;
          this.emit('disconnected');
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('[OpenClaw] Gateway error:', error.message);
          this.emit('error', error);
          if (!this.connected) {
            reject(error);
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from Gateway
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());

      // Handle RPC responses
      if (message.id && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          reject(new Error(message.error.message || 'Unknown error'));
        } else {
          resolve(message.result);
        }
        return;
      }

      // Handle events
      switch (message.type) {
        case 'session.message':
          this.emit('message', message.payload);
          break;
        case 'session.created':
          this.sessions.set(message.payload.sessionId, message.payload);
          this.emit('session:created', message.payload);
          break;
        case 'session.ended':
          this.sessions.delete(message.payload.sessionId);
          this.emit('session:ended', message.payload);
          break;
        case 'tool.invoked':
          this.emit('tool:invoked', message.payload);
          break;
        case 'tool.result':
          this.emit('tool:result', message.payload);
          break;
        default:
          this.emit('event', message);
      }
    } catch (error) {
      console.error('[OpenClaw] Failed to parse message:', error);
    }
  }

  /**
   * Send RPC request to Gateway
   */
  async request(method, params = {}) {
    if (!this.connected) {
      throw new Error('Not connected to OpenClaw Gateway');
    }

    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);

      this.ws.send(JSON.stringify(request));
    });
  }

  /**
   * Send a message to a specific session
   */
  async sendMessage(sessionId, content) {
    return this.request('sessions_send', {
      sessionId,
      content
    });
  }

  /**
   * Get list of active sessions
   */
  async listSessions() {
    return this.request('sessions_list');
  }

  /**
   * Get session history
   */
  async getSessionHistory(sessionId, limit = 50) {
    return this.request('sessions_history', {
      sessionId,
      limit
    });
  }

  /**
   * List connected device nodes
   */
  async listNodes() {
    return this.request('node.list');
  }

  /**
   * Invoke a tool on a device node
   */
  async invokeNodeTool(nodeId, tool, params = {}) {
    return this.request('node.invoke', {
      nodeId,
      tool,
      params
    });
  }

  /**
   * Schedule reconnection
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[OpenClaw] Max reconnection attempts reached');
      this.emit('reconnect:failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[OpenClaw] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(err => {
        console.error('[OpenClaw] Reconnection failed:', err.message);
      });
    }, delay);
  }

  /**
   * Disconnect from Gateway
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.sessions.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.connected,
      gatewayUrl: this.gatewayUrl,
      activeSessions: this.sessions.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Singleton instance
let openclawClient = null;

/**
 * Get or create OpenClaw client instance
 */
export function getOpenClawClient(options = {}) {
  if (!openclawClient) {
    openclawClient = new OpenClawClient(options);
  }
  return openclawClient;
}

export default OpenClawClient;
