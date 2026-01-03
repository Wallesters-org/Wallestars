---
name: wallestars-email-management
description: 33mail disposable email alias management for Wallestars. Use when creating temporary email addresses, managing email aliases, protecting privacy, or organizing email subscriptions for different services and purposes.
---

# Wallestars Email Management

Comprehensive 33mail disposable email alias management system for privacy-focused email handling using pattern `krasavetsa1.<purpose>@33mail.com`.

## Core Commands

### Create Alias
```bash
33mail create <purpose> [description]
email-create <purpose>
```

### List Aliases
```bash
33mail list              # Active aliases only
33mail list --all        # All aliases
email-list              # Quick alias
```

### Get Specific Alias
```bash
33mail get <purpose>
email-get <purpose>
```

### Search & Stats
```bash
33mail search <query>
33mail stats
33mail export --format json|csv
```

## Configuration
- Storage: `~/.config/33mail/aliases.json`
- Clipboard integration: Automatic copy to clipboard
- Format: `krasavetsa1.<purpose>@33mail.com`

## Use Cases
- Service registration (GitHub, LinkedIn, Twitter)
- Testing & development
- Privacy protection
- Email organization by category
