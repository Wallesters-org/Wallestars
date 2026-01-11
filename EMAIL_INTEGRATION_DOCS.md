# Email Integration (Hostinger IMAP/SMTP) Documentation

## Overview

The Email Integration feature provides complete IMAP/SMTP connectivity for Hostinger email accounts, enabling email fetching, message analysis, and email sending capabilities.

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration (Hostinger IMAP/SMTP)
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password
IMAP_HOST=imap.hostinger.com
IMAP_PORT=993
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
```

### Hostinger Email Settings

**Protocol Settings:**
- **IMAP Host:** imap.hostinger.com
- **IMAP Port:** 993 (SSL)
- **SMTP Host:** smtp.hostinger.com
- **SMTP Port:** 465 (SSL) 
- **POP3 Host:** pop.hostinger.com
- **POP3 Port:** 995 (SSL)

**Encryption:** All connections use SSL/TLS

## API Endpoints

### GET /api/email/config

Get current email configuration status.

**Response:**
```json
{
  "success": true,
  "imap": {
    "configured": true,
    "host": "imap.hostinger.com",
    "port": 993,
    "user": "***@domain.com"
  },
  "smtp": {
    "configured": true,
    "host": "smtp.hostinger.com",
    "port": 465
  }
}
```

### POST /api/email/test-connection

Test IMAP server connection.

**Request:**
```json
{
  "user": "your_email@domain.com",
  "password": "your_password",
  "host": "imap.hostinger.com",
  "port": 993
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to IMAP server",
  "server": "imap.hostinger.com"
}
```

### POST /api/email/fetch

Fetch emails from mailbox.

**Request:**
```json
{
  "user": "your_email@domain.com",
  "password": "your_password",
  "host": "imap.hostinger.com",
  "port": 993,
  "mailbox": "INBOX",
  "limit": 50,
  "searchCriteria": ["ALL"]
}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "subject": "Email subject",
      "from": "sender@example.com",
      "to": "recipient@example.com",
      "date": "2024-01-03T12:00:00.000Z",
      "text": "Email body text",
      "html": "<p>Email body HTML</p>",
      "attachments": [
        {
          "filename": "document.pdf",
          "contentType": "application/pdf",
          "size": 12345
        }
      ]
    }
  ],
  "total": 10,
  "mailbox": "INBOX",
  "box": {
    "total": 100,
    "new": 5,
    "unseen": 10
  }
}
```

### POST /api/email/fetch-and-analyze

Fetch emails and format for Telegram analysis.

**Request:**
```json
{
  "user": "your_email@domain.com",
  "password": "your_password",
  "host": "imap.hostinger.com",
  "port": 993,
  "mailbox": "INBOX",
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "content": "Subject: Email subject\n\nFrom: sender@example.com\nDate: 2024-01-03T12:00:00.000Z\n\nEmail body content",
      "timestamp": "2024-01-03T12:00:00.000Z",
      "sender": "sender@example.com"
    }
  ],
  "total": 10,
  "source": "email",
  "mailbox": "INBOX",
  "ready_for_analysis": true
}
```

### POST /api/email/mailboxes

List available mailboxes.

**Request:**
```json
{
  "user": "your_email@domain.com",
  "password": "your_password",
  "host": "imap.hostinger.com",
  "port": 993
}
```

**Response:**
```json
{
  "success": true,
  "mailboxes": [
    {
      "name": "INBOX",
      "delimiter": "/",
      "attribs": [],
      "children": 0
    },
    {
      "name": "Sent",
      "delimiter": "/",
      "attribs": ["\\Sent"],
      "children": 0
    }
  ]
}
```

### POST /api/email/send

Send email via SMTP.

**Request:**
```json
{
  "user": "your_email@domain.com",
  "password": "your_password",
  "host": "smtp.hostinger.com",
  "port": 465,
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "text": "Plain text email body",
  "html": "<p>HTML email body</p>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@domain.com>",
  "accepted": ["recipient@example.com"],
  "rejected": []
}
```

## Usage Guide

### 1. Access Email Integration

Navigate to **Email Integration** from the sidebar menu.

### 2. Configure Connection

1. Enter your email address
2. Enter your email password
3. Verify IMAP/SMTP settings (pre-filled for Hostinger)
4. Click **Test Connection** to verify

### 3. Fetch Emails

**Option A: View Emails**
1. Click **Fetch Emails** button
2. Switch to **Inbox** tab
3. View fetched emails with subjects, senders, and content
4. Export to JSON if needed

**Option B: Fetch for Analysis**
1. Click **Fetch for Analysis** button
2. Emails are formatted for Telegram analysis
3. Switch to **Telegram Analysis** page
4. Messages will be pre-loaded from email

### 4. Integration with Telegram Analysis

The Email Integration seamlessly works with the Telegram Analysis feature:

1. Fetch emails using "Fetch for Analysis"
2. Navigate to **Telegram Analysis**
3. Messages appear pre-loaded
4. Analyze with Claude AI as normal
5. Get categorization, priority, and insights

## n8n Workflow Integration

### Setup Instructions

1. **Create n8n Workflow**
   - Add "HTTP Request" node
   - Configure to call `/api/email/fetch`

2. **Configure Workflow Node**
   ```json
   {
     "method": "POST",
     "url": "http://localhost:3000/api/email/fetch",
     "headers": {
       "Content-Type": "application/json"
     },
     "body": {
       "user": "{{$env.EMAIL_USER}}",
       "password": "{{$env.EMAIL_PASSWORD}}",
       "mailbox": "INBOX",
       "limit": 50
     }
   }
   ```

3. **Add Telegram Analysis Node**
   ```json
   {
     "method": "POST",
     "url": "http://localhost:3000/api/telegram/analyze-batch",
     "body": {
       "messages": "{{$json.messages}}"
     }
   }
   ```

4. **Schedule Workflow**
   - Add "Cron" trigger node
   - Set schedule (e.g., every hour)
   - Automate email fetching and analysis

### Example Workflow (Workflow #3)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────────┐
│   Cron      │────▶│ Fetch Emails │────▶│ Analyze with AI │────▶│   Notify   │
│  Trigger    │     │  (IMAP)      │     │   (Claude)      │     │ (Telegram) │
└─────────────┘     └──────────────┘     └─────────────────┘     └────────────┘
```

## Security Best Practices

### Credentials Storage

✅ **DO:**
- Store credentials in `.env` file
- Use environment variables
- Never commit `.env` to git
- Use different credentials for dev/prod

❌ **DON'T:**
- Hardcode passwords in code
- Share credentials in pull requests
- Log passwords or sensitive data
- Use same password for multiple services

### Connection Security

- All connections use SSL/TLS encryption
- Certificates validated by default
- Passwords transmitted securely
- No persistent storage of credentials

### IMAP Security

- Use app-specific passwords when available
- Enable 2FA on email account
- Monitor for unauthorized access
- Regularly rotate passwords

## Troubleshooting

### Connection Issues

**Problem:** "Failed to connect to IMAP server"

**Solutions:**
1. Verify email/password are correct
2. Check if IMAP is enabled in Hostinger
3. Verify firewall allows port 993
4. Check SSL/TLS settings
5. Try without TLS certificate validation

**Problem:** "Authentication failed"

**Solutions:**
1. Verify email address format
2. Check password doesn't have special characters that need escaping
3. Enable IMAP access in Hostinger control panel
4. Check for account suspension

### Fetch Issues

**Problem:** "No emails returned"

**Solutions:**
1. Verify mailbox name (case-sensitive)
2. Check search criteria
3. Verify mailbox has messages
4. Try different mailbox (e.g., "Sent")

**Problem:** "Timeout error"

**Solutions:**
1. Increase limit parameter
2. Check network connectivity
3. Verify server isn't overloaded
4. Try during off-peak hours

### Send Issues

**Problem:** "Failed to send email"

**Solutions:**
1. Verify SMTP credentials
2. Check port 465 is accessible
3. Verify recipient email format
4. Check for rate limiting

## Performance Considerations

### IMAP Operations

- **Connection time:** 2-5 seconds
- **Fetch 50 emails:** 5-15 seconds
- **Fetch 100 emails:** 10-30 seconds

### Optimization Tips

1. **Limit email fetching**
   - Use `limit` parameter
   - Fetch only what you need
   - Use search criteria to filter

2. **Batch processing**
   - Process emails in chunks
   - Use `fetch-and-analyze` for automation
   - Schedule during off-peak hours

3. **Caching**
   - Store fetched emails locally
   - Avoid re-fetching same messages
   - Use message IDs for tracking

## Integration Examples

### Manual Email Analysis

```bash
# 1. Fetch emails
curl -X POST http://localhost:3000/api/email/fetch-and-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user": "your@email.com",
    "password": "password",
    "limit": 50
  }'

# 2. Analyze with Telegram system
curl -X POST http://localhost:3000/api/telegram/analyze-batch \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [/* messages from step 1 */]
  }'
```

### Automated with n8n

1. Create workflow in n8n
2. Add IMAP fetch node
3. Add Claude analysis node
4. Add notification node
5. Schedule with cron trigger

### Python Script Example

```python
import requests

# Fetch emails
response = requests.post(
    'http://localhost:3000/api/email/fetch-and-analyze',
    json={
        'user': 'your@email.com',
        'password': 'password',
        'limit': 50
    }
)

emails = response.json()['messages']

# Analyze emails
analysis = requests.post(
    'http://localhost:3000/api/telegram/analyze-batch',
    json={'messages': emails}
)

print(f"Analyzed {len(emails)} emails")
```

## Future Enhancements

### Planned Features

1. **Email Filtering**
   - Filter by date range
   - Filter by sender
   - Filter by subject keywords
   - Boolean search queries

2. **Advanced SMTP**
   - Email templates
   - Bulk email sending
   - HTML email composer
   - Attachment support

3. **OAuth2 Support**
   - Gmail integration
   - Microsoft 365 OAuth
   - Google Workspace
   - Modern auth protocols

4. **Email Rules**
   - Auto-categorization
   - Auto-forwarding
   - Auto-archiving
   - Spam filtering

5. **Multi-account Support**
   - Multiple email accounts
   - Account switching
   - Unified inbox
   - Cross-account search

## Support

### Documentation
- **API Docs:** This file
- **Telegram Analysis:** TELEGRAM_ANALYSIS_DOCS.md
- **n8n Docs:** https://docs.n8n.io

### Getting Help
1. Check this documentation
2. Review API endpoint responses
3. Check server logs
4. Contact development team

### Reporting Issues
Include:
- Email provider (Hostinger)
- Error message
- Request/response examples
- Steps to reproduce

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Author:** Wallestars Development Team
