# 🚀 WALLESTARS v2.2 - MASTER IMPLEMENTATION PROMPT FOR CLINE
## Antigravity Orchestrator | 1M Context Window Session

---

## 🎯 SESSION OBJECTIVE

Build a complete **Wallestars v2.2** system - a multi-agent AI orchestration platform for Bulgarian business verification and card registration automation. This session should produce production-ready n8n workflows, Supabase schemas, and integration code.

---

## 📐 SYSTEM ARCHITECTURE (from Gemini visualization)

```
                    ┌─────────────────────┐
                    │   Claude 3.5 Sonnet │
                    │   (AI Intelligence) │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│ Multi-Agent   │    │  Quality        │    │   GitHub      │
│ Orchestrator  │◄──►│  Scoring        │◄──►│   (Version    │
│               │    │                 │    │    Control)   │
└───────┬───────┘    └────────┬────────┘    └───────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│  MCP Server   │◄──►│  Knowledge      │◄──►│  Company      │
│               │    │  Indexer        │    │  Enrichment   │
└───────┬───────┘    └────────┬────────┘    └───────┬───────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌─────────────────────────────────────┐
│  SMS Monitor  │    │         n8n ORCHESTRATOR            │
│  (smstome.com)│    │    (Central Workflow Engine)        │
└───────┬───────┘    └──────────────────┬──────────────────┘
        │                               │
        ▼                               ▼
┌───────────────┐    ┌───────────────┐  ┌───────────────┐
│ Email Monitor │    │    Redis      │  │ Supabase (PG) │
│ (Hostinger)   │    │   (Cache)     │  │ + pgvector    │
└───────────────┘    └───────────────┘  └───────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  System Health  │
                    │    Monitor      │
                    └─────────────────┘

LEGEND:
🟠 n8n Core & Workflows
🟢 External Sources (Inputs)
🔵 Data & Storage
🟣 AI Intelligence
```

---

## 🔧 TECH STACK

### Infrastructure
| Component | Technology | Details |
|-----------|-----------|---------|
| VPS | Hostinger KVM2 | srv1201204.hstgr.cloud (72.61.154.188) |
| Workflow Engine | n8n (self-hosted) | https://n8n.srv1201204.hstgr.cloud |
| Database | Supabase | Project: ansiaiuaygcfztabtknl |
| Vector Store | pgvector | 1536 dimensions (OpenAI embeddings) |
| Cache | Redis | MCP tools registry |
| Hosting | Vercel | Frontend apps |

### AI Stack
| Model | Provider | Use Case |
|-------|----------|----------|
| Claude 3.5 Sonnet | Anthropic | Coordinator, Reviewer |
| GPT-4o-mini | OpenAI | Structured extraction |
| text-embedding-3-large | OpenAI | Vector embeddings |

### External Services
| Service | Purpose |
|---------|---------|
| CompanyBook API | Bulgarian business data |
| smstome.com | SMS verification (Finnish numbers) |
| Hostinger IMAP | Email verification |
| 33mail | Disposable email aliases |
| Wallester | Business card registration |

---

## 📋 REFERENCE WORKFLOW: YouTube MacroVoice

This example n8n workflow demonstrates the pattern we'll follow:

```json
{
  "name": "YouTube MacroVoice",
  "description": "Voice/text → AI nutrition estimation → callback webhook",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "6ccb13cf-1eb4-4667-9a64-ba10fd6027b7"
      }
    },
    {
      "name": "Has Audio?",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "conditions": [{
            "leftValue": "={{ $json.body.audio_base64 }}",
            "operator": { "operation": "exists" }
          }]
        }
      }
    },
    {
      "name": "Convert Base64 to Binary",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const audioBase64 = $input.first().json.body.audio_base64;\nconst mimeType = $input.first().json.body.audio_mime_type || 'audio/webm';\nreturn { json: $input.first().json, binary: { data: { data: audioBase64, mimeType, fileName: `audio.webm` } } };"
      }
    },
    {
      "name": "Transcribe Voice",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": { "resource": "audio", "operation": "transcribe" }
    },
    {
      "name": "Estimate Nutrition",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "modelId": "gpt-5-mini",
        "messages": {
          "values": [{
            "role": "system",
            "content": "You are a nutrition estimation assistant. Respond ONLY in JSON: { meal_title, meal_type, calories, protein, carbs, fat }"
          }]
        },
        "jsonOutput": true,
        "options": { "temperature": 0.3 }
      }
    },
    {
      "name": "Send to Callback",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $json.callback_url }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [{ "name": "x-webhook-secret", "value": "macrovoice-secret-123" }]
        }
      }
    }
  ],
  "connections": {
    "Webhook Trigger": { "main": [["Has Audio?"]] },
    "Has Audio?": { "main": [["Convert Base64 to Binary"], ["Set Description (Text)"]] },
    "Transcribe Voice": { "main": [["Set Description"]] },
    "Estimate Nutrition": { "main": [["Send to Callback"]] }
  }
}
```

**Key Patterns:**
1. Webhook trigger with POST
2. Conditional branching (IF node)
3. Code nodes for data transformation
4. OpenAI integration for AI processing
5. Callback webhook with secret header

---

## 🏗️ IMPLEMENTATION TASKS

### PHASE 1: Core Infrastructure (Day 1)

#### Task 1.1: MCP Server Workflow
Create n8n workflow that acts as MCP server for tool management:

```javascript
// Operations
const operations = {
  addWorkflow: async (workflowIds) => {
    const redis = await getRedis();
    const tools = JSON.parse(await redis.get('mcp_n8n_tools') || '[]');
    // Fetch workflow details, add to tools
    return { added: workflowIds };
  },
  removeWorkflow: async (workflowIds) => { /* ... */ },
  listWorkflows: async () => { /* ... */ },
  searchWorkflows: async (query) => { /* ... */ },
  executeWorkflow: async (workflowId, params) => { /* ... */ }
};
```

**Nodes required:**
1. `When Executed by Another Workflow` trigger
2. `Switch` node for operation routing
3. `Redis` node for tool storage
4. `n8n API` node for workflow management
5. `Code` nodes for logic

#### Task 1.2: Quality Scoring Workflow
Automatic AI response evaluation:

```javascript
// Scoring Algorithm
const calculateScore = (response, originalQuery) => {
  const relevance = analyzeRelevance(response, originalQuery);   // 0-100
  const confidence = extractConfidence(response);                // 0-100
  const completeness = measureCompleteness(response);            // 0-100
  
  let score = (relevance * 0.4) + (confidence * 0.3) + (completeness * 0.3);
  
  // Apply penalties
  if (response.executionTime > 30000) score *= 0.95;  // >30s
  if (response.tokens > 4000) score *= 0.90;          // >4k tokens
  
  return Math.round(score);
};

// Scoring thresholds
const THRESHOLDS = {
  EXCELLENT: 90,  // ✅ Accept immediately
  GOOD: 75,       // ✅ Accept with note
  FAIR: 60,       // ⚠️ Retry once
  POOR: 0         // ❌ Retry with different approach
};
```

**Supabase table:**
```sql
CREATE TABLE ai_response_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  original_query TEXT,
  response_text TEXT,
  relevance_score INT,
  confidence_score INT,
  completeness_score INT,
  final_score INT,
  execution_time_ms INT,
  token_count INT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_session ON ai_response_scores(session_id);
CREATE INDEX idx_scores_final ON ai_response_scores(final_score);
```

### PHASE 2: Verification Monitors (Day 2)

#### Task 2.1: Email Monitor Workflow
Monitor Hostinger IMAP for verification codes:

**Connection:**
```
IMAP: imap.hostinger.com:993 (SSL/TLS)
SMTP: smtp.hostinger.com:465 (SSL/TLS)
Email pattern: {business_name}@madoff.33mail.com → forwards to Hostinger
```

**Workflow Flow:**
1. Schedule Trigger (every 5 min)
2. IMAP Node: Fetch unread emails
3. Code Node: Extract verification code
```javascript
// Extract OTP from email body
const extractVerificationCode = (emailBody) => {
  const patterns = [
    /verification code[:\s]+(\d{4,6})/i,
    /your code[:\s]+(\d{4,6})/i,
    /OTP[:\s]+(\d{4,6})/i,
    /\b(\d{4,6})\b/  // Fallback: any 4-6 digit number
  ];
  for (const pattern of patterns) {
    const match = emailBody.match(pattern);
    if (match) return match[1];
  }
  return null;
};
```
4. Supabase Update: Store code
5. Telegram Notification

#### Task 2.2: SMS Monitor Workflow
Scrape smstome.com for verification codes:

**Phone Pool:**
```javascript
const PHONE_POOL = [
  { number: '+3584573999024', url: 'https://smstome.com/country/finland/3584573999024' },
  { number: '+3584573999023', url: 'https://smstome.com/country/finland/3584573999023' },
  { number: '+3584573999022', url: 'https://smstome.com/country/finland/3584573999022' },
  // ... до +3584573999015
];
```

**Supabase table:**
```sql
CREATE TABLE sms_numbers_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  sms_url TEXT NOT NULL,
  status TEXT DEFAULT 'available', -- 'available'|'assigned'|'used'|'invalid'
  assigned_to UUID REFERENCES verified_business_profiles(id),
  last_message_at TIMESTAMPTZ,
  last_message_from TEXT,
  last_verification_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### PHASE 3: Data Enrichment (Day 2-3)

#### Task 3.1: CompanyBook Integration Workflow
Bulgarian business data extraction:

**API Endpoints:**
```javascript
const COMPANYBOOK_API = {
  baseUrl: 'https://api.companybook.bg/api',
  endpoints: {
    searchPeople: '/people/search',
    getPerson: '/people/{indent}',
    getCompany: '/companies/{uic}',
    getRelationships: '/relationships/{identifier}'
  }
};
```

**Address Parsing:**
```javascript
// Parse Bulgarian address format
const parseAddress = (addressParts) => {
  // Input: ["гр. София 1000, ул. Витоша 15, вх. А"]
  const parsed = {
    city_en: transliterate(extractCity(addressParts)),      // "Sofia"
    street_en: transliterate(extractStreet(addressParts)),  // "Vitosha"
    building_number: extractNumber(addressParts),           // "15"
    entrance: extractEntrance(addressParts),                // "A"
    postal_code: extractPostalCode(addressParts),           // "1000"
    region_en: determineRegion(addressParts)                // "Sofia-Capital"
  };
  return parsed;
};
```

#### Task 3.2: Knowledge Indexer Workflow
Automatic documentation indexing:

**GitHub Webhook → Vector DB Pipeline:**
```
1. GitHub Push Event
   ↓
2. Filter: .md, .json files in docs/, n8n_workflows/
   ↓
3. Fetch File Content (GitHub API)
   ↓
4. Generate Embedding (OpenAI text-embedding-3-large)
   ↓
5. Upsert to Supabase pgvector
```

**Supabase schema:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE project_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_org TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  embedding VECTOR(1536),
  source_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_embedding ON project_knowledge 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (id UUID, file_path TEXT, content TEXT, similarity FLOAT)
AS $$
  SELECT id, file_path, content,
         1 - (embedding <=> query_embedding) AS similarity
  FROM project_knowledge
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql;
```

### PHASE 4: Orchestration (Day 3)

#### Task 4.1: Multi-Agent Orchestrator Workflow
Coordinate parallel AI sessions:

**Agent Configuration:**
```javascript
const AGENT_POOL = {
  claude: {
    roles: ['coordinator', 'reviewer'],
    maxSessions: 2,
    capabilities: ['reasoning', 'planning', 'code_review']
  },
  cline: {
    roles: ['executor'],
    maxSessions: 3,
    capabilities: ['code_execution', 'file_operations', 'testing']
  },
  airtop: {
    roles: ['browser'],
    maxSessions: 1,
    capabilities: ['web_automation', 'form_filling', 'screenshots']
  }
};

// Task routing
const routeTask = (task) => {
  const complexity = analyzeComplexity(task);
  
  if (complexity < 30) {
    return { agents: ['claude:coordinator'], parallel: false };
  }
  if (complexity < 70) {
    return { 
      agents: ['claude:coordinator', 'cline:executor', 'cline:executor'],
      parallel: true
    };
  }
  return {
    agents: [
      'claude:coordinator',
      'cline:executor',
      'cline:executor', 
      'airtop:browser',
      'claude:reviewer'
    ],
    parallel: true,
    requiresConsensus: true
  };
};
```

#### Task 4.2: System Health Monitor
Infrastructure monitoring:

```javascript
const healthChecks = {
  supabase: async () => {
    const { data, error } = await supabase.from('system_health').select('*');
    return { status: error ? 'error' : 'ok', details: data };
  },
  n8n: async () => {
    const response = await fetch('https://n8n.srv1201204.hstgr.cloud/healthz');
    return { status: response.ok ? 'ok' : 'error' };
  },
  redis: async () => {
    const redis = await getRedis();
    const ping = await redis.ping();
    return { status: ping === 'PONG' ? 'ok' : 'error' };
  },
  docker: async () => {
    // SSH to VPS and check containers
    const containers = await ssh.exec('docker ps --format "{{.Names}}: {{.Status}}"');
    return { status: 'ok', details: containers };
  }
};

const ALERT_THRESHOLDS = {
  missingEmbeddings: 10,      // Items without vectors
  staleData: 24 * 60 * 60,    // 24 hours without new items
  lastSync: 6 * 60 * 60       // 6 hours since last sync
};
```

---

## 📊 n8n SaaS PLANNING METHODOLOGY

Following the Claude PRD approach, each workflow should include:

### 1. Workflow Analysis
- Input/output shapes
- Failure points
- Dependencies

### 2. Product Definition
- One-sentence description
- Target user
- Value proposition

### 3. Pricing & Limits (if applicable)
- Free tier: 5-10 uses/month
- Pro tier: $9-19/month for 100+ uses
- Soft limits with upgrade prompts

### 4. UI Direction (for dashboards)
- Dark mode aesthetic (matching Gemini visualization)
- Clean, minimal design
- Real-time status updates
- Node graph visualization

### 5. Technical Design
- Database schema
- API endpoints
- Webhook handling
- Security setup

---

## 📁 EXPECTED OUTPUT STRUCTURE

```
wallestars-v2.2/
├── n8n_workflows/
│   ├── mcp-server.json
│   ├── quality-scoring.json
│   ├── email-monitor.json
│   ├── sms-monitor.json
│   ├── companybook-enrichment.json
│   ├── knowledge-indexer.json
│   ├── multi-agent-orchestrator.json
│   ├── system-health-monitor.json
│   └── README.md
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_base_tables.sql
│   │   ├── 002_create_vector_tables.sql
│   │   ├── 003_create_scoring_tables.sql
│   │   └── 004_create_monitoring_tables.sql
│   └── functions/
│       ├── search_knowledge.sql
│       └── get_health_status.sql
├── scripts/
│   ├── import-workflows.sh
│   ├── setup-credentials.sh
│   └── deploy.sh
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
└── config/
    ├── credentials-template.json
    └── environment-template.env
```

---

## 🔐 SECURITY REQUIREMENTS

1. **Webhook Secrets:** All webhooks must validate `x-webhook-secret` header
2. **API Keys:** Never commit credentials - use environment variables
3. **Rate Limiting:** Max 30 requests/min to external APIs
4. **Data Encryption:** Sensitive data encrypted at rest in Supabase
5. **Audit Logging:** All actions logged to `workflow_logs` table

---

## 📞 CONNECTION DETAILS

```yaml
# VPS
host: srv1201204.hstgr.cloud
ip: 72.61.154.188
ssh_user: root

# n8n
url: https://n8n.srv1201204.hstgr.cloud
mcp_endpoint: https://n8n.srv1201204.hstgr.cloud/mcp-server/http

# Supabase
project_id: ansiaiuaygcfztabtknl
url: https://ansiaiuaygcfztabtknl.supabase.co

# Redis
key: mcp_n8n_tools

# Email
imap: imap.hostinger.com:993
smtp: smtp.hostinger.com:465
alias_pattern: {name}@madoff.33mail.com
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] MCP Server Workflow (Redis tool registry)
- [ ] Quality Scoring Workflow (AI evaluation)
- [ ] Email Monitor Workflow (IMAP + code extraction)
- [ ] SMS Monitor Workflow (smstome scraping)
- [ ] CompanyBook Enrichment Workflow (API integration)
- [ ] Knowledge Indexer Workflow (GitHub → pgvector)
- [ ] Multi-Agent Orchestrator Workflow (parallel sessions)
- [ ] System Health Monitor Workflow (infrastructure checks)
- [ ] Supabase migrations (all tables)
- [ ] Deployment scripts
- [ ] Documentation

---

## 🚀 START COMMAND

Begin by creating the **MCP Server Workflow** (`mcp-server.json`) as it's the foundation for all other workflows. Include:

1. Complete n8n JSON export
2. Setup instructions
3. Required credentials list
4. Test commands

Then proceed with Quality Scoring and verification monitors.

---

**Session Context:**
- Project: Wallestars v2.2
- Environment: Production-ready
- Priority: MCP Server → Quality Scoring → Monitors → Enrichment → Orchestrator
- Output: Working n8n workflows + Supabase schemas + documentation
