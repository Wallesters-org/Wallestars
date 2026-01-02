# 33mail Integration

Disposable email management using 33mail service.

## Overview

The 33mail integration provides CLI tools for managing disposable email addresses:
- User: `krasavetsa1@33mail.com`
- Format: `krasavetsa1.<purpose>@33mail.com`

## Features

- ✅ Generate disposable emails for services
- ✅ List active and inactive emails
- ✅ Deactivate emails when no longer needed
- ✅ Local database for tracking
- ✅ Forward configuration

## Installation

```bash
# Make executable
chmod +x platforms/33mail-integration/33mail-manager.py

# Create alias
alias 33mail="python platforms/33mail-integration/33mail-manager.py"
```

## Configuration

Set environment variables:

```bash
export EMAIL_33MAIL_API_KEY="your-api-key"
export EMAIL_33MAIL_FORWARD="your-real-email@example.com"
export EMAIL_33MAIL_STORAGE="~/.33mail"
```

## Usage

### Generate Email

```bash
# Generate for GitHub
python 33mail-manager.py generate github "For GitHub notifications"
# Output: krasavetsa1.github@33mail.com

# Generate for NPM
python 33mail-manager.py generate npm "NPM package notifications"
# Output: krasavetsa1.npm@33mail.com
```

### List Emails

```bash
# List active emails only
python 33mail-manager.py list

# List all emails (including inactive)
python 33mail-manager.py list --all
```

### Deactivate Email

```bash
python 33mail-manager.py deactivate krasavetsa1.github@33mail.com
```

### Check Forward Address

```bash
python 33mail-manager.py forward
```

## Integration with Eva

33mail can be integrated with Eva Core for automated email management:

```javascript
const emailManager = require('./platforms/33mail-integration/wrapper');

// Generate email for new service
const email = emailManager.generate('new-service', 'Service description');

// Use in Eva workflows
eva.config.notificationEmail = email;
```

## Storage

Emails are stored locally in JSON format:

```
~/.33mail/
  └── emails.json
```

## Security

- ✅ API keys stored in environment variables
- ✅ Local database gitignored
- ✅ No sensitive data in repository
- ✅ Forward address configurable

## Common Use Cases

### 1. Service Signups
```bash
python 33mail-manager.py generate servicename "Service signup"
```

### 2. Newsletter Subscriptions
```bash
python 33mail-manager.py generate newsletter-site "Newsletter"
```

### 3. Testing
```bash
python 33mail-manager.py generate test-$(date +%Y%m%d) "Test email"
```

### 4. Bulk Generation
```bash
for service in github npm discord slack; do
  python 33mail-manager.py generate $service "For $service"
done
```

## Troubleshooting

### Email Not Forwarding

Check forward address:
```bash
python 33mail-manager.py forward
```

Set if missing:
```bash
export EMAIL_33MAIL_FORWARD="your-real-email@example.com"
```

### Storage Permission Issues

```bash
mkdir -p ~/.33mail
chmod 700 ~/.33mail
```

## API Reference

See [33mail-manager.py](./33mail-manager.py) for full API documentation.

## Related

- [Email Processor Platform](../email-processor/README.md)
- [Eva Core Integration](../../eva-core/README.md)
