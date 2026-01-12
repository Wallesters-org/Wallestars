# Authentication Code Extraction - Quick Guide

## Overview

The Email Integration system now includes automatic extraction and monitoring of authentication codes from emails, designed for registration and website form filling automation workflows.

## Features

### 1. Multi-Provider Support
- **Gmail** - imap.gmail.com (recommended for receiving 33mail aliases)
- **Hostinger** - imap.hostinger.com
- **AWS WorkMail** - imap.mail.eu-west-1.awsapps.com

### 2. Authentication Code Extraction
Automatically detects and extracts:
- 6-digit codes: `123456`
- 4-digit codes: `1234`
- Verification codes: "verification code: 123456"
- OTP codes: "OTP: 123456"
- PIN codes: "PIN: 1234"
- Alphanumeric: `AB12CD`
- Dashed format: `123-456`

### 3. Real-time Monitoring
- Wait for new emails with auth codes
- 60-second timeout (configurable)
- Returns immediately when code found
- Perfect for automation workflows

## Quick Start

### Setup Gmail (Recommended)

1. **Enable IMAP in Gmail:**
   - Go to Gmail Settings → Forwarding and POP/IMAP
   - Enable IMAP
   - Save changes

2. **Create App Password:**
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Go to App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password

3. **Configure in Wallestars:**
   - Navigate to "Email Integration"
   - Select "Gmail" provider
   - Email: `miropetrovski12@gmail.com` (or your Gmail)
   - Password: Your App Password (16 characters)
   - Click "Test Connection"

### Extract Authentication Codes

**Option A: Scan Recent Emails**
1. Click "Extract Auth Codes" button
2. System scans last 10 unread messages
3. View extracted codes in "Auth Codes" tab
4. Click any code to copy to clipboard

**Option B: Monitor for New Codes**
1. Click "Monitor for Codes (60s)" button
2. System waits for new incoming email
3. Automatically extracts code when received
4. Returns code immediately (within 60s timeout)

## API Usage

### Extract from Recent Emails

```javascript
// Extract codes from recent unread emails
POST /api/email/extract-auth-codes
{
  "user": "miropetrovski12@gmail.com",
  "password": "your_app_password",
  "provider": "gmail",
  "mailbox": "INBOX",
  "limit": 10
}

// Response
{
  "success": true,
  "authCodes": [
    {
      "messageId": 123,
      "subject": "Your verification code",
      "from": "noreply@service.com",
      "date": "2024-01-12T12:00:00.000Z",
      "codes": ["123456", "ABC123"],
      "snippet": "Your verification code is: 123456..."
    }
  ],
  "total": 1,
  "checked": 10
}
```

### Monitor for New Codes

```javascript
// Wait for new email with auth code
POST /api/email/monitor-auth-codes
{
  "user": "miropetrovski12@gmail.com",
  "password": "your_app_password",
  "provider": "gmail",
  "mailbox": "INBOX",
  "timeout": 60000
}

// Response (when code found)
{
  "success": true,
  "found": true,
  "authCode": {
    "subject": "Your verification code",
    "from": "noreply@service.com",
    "codes": ["123456"],
    "date": "2024-01-12T12:00:00.000Z"
  },
  "firstCode": "123456"
}

// Response (timeout)
{
  "success": true,
  "found": false,
  "message": "Timeout: No authentication code received",
  "timeout": true
}
```

## Automation Workflow Examples

### Example 1: Basic Registration Flow

```javascript
// 1. Start registration
await fillForm({
  email: "myalias@33mail.com" // Forwards to miropetrovski12@gmail.com
});

// 2. Submit form
await submitRegistration();

// 3. Wait for verification code
const response = await fetch('/api/email/monitor-auth-codes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user: "miropetrovski12@gmail.com",
    password: process.env.GMAIL_APP_PASSWORD,
    provider: "gmail",
    timeout: 60000
  })
});

const { firstCode } = await response.json();

// 4. Auto-fill verification code
await fillVerificationCode(firstCode);

// 5. Complete registration
await submitVerificationCode();
```

### Example 2: n8n Workflow

**Workflow Configuration:**

```json
{
  "nodes": [
    {
      "name": "Start Registration",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://example.com/register",
        "method": "POST",
        "body": {
          "email": "{{$json.email}}"
        }
      }
    },
    {
      "name": "Monitor for Auth Code",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3000/api/email/monitor-auth-codes",
        "method": "POST",
        "body": {
          "user": "miropetrovski12@gmail.com",
          "password": "{{$credentials.gmail_app_password}}",
          "provider": "gmail",
          "timeout": 60000
        }
      }
    },
    {
      "name": "Submit Verification Code",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://example.com/verify",
        "method": "POST",
        "body": {
          "code": "{{$json.firstCode}}"
        }
      }
    }
  ]
}
```

### Example 3: Multiple Services

```javascript
// Configure 33mail aliases to forward to Gmail
// Then monitor Gmail for all registration emails

const services = [
  { name: 'Service1', email: 'service1@33mail.com' },
  { name: 'Service2', email: 'service2@33mail.com' },
  { name: 'Service3', email: 'service3@33mail.com' }
];

for (const service of services) {
  // Start registration
  await registerService(service);
  
  // Monitor for code
  const { firstCode } = await monitorAuthCode();
  
  // Complete registration
  await verifyService(service, firstCode);
}
```

## 33mail Integration

### Setup

1. **Create 33mail Account:**
   - Go to https://33mail.com/
   - Sign up and verify
   - Set default forward address: `miropetrovski12@gmail.com`

2. **Create Aliases:**
   - `service1@username.33mail.com` → forwards to Gmail
   - `service2@username.33mail.com` → forwards to Gmail
   - All emails go to single Gmail inbox

3. **Monitor Gmail:**
   - Use Gmail provider in Email Integration
   - All auth codes from different services arrive in one place
   - Extract codes automatically

## WorkMail.pro Integration

Similar to 33mail, WorkMail.pro allows email forwarding:

1. Configure DNS for mail services
2. Set up forwarding rules to Gmail
3. Monitor Gmail for incoming codes
4. All aliases centralized in one inbox

## Browser Automation (Airtop)

### Integration Pattern

```javascript
// 1. Use Airtop to open browser and start registration
const browser = await airtop.launch();
const page = await browser.newPage();

await page.goto('https://example.com/register');
await page.fill('#email', 'myalias@33mail.com');
await page.click('#submit');

// 2. Monitor email for code
const { firstCode } = await fetch('/api/email/monitor-auth-codes', {
  method: 'POST',
  body: JSON.stringify({
    user: 'miropetrovski12@gmail.com',
    password: process.env.GMAIL_APP_PASSWORD,
    provider: 'gmail'
  })
}).then(r => r.json());

// 3. Fill code in browser
await page.fill('#verification-code', firstCode);
await page.click('#verify');

// 4. Complete registration
await page.waitForNavigation();
console.log('Registration complete!');
```

## Troubleshooting

### Gmail: "Authentication failed"

**Solution:**
- Use App Password, not regular Gmail password
- Enable 2-Step Verification first
- Generate new App Password from Google Account

### No Codes Extracted

**Solution:**
- Check emails are in INBOX (not Spam)
- Ensure emails are unread
- Try different search criteria
- Verify code format matches patterns

### Monitor Timeout

**Solution:**
- Increase timeout parameter (default 60s)
- Check email arrives during monitoring period
- Verify IMAP connection is stable
- Try manual "Extract" first to test

### 33mail Emails Not Arriving

**Solution:**
- Verify forwarding is set up correctly
- Check Gmail spam folder
- Test with direct email first
- Allow a few seconds for forwarding delay

## Best Practices

### 1. Use Gmail for Centralization
- Set up 33mail/workmail.pro to forward to Gmail
- Monitor single Gmail inbox
- Simpler credential management

### 2. App Passwords Only
- Never use regular Gmail password
- Generate unique App Password per application
- Rotate passwords regularly

### 3. Monitoring Strategy
- Use "Extract" for immediate needs
- Use "Monitor" for automation workflows
- Set appropriate timeout values
- Handle timeout gracefully

### 4. Error Handling
```javascript
try {
  const result = await monitorAuthCode();
  if (result.found) {
    await useCode(result.firstCode);
  } else {
    console.log('No code received, trying manual extraction...');
    const codes = await extractAuthCodes();
    if (codes.length > 0) {
      await useCode(codes[0].codes[0]);
    }
  }
} catch (error) {
  console.error('Auth code extraction failed:', error);
  // Fallback to manual entry
}
```

### 5. Security
- Store credentials in environment variables
- Never commit passwords to git
- Use read-only IMAP when possible
- Delete sensitive emails after processing

## Performance

- **Extract Codes:** ~5-10 seconds (scans 10 emails)
- **Monitor Codes:** 2-60 seconds (depends on email arrival)
- **Pattern Matching:** <1ms per email
- **IMAP Connection:** ~2-3 seconds

## Support

For issues or questions:
1. Check Gmail IMAP is enabled
2. Verify App Password is correct
3. Test with "Extract" before "Monitor"
4. Check email arrives in INBOX
5. Review EMAIL_INTEGRATION_DOCS.md

---

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Feature:** Authentication Code Extraction
