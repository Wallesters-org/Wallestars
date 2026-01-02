# 🔐 Wallestars - Secrets Management Guide

## Интеграция с Tails OS и KeePassXC

**Дата**: 2026-01-02  
**Версия**: 1.0.0

---

## 📋 Съдържание

1. [Обща Концепция](#обща-концепция)
2. [Tails OS Setup](#tails-os-setup)
3. [KeePassXC Интеграция](#keepassxc-интеграция)
4. [Dev Container Secrets](#dev-container-secrets)
5. [Automation Scripts](#automation-scripts)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Обща Концепция

### Security Layers

```
┌─────────────────────────────────────────┐
│    Tails OS (Persistent Storage)        │
│  ┌───────────────────────────────────┐  │
│  │   KeePassXC Database              │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Master Password +          │  │  │
│  │  │  Key File                   │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│     Dev Container                       │
│  ┌───────────────────────────────────┐  │
│  │  Read-only Mount                  │  │
│  │  (via USB-C)                      │  │
│  └───────────────────────────────────┘  │
│            ↓                            │
│  ┌───────────────────────────────────┐  │
│  │  Environment Variables            │  │
│  │  (in-memory only)                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🔒 Tails OS Setup

### 1. Persistent Storage Configuration

```bash
# В Tails OS, отворете Terminal

# Проверка на persistent storage
ls -la /live/persistence/TailsData_unlocked/

# Създаване на директория за KeePassXC
mkdir -p /live/persistence/TailsData_unlocked/keepassxc
chmod 700 /live/persistence/TailsData_unlocked/keepassxc
```

### 2. KeePassXC Database Structure

Препоръчителна структура на вашата база данни:

```
Wallestars.kdbx
├── 📁 Development
│   ├── GitHub
│   │   ├── Personal Access Token (PAT)
│   │   ├── Webhook Secret
│   │   └── SSH Keys
│   ├── AI Services
│   │   ├── Claude AI API Key
│   │   ├── OpenAI API Key
│   │   └── Anthropic Console Password
│   └── Databases
│       ├── Supabase URL & Keys
│       ├── PostgreSQL Passwords
│       └── Redis Passwords
│
├── 📁 Social Media
│   ├── Instagram
│   │   ├── Username & Password
│   │   └── API Tokens
│   ├── Telegram
│   │   ├── API ID
│   │   ├── API Hash
│   │   └── Bot Token
│   ├── Facebook
│   └── Twitter/X
│
├── 📁 Infrastructure
│   ├── VPS
│   │   ├── SSH Keys
│   │   ├── Root Password
│   │   └── Monitoring API Keys
│   ├── Domain Registrar
│   ├── Hosting (Hostinger)
│   └── CDN Services
│
├── 📁 n8n Workflows
│   ├── n8n Admin Password
│   ├── Webhook URLs
│   └── Integration Credentials
│
└── 📁 Email Services
    ├── SMTP Credentials
    ├── IMAP Settings
    └── App Passwords
```

### 3. Генериране на Key File

```bash
# В Tails OS Terminal
cd /live/persistence/TailsData_unlocked/keepassxc

# Генериране на random key file
dd if=/dev/urandom of=wallestars.key bs=1024 count=1

# Set permissions
chmod 400 wallestars.key

# Backup (optional, на друго USB устройство)
cp wallestars.key /path/to/backup/location/
```

---

## 🔌 KeePassXC Интеграция

### 1. Export Credentials от KeePassXC

#### Метод 1: CSV Export (За първоначална миграция)

```bash
# В KeePassXC:
# Database → Export → CSV

# След това, в dev container:
cd /workspaces/Wallestars/.devcontainer/helpers
```

Създайте скрипт за импортиране:

```bash
#!/bin/bash
# import-from-keepass.sh

CSV_FILE="$1"

if [ ! -f "$CSV_FILE" ]; then
    echo "Usage: $0 <keepass-export.csv>"
    exit 1
fi

# Parse CSV and create .env
echo "# Auto-generated from KeePassXC" > /workspaces/Wallestars/.env
echo "# $(date)" >> /workspaces/Wallestars/.env
echo "" >> /workspaces/Wallestars/.env

# Example parsing (adjust based on your CSV structure)
tail -n +2 "$CSV_FILE" | while IFS=',' read -r group title username password url notes; do
    # Convert to ENV format
    ENV_NAME=$(echo "$title" | tr '[:lower:]' '[:upper:]' | tr ' ' '_' | tr -cd '[:alnum:]_')
    
    case "$group" in
        "AI Services")
            echo "${ENV_NAME}_API_KEY=$password" >> /workspaces/Wallestars/.env
            ;;
        "Databases")
            echo "${ENV_NAME}_URL=$url" >> /workspaces/Wallestars/.env
            echo "${ENV_NAME}_PASSWORD=$password" >> /workspaces/Wallestars/.env
            ;;
        *)
            echo "${ENV_NAME}=$password" >> /workspaces/Wallestars/.env
            ;;
    esac
done

echo "✅ Credentials imported to .env"

# Secure the file
chmod 600 /workspaces/Wallestars/.env

# Delete CSV immediately
shred -u "$CSV_FILE"
```

#### Метод 2: KeePassXC CLI (Препоръчително)

```bash
# Install keepassxc-cli в dev container
sudo apt-get install -y keepassxc-cli

# Create helper script
cat > /workspaces/Wallestars/.devcontainer/helpers/keepass-sync.sh << 'EOF'
#!/bin/bash
# keepass-sync.sh - Sync credentials from KeePassXC

KEEPASS_DB="/workspace/.keepass/Wallestars.kdbx"
KEEPASS_KEY="/workspace/.keepass/wallestars.key"
ENV_FILE="/workspaces/Wallestars/.env"

if [ ! -f "$KEEPASS_DB" ]; then
    echo "❌ KeePassXC database not found: $KEEPASS_DB"
    echo "Please mount your Tails USB drive"
    exit 1
fi

echo "🔐 Enter KeePassXC master password:"
read -s MASTER_PASSWORD

# Backup existing .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%s)"
fi

# Extract credentials
echo "# Auto-synced from KeePassXC" > "$ENV_FILE"
echo "# $(date)" >> "$ENV_FILE"
echo "" >> "$ENV_FILE"

# Claude AI
CLAUDE_KEY=$(echo "$MASTER_PASSWORD" | keepassxc-cli show -q -k "$KEEPASS_KEY" "$KEEPASS_DB" "Development/AI Services/Claude AI API Key" -a Password)
echo "CLAUDE_API_KEY=$CLAUDE_KEY" >> "$ENV_FILE"

# OpenAI
OPENAI_KEY=$(echo "$MASTER_PASSWORD" | keepassxc-cli show -q -k "$KEEPASS_KEY" "$KEEPASS_DB" "Development/AI Services/OpenAI API Key" -a Password)
echo "OPENAI_API_KEY=$OPENAI_KEY" >> "$ENV_FILE"

# GitHub
GITHUB_TOKEN=$(echo "$MASTER_PASSWORD" | keepassxc-cli show -q -k "$KEEPASS_KEY" "$KEEPASS_DB" "Development/GitHub/Personal Access Token" -a Password)
echo "GITHUB_ACCESS_TOKEN=$GITHUB_TOKEN" >> "$ENV_FILE"

# Supabase
SUPABASE_URL=$(echo "$MASTER_PASSWORD" | keepassxc-cli show -q -k "$KEEPASS_KEY" "$KEEPASS_DB" "Development/Databases/Supabase" -a URL)
SUPABASE_KEY=$(echo "$MASTER_PASSWORD" | keepassxc-cli show -q -k "$KEEPASS_KEY" "$KEEPASS_DB" "Development/Databases/Supabase" -a Password)
echo "SUPABASE_URL=$SUPABASE_URL" >> "$ENV_FILE"
echo "SUPABASE_KEY=$SUPABASE_KEY" >> "$ENV_FILE"

# Add more as needed...

chmod 600 "$ENV_FILE"
unset MASTER_PASSWORD

echo "✅ Credentials synced successfully!"
EOF

chmod +x /workspaces/Wallestars/.devcontainer/helpers/keepass-sync.sh
```

### 2. Mount Tails USB в Dev Container

Добавете в `devcontainer.json`:

```json
{
  "mounts": [
    "source=/media/tails-usb/Persistent/keepassxc,target=/workspace/.keepass,type=bind,readonly"
  ]
}
```

Или runtime mount:

```bash
# Find USB device
lsblk

# Mount (замнете sdX1 с вашето устройство)
sudo mount -o ro /dev/sdX1 /mnt/tails-usb

# Symlink to workspace
ln -s /mnt/tails-usb/Persistent/keepassxc /workspace/.keepass
```

---

## 🔑 Dev Container Secrets Management

### 1. Environment Variables Hierarchy

```bash
# Priority (lowest to highest):
# 1. .env.example (templates)
# 2. .env (development defaults)
# 3. .env.local (local overrides)
# 4. Container environment variables
# 5. Runtime secrets (in-memory)
```

### 2. SOPS Integration (Advanced)

```bash
# Install SOPS (уже в dev container)
# Install age (уже в dev container)

# Generate age key
age-keygen -o /workspace/.secrets/age-key.txt
chmod 600 /workspace/.secrets/age-key.txt

# Create encrypted secrets
cat > /workspaces/Wallestars/.env.encrypted << EOF
CLAUDE_API_KEY=ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
OPENAI_API_KEY=ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
EOF

# Encrypt with SOPS
export SOPS_AGE_RECIPIENTS=$(cat /workspace/.secrets/age-key.txt | grep "public key:" | cut -d: -f2 | tr -d ' ')
sops -e /workspaces/Wallestars/.env > /workspaces/Wallestars/.env.encrypted

# Decrypt when needed
sops -d /workspaces/Wallestars/.env.encrypted > /workspaces/Wallestars/.env
```

### 3. In-Memory Secrets

```bash
# Create script for loading secrets in memory
cat > /workspaces/Wallestars/.devcontainer/helpers/load-secrets.sh << 'EOF'
#!/bin/bash
# load-secrets.sh - Load secrets into environment (in-memory only)

# Source from KeePassXC
if [ -f "/workspace/.keepass/Wallestars.kdbx" ]; then
    echo "🔐 Loading secrets from KeePassXC..."
    source /workspaces/Wallestars/.devcontainer/helpers/keepass-sync.sh
fi

# Export to current shell
set -a
source /workspaces/Wallestars/.env
set +a

echo "✅ Secrets loaded (in-memory only)"
echo "⚠️  Do not commit .env file!"
EOF

chmod +x /workspaces/Wallestars/.devcontainer/helpers/load-secrets.sh

# Add to bashrc
echo "alias load-secrets='source /workspaces/Wallestars/.devcontainer/helpers/load-secrets.sh'" >> ~/.bashrc
```

---

## 🤖 Automation Scripts

### 1. Auto-Rotate Credentials

```bash
cat > /workspaces/Wallestars/.devcontainer/helpers/rotate-secrets.sh << 'EOF'
#!/bin/bash
# rotate-secrets.sh - Automatically rotate API keys

echo "🔄 Secret Rotation Assistant"
echo "=============================="

# List expirable secrets
SECRETS=(
    "GITHUB_ACCESS_TOKEN:90days"
    "CLAUDE_API_KEY:never"
    "OPENAI_API_KEY:never"
)

# Check age of secrets
for secret in "${SECRETS[@]}"; do
    KEY="${secret%:*}"
    EXPIRY="${secret#*:}"
    
    # Get last rotation date from KeePassXC notes
    # Implementation depends on your KeePassXC structure
    
    echo "• $KEY (expires: $EXPIRY)"
done

echo ""
echo "To rotate a secret:"
echo "1. Generate new key in service console"
echo "2. Update in KeePassXC"
echo "3. Run: keepass-sync"
echo "4. Restart affected services"
EOF

chmod +x /workspaces/Wallestars/.devcontainer/helpers/rotate-secrets.sh
```

### 2. Audit Log

```bash
cat > /workspaces/Wallestars/.devcontainer/helpers/secrets-audit.sh << 'EOF'
#!/bin/bash
# secrets-audit.sh - Audit secrets usage

AUDIT_LOG="/workspace/.logs/secrets-audit.log"
mkdir -p /workspace/.logs
touch "$AUDIT_LOG"
chmod 600 "$AUDIT_LOG"

echo "[$(date -Iseconds)] Secrets audit started" >> "$AUDIT_LOG"

# Check for exposed secrets in git history
echo "🔍 Checking git history for exposed secrets..."
git log -p | grep -iE "(api_key|password|secret|token)" >> "$AUDIT_LOG" || echo "✅ No exposed secrets found"

# Check for secrets in code
echo "🔍 Checking code for hardcoded secrets..."
grep -r -iE "(api_key|password|secret|token)\s*=\s*['\"][^'\"]{10,}" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude=*.log \
    /workspaces/Wallestars/ >> "$AUDIT_LOG" || echo "✅ No hardcoded secrets found"

echo "[$(date -Iseconds)] Secrets audit completed" >> "$AUDIT_LOG"
echo "✅ Audit complete. Check: /workspace/.logs/secrets-audit.log"
EOF

chmod +x /workspaces/Wallestars/.devcontainer/helpers/secrets-audit.sh

# Setup cron job (optional)
echo "0 0 * * * /workspaces/Wallestars/.devcontainer/helpers/secrets-audit.sh" >> /tmp/wallestars-cron
```

---

## ✅ Best Practices

### 1. **Never Commit Secrets**

```bash
# Add to .gitignore
cat >> /workspaces/Wallestars/.gitignore << EOF

# === Security - Never Commit ===
.env
.env.local
.env.*.local
*.key
*.pem
*.p12
*.pfx
*.kdbx
*.kdb
secrets/
.secrets/
.keepass/

# Encrypted secrets OK to commit (with proper key management)
# .env.encrypted
# secrets.enc
EOF
```

### 2. **Use Environment-Specific Files**

```
.env.example          → Template (commit)
.env.development      → Dev defaults (commit safe values)
.env.local           → Your secrets (never commit)
.env.production      → Production (deploy via secure method)
```

### 3. **Separate Keys by Environment**

```bash
# Development
CLAUDE_API_KEY_DEV=sk-ant-dev-...

# Production
CLAUDE_API_KEY_PROD=sk-ant-prod-...

# Use in code:
const API_KEY = process.env.NODE_ENV === 'production' 
    ? process.env.CLAUDE_API_KEY_PROD 
    : process.env.CLAUDE_API_KEY_DEV;
```

### 4. **Regular Rotation Schedule**

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| API Keys (AI) | 90 days или при compromise |
| Database Passwords | 60 days |
| GitHub PAT | 90 days |
| SSH Keys | 180 days |
| Master Passwords | 90 days |

### 5. **Access Control**

```bash
# File permissions
chmod 600 .env                    # rw-------
chmod 600 .secrets/*              # rw-------
chmod 400 /workspace/.keepass/*   # r--------

# Directory permissions
chmod 700 /workspace/.secrets     # rwx------
chmod 700 /workspace/.keepass     # rwx------
```

---

## 🔧 Troubleshooting

### Problem: Cannot access KeePassXC database

```bash
# Check mount
ls -la /workspace/.keepass/

# Check permissions
stat /workspace/.keepass/Wallestars.kdbx

# Try manual mount
sudo mount /dev/sdX1 /mnt/tails-usb
ln -s /mnt/tails-usb/Persistent/keepassxc /workspace/.keepass
```

### Problem: keepassxc-cli fails

```bash
# Test connection
keepassxc-cli open /workspace/.keepass/Wallestars.kdbx

# Check key file
keepassxc-cli open -k /workspace/.keepass/wallestars.key /workspace/.keepass/Wallestars.kdbx

# Verbose mode
keepassxc-cli --debug open /workspace/.keepass/Wallestars.kdbx
```

### Problem: Secrets not loading

```bash
# Check .env file
cat /workspaces/Wallestars/.env

# Check environment
printenv | grep -E "(CLAUDE|OPENAI|GITHUB)"

# Reload
source /workspaces/Wallestars/.devcontainer/helpers/load-secrets.sh

# Verify in Node.js
node -e "console.log(process.env.CLAUDE_API_KEY)"
```

---

## 📊 Security Checklist

- [ ] Tails OS Persistent Storage configured
- [ ] KeePassXC database created with strong master password
- [ ] Key file generated and backed up securely
- [ ] Dev container mounts configured (read-only)
- [ ] `.env` added to `.gitignore`
- [ ] Secrets loading script tested
- [ ] File permissions set correctly (600/700)
- [ ] Audit logging enabled
- [ ] Rotation schedule defined
- [ ] Backup strategy in place
- [ ] Team members trained on process

---

## 📚 Additional Resources

- [KeePassXC Documentation](https://keepassxc.org/docs/)
- [Tails OS Persistent Storage](https://tails.boum.org/doc/persistent_storage/)
- [SOPS Documentation](https://github.com/mozilla/sops)
- [Age Encryption](https://github.com/FiloSottile/age)
- [Git-crypt](https://github.com/AGWA/git-crypt)

---

**Автор**: Wallestars Team  
**Последна актуализация**: 2026-01-02  
**Версия**: 1.0.0
