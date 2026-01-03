# 🏗️ Wallestars - Platform Integrations & Management

**Part 2 of Full Architecture**  
**Version**: 3.0.0

---

## 📱 Platform Integrations

### Current Platforms

```
platforms/
├── telegram-messages/      ✅ IMPLEMENTED
├── instagram/              🔜 PLANNED
├── facebook/               🔜 PLANNED
├── whatsapp/               🔜 PLANNED
├── email-processor/        ✅ IMPLEMENTED
├── website-builder/        ✅ IMPLEMENTED
├── task-automation-web/    ✅ IMPLEMENTED
├── free-trial-automation/  ✅ IMPLEMENTED
├── phone-numbers/          ✅ IMPLEMENTED
├── vps-monitor/            ✅ IMPLEMENTED
└── [NEW PLATFORMS]         🆕 TO ADD
```

### Integration with External Services

#### 1. SMS Services

**smstome** - SMS Gateway Integration
```javascript
// Platform: platforms/sms-gateway/
const smstomeConfig = {
  api_url: 'https://api.smstome.com/v1',
  api_key: process.env.SMSTOME_API_KEY,
  
  features: {
    send_sms: true,
    receive_sms: true,
    two_way_messaging: true,
    bulk_sending: true,
    delivery_reports: true
  },
  
  use_cases: [
    'Two-factor authentication',
    'Notification delivery',
    'Marketing campaigns',
    'Customer support alerts'
  ]
};

// Integration with Eva Core
class SMSHandler {
  async processSMS(message) {
    // 1. Store in database
    const storedMessage = await supabase
      .from('messages')
      .insert({
        platform: 'sms',
        content: message.body,
        sender_id: message.from,
        timestamp: new Date()
      });
    
    // 2. Get Eva decision
    const decision = await evaCore.processMessage(storedMessage);
    
    // 3. Send response if needed
    if (decision.should_respond) {
      await smstome.sendSMS({
        to: message.from,
        body: decision.generated_response
      });
    }
  }
}
```

#### 2. Virtual Phone Numbers

**fanytel** - Virtual Phone System
```javascript
// Platform: platforms/virtual-phones/
const fanytelConfig = {
  api_url: 'https://api.fanytel.com/v2',
  api_key: process.env.FANYTEL_API_KEY,
  
  features: {
    number_purchasing: true,
    call_forwarding: true,
    voicemail: true,
    call_recording: true,
    ivr_system: true,
    sms_support: true
  },
  
  use_cases: [
    'Business phone numbers (local/international)',
    'Call center operations',
    'Voice-based customer support',
    'Multi-line management',
    'Call analytics & reporting'
  ]
};

// n8n Workflow: Phone Call Handler
{
  "name": "Fanytel Call Processing",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Incoming Call",
      "webhookId": "fanytel-calls"
    },
    {
      "type": "n8n-nodes-base.function",
      "name": "Get Caller Info",
      "functionCode": "const caller = await supabase.from('users').select('*').eq('phone_number', items[0].json.from).single();"
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Claude Analysis",
      "url": "https://api.anthropic.com/v1/messages",
      "method": "POST",
      "body": {
        "model": "claude-sonnet-4",
        "messages": [
          {
            "role": "user",
            "content": "Analyze this call: {{$json.transcription}}"
          }
        ]
      }
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Store Call Log",
      "operation": "insert",
      "table": "call_logs"
    }
  ]
}
```

#### 3. Development & Deployment Platforms

**Replit** - Rapid Development & Deployment
```javascript
// Use Case: Quick prototypes and microservices
const replitConfig = {
  use_for: [
    'Quick API prototypes',
    'Testing webhook endpoints',
    'Temporary staging environments',
    'Educational demos',
    'Collaborative coding sessions'
  ],
  
  integration_points: {
    n8n_webhooks: 'https://your-repl.replit.app/webhook',
    api_endpoints: 'https://your-repl.replit.app/api',
    database: 'Use Supabase from Replit'
  }
};

// Example: Replit-hosted webhook receiver
// File: index.js (on Replit)
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/social-media', async (req, res) => {
  const { platform, message } = req.body;
  
  // Forward to main VPS
  await fetch('https://n8n.srv1201204.hstgr.cloud/webhook/incoming', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, message })
  });
  
  res.json({ status: 'received' });
});

app.listen(3000);
```

**Netlify** - Static Sites & Functions
```javascript
// Use Case: Management Dashboard Hosting
const netlifyConfig = {
  hosting: {
    type: 'static_site',
    domain: 'wallestars-dashboard.netlify.app',
    ssl: 'automatic',
    cdn: 'global'
  },
  
  functions: {
    // Serverless functions for API calls
    'functions/get-analytics.js': async (event) => {
      const data = await supabase
        .from('conversation_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    }
  },
  
  build: {
    command: 'npm run build',
    publish: 'dist',
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_ANON_KEY
    }
  }
};
```

#### 4. Your Hostinger VPS Integration

**VPS Details:**
- Hostname: `srv1201204.hstgr.cloud`
- IPv4: `72.61.154.188`
- IPv6: `2a02:4780:41:e7b1::1`
- n8n Panel: `https://n8n.srv1201204.hstgr.cloud`

**Complete VPS Stack:**

```yaml
# docker-compose.yml (on VPS)
version: '3.8'

services:
  # n8n Workflow Engine (already running)
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.srv1201204.hstgr.cloud
      - N8N_PROTOCOL=https
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - WEBHOOK_URL=https://n8n.srv1201204.hstgr.cloud/
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - wallestars-network
  
  # MCP Server (NEW)
  mcp-server:
    build: ./mcp-server
    ports:
      - "3001:3001"
    environment:
      - N8N_API_KEY=${N8N_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    networks:
      - wallestars-network
  
  # PostgreSQL (for local n8n data)
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - wallestars-network
  
  # Redis (for caching & queues)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - wallestars-network
  
  # Nginx (reverse proxy)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    networks:
      - wallestars-network
  
  # Management API (NEW)
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_SERVICE_KEY}
      - N8N_URL=http://n8n:5678
    networks:
      - wallestars-network

networks:
  wallestars-network:
    driver: bridge

volumes:
  n8n_data:
  postgres_data:
  redis_data:
```

**MCP Server Implementation (on VPS):**

```javascript
// mcp-server/index.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// MCP Tools Registry
const tools = {
  // Execute n8n workflow
  execute_workflow: async ({ workflow_id, payload }) => {
    const response = await axios.post(
      `${process.env.N8N_URL}/webhook/${workflow_id}`,
      payload,
      { headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY } }
    );
    return response.data;
  },
  
  // Query database
  query_database: async ({ table, filters }) => {
    let query = supabase.from(table).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  // Send social media message
  send_social_message: async ({ platform, recipient, message }) => {
    // Trigger appropriate n8n workflow
    return await tools.execute_workflow({
      workflow_id: `send-${platform}-message`,
      payload: { recipient, message }
    });
  },
  
  // Analyze sentiment
  analyze_sentiment: async ({ text }) => {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Analyze sentiment: "${text}"`
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    return response.data;
  },
  
  // Get conversation context
  get_conversation_context: async ({ chat_id, platform }) => {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('platform', platform)
      .eq('chat_id', chat_id)
      .order('timestamp', { ascending: false })
      .limit(50);
    
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('platform', platform)
      .eq('chat_id', chat_id)
      .single();
    
    return { messages, conversation };
  }
};

// MCP HTTP endpoint
app.post('/mcp-server/http', async (req, res) => {
  const { tool, params } = req.body;
  
  try {
    if (!tools[tool]) {
      return res.status(404).json({ error: `Tool '${tool}' not found` });
    }
    
    const result = await tools[tool](params);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tools: Object.keys(tools) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Available tools: ${Object.keys(tools).join(', ')}`);
});
```

---

## 🖥️ Management Web App

### Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             WALLESTARS MANAGEMENT DASHBOARD                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Technology Stack:                                           │
│  • Frontend: React + TypeScript + Vite                      │
│  • UI: TailwindCSS + shadcn/ui                              │
│  • State: Zustand + React Query                             │
│  • Real-time: Supabase Realtime                             │
│  • Charts: Recharts + D3.js                                 │
│  • Deployment: Netlify                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Features

#### 1. Real-Time Conversation Monitor

```typescript
// components/ConversationMonitor.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export function ConversationMonitor() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    responded: 0,
    escalated: 0
  });
  
  useEffect(() => {
    // Real-time subscription
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => [payload.new, ...prev].slice(0, 100));
          updateStats();
        }
      )
      .subscribe();
    
    return () => { subscription.unsubscribe(); };
  }, []);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        icon={<MessageSquare />}
        title="Total Messages"
        value={stats.total}
        trend="+12%"
      />
      <StatCard
        icon={<TrendingUp />}
        title="Auto-Responded"
        value={stats.responded}
        trend="+8%"
      />
      <StatCard
        icon={<AlertTriangle />}
        title="Escalated"
        value={stats.escalated}
        trend="-5%"
      />
      {/* More stats... */}
    </div>
  );
}
```

#### 2. Workflow Orchestration Visualizer

```typescript
// components/WorkflowVisualizer.tsx
import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from 'reactflow';

export function WorkflowVisualizer() {
  const nodes = [
    {
      id: '1',
      type: 'input',
      data: { label: 'Incoming Message' },
      position: { x: 250, y: 0 }
    },
    {
      id: '2',
      data: { label: 'Eva Core Processing' },
      position: { x: 250, y: 100 }
    },
    {
      id: '3',
      data: { label: 'Sentiment Analysis' },
      position: { x: 100, y: 200 }
    },
    {
      id: '4',
      data: { label: 'Decision Engine' },
      position: { x: 400, y: 200 }
    },
    {
      id: '5',
      type: 'output',
      data: { label: 'Response Sent' },
      position: { x: 250, y: 300 }
    }
  ];
  
  const edges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-5', source: '3', target: '5' },
    { id: 'e4-5', source: '4', target: '5' }
  ];
  
  return (
    <div style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

#### 3. AI Decision Insights

```typescript
// components/DecisionInsights.tsx
export function DecisionInsights() {
  const { data: decisions } = useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('eva_decisions')
        .select(`
          *,
          messages (
            content,
            platform,
            sentiment
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      return data;
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });
  
  return (
    <div className="space-y-4">
      {decisions?.map(decision => (
        <DecisionCard
          key={decision.id}
          decision={decision}
          message={decision.messages}
        />
      ))}
    </div>
  );
}

function DecisionCard({ decision, message }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <Badge>{message.platform}</Badge>
          <span className={`badge-${message.sentiment}`}>
            {message.sentiment}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{message.content}</p>
        
        <Separator className="my-2" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Decision:</span>
            <strong>{decision.should_respond ? 'Respond' : 'Skip'}</strong>
          </div>
          <div className="flex justify-between">
            <span>Confidence:</span>
            <strong>{(decision.confidence_score * 100).toFixed(0)}%</strong>
          </div>
          <div className="flex justify-between">
            <span>Timing:</span>
            <strong>{decision.timing}</strong>
          </div>
        </div>
        
        {decision.generated_response && (
          <>
            <Separator className="my-2" />
            <p className="text-sm italic bg-blue-50 p-2 rounded">
              "{decision.generated_response}"
            </p>
          </>
        )}
        
        {decision.reasoning && (
          <p className="text-xs text-gray-500 mt-2">
            Reasoning: {decision.reasoning}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 4. Platform Analytics

```typescript
// components/PlatformAnalytics.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function PlatformAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: async () => {
      const { data } = await supabase
        .rpc('get_platform_analytics', {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end_date: new Date()
        });
      return data;
    }
  });
  
  return (
    <div>
      <h2>Platform Performance (Last 7 Days)</h2>
      <BarChart width={800} height={400} data={analytics}>
        <XAxis dataKey="platform" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total_messages" fill="#8884d8" name="Messages" />
        <Bar dataKey="auto_responded" fill="#82ca9d" name="Auto-Responded" />
        <Bar dataKey="escalated" fill="#ffc658" name="Escalated" />
      </BarChart>
    </div>
  );
}
```

---

## 🔐 Claude Projects vs Claude Code

### Analysis & Recommendation

**Claude Projects (in Claude.ai):**
- ✅ Best for: Long-term projects, knowledge bases
- ✅ Persistent context across sessions
- ✅ Custom instructions per project
- ❌ Not integrated with IDE
- ❌ Manual copy-paste of code

**Claude Code (Cline extension - ALREADY IN CONTAINER):**
- ✅ Already configured in devcontainer.json
- ✅ Direct IDE integration
- ✅ 1M context window
- ✅ File system access
- ✅ Terminal execution
- ✅ Perfect for coding tasks

**Recommendation:**
**NO NEED to add Claude Projects** - Cline is superior for development:

```json
// Already in .devcontainer/devcontainer.json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "saoudrizwan.claude-dev"  // ✅ Cline with 1M context
      ],
      "settings": {
        "claude-dev.apiKey": "${ANTHROPIC_API_KEY}",
        "claude-dev.model": "claude-sonnet-4-20250514",
        "claude-dev.maxTokens": 1000000
      }
    }
  }
}
```

**Use Cases:**
- **Cline**: All development work (primary)
- **Claude Projects**: Research, planning, documentation (secondary, optional)

---

**(To be continued in FULL-ARCHITECTURE-PART3.md...)**
