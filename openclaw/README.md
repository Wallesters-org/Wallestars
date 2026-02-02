# Molty - Wallestars OpenClaw Integration

**Molty** е AI асистент базиран на [OpenClaw](https://openclaw.ai), специализиран за автоматизация на бизнес регистрации и верификации за платформата Wallestars.

## Какво е OpenClaw?

OpenClaw (преди Clawdbot/Moltbot) е open-source AI personal assistant с 135K+ GitHub stars. Ключови характеристики:

- **Multi-channel**: WhatsApp, Telegram, Discord, Slack, Teams, Signal, iMessage
- **Local-first**: Работи на твоята машина, контролираш данните си
- **MCP интеграция**: 700+ community skills чрез Model Context Protocol
- **Памет**: Persistent memory across sessions (MEMORY.md)
- **Secure**: Sandboxing, pairing policies, credential isolation

## Структура на директориите

```
openclaw/
├── config/
│   └── openclaw.json5          # Main configuration
├── workspace/
│   ├── SOUL.md                 # Molty's personality
│   └── MEMORY.md               # Long-term memory
├── skills/
│   ├── wallestars-registration/ # Registration workflow skill
│   ├── wallestars-database/     # Supabase operations skill
│   └── wallestars-verification/ # OTP verification skill
├── docker/
│   ├── docker-compose.yml      # Docker deployment
│   └── .env.example            # Environment template
└── README.md                   # This file
```

## Quick Start

### 1. Инсталация на OpenClaw

```bash
# Global install
npm install -g openclaw@latest

# Или с pnpm
pnpm add -g openclaw@latest
```

### 2. Конфигурация

```bash
# Копирай конфигурацията
mkdir -p ~/.openclaw
cp openclaw/config/openclaw.json5 ~/.openclaw/openclaw.json5
cp -r openclaw/workspace ~/.openclaw/
cp -r openclaw/skills ~/.openclaw/

# Настрой environment variables
export ANTHROPIC_API_KEY="sk-ant-..."
export TELEGRAM_BOT_TOKEN="123456789:ABC..."
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_ANON_KEY="eyJ..."
export N8N_WEBHOOK_URL="https://n8n.srv1201204.hstgr.cloud"
```

### 3. Стартиране

```bash
# Interactive onboarding
openclaw onboard --install-daemon

# Или директно стартиране
openclaw gateway --port 18789

# Dashboard (browser)
openclaw dashboard
# Отвори http://127.0.0.1:18789/
```

### 4. Docker Deployment

```bash
cd openclaw/docker

# Копирай .env
cp .env.example .env
# Редактирай .env с твоите credentials

# Стартирай
docker compose up -d

# Логове
docker compose logs -f molty-gateway
```

## Канали

### Telegram Setup

1. Създай бот чрез [@BotFather](https://t.me/BotFather)
2. Вземи token и го сложи в `TELEGRAM_BOT_TOKEN`
3. Добави username в `allowFrom` в конфигурацията

```bash
# Test
openclaw channel test telegram
```

### Discord Setup

1. Създай application в [Discord Developer Portal](https://discord.com/developers/applications)
2. Добави Bot към application
3. Вземи token и го сложи в `DISCORD_BOT_TOKEN`
4. Invite bot в твой server

## Custom Skills

### wallestars-registration

Trigger и management на Wallesters регистрационни workflows.

```
Molty, start registration for owner abc-123
```

### wallestars-database

Supabase операции за verified owners и companies.

```
Molty, find owner named Иван Петров
Molty, check phone pool status
```

### wallestars-verification

SMS и Email OTP верификация.

```
Molty, start SMS verification for +359888123456
Molty, check for Wallester verification email
```

## Memory System

Molty използва Markdown файлове за памет:

- **SOUL.md**: Личност, capabilities, behavior guidelines
- **MEMORY.md**: Дългосрочна памет, preferences, project status
- **memory/YYYY-MM-DD.md**: Daily logs (автоматично)

## Security

### DM Pairing

По подразбиране нови DMs изискват approval:

```bash
# Approve pairing
openclaw pairing approve telegram ABC123
```

### Sandbox Mode

Non-main sessions работят в Docker sandbox:

```json5
{
  sandbox: {
    enabled: true,
    mode: "non-main"
  }
}
```

### File Permissions

```bash
chmod 700 ~/.openclaw
chmod 600 ~/.openclaw/openclaw.json5
chmod 600 ~/.openclaw/credentials/*
```

## Troubleshooting

### Gateway не стартира

```bash
# Check logs
openclaw gateway logs

# Verify config
openclaw config validate

# Check port
lsof -i :18789
```

### Channel не се свързва

```bash
# Test specific channel
openclaw channel test telegram

# Re-authenticate
openclaw channel login telegram
```

### Skill не работи

```bash
# List skills
openclaw skills list

# Test skill
openclaw skills test wallestars-database
```

## Integration with n8n

Molty се интегрира с n8n workflows чрез webhooks:

| Workflow | Webhook Path | Purpose |
|----------|--------------|---------|
| Main Registration | `/webhook/wallesters-registration` | Start registration |
| SMS Verification | `/webhook/sms-verify-agent` | Extract SMS OTP |
| Email Verification | `/webhook/email-otp-extract` | Extract Email OTP |
| Status Check | `/webhook/registration-status` | Check progress |

## Useful Commands

```bash
# Status
openclaw status
openclaw health

# Gateway management
openclaw gateway --restart
openclaw gateway logs --follow

# Channel management
openclaw channel list
openclaw channel login <channel>
openclaw channel test <channel>

# Skills
openclaw skills list
openclaw skills install <skill>
openclaw skills test <skill>

# Memory
openclaw memory search "keyword"
openclaw memory export

# Dashboard
openclaw dashboard
```

## Resources

- [OpenClaw Documentation](https://docs.openclaw.ai/)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Awesome OpenClaw Skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)

---

*Molty - Your Wallestars automation companion*
