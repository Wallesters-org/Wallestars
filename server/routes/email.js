import express from 'express';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { Readable } from 'stream';

const router = express.Router();

// Email configuration from environment or request
// Support for multiple providers: Hostinger, Gmail, etc.
const getImapConfig = (customConfig = {}) => {
  const provider = customConfig.provider || process.env.EMAIL_PROVIDER || 'hostinger';
  
  // Provider-specific defaults
  const providerDefaults = {
    hostinger: {
      host: 'imap.hostinger.com',
      port: 993,
      tls: true
    },
    gmail: {
      host: 'imap.gmail.com',
      port: 993,
      tls: true
    },
    workmail: {
      host: 'imap.mail.eu-west-1.awsapps.com',
      port: 993,
      tls: true
    }
  };
  
  const defaults = providerDefaults[provider] || providerDefaults.hostinger;
  
  return {
    user: customConfig.user || process.env.EMAIL_USER,
    password: customConfig.password || process.env.EMAIL_PASSWORD,
    host: customConfig.host || process.env.IMAP_HOST || defaults.host,
    port: customConfig.port || parseInt(process.env.IMAP_PORT || defaults.port.toString()),
    tls: customConfig.tls !== undefined ? customConfig.tls : defaults.tls,
    tlsOptions: { rejectUnauthorized: false }
  };
};

const getSmtpConfig = (customConfig = {}) => ({
  host: customConfig.host || process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: customConfig.port || parseInt(process.env.SMTP_PORT || '465'),
  secure: customConfig.secure !== undefined ? customConfig.secure : true,
  auth: {
    user: customConfig.user || process.env.EMAIL_USER,
    pass: customConfig.password || process.env.EMAIL_PASSWORD
  }
});

// GET /api/email/config - Get email configuration status
router.get('/config', (req, res) => {
  const hasImapConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  const hasSmtpConfig = hasImapConfig; // Same credentials
  
  res.json({
    success: true,
    imap: {
      configured: hasImapConfig,
      host: process.env.IMAP_HOST || 'imap.hostinger.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      user: process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.slice(-10) : null
    },
    smtp: {
      configured: hasSmtpConfig,
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465')
    }
  });
});

// POST /api/email/test-connection - Test IMAP connection
router.post('/test-connection', async (req, res) => {
  const { user, password, host, port } = req.body;
  
  try {
    const config = getImapConfig({ user, password, host, port });
    
    const imap = new Imap(config);
    
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.end();
        resolve(res.json({
          success: true,
          message: 'Successfully connected to IMAP server',
          server: config.host
        }));
      });
      
      imap.once('error', (err) => {
        reject(res.status(500).json({
          success: false,
          error: 'Failed to connect to IMAP server',
          details: err.message
        }));
      });
      
      imap.connect();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message
    });
  }
});

// POST /api/email/fetch - Fetch emails from IMAP server
router.post('/fetch', async (req, res) => {
  const { 
    user, 
    password, 
    host, 
    port, 
    mailbox = 'INBOX', 
    limit = 50,
    searchCriteria = ['ALL']
  } = req.body;
  
  try {
    const config = getImapConfig({ user, password, host, port });
    const imap = new Imap(config);
    const messages = [];
    
    imap.once('ready', () => {
      imap.openBox(mailbox, true, (err, box) => {
        if (err) {
          imap.end();
          return res.status(500).json({
            success: false,
            error: 'Failed to open mailbox',
            details: err.message
          });
        }
        
        // Search for messages
        imap.search(searchCriteria, (err, results) => {
          if (err) {
            imap.end();
            return res.status(500).json({
              success: false,
              error: 'Failed to search messages',
              details: err.message
            });
          }
          
          if (!results || results.length === 0) {
            imap.end();
            return res.json({
              success: true,
              messages: [],
              total: 0,
              mailbox
            });
          }
          
          // Limit results
          const messagesToFetch = results.slice(-limit);
          
          const fetch = imap.fetch(messagesToFetch, {
            bodies: '',
            struct: true
          });
          
          fetch.on('message', (msg, seqno) => {
            let messageData = { seqno };
            
            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              
              stream.once('end', () => {
                simpleParser(buffer, (err, parsed) => {
                  if (!err && parsed) {
                    messageData = {
                      id: seqno,
                      subject: parsed.subject || 'No Subject',
                      from: parsed.from?.text || 'Unknown',
                      to: parsed.to?.text || '',
                      date: parsed.date || new Date(),
                      text: parsed.text || '',
                      html: parsed.html || '',
                      attachments: parsed.attachments?.map(att => ({
                        filename: att.filename,
                        contentType: att.contentType,
                        size: att.size
                      })) || []
                    };
                    messages.push(messageData);
                  }
                });
              });
            });
          });
          
          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
          });
          
          fetch.once('end', () => {
            imap.end();
            res.json({
              success: true,
              messages: messages.sort((a, b) => new Date(b.date) - new Date(a.date)),
              total: messages.length,
              mailbox,
              box: {
                total: box.messages.total,
                new: box.messages.new,
                unseen: box.messages.unseen
              }
            });
          });
        });
      });
    });
    
    imap.once('error', (err) => {
      res.status(500).json({
        success: false,
        error: 'IMAP connection error',
        details: err.message
      });
    });
    
    imap.connect();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emails',
      details: error.message
    });
  }
});

// POST /api/email/send - Send email via SMTP
router.post('/send', async (req, res) => {
  const { user, password, host, port, to, subject, text, html } = req.body;
  
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: to, subject, and text/html'
    });
  }
  
  try {
    const config = getSmtpConfig({ user, password, host, port });
    const transporter = nodemailer.createTransporter(config);
    
    const mailOptions = {
      from: config.auth.user,
      to,
      subject,
      text,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// POST /api/email/fetch-and-analyze - Fetch emails and prepare for analysis
router.post('/fetch-and-analyze', async (req, res) => {
  const { 
    user, 
    password, 
    host, 
    port, 
    mailbox = 'INBOX', 
    limit = 50,
    searchCriteria = ['ALL']
  } = req.body;
  
  try {
    const config = getImapConfig({ user, password, host, port });
    const imap = new Imap(config);
    const messages = [];
    
    imap.once('ready', () => {
      imap.openBox(mailbox, true, (err, box) => {
        if (err) {
          imap.end();
          return res.status(500).json({
            success: false,
            error: 'Failed to open mailbox',
            details: err.message
          });
        }
        
        imap.search(searchCriteria, (err, results) => {
          if (err) {
            imap.end();
            return res.status(500).json({
              success: false,
              error: 'Failed to search messages',
              details: err.message
            });
          }
          
          if (!results || results.length === 0) {
            imap.end();
            return res.json({
              success: true,
              messages: [],
              total: 0
            });
          }
          
          const messagesToFetch = results.slice(-limit);
          
          const fetch = imap.fetch(messagesToFetch, {
            bodies: '',
            struct: true
          });
          
          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              
              stream.once('end', () => {
                simpleParser(buffer, (err, parsed) => {
                  if (!err && parsed) {
                    // Format for Telegram analysis compatibility
                    messages.push({
                      id: seqno,
                      content: `Subject: ${parsed.subject || 'No Subject'}\n\nFrom: ${parsed.from?.text || 'Unknown'}\nDate: ${parsed.date}\n\n${parsed.text || parsed.html || ''}`,
                      timestamp: parsed.date || new Date(),
                      sender: parsed.from?.text || 'Unknown'
                    });
                  }
                });
              });
            });
          });
          
          fetch.once('end', () => {
            imap.end();
            
            // Return in format compatible with Telegram analysis
            res.json({
              success: true,
              messages: messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
              total: messages.length,
              source: 'email',
              mailbox,
              ready_for_analysis: true
            });
          });
        });
      });
    });
    
    imap.once('error', (err) => {
      res.status(500).json({
        success: false,
        error: 'IMAP connection error',
        details: err.message
      });
    });
    
    imap.connect();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch and prepare emails',
      details: error.message
    });
  }
});

// GET /api/email/mailboxes - List available mailboxes
router.post('/mailboxes', async (req, res) => {
  const { user, password, host, port } = req.body;
  
  try {
    const config = getImapConfig({ user, password, host, port });
    const imap = new Imap(config);
    
    imap.once('ready', () => {
      imap.getBoxes((err, boxes) => {
        imap.end();
        
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Failed to get mailboxes',
            details: err.message
          });
        }
        
        // Flatten mailbox structure
        const flattenBoxes = (boxes, prefix = '') => {
          let result = [];
          for (const [name, box] of Object.entries(boxes)) {
            const fullName = prefix ? `${prefix}${box.delimiter}${name}` : name;
            result.push({
              name: fullName,
              delimiter: box.delimiter,
              attribs: box.attribs,
              children: box.children ? Object.keys(box.children).length : 0
            });
            if (box.children) {
              result = result.concat(flattenBoxes(box.children, fullName));
            }
          }
          return result;
        };
        
        res.json({
          success: true,
          mailboxes: flattenBoxes(boxes)
        });
      });
    });
    
    imap.once('error', (err) => {
      res.status(500).json({
        success: false,
        error: 'IMAP connection error',
        details: err.message
      });
    });
    
    imap.connect();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to list mailboxes',
      details: error.message
    });
  }
});

// Helper function to extract authentication codes from email content
function extractAuthCodes(emailContent) {
  const codes = [];
  
  // Common patterns for authentication codes
  const patterns = [
    // 6-digit codes
    /\b(\d{6})\b/g,
    // 4-digit codes
    /\b(\d{4})\b/g,
    // Verification code: 123456
    /verification code[:\s]+([0-9]{4,8})/gi,
    /verification[:\s]+([0-9]{4,8})/gi,
    // Code: 123456
    /code[:\s]+([0-9]{4,8})/gi,
    // OTP: 123456
    /otp[:\s]+([0-9]{4,8})/gi,
    // PIN: 1234
    /pin[:\s]+([0-9]{4,6})/gi,
    // Your code is 123456
    /your code is[:\s]+([0-9]{4,8})/gi,
    // Alphanumeric codes (e.g., AB12CD)
    /\b([A-Z0-9]{6,8})\b/g,
    // Codes with dashes (e.g., 123-456)
    /\b(\d{3}-\d{3})\b/g
  ];
  
  patterns.forEach(pattern => {
    const matches = emailContent.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && !codes.includes(match[1])) {
        codes.push(match[1]);
      }
    }
  });
  
  return codes;
}

// POST /api/email/extract-auth-codes - Extract authentication codes from recent emails
router.post('/extract-auth-codes', async (req, res) => {
  const { 
    user, 
    password, 
    host, 
    port,
    provider,
    mailbox = 'INBOX',
    limit = 10,
    searchCriteria = ['UNSEEN'] // Only unread messages by default
  } = req.body;
  
  try {
    const config = getImapConfig({ user, password, host, port, provider });
    const imap = new Imap(config);
    const authCodes = [];
    
    imap.once('ready', () => {
      imap.openBox(mailbox, false, (err, box) => {
        if (err) {
          imap.end();
          return res.status(500).json({
            success: false,
            error: 'Failed to open mailbox',
            details: err.message
          });
        }
        
        imap.search(searchCriteria, (err, results) => {
          if (err) {
            imap.end();
            return res.status(500).json({
              success: false,
              error: 'Failed to search messages',
              details: err.message
            });
          }
          
          if (!results || results.length === 0) {
            imap.end();
            return res.json({
              success: true,
              authCodes: [],
              total: 0,
              message: 'No new messages found'
            });
          }
          
          const messagesToFetch = results.slice(-limit);
          
          const fetch = imap.fetch(messagesToFetch, {
            bodies: '',
            struct: true,
            markSeen: false // Don't mark as read
          });
          
          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              
              stream.once('end', () => {
                simpleParser(buffer, (err, parsed) => {
                  if (!err && parsed) {
                    const content = `${parsed.subject || ''} ${parsed.text || ''}`;
                    const extractedCodes = extractAuthCodes(content);
                    
                    if (extractedCodes.length > 0) {
                      authCodes.push({
                        messageId: seqno,
                        subject: parsed.subject || 'No Subject',
                        from: parsed.from?.text || 'Unknown',
                        date: parsed.date || new Date(),
                        codes: extractedCodes,
                        snippet: (parsed.text || '').substring(0, 200)
                      });
                    }
                  }
                });
              });
            });
          });
          
          fetch.once('end', () => {
            imap.end();
            res.json({
              success: true,
              authCodes: authCodes.sort((a, b) => new Date(b.date) - new Date(a.date)),
              total: authCodes.length,
              checked: messagesToFetch.length
            });
          });
        });
      });
    });
    
    imap.once('error', (err) => {
      res.status(500).json({
        success: false,
        error: 'IMAP connection error',
        details: err.message
      });
    });
    
    imap.connect();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to extract authentication codes',
      details: error.message
    });
  }
});

// POST /api/email/monitor-auth-codes - Continuously monitor for new auth codes
router.post('/monitor-auth-codes', async (req, res) => {
  const { 
    user, 
    password, 
    host, 
    port,
    provider,
    mailbox = 'INBOX',
    timeout = 60000 // 60 seconds default
  } = req.body;
  
  try {
    const config = getImapConfig({ user, password, host, port, provider });
    const imap = new Imap(config);
    let monitorTimeout;
    let foundCode = null;
    
    imap.once('ready', () => {
      imap.openBox(mailbox, false, (err, box) => {
        if (err) {
          imap.end();
          return res.status(500).json({
            success: false,
            error: 'Failed to open mailbox',
            details: err.message
          });
        }
        
        // Set timeout
        monitorTimeout = setTimeout(() => {
          imap.end();
          if (!foundCode) {
            res.json({
              success: true,
              found: false,
              message: 'Timeout: No authentication code received',
              timeout: true
            });
          }
        }, timeout);
        
        // Listen for new mail
        imap.on('mail', (numNewMsgs) => {
          imap.search(['UNSEEN'], (err, results) => {
            if (err || !results || results.length === 0) return;
            
            const fetch = imap.fetch(results.slice(-1), {
              bodies: '',
              markSeen: false
            });
            
            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                let buffer = '';
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });
                
                stream.once('end', () => {
                  simpleParser(buffer, (err, parsed) => {
                    if (!err && parsed && !foundCode) {
                      const content = `${parsed.subject || ''} ${parsed.text || ''}`;
                      const codes = extractAuthCodes(content);
                      
                      if (codes.length > 0) {
                        clearTimeout(monitorTimeout);
                        foundCode = {
                          subject: parsed.subject,
                          from: parsed.from?.text,
                          codes: codes,
                          date: parsed.date
                        };
                        
                        imap.end();
                        res.json({
                          success: true,
                          found: true,
                          authCode: foundCode,
                          firstCode: codes[0]
                        });
                      }
                    }
                  });
                });
              });
            });
          });
        });
        
        // Check existing unseen messages first
        imap.search(['UNSEEN'], (err, results) => {
          if (!err && results && results.length > 0) {
            const fetch = imap.fetch(results.slice(-1), {
              bodies: '',
              markSeen: false
            });
            
            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                let buffer = '';
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });
                
                stream.once('end', () => {
                  simpleParser(buffer, (err, parsed) => {
                    if (!err && parsed && !foundCode) {
                      const content = `${parsed.subject || ''} ${parsed.text || ''}`;
                      const codes = extractAuthCodes(content);
                      
                      if (codes.length > 0) {
                        clearTimeout(monitorTimeout);
                        foundCode = {
                          subject: parsed.subject,
                          from: parsed.from?.text,
                          codes: codes,
                          date: parsed.date
                        };
                        
                        imap.end();
                        res.json({
                          success: true,
                          found: true,
                          authCode: foundCode,
                          firstCode: codes[0]
                        });
                      }
                    }
                  });
                });
              });
            });
          }
        });
      });
    });
    
    imap.once('error', (err) => {
      clearTimeout(monitorTimeout);
      res.status(500).json({
        success: false,
        error: 'IMAP connection error',
        details: err.message
      });
    });
    
    imap.connect();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to monitor for authentication codes',
      details: error.message
    });
  }
});

export default router;
