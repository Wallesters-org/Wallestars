import express from 'express';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email configuration missing. Using ethereal for preview only.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate HTML email template
const generateEmailTemplate = (title, content, changes = []) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0ea5e9;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0ea5e9;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .changes {
      background: #f8f9fa;
      border-left: 4px solid #0ea5e9;
      padding: 15px;
      margin: 20px 0;
    }
    .changes h3 {
      margin-top: 0;
      color: #0ea5e9;
    }
    .changes ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .changes li {
      margin: 8px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #0ea5e9;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .timestamp {
      color: #6b7280;
      font-size: 14px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌟 Wallestars Control Center</h1>
      <p>Update Notification</p>
    </div>
    
    <div class="content">
      <h2>${title}</h2>
      <p>${content}</p>
      
      ${changes.length > 0 ? `
      <div class="changes">
        <h3>📝 Recent Changes</h3>
        <ul>
          ${changes.map(change => `<li>${change}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      <div class="timestamp">
        <strong>Timestamp:</strong> ${new Date().toISOString()}
      </div>
    </div>
    
    <div class="footer">
      <p>
        This email was sent by Wallestars Control Center<br>
        © ${new Date().getFullYear()} Wallestars Team
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Preview email endpoint
router.post('/preview', async (req, res) => {
  try {
    const { title, content, changes } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'content']
      });
    }

    const htmlContent = generateEmailTemplate(title, content, changes || []);
    
    res.json({
      success: true,
      preview: htmlContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email preview error:', error);
    res.status(500).json({
      error: 'Failed to generate email preview',
      message: error.message
    });
  }
});

// Send email endpoint
router.post('/send', async (req, res) => {
  try {
    const { to, subject, title, content, changes } = req.body;
    
    if (!to || !subject || !title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['to', 'subject', 'title', 'content']
      });
    }

    const transporter = createTransporter();
    
    if (!transporter) {
      // For preview purposes, create ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const htmlContent = generateEmailTemplate(title, content, changes || []);
      
      const info = await testTransporter.sendMail({
        from: `"Wallestars Control Center" <${testAccount.user}>`,
        to: to,
        subject: subject,
        html: htmlContent
      });

      return res.json({
        success: true,
        message: 'Email sent (test mode)',
        previewUrl: nodemailer.getTestMessageUrl(info),
        messageId: info.messageId,
        timestamp: new Date().toISOString()
      });
    }

    const htmlContent = generateEmailTemplate(title, content, changes || []);
    
    const info = await transporter.sendMail({
      from: `"Wallestars Control Center" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

// Get system update summary for email
router.get('/system-summary', async (req, res) => {
  try {
    const summary = {
      title: 'Wallestars System Update',
      content: 'Your Wallestars Control Center has new updates available.',
      changes: [
        'Server is running and healthy',
        `Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Connected' : 'Not configured'}`,
        `Computer Use: ${process.env.ENABLE_COMPUTER_USE === 'true' ? 'Enabled' : 'Disabled'}`,
        `Android Control: ${process.env.ENABLE_ANDROID === 'true' ? 'Enabled' : 'Disabled'}`,
        `Email Service: ${process.env.EMAIL_HOST ? 'Configured' : 'Not configured'}`
      ],
      timestamp: new Date().toISOString()
    };

    res.json(summary);
  } catch (error) {
    console.error('System summary error:', error);
    res.status(500).json({
      error: 'Failed to get system summary',
      message: error.message
    });
  }
});

export { router as emailRouter };
