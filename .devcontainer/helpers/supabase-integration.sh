#!/bin/bash
# supabase-integration.sh - Enhanced Supabase Integration

set -e

echo "🗄️  Supabase Integration Setup"
echo "============================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SUPABASE_DIR="/workspaces/Wallestars/.supabase"

# Create Supabase project structure
echo -e "${YELLOW}📁 Creating Supabase project structure...${NC}"

mkdir -p "$SUPABASE_DIR"/{functions,migrations,seed,types}
chmod 700 "$SUPABASE_DIR"

# Initialize Supabase
echo -e "${YELLOW}🔧 Initializing Supabase...${NC}"

cd /workspaces/Wallestars

if [ ! -f "supabase/.gitignore" ]; then
    supabase init 2>/dev/null || echo "Supabase already initialized"
fi

# Enhanced database schema
cat > "$SUPABASE_DIR/migrations/$(date +%Y%m%d%H%M%S)_wallestars_schema.sql" << 'EOF'
-- Wallestars Enhanced Schema with Supabase Features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS eva;
CREATE SCHEMA IF NOT EXISTS workflows;
CREATE SCHEMA IF NOT EXISTS platforms;
CREATE SCHEMA IF NOT EXISTS analytics;

-- === Eva Core Tables ===

-- Users with RLS
CREATE TABLE IF NOT EXISTS eva.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    email VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, platform_user_id)
);

-- Enable Row Level Security
ALTER TABLE eva.users ENABLE ROW LEVEL SECURITY;

-- Interactions with full-text search
CREATE TABLE IF NOT EXISTS eva.interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES eva.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT,
    content_vector tsvector,
    sentiment VARCHAR(20),
    sentiment_score NUMERIC(3,2),
    priority INTEGER CHECK (priority BETWEEN 1 AND 10),
    keywords TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_interactions_content_search 
    ON eva.interactions USING GIN(content_vector);

-- Actions with scheduling
CREATE TABLE IF NOT EXISTS eva.actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES eva.interactions(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'executing', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 5,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- === Analytics Tables ===

CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES eva.users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    source VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partitioned by month for performance
CREATE TABLE IF NOT EXISTS analytics.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    dimensions JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (recorded_at);

-- === Workflows Tables ===

CREATE TABLE IF NOT EXISTS workflows.executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_version VARCHAR(50),
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    input JSONB,
    output JSONB,
    error JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER
);

-- === Secrets Management ===

CREATE TABLE IF NOT EXISTS workflows.secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    encrypted_value TEXT NOT NULL,
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE workflows.secrets ENABLE ROW LEVEL SECURITY;

-- === Functions ===

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_eva_users_updated_at BEFORE UPDATE ON eva.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Content search trigger
CREATE OR REPLACE FUNCTION eva_interactions_content_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.content_vector = to_tsvector('english', coalesce(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interactions_content_search_update BEFORE INSERT OR UPDATE ON eva.interactions
    FOR EACH ROW EXECUTE FUNCTION eva_interactions_content_search_trigger();

-- === Views ===

-- User activity summary
CREATE OR REPLACE VIEW eva.user_activity AS
SELECT 
    u.id as user_id,
    u.platform,
    u.username,
    COUNT(i.id) as total_interactions,
    AVG(i.sentiment_score) as avg_sentiment,
    MAX(i.created_at) as last_interaction,
    COUNT(CASE WHEN i.priority >= 8 THEN 1 END) as high_priority_count
FROM eva.users u
LEFT JOIN eva.interactions i ON u.id = i.user_id
GROUP BY u.id, u.platform, u.username;

-- === Indexes ===

CREATE INDEX IF NOT EXISTS idx_users_platform ON eva.users(platform);
CREATE INDEX IF NOT EXISTS idx_users_email ON eva.users(email);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON eva.interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON eva.interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_platform ON eva.interactions(platform);
CREATE INDEX IF NOT EXISTS idx_interactions_sentiment ON eva.interactions(sentiment);
CREATE INDEX IF NOT EXISTS idx_actions_status ON eva.actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_scheduled ON eva.actions(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics.events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_executions_workflow ON workflows.executions(workflow_name, started_at DESC);

-- === Row Level Security Policies ===

-- Users can only see their own data (example)
CREATE POLICY users_select_own ON eva.users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- === Grants ===

GRANT USAGE ON SCHEMA eva TO postgres, anon, authenticated;
GRANT USAGE ON SCHEMA workflows TO postgres, anon, authenticated;
GRANT USAGE ON SCHEMA platforms TO postgres, anon, authenticated;
GRANT USAGE ON SCHEMA analytics TO postgres, anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA eva TO postgres;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA eva TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA eva TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA workflows TO postgres;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA workflows TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA analytics TO postgres;
GRANT INSERT ON ALL TABLES IN SCHEMA analytics TO authenticated;

-- === Realtime ===

-- Enable realtime for Eva interactions
ALTER PUBLICATION supabase_realtime ADD TABLE eva.interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE eva.actions;
ALTER PUBLICATION supabase_realtime ADD TABLE workflows.executions;
EOF

# Seed data
cat > "$SUPABASE_DIR/seed/wallestars_seed.sql" << 'EOF'
-- Wallestars Seed Data

-- Insert test user
INSERT INTO eva.users (platform, platform_user_id, username, email, metadata)
VALUES 
    ('instagram', 'test_user_001', '@wallestars_test', 'test@wallestars.com', '{"test": true}'::jsonb),
    ('telegram', 'test_user_002', 'WallestarsBot', 'bot@wallestars.com', '{"bot": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert sample interactions
INSERT INTO eva.interactions (user_id, platform, type, content, sentiment, priority)
SELECT 
    u.id,
    'instagram',
    'comment',
    'This is amazing! Love your work!',
    'positive',
    7
FROM eva.users u WHERE u.platform_user_id = 'test_user_001'
LIMIT 1
ON CONFLICT DO NOTHING;
EOF

# TypeScript types generation
echo -e "${YELLOW}📝 Generating TypeScript types...${NC}"

cat > "$SUPABASE_DIR/types/database.types.ts" << 'EOF'
// Auto-generated TypeScript types for Supabase
// Run: supabase gen types typescript --local > .supabase/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  eva: {
    Tables: {
      users: {
        Row: {
          id: string
          platform: string
          platform_user_id: string
          username: string | null
          email: string | null
          metadata: Json
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          platform_user_id: string
          username?: string | null
          email?: string | null
          metadata?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          platform_user_id?: string
          username?: string | null
          email?: string | null
          metadata?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // Add more tables as needed
    }
    Views: {
      user_activity: {
        Row: {
          user_id: string
          platform: string
          username: string | null
          total_interactions: number
          avg_sentiment: number
          last_interaction: string
          high_priority_count: number
        }
      }
    }
  }
}
EOF

# Supabase Edge Functions
mkdir -p "$SUPABASE_DIR/functions/eva-webhook"

cat > "$SUPABASE_DIR/functions/eva-webhook/index.ts" << 'EOF'
// Eva Core Webhook Handler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { event, data } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Process Eva event
    switch (event) {
      case 'interaction':
        await supabase.from('eva.interactions').insert({
          user_id: data.userId,
          platform: data.platform,
          type: data.type,
          content: data.content,
          sentiment: data.sentiment,
          priority: data.priority
        })
        break
        
      case 'action':
        await supabase.from('eva.actions').insert({
          interaction_id: data.interactionId,
          action_type: data.actionType,
          status: 'pending',
          scheduled_at: data.scheduledAt
        })
        break
        
      default:
        return new Response(JSON.stringify({ error: 'Unknown event type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
EOF

# Configuration file
cat > "$SUPABASE_DIR/config.toml" << 'EOF'
# Supabase Configuration for Wallestars

[api]
enabled = true
port = 54321
max_rows = 1000

[auth]
enabled = true
site_url = "http://localhost:3000"

[auth.email]
enable_signup = true
double_confirm_changes = true

[db]
port = 54322

[realtime]
enabled = true

[storage]
enabled = true
file_size_limit = "50MiB"

[functions]
enabled = true
EOF

# CLI helpers
cat > /workspaces/Wallestars/.devcontainer/helpers/supabase-cli.sh << 'EOF'
#!/bin/bash
# Supabase CLI helpers

supabase_start() {
    echo "🚀 Starting Supabase..."
    cd /workspaces/Wallestars
    supabase start
}

supabase_stop() {
    echo "🛑 Stopping Supabase..."
    cd /workspaces/Wallestars
    supabase stop
}

supabase_reset() {
    echo "🔄 Resetting Supabase..."
    cd /workspaces/Wallestars
    supabase db reset
}

supabase_migrate() {
    echo "📊 Running migrations..."
    cd /workspaces/Wallestars
    supabase db push
}

supabase_types() {
    echo "📝 Generating TypeScript types..."
    cd /workspaces/Wallestars
    supabase gen types typescript --local > .supabase/types/database.types.ts
}

supabase_studio() {
    echo "🎨 Opening Supabase Studio..."
    supabase studio
}

case "$1" in
    start) supabase_start ;;
    stop) supabase_stop ;;
    reset) supabase_reset ;;
    migrate) supabase_migrate ;;
    types) supabase_types ;;
    studio) supabase_studio ;;
    *)
        echo "Usage: supabase-cli {start|stop|reset|migrate|types|studio}"
        ;;
esac
EOF

chmod +x /workspaces/Wallestars/.devcontainer/helpers/supabase-cli.sh

# Add to aliases
if ! grep -q "alias supa=" ~/.zshrc; then
    echo "alias supa='/workspaces/Wallestars/.devcontainer/helpers/supabase-cli.sh'" >> ~/.zshrc
fi

echo ""
echo -e "${GREEN}✅ Supabase integration setup complete!${NC}"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  supa start   - Start Supabase"
echo "  supa stop    - Stop Supabase"
echo "  supa reset   - Reset database"
echo "  supa migrate - Run migrations"
echo "  supa types   - Generate TypeScript types"
echo "  supa studio  - Open Supabase Studio"
echo ""
echo -e "${YELLOW}📖 Configuration: .supabase/config.toml${NC}"
echo -e "${YELLOW}🗄️  Migrations: .supabase/migrations/${NC}"
echo -e "${YELLOW}🌱 Seed data: .supabase/seed/${NC}"
