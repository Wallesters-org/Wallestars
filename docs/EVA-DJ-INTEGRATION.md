# 🔗 Eva + DJ Workflow - Интеграционно Ръководство

**Последна актуализация**: 2026-01-01  
**Статус**: Complete Integration Guide

---

## 📑 Съдържание

1. [Обща Концепция](#обща-концепция)
2. [Архитектурна Интеграция](#архитектурна-интеграция)
3. [Eva в n8n Workflows](#eva-в-n8n-workflows)
4. [DJ Workflow с Eva](#dj-workflow-с-eva)
5. [Конфигурация](#конфигурация)
6. [Практически Примери](#практически-примери)
7. [Best Practices](#best-practices)

---

## 🎯 Обща Концепция

### Какво е Eva?
Eva е AI алгоритъм за интелигентна обработка на потребителски взаимодействия:
- Анализира контекст (снимки, текст, user behavior)
- Взема решения базирани на предефинирани правила
- Персонализира комуникацията
- Управлява множество социални акаунти

### Какво е DJ Workflow?
DJ Workflow е автоматизирана система за:
- Multi-chain blockchain управление
- n8n workflow automation
- GitHub integration
- Claude AI powered decision making

### Защо ги интегрираме?
```
Eva (Intelligence) + DJ Workflow (Automation) = Powerful Unified System

Eva предоставя:          DJ Workflow предоставя:
- Context Processing     - Workflow Orchestration
- Decision Making        - Multi-chain Routing
- Personalization        - GitHub Integration
- User Analysis          - n8n Automation Engine
```

---

## 🏗️ Архитектурна Интеграция

```
┌────────────────────────────────────────────────────────────┐
│                   Wallestars Platform                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐          │
│  │   Eva Core      │◄───────►│  DJ Workflow    │          │
│  │   Algorithm     │         │  Orchestrator   │          │
│  └─────────────────┘         └─────────────────┘          │
│         │                            │                     │
│         │   Context & Decisions      │  Execution         │
│         ▼                            ▼                     │
│  ┌─────────────────────────────────────────┐              │
│  │         n8n Workflow Engine             │              │
│  │         (VPS KVM2 Hosted)               │              │
│  └─────────────────────────────────────────┘              │
│         ▲                            ▲                     │
│         │                            │                     │
│  ┌──────┴────────┐           ┌──────┴────────┐           │
│  │  Claude AI    │           │   GitHub      │           │
│  │  Integration  │           │   Actions     │           │
│  └───────────────┘           └───────────────┘           │
│         │                            │                     │
│         ▼                            ▼                     │
│  ┌─────────────────────────────────────────┐              │
│  │     Execution Targets                   │              │
│  │  - Social Media (10-15 accounts)        │              │
│  │  - Multi-Chain Networks                 │              │
│  │  - User Interactions                    │              │
│  │  - Content Generation                   │              │
│  └─────────────────────────────────────────┘              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Ключови Интеграционни Точки

1. **Eva Context → n8n Workflow**
   - Eva анализира входящи данни
   - Предава context на n8n за изпълнение
   - n8n използва Eva решенията за routing

2. **n8n Events → Eva Processing**
   - GitHub webhooks тригерират n8n
   - n8n извиква Eva за анализ
   - Eva връща action plan

3. **Claude AI като Bridge**
   - Claude AI обработва prompt-ове от Eva
   - Генерира отговори за social media
   - Анализира code changes за DJ Workflow

---

## 🤖 Eva в n8n Workflows

### Структура на Eva Workflow в n8n

```json
{
  "name": "Eva Social Media Automation",
  "nodes": [
    {
      "name": "Trigger: Schedule",
      "type": "n8n-nodes-base.schedule"
    },
    {
      "name": "Eva: Load Config",
      "type": "n8n-nodes-base.readFile",
      "parameters": {
        "filePath": "/path/to/eva-config.json"
      }
    },
    {
      "name": "Eva: Context Processor",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://localhost:3000/eva/process-context",
        "method": "POST"
      }
    },
    {
      "name": "Claude AI: Generate Response",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.anthropic.com/v1/messages",
        "authentication": "headerAuth"
      }
    },
    {
      "name": "Execute: Post to Instagram",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

### Eva Decision Flow в n8n

```
1. Trigger (Schedule/Webhook)
   ↓
2. Load Eva Config
   ↓
3. Fetch User Context
   ↓
4. Eva Context Processor
   ├─→ Analyze User Behavior
   ├─→ Check Rules & Conditions
   └─→ Generate Action Plan
   ↓
5. Claude AI Processing
   ├─→ Generate Personalized Content
   └─→ Optimize Messaging
   ↓
6. Execute Actions
   ├─→ Post Content
   ├─→ Reply to Messages
   ├─→ Like/Comment
   └─→ Update Analytics
   ↓
7. Log & Monitor
```

---

## 🔗 DJ Workflow с Eva

### Интеграция на Eva в Multi-Chain Routing

**Сценарий**: Deploying multi-chain app based on Eva's user analysis

```javascript
// n8n Function Node: Eva Multi-Chain Router
const evaContext = $input.item.json.evaContext;
const userPreference = evaContext.userPreference;
const trafficAnalysis = evaContext.trafficAnalysis;

// Eva decision logic
let targetChain;
if (userPreference.region === "US" && trafficAnalysis.speed === "fast") {
  targetChain = "polygon";
} else if (trafficAnalysis.cost === "low") {
  targetChain = "solana";
} else {
  targetChain = "ethereum";
}

// Pass to DJ Workflow
return {
  json: {
    chain: targetChain,
    deployment: {
      commit: $input.item.json.commit,
      analyzed_by: "eva",
      decision_factors: {
        region: userPreference.region,
        speed: trafficAnalysis.speed,
        cost: trafficAnalysis.cost
      }
    }
  }
};
```

### GitHub Issue → Eva → n8n → Response

**Workflow**: `workflows/user-contact-automation.json`

```
1. GitHub Webhook (New Issue)
   ↓
2. n8n Receives Event
   ↓
3. Extract Issue Content
   ↓
4. Call Eva Context Processor
   ├─→ Analyze Issue Type
   ├─→ Check User History
   └─→ Determine Priority
   ↓
5. Claude AI Generate Response
   ├─→ Use Eva's analysis
   └─→ Personalized reply
   ↓
6. Post Comment to GitHub
   ↓
7. Update Eva Analytics
```

---

## ⚙️ Конфигурация

### Eva Config за n8n Integration

**Файл**: `eva-core/config/eva-config.json`

```json
{
  "eva_version": "1.0.0",
  "integration": {
    "n8n": {
      "enabled": true,
      "webhook_url": "${N8N_WEBHOOK_URL}",
      "auth": {
        "type": "basic",
        "user": "${N8N_BASIC_AUTH_USER}",
        "password": "${N8N_BASIC_AUTH_PASSWORD}"
      }
    },
    "claude_ai": {
      "enabled": true,
      "api_key": "${CLAUDE_API_KEY}",
      "model": "claude-3-5-sonnet-20241022"
    }
  },
  "workflows": {
    "social_automation": {
      "enabled": true,
      "platforms": ["instagram", "telegram", "facebook"],
      "schedule": "0 */2 * * *"
    },
    "github_automation": {
      "enabled": true,
      "webhook_enabled": true,
      "auto_respond": true
    }
  }
}
```

### n8n Environment Variables

**Файл**: `.env`

```bash
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=secure_password
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_WEBHOOK_URL=https://your-vps.com

# Eva Integration
EVA_CONFIG_PATH=eva-core/config/eva-config.json
EVA_CONTEXT_API=http://localhost:3000/eva/context

# Claude AI
CLAUDE_API_KEY=sk-ant-your-key

# GitHub
GITHUB_ACCESS_TOKEN=ghp_your_token
GITHUB_WEBHOOK_SECRET=your_secret
```

---

## 💡 Практически Примери

### Пример 1: Instagram Daily Automation с Eva

**Цел**: Автоматично публикуване на content, базирано на Eva's context analysis

**Workflow**: `eva-core/workflows/instagram-daily-example.json`

**Стъпки**:
1. Eva анализира trending topics
2. Eva определя optimal posting time
3. Claude AI генерира content
4. n8n публикува на Instagram
5. Eva мониторира engagement

**n8n Integration**:
```bash
# Import workflow
curl -X POST http://localhost:5678/rest/workflows \
  -H "Content-Type: application/json" \
  -u admin:password \
  -d @eva-core/workflows/instagram-daily-example.json
```

### Пример 2: Multi-Chain Deployment с Eva Analysis

**Цел**: Deploy app на optimal chain based on user analysis

**Workflow**: `workflows/dj-workflow-multichain.json`

**Eva's Role**:
- Analyze user demographics
- Check network congestion
- Calculate cost optimization
- Recommend best chain

**DJ Workflow's Role**:
- Receive Eva's recommendation
- Execute deployment
- Update GitHub status
- Monitor deployment

### Пример 3: Intelligent User Support

**Цел**: 24/7 automated support с personalized responses

**Workflow**: `workflows/user-contact-automation.json`

**Flow**:
```
User creates GitHub Issue
  ↓
n8n webhook triggered
  ↓
Eva analyzes:
  - Issue type
  - User history
  - Urgency level
  ↓
Claude AI generates:
  - Personalized response
  - Suggested solutions
  ↓
n8n posts response
  ↓
Eva updates user profile
```

---

## ✅ Best Practices

### 1. Eva Configuration
- ✅ Always use environment variables for sensitive data
- ✅ Keep eva-config.json outside of git
- ✅ Regularly update Eva's decision rules
- ✅ Monitor Eva's performance metrics

### 2. n8n Workflows
- ✅ Use error handling nodes
- ✅ Implement retry logic
- ✅ Log all Eva decisions
- ✅ Test workflows in staging first

### 3. Claude AI Integration
- ✅ Set appropriate rate limits
- ✅ Use streaming for long responses
- ✅ Cache frequent prompts
- ✅ Monitor API usage

### 4. Security
- ✅ Rotate API keys regularly
- ✅ Use SSL/TLS for all connections
- ✅ Implement IP whitelisting
- ✅ Encrypt sensitive Eva configs

### 5. Monitoring
- ✅ Track Eva decision accuracy
- ✅ Monitor workflow execution times
- ✅ Alert on failed workflows
- ✅ Regular audit of automated actions

---

## 🔧 Troubleshooting

### Common Issues

**1. Eva не се свързва с n8n**
```bash
# Check n8n is running
curl http://localhost:5678/healthz

# Check Eva config
cat eva-core/config/eva-config.json | grep n8n

# Verify credentials
echo $N8N_BASIC_AUTH_USER
```

**2. Workflows не се trigger-ват**
```bash
# Check GitHub webhook
# Go to: Settings → Webhooks → Check delivery

# Verify n8n webhook URL
echo $N8N_WEBHOOK_URL

# Test webhook manually
curl -X POST $N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**3. Claude AI errors**
```bash
# Check API key
echo $CLAUDE_API_KEY | cut -c1-10

# Test API connection
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

---

## 📚 Допълнителни Ресурси

### Документация
- [Eva Documentation](../eva-core/docs/EVA-DOCUMENTATION.md)
- [n8n Integration Guide](./n8n-integration-guide.md)
- [DJ Workflow Summary](./summary.md)
- [Quick Access](./QUICK-ACCESS.md)

### Workflows
- [Instagram Daily Example](../eva-core/workflows/instagram-daily-example.json)
- [User Contact Automation](../workflows/user-contact-automation.json)
- [DJ Multi-Chain Workflow](../workflows/dj-workflow-multichain.json)

### Configuration
- [Eva Config Template](../eva-core/config/eva-config.template.json)
- [Environment Variables](./.env.example)
- [n8n Setup Script](../scripts/setup-n8n.sh)

---

## 🎯 Следващи Стъпки

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Configure Eva**
   ```bash
   cp eva-core/config/eva-config.template.json eva-core/config/eva-config.json
   # Edit eva-config.json
   ```

3. **Install n8n**
   ```bash
   bash scripts/setup-n8n.sh
   ```

4. **Import Workflows**
   - Open n8n at http://localhost:5678
   - Import all .json workflows
   - Configure credentials

5. **Test Integration**
   - Create test GitHub issue
   - Verify Eva processes it
   - Check n8n execution logs

---

**Успех! Eva и DJ Workflow са напълно интегрирани! 🎉**
