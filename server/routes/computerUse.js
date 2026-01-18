import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import screenshot from 'screenshot-desktop';

const execAsync = promisify(exec);
const router = Router();

// Take screenshot
router.get('/screenshot', async (req, res) => {
  try {
    const screenshotBuffer = await screenshot({ format: 'png' });
    const base64Screenshot = screenshotBuffer.toString('base64');

    res.json({
      success: true,
      screenshot: base64Screenshot,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute mouse click
router.post('/click', async (req, res) => {
  try {
    const { x, y, button = 1 } = req.body;

    // Using xdotool for Linux
    await execAsync(`xdotool mousemove ${x} ${y} click ${button}`);

    res.json({
      success: true,
      action: 'click',
      coordinates: { x, y }
    });
  } catch (error) {
    console.error('Click error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Type text
router.post('/type', async (req, res) => {
  try {
    const { text } = req.body;

    // Escape special characters for shell
    const escapedText = text.replace(/'/g, "'\\''");
    await execAsync(`xdotool type '${escapedText}'`);

    res.json({
      success: true,
      action: 'type',
      text: text
    });
  } catch (error) {
    console.error('Type error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Press keyboard key
router.post('/key', async (req, res) => {
  try {
    const { key } = req.body;

    await execAsync(`xdotool key ${key}`);

    res.json({
      success: true,
      action: 'key',
      key: key
    });
  } catch (error) {
    console.error('Key press error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get system info
router.get('/info', async (req, res) => {
  try {
    const [hostname, uptime, memory] = await Promise.all([
      execAsync('hostname'),
      execAsync('uptime -p'),
      execAsync('free -h')
    ]);

    res.json({
      success: true,
      system: {
        hostname: hostname.stdout.trim(),
        uptime: uptime.stdout.trim(),
        memory: memory.stdout,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute shell command (dangerous - use with caution)
router.post('/execute', async (req, res) => {
  try {
    const { command } = req.body;

    // Whitelist of safe commands
    const safeCommands = ['ls', 'pwd', 'date', 'whoami', 'uname'];
    const commandName = command.split(' ')[0];

    if (!safeCommands.includes(commandName)) {
      return res.status(403).json({
        success: false,
        error: 'Command not allowed for security reasons'
      });
    }

    const result = await execAsync(command);

    res.json({
      success: true,
      output: result.stdout,
      error: result.stderr
    });
  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as computerUseRouter };
