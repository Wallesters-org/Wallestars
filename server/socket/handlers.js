import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let activeStreams = new Map();

// Helper function to take screenshot (Wayland-compatible)
// Using a single temp file per socket to prevent file accumulation
async function takeScreenshot(socketId = 'default') {
  const tempFile = `/tmp/wallestars_stream_${socketId}.png`;
  const fs = await import('fs/promises');

  // Clean up any existing file first
  await fs.unlink(tempFile).catch(() => { });

  // Try gnome-screenshot first (works on Wayland and X11)
  try {
    await execAsync(`gnome-screenshot -f ${tempFile}`);
  } catch (e) {
    // Fallback to scrot for X11-only systems
    const env = { ...process.env, DISPLAY: process.env.DISPLAY || ':0' };
    await execAsync(`scrot -o ${tempFile}`, { env });
  }

  const img = await fs.readFile(tempFile);

  // Clean up temp file after reading
  await fs.unlink(tempFile).catch(() => { });

  return img.toString('base64');
}

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
          const base64 = await takeScreenshot(socket.id);

          socket.emit('screen-frame', {
            screenshot: base64,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Screenshot stream error:', error.message);
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
