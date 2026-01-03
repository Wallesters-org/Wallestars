# 🏗️ Wallestars - Full System Architecture

**Version**: 3.0.0  
**Date**: 2026-01-02  
**Status**: Production Ready with Social Media Integration

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Social Media Chat Storage](#social-media-chat-storage)
3. [Decision Making Architecture](#decision-making-architecture)
4. [MCP Integration](#mcp-integration)
5. [Platform Integrations](#platform-integrations)
6. [Management Web App](#management-web-app)
7. [Infrastructure](#infrastructure)
8. [Security & Privacy](#security--privacy)

---

## 🎯 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WALLESTARS PLATFORM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Social     │  │   Eva Core   │  │  Management  │         │
│  │   Media      │──│   AI Brain   │──│   Dashboard  │         │
│  │   Hub        │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                 │
│                          │                                      │
│  ┌──────────────────────┴──────────────────────┐              │
│  │                                               │              │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │              │
│  │  │ Supabase │  │   n8n    │  │  GitHub  │  │              │
│  │  │   DB     │  │Workflows │  │  Actions │  │              │
│  │  └──────────┘  └──────────┘  └──────────┘  │              │
│  │                                               │              │
│  │         Data Layer & Orchestration           │              │
│  └───────────────────────────────────────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**AI & Decision Making:**
- Claude Sonnet 4 (1M context) - Primary AI
- Eva Core Algorithm - Decision engine
- Cline (Claude Dev) - Development AI
- GitHub Copilot - Code assistance

**Database & Storage:**
- Supabase (PostgreSQL) - Primary database
- Redis - Cache & sessions
- KeePassXC - Secrets management
- Tails OS - Secure storage

**Orchestration:**
- n8n - Workflow automation
- GitHub Actions - CI/CD
- PM2 - Process management
- Docker Compose - Container orchestration

**Platforms:**
- 7+ Social Media integrations
- VPS Monitor
- Website Builder
- Task Automation
- Email Processor
- Phone Numbers
- Free Trial Automation

---

## 💬 Social Media Chat Storage

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              SOCIAL MEDIA CHAT STORAGE SYSTEM                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input Layer (Real-time ingestion)                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Telegram│ │Instagram│ │Facebook│ │WhatsApp│ │Twitter│  │
│  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘  │
│      └───────────┴──────────┴──────────┴──────────┘        │
│                        │                                     │
│  ┌────────────────────┴───────────────────────┐            │
│  │       Message Processor & Normalizer       │            │
│  │  • Unified format conversion                │            │
│  │  • Media extraction & storage               │            │
│  │  • Metadata enrichment                      │            │
│  │  • Sentiment analysis                       │            │
│  └────────────────────┬───────────────────────┘            │
│                        │                                     │
│  ┌────────────────────┴───────────────────────┐            │
│  │         Context Builder & Analyzer         │            │
│  │  • Conversation threading                   │            │
│  │  • Entity extraction (users, topics)        │            │
│  │  • Intent classification                    │            │
│  │  • Relationship mapping                     │            │
│  └────────────────────┬───────────────────────┘            │
│                        │                                     │
│  ┌────────────────────┴───────────────────────┐            │
│  │          Supabase Storage Layer            │            │
│  │  ├─ messages (core data)                   │            │
│  │  ├─ conversations (threads)                 │            │
│  │  ├─ users (profiles & history)              │            │
│  │  ├─ media (files & attachments)             │            │
│  │  ├─ context (AI analysis results)           │            │
│  │  ├─ decisions (Eva Core actions)            │            │
│  │  └─ analytics (insights & metrics)          │            │
│  └────────────────────────────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

#### 1. Messages Table (`messages`)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Source identification
  platform VARCHAR(50) NOT NULL, -- 'telegram', 'instagram', etc.
  platform_message_id VARCHAR(255) NOT NULL,
  chat_id VARCHAR(255) NOT NULL,
  
  -- Content
  content TEXT,
  content_type VARCHAR(50), -- 'text', 'image', 'video', 'audio', 'document'
  language VARCHAR(10), -- Detected language
  
  -- Sender information
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  sender_username VARCHAR(255),
  
  -- Metadata
  timestamp TIMESTAMPTZ NOT NULL,
  edit_timestamp TIMESTAMPTZ,
  is_forwarded BOOLEAN DEFAULT FALSE,
  forward_from VARCHAR(255),
  reply_to_message_id UUID REFERENCES messages(id),
  
  -- Media
  media_urls JSONB, -- Array of media file URLs
  media_metadata JSONB, -- Size, dimensions, duration, etc.
  
  -- Analysis results
  sentiment VARCHAR(50), -- 'positive', 'negative', 'neutral'
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  entities JSONB, -- Extracted entities (people, places, organizations)
  topics JSONB, -- Detected topics/categories
  intent VARCHAR(100), -- 'question', 'complaint', 'praise', etc.
  priority INTEGER DEFAULT 0, -- 0-10
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  eva_decision_id UUID REFERENCES eva_decisions(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  UNIQUE(platform, platform_message_id)
);

CREATE INDEX idx_messages_platform ON messages(platform);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_sentiment ON messages(sentiment);
CREATE INDEX idx_messages_processed ON messages(processed);
CREATE INDEX idx_messages_eva_decision ON messages(eva_decision_id);
```

#### 2. Conversations Table (`conversations`)

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  platform VARCHAR(50) NOT NULL,
  chat_id VARCHAR(255) NOT NULL,
  chat_name VARCHAR(255),
  chat_type VARCHAR(50), -- 'private', 'group', 'channel'
  
  -- Participants
  participants JSONB, -- Array of user IDs
  participant_count INTEGER,
  
  -- Statistics
  total_messages INTEGER DEFAULT 0,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  
  -- AI Summary
  summary TEXT,
  key_topics JSONB,
  important_links JSONB,
  shared_files_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  archived_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(platform, chat_id)
);

CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_conversations_active ON conversations(is_active);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

#### 3. Users Table (`users`)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification (multi-platform)
  telegram_id VARCHAR(255),
  instagram_id VARCHAR(255),
  facebook_id VARCHAR(255),
  whatsapp_id VARCHAR(255),
  twitter_id VARCHAR(255),
  
  -- Profile
  name VARCHAR(255),
  username VARCHAR(255),
  bio TEXT,
  profile_picture_url TEXT,
  
  -- Analytics
  total_messages INTEGER DEFAULT 0,
  first_interaction TIMESTAMPTZ,
  last_interaction TIMESTAMPTZ,
  sentiment_avg DECIMAL(3,2),
  
  -- Behavior
  preferred_platform VARCHAR(50),
  communication_style VARCHAR(50), -- 'formal', 'casual', 'emoji-heavy'
  response_time_avg INTEGER, -- Average in minutes
  
  -- AI Profile
  personality_traits JSONB,
  interests JSONB,
  interaction_patterns JSONB,
  
  -- CRM
  tags JSONB,
  notes TEXT,
  status VARCHAR(50), -- 'active', 'vip', 'blocked'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_users_instagram ON users(instagram_id);
CREATE INDEX idx_users_status ON users(status);
```

#### 4. Context Storage (`message_context`)

```sql
CREATE TABLE message_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  
  -- Context window (previous messages for AI)
  previous_messages JSONB, -- Array of previous message IDs
  conversation_summary TEXT,
  
  -- User context
  user_history JSONB,
  user_preferences JSONB,
  past_interactions_count INTEGER,
  
  -- Situational context
  time_of_day VARCHAR(20), -- 'morning', 'afternoon', 'evening', 'night'
  day_of_week VARCHAR(20),
  is_holiday BOOLEAN DEFAULT FALSE,
  
  -- Platform context
  platform_features JSONB, -- Available features on this platform
  rate_limits JSONB,
  
  -- Business context
  active_campaigns JSONB,
  user_segment VARCHAR(100),
  customer_journey_stage VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_context_message ON message_context(message_id);
```

#### 5. Eva Decisions (`eva_decisions`)

```sql
CREATE TABLE eva_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id),
  
  -- Decision details
  rule_matched VARCHAR(255),
  should_respond BOOLEAN,
  response_type VARCHAR(100), -- 'auto', 'human_escalation', 'scheduled'
  
  -- Action plan
  actions JSONB, -- Array of actions to take
  timing VARCHAR(50), -- 'immediate', 'delayed', 'scheduled'
  delay_seconds INTEGER,
  scheduled_at TIMESTAMPTZ,
  
  -- Response strategy
  tone VARCHAR(50),
  style JSONB,
  length VARCHAR(50),
  personality VARCHAR(100),
  
  -- Generated response
  generated_response TEXT,
  response_confidence DECIMAL(3,2),
  
  -- Execution
  executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  
  -- Metadata
  confidence_score DECIMAL(3,2),
  reasoning TEXT,
  alternative_actions JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decisions_message ON eva_decisions(message_id);
CREATE INDEX idx_decisions_executed ON eva_decisions(executed);
CREATE INDEX idx_decisions_scheduled ON eva_decisions(scheduled_at);
```

#### 6. Media Storage (`media_files`)

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  
  -- File information
  filename VARCHAR(255),
  file_type VARCHAR(100),
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  
  -- Storage
  storage_url TEXT NOT NULL,
  storage_provider VARCHAR(50), -- 'supabase', 's3', 'cloudinary'
  thumbnail_url TEXT,
  
  -- Media metadata
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For video/audio in seconds
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  ocr_text TEXT, -- For images with text
  transcription TEXT, -- For audio/video
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_message ON media_files(message_id);
CREATE INDEX idx_media_type ON media_files(file_type);
```

#### 7. Analytics (`conversation_analytics`)

```sql
CREATE TABLE conversation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  
  -- Time period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Volume metrics
  message_count INTEGER,
  unique_users INTEGER,
  active_days INTEGER,
  
  -- Engagement metrics
  avg_response_time INTEGER, -- In minutes
  messages_per_user DECIMAL(5,2),
  user_retention_rate DECIMAL(3,2),
  
  -- Sentiment analysis
  positive_messages INTEGER,
  negative_messages INTEGER,
  neutral_messages INTEGER,
  avg_sentiment_score DECIMAL(3,2),
  
  -- Topic analysis
  top_topics JSONB,
  trending_keywords JSONB,
  
  -- Eva performance
  eva_responses INTEGER,
  eva_accuracy DECIMAL(3,2),
  human_escalations INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_conversation ON conversation_analytics(conversation_id);
CREATE INDEX idx_analytics_period ON conversation_analytics(period_start, period_end);
```

### Real-time Processing Flow

```javascript
// Message ingestion pipeline
const processIncomingMessage = async (rawMessage) => {
  // 1. Normalize message format
  const normalizedMessage = await normalizeMessage(rawMessage);
  
  // 2. Extract and store media
  if (normalizedMessage.media) {
    normalizedMessage.media_urls = await storeMedia(normalizedMessage.media);
  }
  
  // 3. Perform AI analysis
  const analysis = await analyzeMessage(normalizedMessage);
  
  // 4. Store in database
  const storedMessage = await supabase
    .from('messages')
    .insert({
      ...normalizedMessage,
      sentiment: analysis.sentiment,
      entities: analysis.entities,
      topics: analysis.topics,
      intent: analysis.intent,
      priority: analysis.priority
    })
    .select()
    .single();
  
  // 5. Build context
  const context = await buildMessageContext(storedMessage);
  
  // 6. Get Eva decision
  const decision = await evaCore.processMessage(storedMessage, context);
  
  // 7. Store decision
  await supabase
    .from('eva_decisions')
    .insert({
      message_id: storedMessage.id,
      ...decision
    });
  
  // 8. Execute action if needed
  if (decision.should_respond && decision.timing === 'immediate') {
    await executeResponse(decision);
  } else if (decision.timing === 'scheduled') {
    await scheduleResponse(decision);
  }
  
  // 9. Update analytics
  await updateAnalytics(storedMessage);
  
  return storedMessage;
};
```

---

## 🧠 Decision Making Architecture

### Eva Core Integration with Chat Storage

```
┌─────────────────────────────────────────────────────────────┐
│                  EVA CORE DECISION ENGINE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CONTEXT PROCESSOR                                        │
│  ┌────────────────────────────────────────┐                │
│  │  • Load message from database           │                │
│  │  • Retrieve conversation history        │                │
│  │  • Get user profile & preferences       │                │
│  │  • Load previous interactions           │                │
│  │  • Analyze sentiment & intent           │                │
│  └────────────────┬───────────────────────┘                │
│                    │                                          │
│  2. DECISION ENGINE                                          │
│  ┌────────────────┴───────────────────────┐                │
│  │  • Match against rules                  │                │
│  │  • Calculate priority                   │                │
│  │  • Determine response strategy          │                │
│  │  • Check rate limits                    │                │
│  │  • Assess confidence                    │                │
│  └────────────────┬───────────────────────┘                │
│                    │                                          │
│  3. RESPONSE GENERATOR                                       │
│  ┌────────────────┴───────────────────────┐                │
│  │  • Generate response text (Claude API)  │                │
│  │  • Apply personality & tone             │                │
│  │  • Validate appropriateness             │                │
│  │  • Format for platform                  │                │
│  │  • Store for review/approval            │                │
│  └────────────────┬───────────────────────┘                │
│                    │                                          │
│  4. ACTION EXECUTOR                                          │
│  ┌────────────────┴───────────────────────┐                │
│  │  • Send response via platform API       │                │
│  │  • Log execution result                 │                │
│  │  • Update message status                │                │
│  │  • Trigger n8n workflows               │                │
│  │  • Record performance metrics           │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Enhanced Eva Core Config

```json
{
  "eva_core": {
    "version": "3.0.0",
    "mode": "production",
    
    "database": {
      "type": "supabase",
      "connection": "${SUPABASE_URL}",
      "api_key": "${SUPABASE_KEY}",
      "realtime_enabled": true,
      "replication_enabled": true
    },
    
    "ai_providers": {
      "primary": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1000000,
        "temperature": 0.7,
        "api_key": "${ANTHROPIC_API_KEY}"
      },
      "fallback": {
        "provider": "openai",
        "model": "gpt-4-turbo",
        "api_key": "${OPENAI_API_KEY}"
      }
    },
    
    "context_window": {
      "max_messages": 50,
      "max_age_hours": 168,
      "include_user_history": true,
      "include_sentiment_history": true
    },
    
    "decision_rules": [
      {
        "id": "urgent_negative",
        "priority": 10,
        "conditions": {
          "sentiment": "negative",
          "intent": ["complaint", "urgent"],
          "priority": {"gte": 7}
        },
        "actions": ["respond_immediately", "escalate_to_human", "notify_admin"],
        "response_strategy": {
          "tone": "empathetic",
          "max_response_time_minutes": 5
        }
      },
      {
        "id": "question_auto_respond",
        "priority": 5,
        "conditions": {
          "intent": "question",
          "confidence": {"gte": 0.8}
        },
        "actions": ["respond_immediately"],
        "response_strategy": {
          "tone": "helpful",
          "include_resources": true
        }
      }
    ],
    
    "platforms": {
      "telegram": {
        "enabled": true,
        "auto_respond": true,
        "rate_limit_per_minute": 30,
        "features": ["typing_indicator", "read_receipts"]
      },
      "instagram": {
        "enabled": true,
        "auto_respond": true,
        "rate_limit_per_minute": 20,
        "features": ["story_reactions", "dm_quick_replies"]
      }
    },
    
    "analytics": {
      "track_performance": true,
      "measure_sentiment": true,
      "calculate_roi": true,
      "export_to_sheets": true
    }
  }
}
```

---

## 🔌 MCP Integration

### Model Context Protocol Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               MODEL CONTEXT PROTOCOL (MCP)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your n8n VPS Server: n8n.srv1201204.hstgr.cloud           │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │        MCP Server (n8n-hosted)         │                │
│  │  • Exposes workflows as MCP tools       │                │
│  │  • Provides context from n8n data       │                │
│  │  • Connects to Supabase                 │                │
│  │  • Streams real-time events             │                │
│  └────────────────┬───────────────────────┘                │
│                    │                                          │
│  ┌────────────────┴───────────────────────┐                │
│  │          MCP Client (Local)            │                │
│  │  • VSCode/Cline integration             │                │
│  │  • GitHub Copilot Chat                  │                │
│  │  • Claude Desktop (if used)             │                │
│  └────────────────┬───────────────────────┘                │
│                    │                                          │
│  ┌────────────────┴───────────────────────┐                │
│  │       Available MCP Tools               │                │
│  │  • execute_workflow(workflow_id)        │                │
│  │  • get_execution_status(execution_id)   │                │
│  │  • query_database(sql_query)            │                │
│  │  • send_social_message(platform, msg)   │                │
│  │  • analyze_sentiment(text)              │                │
│  │  • get_conversation_context(chat_id)    │                │
│  └────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### MCP Configuration for n8n VPS

```json
{
  "mcpServers": {
    "n8n-wallestars": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--streamableHttp",
        "https://n8n.srv1201204.hstgr.cloud/mcp-server/http",
        "--header",
        "authorization:Bearer ${N8N_API_KEY}"
      ]
    },
    "supabase-wallestars": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${SUPABASE_DB_URL}"
      ]
    },
    "github-wallestars": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github",
        "--repo",
        "Wallesters-org/Wallestars"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### MCP Benefits for Wallestars

1. **Real-time Workflow Execution**
   - AI can trigger n8n workflows directly
   - No need for webhooks or manual triggers
   - Streaming results back to AI

2. **Database Context**
   - AI has access to Supabase data
   - Can query conversation history
   - Retrieve user profiles on demand

3. **GitHub Integration**
   - AI can read/write issues
   - Access repository code
   - Update documentation

4. **Social Media Actions**
   - Send messages via MCP tool
   - Schedule posts
   - Retrieve analytics

---

**(Continued in next part...)**
