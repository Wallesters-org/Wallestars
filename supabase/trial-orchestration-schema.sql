-- ============================================================================
-- AI AGENTS ORCHESTRATION FARM - TRIAL PLATFORMS SCHEMA
-- Automates free trial platform registration and management
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Platform Registry - Stores all available trial platforms
CREATE TABLE IF NOT EXISTS trial_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    website_url TEXT NOT NULL,
    signup_url TEXT NOT NULL,
    trial_duration_days INTEGER DEFAULT 14,
    requires_credit_card BOOLEAN DEFAULT FALSE,
    api_available BOOLEAN DEFAULT FALSE,
    api_docs_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    pricing_after_trial JSONB,
    automation_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Registry - Tracks orchestration agents
CREATE TABLE IF NOT EXISTS orchestration_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(100) NOT NULL UNIQUE,
    agent_type VARCHAR(50) NOT NULL,
    capabilities JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'idle',
    current_task_id UUID,
    max_concurrent_tasks INTEGER DEFAULT 3,
    assigned_platforms JSONB DEFAULT '[]'::jsonb,
    performance_score DECIMAL(5,2) DEFAULT 100.00,
    total_tasks_completed INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    health_status JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('idle', 'busy', 'error', 'offline', 'initializing'))
);

-- Trial Accounts - Stores registered trial accounts
CREATE TABLE IF NOT EXISTS trial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID NOT NULL REFERENCES trial_platforms(id),
    agent_id UUID REFERENCES orchestration_agents(id),
    workspace_id UUID,
    account_email VARCHAR(255),
    account_username VARCHAR(100),
    credentials_encrypted TEXT,
    api_key_encrypted TEXT,
    trial_start_date DATE,
    trial_end_date DATE,
    status VARCHAR(30) DEFAULT 'pending',
    registration_method VARCHAR(30) DEFAULT 'automated',
    verification_status VARCHAR(30) DEFAULT 'pending',
    integration_status VARCHAR(30) DEFAULT 'not_started',
    metadata JSONB DEFAULT '{}'::jsonb,
    error_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_account_status CHECK (status IN (
        'pending', 'registering', 'registered', 'verifying',
        'verified', 'active', 'expiring_soon', 'expired', 'cancelled', 'error'
    ))
);

-- Orchestration Tasks - Individual automation tasks
CREATE TABLE IF NOT EXISTS orchestration_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID,
    agent_id UUID REFERENCES orchestration_agents(id),
    platform_id UUID REFERENCES trial_platforms(id),
    trial_account_id UUID REFERENCES trial_accounts(id),
    task_type VARCHAR(50) NOT NULL,
    task_priority INTEGER DEFAULT 5,
    task_config JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(30) DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_task_status CHECK (status IN (
        'queued', 'assigned', 'in_progress', 'waiting_verification',
        'completed', 'failed', 'cancelled', 'retrying'
    )),
    CONSTRAINT valid_task_type CHECK (task_type IN (
        'register_trial', 'verify_email', 'verify_phone', 'setup_api',
        'configure_integration', 'health_check', 'renew_trial', 'export_data'
    ))
);

-- Orchestration Batches - Groups of tasks to run together
CREATE TABLE IF NOT EXISTS orchestration_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_name VARCHAR(200),
    batch_type VARCHAR(50) DEFAULT 'trial_activation',
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    failed_tasks INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'pending',
    config JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_batch_status CHECK (status IN (
        'pending', 'running', 'paused', 'completed', 'failed', 'cancelled'
    ))
);

-- Platform Integrations - Tracks how platforms connect to workspace
CREATE TABLE IF NOT EXISTS platform_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_account_id UUID NOT NULL REFERENCES trial_accounts(id),
    integration_type VARCHAR(50) NOT NULL,
    webhook_url TEXT,
    api_endpoint TEXT,
    oauth_config JSONB,
    mcp_config JSONB,
    n8n_workflow_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'pending',
    last_sync_at TIMESTAMPTZ,
    sync_frequency_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log - Comprehensive logging
CREATE TABLE IF NOT EXISTS orchestration_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_trial_platforms_category ON trial_platforms(category);
CREATE INDEX IF NOT EXISTS idx_trial_platforms_active ON trial_platforms(is_active);
CREATE INDEX IF NOT EXISTS idx_orchestration_agents_status ON orchestration_agents(status);
CREATE INDEX IF NOT EXISTS idx_trial_accounts_status ON trial_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trial_accounts_platform ON trial_accounts(platform_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_status ON orchestration_tasks(status);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_batch ON orchestration_tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_agent ON orchestration_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON orchestration_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON orchestration_activity_log(created_at DESC);

-- ============================================================================
-- VIEWS FOR DASHBOARDS
-- ============================================================================

-- Agent Dashboard View
CREATE OR REPLACE VIEW v_agent_orchestration_dashboard AS
SELECT
    a.id AS agent_id,
    a.agent_name,
    a.agent_type,
    a.status AS agent_status,
    a.performance_score,
    a.total_tasks_completed,
    a.last_activity_at,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'in_progress') AS active_tasks,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'queued') AS queued_tasks,
    COUNT(DISTINCT ta.id) AS managed_accounts,
    ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) AS platforms_handled
FROM orchestration_agents a
LEFT JOIN orchestration_tasks t ON a.id = t.agent_id
LEFT JOIN trial_accounts ta ON a.id = ta.agent_id
LEFT JOIN trial_platforms p ON ta.platform_id = p.id
GROUP BY a.id, a.agent_name, a.agent_type, a.status,
         a.performance_score, a.total_tasks_completed, a.last_activity_at;

-- Trial Status Overview
CREATE OR REPLACE VIEW v_trial_status_overview AS
SELECT
    p.id AS platform_id,
    p.name AS platform_name,
    p.category,
    p.trial_duration_days,
    COUNT(ta.id) AS total_accounts,
    COUNT(ta.id) FILTER (WHERE ta.status = 'active') AS active_accounts,
    COUNT(ta.id) FILTER (WHERE ta.status = 'expiring_soon') AS expiring_soon,
    COUNT(ta.id) FILTER (WHERE ta.status = 'expired') AS expired_accounts,
    COUNT(ta.id) FILTER (WHERE ta.status = 'error') AS error_accounts,
    MIN(ta.trial_end_date) AS earliest_expiry
FROM trial_platforms p
LEFT JOIN trial_accounts ta ON p.id = ta.platform_id
GROUP BY p.id, p.name, p.category, p.trial_duration_days;

-- Batch Progress View
CREATE OR REPLACE VIEW v_batch_progress AS
SELECT
    b.id AS batch_id,
    b.batch_name,
    b.batch_type,
    b.status AS batch_status,
    b.total_tasks,
    b.completed_tasks,
    b.failed_tasks,
    ROUND((b.completed_tasks::DECIMAL / NULLIF(b.total_tasks, 0)) * 100, 2) AS progress_percentage,
    COUNT(DISTINCT t.agent_id) AS agents_working,
    b.started_at,
    b.completed_at,
    EXTRACT(EPOCH FROM (COALESCE(b.completed_at, NOW()) - b.started_at)) / 60 AS duration_minutes
FROM orchestration_batches b
LEFT JOIN orchestration_tasks t ON b.id = t.batch_id AND t.status = 'in_progress'
GROUP BY b.id, b.batch_name, b.batch_type, b.status, b.total_tasks,
         b.completed_tasks, b.failed_tasks, b.started_at, b.completed_at;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to assign task to best available agent
CREATE OR REPLACE FUNCTION assign_task_to_agent(task_id UUID)
RETURNS UUID AS $$
DECLARE
    selected_agent_id UUID;
    task_platform_id UUID;
BEGIN
    -- Get the platform for this task
    SELECT platform_id INTO task_platform_id
    FROM orchestration_tasks WHERE id = task_id;

    -- Find best available agent (idle or with capacity, prioritizing by performance)
    SELECT id INTO selected_agent_id
    FROM orchestration_agents
    WHERE status IN ('idle', 'busy')
    AND (
        SELECT COUNT(*) FROM orchestration_tasks
        WHERE agent_id = orchestration_agents.id
        AND status = 'in_progress'
    ) < max_concurrent_tasks
    ORDER BY
        CASE WHEN assigned_platforms::text LIKE '%' || task_platform_id::text || '%' THEN 0 ELSE 1 END,
        performance_score DESC,
        total_tasks_completed DESC
    LIMIT 1;

    -- Assign the task
    IF selected_agent_id IS NOT NULL THEN
        UPDATE orchestration_tasks
        SET agent_id = selected_agent_id,
            status = 'assigned',
            updated_at = NOW()
        WHERE id = task_id;

        UPDATE orchestration_agents
        SET status = 'busy',
            current_task_id = task_id,
            last_activity_at = NOW(),
            updated_at = NOW()
        WHERE id = selected_agent_id;
    END IF;

    RETURN selected_agent_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update batch progress
CREATE OR REPLACE FUNCTION update_batch_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.batch_id IS NOT NULL THEN
        UPDATE orchestration_batches
        SET
            completed_tasks = (
                SELECT COUNT(*) FROM orchestration_tasks
                WHERE batch_id = NEW.batch_id AND status = 'completed'
            ),
            failed_tasks = (
                SELECT COUNT(*) FROM orchestration_tasks
                WHERE batch_id = NEW.batch_id AND status = 'failed'
            ),
            status = CASE
                WHEN (SELECT COUNT(*) FROM orchestration_tasks WHERE batch_id = NEW.batch_id AND status IN ('queued', 'assigned', 'in_progress')) = 0
                THEN 'completed'
                ELSE 'running'
            END,
            completed_at = CASE
                WHEN (SELECT COUNT(*) FROM orchestration_tasks WHERE batch_id = NEW.batch_id AND status IN ('queued', 'assigned', 'in_progress')) = 0
                THEN NOW()
                ELSE NULL
            END,
            updated_at = NOW()
        WHERE id = NEW.batch_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for batch progress updates
DROP TRIGGER IF EXISTS trigger_update_batch_progress ON orchestration_tasks;
CREATE TRIGGER trigger_update_batch_progress
AFTER UPDATE OF status ON orchestration_tasks
FOR EACH ROW
EXECUTE FUNCTION update_batch_progress();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_orchestration_activity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_action VARCHAR(100),
    p_actor VARCHAR(100) DEFAULT 'system',
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO orchestration_activity_log (entity_type, entity_id, action, actor, details)
    VALUES (p_entity_type, p_entity_id, p_action, p_actor, p_details)
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA - TOP 10 TRIAL PLATFORMS
-- ============================================================================

INSERT INTO trial_platforms (name, slug, category, description, website_url, signup_url, trial_duration_days, requires_credit_card, api_available, features, automation_config, priority) VALUES

-- AI & Development Platforms
('Claude AI (Anthropic)', 'claude-ai', 'AI Assistant',
 'Advanced AI assistant with Claude models for coding, analysis, and automation',
 'https://claude.ai', 'https://claude.ai/signup', 0, FALSE, TRUE,
 '["Chat", "Code generation", "Analysis", "MCP support", "Computer use"]'::jsonb,
 '{"auth_type": "email_oauth", "supports_api_key": true, "mcp_compatible": true}'::jsonb, 1),

('GitHub Copilot', 'github-copilot', 'AI Development',
 'AI-powered code completion and suggestion tool integrated with VS Code',
 'https://github.com/features/copilot', 'https://github.com/github-copilot/signup', 30, FALSE, TRUE,
 '["Code completion", "Chat", "PR reviews", "CLI integration"]'::jsonb,
 '{"auth_type": "github_oauth", "requires_subscription": true}'::jsonb, 2),

('Cursor IDE', 'cursor-ide', 'AI Development',
 'AI-first code editor with built-in AI assistant',
 'https://cursor.sh', 'https://cursor.sh/signup', 14, FALSE, TRUE,
 '["AI code editing", "Chat", "Codebase understanding", "Multi-file editing"]'::jsonb,
 '{"auth_type": "email", "desktop_app": true}'::jsonb, 3),

-- Automation Platforms
('n8n Cloud', 'n8n-cloud', 'Automation',
 'Workflow automation platform with 400+ integrations',
 'https://n8n.io', 'https://app.n8n.cloud/register', 14, FALSE, TRUE,
 '["Visual workflows", "400+ integrations", "Self-host option", "AI nodes"]'::jsonb,
 '{"auth_type": "email", "supports_webhook": true, "api_available": true}'::jsonb, 1),

('Zapier', 'zapier', 'Automation',
 'No-code automation connecting 6000+ apps',
 'https://zapier.com', 'https://zapier.com/sign-up', 14, FALSE, TRUE,
 '["6000+ apps", "Multi-step Zaps", "Filters", "Formatter"]'::jsonb,
 '{"auth_type": "email_oauth", "supports_webhook": true}'::jsonb, 2),

('Make (Integromat)', 'make', 'Automation',
 'Visual automation platform with advanced features',
 'https://make.com', 'https://make.com/en/register', 14, FALSE, TRUE,
 '["Visual builder", "Data transformation", "Error handling", "Scheduling"]'::jsonb,
 '{"auth_type": "email", "supports_webhook": true}'::jsonb, 3),

-- Database & Backend
('Supabase', 'supabase', 'Database/Backend',
 'Open source Firebase alternative with PostgreSQL',
 'https://supabase.com', 'https://supabase.com/dashboard', 0, FALSE, TRUE,
 '["PostgreSQL", "Auth", "Storage", "Edge Functions", "Realtime"]'::jsonb,
 '{"auth_type": "github_oauth", "free_tier": true, "api_available": true}'::jsonb, 1),

('Airtable', 'airtable', 'Database/Productivity',
 'Spreadsheet-database hybrid with automation',
 'https://airtable.com', 'https://airtable.com/signup', 14, FALSE, TRUE,
 '["Flexible tables", "Views", "Automations", "API access"]'::jsonb,
 '{"auth_type": "email_oauth", "supports_webhook": true}'::jsonb, 2),

-- Deployment & Hosting
('Vercel', 'vercel', 'Deployment',
 'Frontend cloud platform for deploying web applications',
 'https://vercel.com', 'https://vercel.com/signup', 0, FALSE, TRUE,
 '["Instant deploys", "Edge functions", "Analytics", "CI/CD"]'::jsonb,
 '{"auth_type": "github_oauth", "free_tier": true}'::jsonb, 1),

('Railway', 'railway', 'Deployment',
 'Infrastructure platform for deploying any app',
 'https://railway.app', 'https://railway.app/new', 0, FALSE, TRUE,
 '["One-click deploy", "Databases", "Cron jobs", "Private networking"]'::jsonb,
 '{"auth_type": "github_oauth", "free_tier": true, "credits": 5}'::jsonb, 2),

-- Communication
('Slack', 'slack', 'Communication',
 'Business messaging platform with extensive API',
 'https://slack.com', 'https://slack.com/get-started', 0, FALSE, TRUE,
 '["Channels", "Apps", "Workflows", "API", "Bots"]'::jsonb,
 '{"auth_type": "email_oauth", "free_tier": true, "bot_support": true}'::jsonb, 1),

('Discord', 'discord', 'Communication',
 'Community platform with voice, video, and text',
 'https://discord.com', 'https://discord.com/register', 0, FALSE, TRUE,
 '["Servers", "Bots", "Voice channels", "Webhooks"]'::jsonb,
 '{"auth_type": "email", "free_tier": true, "bot_support": true}'::jsonb, 2),

-- Productivity & Docs
('Notion', 'notion', 'Productivity',
 'All-in-one workspace for notes, docs, and databases',
 'https://notion.so', 'https://notion.so/signup', 0, FALSE, TRUE,
 '["Pages", "Databases", "Templates", "API", "AI features"]'::jsonb,
 '{"auth_type": "email_oauth", "free_tier": true, "api_available": true}'::jsonb, 1),

('Linear', 'linear', 'Project Management',
 'Issue tracking and project management for software teams',
 'https://linear.app', 'https://linear.app/signup', 14, FALSE, TRUE,
 '["Issues", "Projects", "Cycles", "API", "GitHub sync"]'::jsonb,
 '{"auth_type": "email_oauth", "supports_webhook": true}'::jsonb, 2)

ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    automation_config = EXCLUDED.automation_config,
    updated_at = NOW();

-- Seed initial orchestration agents
INSERT INTO orchestration_agents (agent_name, agent_type, capabilities, max_concurrent_tasks) VALUES
('orchestrator-alpha', 'master', '["task_distribution", "monitoring", "health_checks", "reporting"]'::jsonb, 10),
('registration-agent-1', 'registration', '["form_filling", "email_verification", "captcha_handling"]'::jsonb, 3),
('registration-agent-2', 'registration', '["form_filling", "email_verification", "captcha_handling"]'::jsonb, 3),
('integration-agent-1', 'integration', '["api_setup", "webhook_config", "oauth_flow", "mcp_setup"]'::jsonb, 5),
('monitor-agent-1', 'monitor', '["trial_tracking", "expiry_alerts", "usage_monitoring"]'::jsonb, 8)
ON CONFLICT (agent_name) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE trial_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for service role access
CREATE POLICY "Service role full access to trial_platforms" ON trial_platforms
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access to orchestration_agents" ON orchestration_agents
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access to trial_accounts" ON trial_accounts
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access to orchestration_tasks" ON orchestration_tasks
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access to orchestration_batches" ON orchestration_batches
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access to platform_integrations" ON platform_integrations
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access to orchestration_activity_log" ON orchestration_activity_log
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
