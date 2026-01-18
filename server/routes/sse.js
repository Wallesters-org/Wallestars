// server/routes/sse.js
// SSE (Server-Sent Events) endpoint за MCP SuperAssistant
// Решава проблема с конектването на http://localhost:3006/sse

import express from 'express';

const router = express.Router();

// Store active SSE connections
const clients = new Map();
let clientId = 0;

/**
 * SSE endpoint за MCP SuperAssistant
 * GET /sse
 */
router.get('/', (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    const newClientId = ++clientId;
    clients.set(newClientId, res);

    console.log(`[SSE] Client ${newClientId} connected. Total clients: ${clients.size}`);

    // Send connection confirmation
    res.write(`data: ${JSON.stringify({
        type: 'connection',
        status: 'connected',
        clientId: newClientId,
        timestamp: new Date().toISOString(),
        server: 'wallestars-nexus',
        version: '1.0.0'
    })}\n\n`);

    // Keep-alive ping every 30 seconds
    const keepAlive = setInterval(() => {
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
        }
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
        clearInterval(keepAlive);
        clients.delete(newClientId);
        console.log(`[SSE] Client ${newClientId} disconnected. Total clients: ${clients.size}`);
    });

    req.on('error', (err) => {
        clearInterval(keepAlive);
        clients.delete(newClientId);
        console.error(`[SSE] Client ${newClientId} error:`, err.message);
    });
});

/**
 * Broadcast message to all SSE clients
 */
export function broadcast(eventType, data) {
    const message = JSON.stringify({
        type: eventType,
        data,
        timestamp: new Date().toISOString()
    });

    clients.forEach((clientResponse, clientId) => {
        try {
            if (!clientResponse.writableEnded) {
                clientResponse.write(`data: ${message}\n\n`);
            }
        } catch (err) {
            console.error(`[SSE] Broadcast error to client ${clientId}:`, err.message);
            clients.delete(clientId);
        }
    });
}

/**
 * MCP Tool execution endpoint
 * POST /sse/execute
 */
router.post('/execute', express.json(), async (req, res) => {
    const { tool, params } = req.body;

    try {
        let result;

        switch (tool) {
            case 'screenshot':
                result = { success: true, message: 'Screenshot captured' };
                broadcast('tool_result', { tool, result });
                break;

            case 'click':
                result = { success: true, x: params.x, y: params.y };
                broadcast('tool_result', { tool, result });
                break;

            case 'type':
                result = { success: true, text: params.text };
                broadcast('tool_result', { tool, result });
                break;

            default:
                result = { success: false, error: `Unknown tool: ${tool}` };
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Health check for SSE endpoint
 * GET /sse/health
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        endpoint: '/sse',
        clients: clients.size,
        timestamp: new Date().toISOString()
    });
});

/**
 * Get connected clients info
 * GET /sse/clients
 */
router.get('/clients', (req, res) => {
    res.json({
        count: clients.size,
        clientIds: Array.from(clients.keys())
    });
});

export { router as sseRouter };
export default router;
