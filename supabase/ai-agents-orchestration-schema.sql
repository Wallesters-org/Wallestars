-- =====================================================
-- AI AGENTS ORCHESTRATION FARM - DATABASE SCHEMA
-- Manages free trial platforms and agent coordination
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PLATFORM REGISTRY
-- Stores all available free trial platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name VARCHAR(100) NOT NULL UNIQUE,
    platform_type VARCHAR(50) NOT NULL, -- 'ai_agent', 'automation', 'cloud', 'dev_tools', 'communication'
    registration_url TEXT NOT NULL,
    api_endpoint TEXT,
    trial_duration_days INTEGER DEFAULT 14,
    requires_credit_card BOOLEAN DEFAULT FALSE,
    requires_phone_verification BOOLEAN DEFAULT FALSE,
    requires_email_verification BOOLEAN DEFAULT TRUE,

    -- Capabilities
    capabilities JSONB DEFAULT '[]'::JSONB, -- ['code_generation', 'automation', 'api_access']

    -- Configuration
    config_schema JSONB DEFAULT '{}'::JSONB, -- Schema for platform-specific config

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMPTZ,
    health_status VARCHAR(20) DEFAULT 'unknown', -- 'healthy', 'degraded', 'down', 'unknown'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. WORKSPACE PLATFORMS
-- Tracks platforms added to user's workspace
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id VARCHAR(100) NOT NULL DEFAULT 'default',
    platform_id UUID NOT NULL REFERENCES platform_registry(id),

    -- Account Info
    account_email VARCHAR(255),
    account_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'registering', 'active', 'expired', 'suspended'

    -- Trial Info
    trial_started_at TIMESTAMPTZ,
    trial_expires_at TIMESTAMPTZ,

    -- Credentials (encrypted in production)
    credentials JSONB DEFAULT '{}'::JSONB, -- {api_key, access_token, etc}

    -- Agent Assignment
    assigned_agent VARCHAR(100),
    agent_session_id VARCHAR(100),

    -- Integration Status
    integration_status VARCHAR(50) DEFAULT 'disconnected', -- 'disconnected', 'connecting', 'connected', 'error'
    last_sync_at TIMESTAMPTZ,
    error_message TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workspace_id, platform_id)
);

-- =====================================================
-- 3. ORCHESTRATION AGENTS
-- Registry of AI agents in the orchestration farm
-- =====================================================
CREATE TABLE IF NOT EXISTS orchestration_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL UNIQUE,
    agent_type VARCHAR(50) NOT NULL, -- 'platform_manager', 'task_executor', 'coordinator', 'monitor'

    -- Capabilities
    supported_platforms JSONB DEFAULT '[]'::JSONB, -- Platform IDs this agent can manage
    max_concurrent_tasks INTEGER DEFAULT 5,
    skills JSONB DEFAULT '[]'::JSONB, -- ['web_automation', 'api_integration', 'form_filling']

    -- Status
    status VARCHAR(50) DEFAULT 'idle', -- 'idle', 'busy', 'offline', 'error'
    current_task_count INTEGER DEFAULT 0,
    health_score DECIMAL(5,2) DEFAULT 100.00,

    -- Performance
    total_tasks_completed INTEGER DEFAULT 0,
    total_tasks_failed INTEGER DEFAULT 0,
    avg_task_duration_ms INTEGER,
    success_rate DECIMAL(5,2) DEFAULT 100.00,

    -- Connection
    endpoint_url TEXT,
    last_heartbeat_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ORCHESTRATION TASKS
-- Individual tasks assigned to agents
-- =====================================================
CREATE TABLE IF NOT EXISTS orchestration_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type VARCHAR(100) NOT NULL, -- 'platform_registration', 'platform_setup', 'integration_test', 'health_check'

    -- Assignment
    platform_id UUID REFERENCES platform_registry(id),
    agent_id UUID REFERENCES orchestration_agents(id),
    workspace_platform_id UUID REFERENCES workspace_platforms(id),

    -- Task Details
    priority INTEGER DEFAULT 5, -- 1-10, 1 = highest
    task_data JSONB DEFAULT '{}'::JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'queued', 'running', 'completed', 'failed', 'cancelled'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Results
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ORCHESTRATION BATCHES
-- Batch operations for parallel execution
-- =====================================================
CREATE TABLE IF NOT EXISTS orchestration_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_name VARCHAR(255) NOT NULL,
    workspace_id VARCHAR(100) NOT NULL DEFAULT 'default',

    -- Batch Type
    batch_type VARCHAR(50) NOT NULL, -- 'bulk_registration', 'bulk_setup', 'parallel_tasks'

    -- Progress
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    failed_tasks INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'partial_failure', 'failed'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Configuration
    parallel_limit INTEGER DEFAULT 5, -- Max concurrent tasks
    config JSONB DEFAULT '{}'::JSONB,

    -- Results Summary
    results_summary JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. BATCH TASKS (Junction Table)
-- Links tasks to batches
-- =====================================================
CREATE TABLE IF NOT EXISTS batch_tasks (
    batch_id UUID NOT NULL REFERENCES orchestration_batches(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES orchestration_tasks(id) ON DELETE CASCADE,
    execution_order INTEGER,
    PRIMARY KEY (batch_id, task_id)
);

-- =====================================================
-- 7. PLATFORM TEMPLATES
-- Pre-configured settings for popular platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID NOT NULL REFERENCES platform_registry(id),
    template_name VARCHAR(100) NOT NULL,

    -- Template Data
    registration_steps JSONB NOT NULL, -- Steps for automated registration
    setup_config JSONB, -- Default setup configuration
    integration_config JSONB, -- Integration settings

    -- Metadata
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(platform_id, template_name)
);

-- =====================================================
-- 8. AGENT COMMUNICATION LOG
-- Inter-agent communication history
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_communication_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_agent_id UUID REFERENCES orchestration_agents(id),
    to_agent_id UUID REFERENCES orchestration_agents(id),

    message_type VARCHAR(50) NOT NULL, -- 'task_handoff', 'status_update', 'coordination', 'alert'
    message_data JSONB NOT NULL,

    -- Context
    task_id UUID REFERENCES orchestration_tasks(id),
    batch_id UUID REFERENCES orchestration_batches(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. ORCHESTRATION EVENTS
-- Event log for audit and debugging
-- =====================================================
CREATE TABLE IF NOT EXISTS orchestration_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100) NOT NULL, -- 'agent', 'system', 'webhook', 'user'

    -- References
    agent_id UUID REFERENCES orchestration_agents(id),
    task_id UUID REFERENCES orchestration_tasks(id),
    batch_id UUID REFERENCES orchestration_batches(id),
    platform_id UUID REFERENCES platform_registry(id),

    -- Event Data
    event_data JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'debug', 'info', 'warning', 'error', 'critical'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_workspace_platforms_workspace ON workspace_platforms(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_platforms_status ON workspace_platforms(account_status);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_status ON orchestration_tasks(status);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_agent ON orchestration_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_batches_status ON orchestration_batches(status);
CREATE INDEX IF NOT EXISTS idx_orchestration_events_type ON orchestration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_orchestration_events_created ON orchestration_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_communication_log_created ON agent_communication_log(created_at DESC);

-- =====================================================
-- VIEWS
-- =====================================================

-- Agent Dashboard View
CREATE OR REPLACE VIEW v_agent_orchestration_dashboard AS
SELECT
    a.id,
    a.agent_name,
    a.agent_type,
    a.status,
    a.current_task_count,
    a.health_score,
    a.success_rate,
    a.total_tasks_completed,
    a.total_tasks_failed,
    COALESCE(
        (SELECT COUNT(*) FROM orchestration_tasks t WHERE t.agent_id = a.id AND t.status = 'running'),
        0
    ) as active_tasks,
    COALESCE(
        (SELECT COUNT(*) FROM orchestration_tasks t WHERE t.agent_id = a.id AND t.status = 'pending'),
        0
    ) as pending_tasks,
    a.last_heartbeat_at,
    CASE
        WHEN a.last_heartbeat_at > NOW() - INTERVAL '5 minutes' THEN 'online'
        WHEN a.last_heartbeat_at > NOW() - INTERVAL '15 minutes' THEN 'degraded'
        ELSE 'offline'
    END as connection_status
FROM orchestration_agents a;

-- Workspace Status View
CREATE OR REPLACE VIEW v_workspace_platform_status AS
SELECT
    wp.workspace_id,
    pr.platform_name,
    pr.platform_type,
    wp.account_status,
    wp.integration_status,
    wp.trial_started_at,
    wp.trial_expires_at,
    CASE
        WHEN wp.trial_expires_at IS NULL THEN NULL
        WHEN wp.trial_expires_at < NOW() THEN 0
        ELSE EXTRACT(DAY FROM wp.trial_expires_at - NOW())
    END as days_remaining,
    wp.assigned_agent,
    wp.last_sync_at,
    wp.error_message
FROM workspace_platforms wp
JOIN platform_registry pr ON wp.platform_id = pr.id;

-- Batch Progress View
CREATE OR REPLACE VIEW v_batch_progress AS
SELECT
    b.id,
    b.batch_name,
    b.workspace_id,
    b.batch_type,
    b.status,
    b.total_tasks,
    b.completed_tasks,
    b.failed_tasks,
    CASE
        WHEN b.total_tasks = 0 THEN 0
        ELSE ROUND((b.completed_tasks::DECIMAL / b.total_tasks) * 100, 2)
    END as progress_percent,
    b.started_at,
    b.completed_at,
    CASE
        WHEN b.completed_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (b.completed_at - b.started_at))
        WHEN b.started_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (NOW() - b.started_at))
        ELSE NULL
    END as duration_seconds
FROM orchestration_batches b;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to assign task to best available agent
CREATE OR REPLACE FUNCTION assign_task_to_agent(
    p_task_id UUID,
    p_platform_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_agent_id UUID;
BEGIN
    -- Find best available agent based on:
    -- 1. Status = idle or has capacity
    -- 2. Supports the platform (if specified)
    -- 3. Lowest current task count
    -- 4. Highest success rate
    SELECT id INTO v_agent_id
    FROM orchestration_agents
    WHERE status IN ('idle', 'busy')
    AND current_task_count < max_concurrent_tasks
    AND (
        p_platform_id IS NULL
        OR supported_platforms @> to_jsonb(p_platform_id)::jsonb
        OR supported_platforms = '[]'::jsonb
    )
    ORDER BY
        current_task_count ASC,
        success_rate DESC,
        health_score DESC
    LIMIT 1;

    IF v_agent_id IS NOT NULL THEN
        -- Assign task
        UPDATE orchestration_tasks
        SET agent_id = v_agent_id,
            status = 'queued',
            updated_at = NOW()
        WHERE id = p_task_id;

        -- Update agent task count
        UPDATE orchestration_agents
        SET current_task_count = current_task_count + 1,
            status = CASE
                WHEN current_task_count + 1 >= max_concurrent_tasks THEN 'busy'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = v_agent_id;
    END IF;

    RETURN v_agent_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update batch progress
CREATE OR REPLACE FUNCTION update_batch_progress(p_batch_id UUID)
RETURNS void AS $$
DECLARE
    v_total INTEGER;
    v_completed INTEGER;
    v_failed INTEGER;
    v_running INTEGER;
BEGIN
    -- Count task statuses
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE t.status = 'completed'),
        COUNT(*) FILTER (WHERE t.status = 'failed'),
        COUNT(*) FILTER (WHERE t.status = 'running')
    INTO v_total, v_completed, v_failed, v_running
    FROM batch_tasks bt
    JOIN orchestration_tasks t ON bt.task_id = t.id
    WHERE bt.batch_id = p_batch_id;

    -- Update batch
    UPDATE orchestration_batches
    SET
        total_tasks = v_total,
        completed_tasks = v_completed,
        failed_tasks = v_failed,
        status = CASE
            WHEN v_completed + v_failed = v_total AND v_total > 0 THEN
                CASE
                    WHEN v_failed = 0 THEN 'completed'
                    WHEN v_completed = 0 THEN 'failed'
                    ELSE 'partial_failure'
                END
            WHEN v_running > 0 OR v_completed > 0 THEN 'running'
            ELSE 'pending'
        END,
        completed_at = CASE
            WHEN v_completed + v_failed = v_total AND v_total > 0 THEN NOW()
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log orchestration event
CREATE OR REPLACE FUNCTION log_orchestration_event(
    p_event_type VARCHAR(100),
    p_event_source VARCHAR(100),
    p_event_data JSONB,
    p_severity VARCHAR(20) DEFAULT 'info',
    p_agent_id UUID DEFAULT NULL,
    p_task_id UUID DEFAULT NULL,
    p_batch_id UUID DEFAULT NULL,
    p_platform_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO orchestration_events (
        event_type, event_source, event_data, severity,
        agent_id, task_id, batch_id, platform_id
    ) VALUES (
        p_event_type, p_event_source, p_event_data, p_severity,
        p_agent_id, p_task_id, p_batch_id, p_platform_id
    )
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA: Popular Free Trial Platforms
-- =====================================================
INSERT INTO platform_registry (platform_name, platform_type, registration_url, trial_duration_days, requires_credit_card, capabilities, config_schema)
VALUES
    -- AI Agents & Assistants
    ('OpenAI', 'ai_agent', 'https://platform.openai.com/signup', 90, FALSE,
     '["code_generation", "chat", "api_access", "embeddings", "fine_tuning"]'::JSONB,
     '{"api_key": "string", "org_id": "string"}'::JSONB),

    ('Anthropic Claude', 'ai_agent', 'https://console.anthropic.com/signup', 14, FALSE,
     '["code_generation", "chat", "api_access", "vision", "tool_use"]'::JSONB,
     '{"api_key": "string"}'::JSONB),

    ('Google AI Studio', 'ai_agent', 'https://aistudio.google.com/', 0, FALSE,
     '["code_generation", "chat", "api_access", "multimodal"]'::JSONB,
     '{"api_key": "string", "project_id": "string"}'::JSONB),

    ('Mistral AI', 'ai_agent', 'https://console.mistral.ai/signup', 14, FALSE,
     '["code_generation", "chat", "api_access", "embeddings"]'::JSONB,
     '{"api_key": "string"}'::JSONB),

    ('Cohere', 'ai_agent', 'https://dashboard.cohere.com/signup', 30, FALSE,
     '["embeddings", "rerank", "chat", "api_access"]'::JSONB,
     '{"api_key": "string"}'::JSONB),

    -- Automation Platforms
    ('Make (Integromat)', 'automation', 'https://www.make.com/en/register', 14, FALSE,
     '["workflow_automation", "api_integration", "scheduling"]'::JSONB,
     '{"api_key": "string", "team_id": "string"}'::JSONB),

    ('Zapier', 'automation', 'https://zapier.com/sign-up', 14, FALSE,
     '["workflow_automation", "api_integration", "triggers"]'::JSONB,
     '{"api_key": "string"}'::JSONB),

    ('N8n Cloud', 'automation', 'https://app.n8n.cloud/register', 14, FALSE,
     '["workflow_automation", "self_hosted", "api_integration"]'::JSONB,
     '{"api_key": "string", "webhook_url": "string"}'::JSONB),

    -- Cloud & Infrastructure
    ('Supabase', 'cloud', 'https://supabase.com/dashboard/sign-up', 0, FALSE,
     '["database", "auth", "storage", "realtime", "edge_functions"]'::JSONB,
     '{"project_url": "string", "anon_key": "string", "service_key": "string"}'::JSONB),

    ('Vercel', 'cloud', 'https://vercel.com/signup', 0, FALSE,
     '["hosting", "serverless", "edge_functions", "ci_cd"]'::JSONB,
     '{"api_token": "string", "team_id": "string"}'::JSONB),

    ('Railway', 'cloud', 'https://railway.app/login', 0, FALSE,
     '["hosting", "database", "ci_cd", "containers"]'::JSONB,
     '{"api_token": "string", "project_id": "string"}'::JSONB),

    ('Render', 'cloud', 'https://dashboard.render.com/register', 0, FALSE,
     '["hosting", "database", "containers", "ci_cd"]'::JSONB,
     '{"api_key": "string"}'::JSONB),

    -- Dev Tools
    ('GitHub', 'dev_tools', 'https://github.com/signup', 0, FALSE,
     '["git_hosting", "ci_cd", "actions", "copilot"]'::JSONB,
     '{"token": "string", "org": "string"}'::JSONB),

    ('Airtable', 'dev_tools', 'https://airtable.com/signup', 14, FALSE,
     '["database", "api_access", "automation"]'::JSONB,
     '{"api_key": "string", "base_id": "string"}'::JSONB),

    ('Notion', 'dev_tools', 'https://www.notion.so/signup', 0, FALSE,
     '["documentation", "database", "api_access"]'::JSONB,
     '{"api_key": "string", "workspace_id": "string"}'::JSONB),

    -- Communication & Messaging
    ('Slack', 'communication', 'https://slack.com/get-started', 0, FALSE,
     '["messaging", "bots", "webhooks", "api_access"]'::JSONB,
     '{"bot_token": "string", "signing_secret": "string"}'::JSONB),

    ('Discord', 'communication', 'https://discord.com/register', 0, FALSE,
     '["messaging", "bots", "webhooks", "api_access"]'::JSONB,
     '{"bot_token": "string", "guild_id": "string"}'::JSONB),

    ('Twilio', 'communication', 'https://www.twilio.com/try-twilio', 15, FALSE,
     '["sms", "voice", "video", "api_access"]'::JSONB,
     '{"account_sid": "string", "auth_token": "string"}'::JSONB),

    -- Browser Automation
    ('Browserless', 'automation', 'https://www.browserless.io/sign-up', 7, FALSE,
     '["browser_automation", "screenshots", "pdf_generation"]'::JSONB,
     '{"api_key": "string"}'::JSONB),

    ('Airtop', 'automation', 'https://www.airtop.ai/signup', 14, FALSE,
     '["browser_automation", "web_scraping", "form_filling"]'::JSONB,
     '{"api_key": "string", "profile_id": "string"}'::JSONB)

ON CONFLICT (platform_name) DO UPDATE SET
    updated_at = NOW();

-- Seed default orchestration agents
INSERT INTO orchestration_agents (agent_name, agent_type, skills, max_concurrent_tasks)
VALUES
    ('platform-manager-1', 'platform_manager',
     '["web_automation", "form_filling", "api_integration"]'::JSONB, 5),
    ('platform-manager-2', 'platform_manager',
     '["web_automation", "form_filling", "api_integration"]'::JSONB, 5),
    ('task-executor-1', 'task_executor',
     '["api_calls", "data_processing", "verification"]'::JSONB, 10),
    ('task-executor-2', 'task_executor',
     '["api_calls", "data_processing", "verification"]'::JSONB, 10),
    ('coordinator', 'coordinator',
     '["task_routing", "load_balancing", "monitoring"]'::JSONB, 1),
    ('health-monitor', 'monitor',
     '["health_checks", "alerting", "reporting"]'::JSONB, 20)
ON CONFLICT (agent_name) DO UPDATE SET
    updated_at = NOW();

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        ', t, t, t, t);
    END LOOP;
END;
$$;

COMMENT ON TABLE platform_registry IS 'Registry of all available free trial platforms for AI agent orchestration';
COMMENT ON TABLE workspace_platforms IS 'Platforms added to user workspaces with account status tracking';
COMMENT ON TABLE orchestration_agents IS 'AI agents available in the orchestration farm';
COMMENT ON TABLE orchestration_tasks IS 'Individual tasks assigned to agents';
COMMENT ON TABLE orchestration_batches IS 'Batch operations for parallel task execution';
