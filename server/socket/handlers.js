import screenshot from 'screenshot-desktop';

let activeStreams = new Map();

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Start live screenshot streaming
    socket.on('start-screen-stream', async ({ interval = 1000 }) => {
      if (activeStreams.has(socket.id)) {
        clearInterval(activeStreams.get(socket.id));
      }

      const streamInterval = setInterval(async () => {
        try {
          const screenshotBuffer = await screenshot({ format: 'png' });
          const base64Screenshot = screenshotBuffer.toString('base64');

          socket.emit('screen-frame', {
            screenshot: base64Screenshot,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          socket.emit('screen-error', {
            error: error.message
          });
        }
      }, interval);

      activeStreams.set(socket.id, streamInterval);
      socket.emit('stream-started', { interval });
    });

    // Stop screenshot streaming
    socket.on('stop-screen-stream', () => {
      if (activeStreams.has(socket.id)) {
        clearInterval(activeStreams.get(socket.id));
        activeStreams.delete(socket.id);
        socket.emit('stream-stopped');
      }
    });

    // Real-time action logging
    socket.on('action-log', (data) => {
      io.emit('action-broadcast', {
        ...data,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    // System metrics streaming
    socket.on('start-metrics', ({ interval = 5000 }) => {
      const metricsInterval = setInterval(() => {
        const metrics = {
          memory: process.memoryUsage(),
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        };

        socket.emit('metrics-update', metrics);
      }, interval);

      activeStreams.set(`metrics-${socket.id}`, metricsInterval);
    });

    socket.on('stop-metrics', () => {
      const key = `metrics-${socket.id}`;
      if (activeStreams.has(key)) {
        clearInterval(activeStreams.get(key));
        activeStreams.delete(key);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      // Clear all streams for this socket
      if (activeStreams.has(socket.id)) {
        clearInterval(activeStreams.get(socket.id));
        activeStreams.delete(socket.id);
      }

      const metricsKey = `metrics-${socket.id}`;
      if (activeStreams.has(metricsKey)) {
        clearInterval(activeStreams.get(metricsKey));
        activeStreams.delete(metricsKey);
      }
    });
  });

  console.log('🔌 WebSocket handlers initialized');
}
