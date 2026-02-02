---
name: "Wallestars Verification"
description: "SMS and Email OTP verification management"
icon: "🔐"
version: "1.0.0"
author: "Wallestars"
requires:
  - "node-fetch"
env:
  - N8N_WEBHOOK_URL
  - N8N_API_KEY
---

# Wallestars Verification Skill

## Description

This skill manages SMS and Email OTP verification processes for Wallesters business registration. It triggers verification subworkflows and retrieves extracted codes.

## Capabilities

### Trigger SMS Verification
Start SMS OTP extraction for a phone number.

**Input:**
- `phone_number` - Phone number receiving the SMS
- `sms_url` - URL to check for SMS (from phone pool)
- `expected_sender` - Optional sender filter

**Output:**
- `verification_code` - Extracted 4-6 digit code
- `status` - success | timeout | error

### Trigger Email Verification
Start Email OTP extraction.

**Input:**
- `target_email` - Email address receiving the verification
- `subject_filter` - Subject line to search for (default: "Wallester user account activation code")
- `max_retries` - Maximum retry attempts (default: 10)
- `wait_seconds` - Seconds between retries (default: 15)

**Output:**
- `verification_code` - Extracted code
- `email_subject` - Subject of matched email
- `status` - success | timeout | error

### Check Verification Status
Query status of ongoing verification.

**Input:**
- `verification_id` - Verification process ID

**Output:**
- `status` - pending | checking | found | timeout
- `attempts` - Number of attempts made
- `code` - Extracted code (if found)

## Usage Examples

### SMS Verification
```
User: Start SMS verification for +359888123456
Molty: 📱 Starting SMS verification...
       - Phone: +359888****
       - Checking inbox every 15 seconds
       - Max wait: 150 seconds

       ⏳ Attempt 1/10 - No SMS yet...
       ⏳ Attempt 2/10 - No SMS yet...
       ✅ SMS found! Code: 847291
```

### Email Verification
```
User: Check for Wallester verification email
Molty: 📧 Starting email verification...
       - Target: company@wallestars.eu
       - Subject filter: "Wallester user account activation code"
       - Checking unread emails...

       ✅ Email found!
       Code: 583921
       From: noreply@wallester.com
```

## Timeouts

| Type | Default Wait | Max Retries | Total Time |
|------|--------------|-------------|------------|
| SMS  | 15 seconds   | 10          | 150 seconds |
| Email | 15 seconds  | 10          | 150 seconds |

## Error Codes

| Code | Meaning |
|------|---------|
| `OTP_TIMEOUT` | Max retries exceeded, no code found |
| `INVALID_PHONE` | Phone number format invalid |
| `INVALID_EMAIL` | Email address format invalid |
| `WORKFLOW_ERROR` | n8n workflow execution failed |
| `PARSE_ERROR` | Could not extract code from message |
