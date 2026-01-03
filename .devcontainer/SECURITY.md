# 🔐 Security Guide - Wallestars Development

## Обобщение на Сигурността

Този документ описва как безопасно да управлявате credentials, secrets и sensitive data в Wallestars development environment.

## �� Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Tails OS (Bootable USB-C)                  │
│  ┌────────────────────────────────────────────────┐    │
│  │    Persistent Storage (Encrypted)              │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  KeePassXC Database                  │     │    │
│  │  │  - Encrypted with Password           │     │    │
│  │  │  - Protected with Key File           │     │    │
│  │  │  - Locked with Passphrase            │     │    │
│  │  │                                       │     │    │
│  │  │  Contents:                           │     │    │
│  │  │  ├─ GitHub Tokens                    │     │    │
│  │  │  ├─ API Keys (Claude, OpenAI)        │     │    │
│  │  │  ├─ Database Credentials             │     │    │
│  │  │  ├─ Social Media Logins              │     │    │
│  │  │  └─ SSH Passphrases                  │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Mount/Access
                           ↓
┌─────────────────────────────────────────────────────────┐
│          Development Container (Ephemeral)              │
│  ┌────────────────────────────────────────────────┐    │
│  │  Environment Variables (In-Memory Only)        │    │
│  │  - CLAUDE_API_KEY                              │    │
│  │  - GITHUB_TOKEN                                │    │
│  │  - SUPABASE_KEY                                │    │
│  │  - etc.                                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  .env File (Gitignored, Container Only)        │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🔒 Layer 1: Tails OS Security

### Setup на Tails OS

1. **Bootable USB-C Drive**
   ```
   - Използвайте качествен USB-C flash drive (32GB+)
   - Инсталирайте Tails OS от официален source
   - Enable Persistent Storage
   ```

2. **Persistent Storage Configuration**
   ```
   - Създайте strong passphrase (12+ characters)
   - Запишете passphrase САМО офлайн (хартия)
   - Никога не съхранявайте passphrase дигитално
   ```

3. **KeePassXC Setup**
   ```bash
   # В Tails OS Persistent Storage
   mkdir -p /media/amnesia/Persistent/keepass
   cd /media/amnesia/Persistent/keepass
   
   # Създайте нова база данни
   keepassxc-cli db-create keepass.kdbx
   
   # Генерирайте key file за допълнителна защита
   keepassxc-cli generate --length 32 > keepass.key
   chmod 600 keepass.key
   ```

### KeePassXC Security Levels

**Level 1: Password Only**
```
Master Password: Generated 16+ chars
Security: Medium
Use Case: Personal projects
```

**Level 2: Password + Key File**
```
Master Password: 16+ chars
Key File: 32-byte random
Security: High
Use Case: Professional projects
```

**Level 3: Password + Key File + Persistent Storage Passphrase**
```
Master Password: 16+ chars
Key File: 32-byte random
Storage Passphrase: 12+ chars (separate)
Security: Very High
Use Case: Production secrets (current setup)
```

## 🔑 Layer 2: Secret Management in Dev Container

### Method 1: KeePassXC Integration (Recommended)

**Setup:**

1. **Mount Tails Persistent Storage** (if accessible from host)
   ```bash
   # On Linux host
   sudo mount /dev/sdX /mnt/tails
   export KEEPASS_DB_PATH=/mnt/tails/Persistent/keepass/keepass.kdbx
   export KEEPASS_KEY_FILE=/mnt/tails/Persistent/keepass/keepass.key
   ```

2. **Use Helper Script in Container**
   ```bash
   # Extract secret
   keepass-get "Claude API Key"
   
   # Set as environment variable
   export CLAUDE_API_KEY=$(keepass-get "Claude API Key")
   
   # Add to .env (container only, gitignored)
   echo "CLAUDE_API_KEY=$(keepass-get 'Claude API Key')" >> .env
   ```

3. **Automate for Session**
   ```bash
   # Create ~/.env-from-keepass.sh
   #!/bin/bash
   export CLAUDE_API_KEY=$(keepass-get "Claude API Key")
   export GITHUB_TOKEN=$(keepass-get "GitHub Token")
   export SUPABASE_KEY=$(keepass-get "Supabase Key")
   export OPENAI_API_KEY=$(keepass-get "OpenAI API Key")
   
   # Source at container start
   source ~/.env-from-keepass.sh
   ```

### Method 2: Manual .env (Less Secure)

```bash
# Copy template
cp .env.example .env

# Edit manually (use secure editor)
nano .env

# Set restrictive permissions
chmod 600 .env

# IMPORTANT: .env is already in .gitignore
# Never commit .env to git
```

### Method 3: GitHub Secrets (CI/CD Only)

For GitHub Actions workflows:

```yaml
env:
  CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

## 🚨 Security Rules

### ✅ DO

1. **Use KeePassXC for all secrets**
2. **Rotate API keys every 90 days**
3. **Enable 2FA on all services**
4. **Use SSH keys for Git (not passwords)**
5. **Review .gitignore before every commit**
6. **Use environment variables in code**
7. **Encrypt backups**
8. **Lock screen when away**
9. **Use VPN for sensitive operations**
10. **Keep Tails OS updated**

### ❌ DON'T

1. **Never commit .env to Git**
2. **Never hardcode API keys in code**
3. **Never share KeePassXC master password**
4. **Never store passphrases digitally**
5. **Never use same password twice**
6. **Never commit secrets/credentials directories**
7. **Never share screen during secret entry**
8. **Never auto-save passwords in browser**
9. **Never use public WiFi without VPN**
10. **Never store secrets in Slack/Discord**

## 📋 Credential Inventory

### Required Secrets

```
CREDENTIALS CHECKLIST
─────────────────────────────────────────
✓ Claude API Key (Anthropic Console)
✓ OpenAI API Key (OpenAI Platform)
✓ GitHub Personal Access Token
✓ Supabase Project URL
✓ Supabase Anon Key
✓ Supabase Service Role Key
✓ Instagram Username/Password
✓ Telegram API ID/Hash
✓ Facebook Access Token
✓ n8n Basic Auth Credentials
✓ Azure Subscription ID
✓ SSH Private Key Passphrase
✓ Database Master Password
✓ JWT Secret
✓ Encryption Key
```

### KeePassXC Entry Structure

```
Wallestars Production/
├── AI Services/
│   ├── Claude API Key
│   ├── OpenAI API Key
│   └── OpenAI Organization ID
├── GitHub/
│   ├── Personal Access Token
│   ├── Webhook Secret
│   └── SSH Key Passphrase
├── Supabase/
│   ├── Project URL
│   ├── Anon Key
│   └── Service Role Key
├── Social Media/
│   ├── Instagram/username1
│   ├── Instagram/username2
│   ├── Telegram API
│   └── Facebook Token
├── n8n/
│   ├── Basic Auth User
│   └── Basic Auth Password
└── Azure/
    ├── Subscription ID
    ├── Tenant ID
    └── Service Principal
```

## 🔄 Key Rotation Schedule

| Service | Frequency | Priority |
|---------|-----------|----------|
| API Keys | 90 days | High |
| Passwords | 180 days | Medium |
| SSH Keys | 365 days | Medium |
| JWT Secrets | 30 days | High |
| Database | 90 days | High |

### Rotation Process

```bash
# 1. Generate new key
NEW_KEY=$(openssl rand -base64 32)

# 2. Update in KeePassXC
keepassxc-cli edit keepass.kdbx "Service Name"

# 3. Update in services
# - Update on provider dashboard
# - Test with new key
# - Update .env
# - Restart services

# 4. Document rotation
echo "$(date): Rotated Service Name" >> ~/workspace/logs/key-rotations.log

# 5. Destroy old key after verification
```

## 🛡️ Incident Response

### If Secret is Compromised

```bash
# IMMEDIATE ACTIONS:
1. Revoke compromised secret on provider
2. Generate new secret
3. Update KeePassXC
4. Update all deployments
5. Review access logs
6. Document incident
7. Notify team if needed
```

### Example: GitHub Token Compromised

```bash
# 1. Revoke on GitHub
# Go to: Settings → Developer settings → Personal access tokens
# Click on token → Delete

# 2. Generate new token
# Same page → Generate new token
# Copy immediately

# 3. Update KeePassXC
keepassxc-cli edit keepass.kdbx "GitHub Token"

# 4. Update in container
export GITHUB_TOKEN="new_token_here"
echo "GITHUB_TOKEN=new_token_here" >> .env

# 5. Test
gh auth status

# 6. Document
echo "$(date): GitHub token rotated due to compromise" >> ~/workspace/logs/incidents.log
```

## 🔍 Audit & Monitoring

### Regular Security Audits

```bash
# Check for exposed secrets in code
grep -r "sk-" . --exclude-dir=node_modules
grep -r "ghp_" . --exclude-dir=node_modules
grep -r "Bearer " . --exclude-dir=node_modules

# Check .env is gitignored
git check-ignore .env

# List all environment variables
printenv | grep -E "(KEY|TOKEN|PASSWORD|SECRET)" | cut -d= -f1

# Check file permissions
find ~/workspace/secrets -type f -exec ls -la {} \;
```

### Automated Security Checks

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: GitLeaks scan
        uses: gitleaks/gitleaks-action@v2
      - name: Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
```

## 📚 Additional Resources

- [KeePassXC Documentation](https://keepassxc.org/docs/)
- [Tails Security Guide](https://tails.boum.org/doc/index.en.html)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

## 🆘 Emergency Contacts

```
Security Issue: Create GitHub issue with [SECURITY] tag
Team: @krasavetsa1
Documentation: /docs/QUICK-ACCESS.md
```

---

**Last Updated**: 2026-01-02  
**Review Frequency**: Monthly  
**Next Review**: 2026-02-02

🔒 **Stay Secure!** 🔒
