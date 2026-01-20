-- ============================================
-- AI Agent Orchestration Farm Schema
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: ai_platforms
-- Description: Registry of AI platforms
-- ============================================
CREATE TABLE IF NOT EXISTS ai_platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tier TEXT CHECK (tier IN ('free_trial', 'free_tier', 'paid')),
    trial_credits TEXT,
    signup_url TEXT,
    api_base_url TEXT,
    auth_type TEXT CHECK (auth_type IN ('api_key', 'oauth', 'bearer')),
    env_var_name TEXT,
    models JSONB DEFAULT '[]',
    capabilities JSONB DEFAULT '[]',
    rate_limit JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 10,
    is_configured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'available' CHECK (status IN (
        'available',
        'active',
        'expired',
        'rate_limited',
        'error'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for platform queries
CREATE INDEX IF NOT EXISTS idx_ai_platforms_status ON ai_platforms(status);
CREATE INDEX IF NOT EXISTS idx_ai_platforms_tier ON ai_platforms(tier);
CREATE INDEX IF NOT EXISTS idx_ai_platforms_is_configured ON ai_platforms(is_configured);

-- ============================================
-- Table: agent_instances
-- Description: Active agent instances in the farm
-- ============================================
CREATE TABLE IF NOT EXISTS agent_instances (
    id TEXT PRIMARY KEY,
    platform_id TEXT REFERENCES ai_platforms(id) ON DELETE SET NULL,
    state TEXT DEFAULT 'idle' CHECK (state IN (
        'idle',
        'working',
        'waiting',
        'error',
        'completed'
    )),
    current_task_id TEXT,
    tasks_completed INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0,
    last_error TEXT,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for agent queries
CREATE INDEX IF NOT EXISTS idx_agent_instances_platform_id ON agent_instances(platform_id);
CREATE INDEX IF NOT EXISTS idx_agent_instances_state ON agent_instances(state);

-- ============================================
-- Table: orchestration_tasks
-- Description: Tasks submitted to the farm
-- ============================================
CREATE TABLE IF NOT EXISTS orchestration_tasks (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    system_prompt TEXT,
    preferred_platform TEXT,
    workflow_id TEXT,
    max_tokens INTEGER DEFAULT 4096,
    status TEXT DEFAULT 'queued' CHECK (status IN (
        'queued',
        'processing',
        'completed',
        'failed',
        'cancelled'
    )),
    assigned_agent_id TEXT REFERENCES agent_instances(id) ON DELETE SET NULL,
    result TEXT,
    error TEXT,
    attempts INTEGER DEFAULT 0,
    response_time INTEGER,
    tokens_used INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for task queries
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_status ON orchestration_tasks(status);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_workflow ON orchestration_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_agent ON orchestration_tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_tasks_submitted ON orchestration_tasks(submitted_at);

-- ============================================
-- Table: agent_farm_metrics
-- Description: Time-series metrics for the farm
-- ============================================
CREATE TABLE IF NOT EXISTS agent_farm_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    total_agents INTEGER DEFAULT 0,
    agents_idle INTEGER DEFAULT 0,
    agents_working INTEGER DEFAULT 0,
    agents_error INTEGER DEFAULT 0,
    queued_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    failed_tasks INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0,
    is_healthy BOOLEAN DEFAULT TRUE,
    alerts JSONB DEFAULT '[]'
);

-- Index for metrics queries (time-based)
CREATE INDEX IF NOT EXISTS idx_agent_farm_metrics_timestamp ON agent_farm_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_farm_metrics_healthy ON agent_farm_metrics(is_healthy);

-- ============================================
-- Table: workflow_executions
-- Description: Track workflow template executions
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id TEXT NOT NULL,
    workflow_name TEXT,
    prompt TEXT NOT NULL,
    total_agents INTEGER DEFAULT 0,
    successful_agents INTEGER DEFAULT 0,
    failed_agents INTEGER DEFAULT 0,
    total_time INTEGER,
    aggregation_type TEXT CHECK (aggregation_type IN (
        'merge',
        'vote',
        'best',
        'collect'
    )),
    aggregated_result JSONB DEFAULT '{}',
    individual_results JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running' CHECK (status IN (
        'running',
        'completed',
        'failed'
    ))
);

-- Index for workflow queries
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON workflow_executions(started_at);

-- ============================================
-- View: farm_status_summary
-- Description: Current farm status at a glance
-- ============================================
CREATE OR REPLACE VIEW farm_status_summary AS
SELECT
    (SELECT COUNT(*) FROM agent_instances) as total_agents,
    (SELECT COUNT(*) FROM agent_instances WHERE state = 'idle') as idle_agents,
    (SELECT COUNT(*) FROM agent_instances WHERE state = 'working') as working_agents,
    (SELECT COUNT(*) FROM agent_instances WHERE state = 'error') as error_agents,
    (SELECT COUNT(*) FROM orchestration_tasks WHERE status = 'queued') as queued_tasks,
    (SELECT COUNT(*) FROM orchestration_tasks WHERE status = 'completed') as completed_tasks,
    (SELECT COUNT(*) FROM orchestration_tasks WHERE status = 'failed') as failed_tasks,
    (SELECT COUNT(*) FROM ai_platforms WHERE is_configured = TRUE) as configured_platforms,
    (SELECT COUNT(*) FROM ai_platforms WHERE is_configured = FALSE) as available_platforms,
    (SELECT SUM(total_tokens) FROM agent_instances) as total_tokens_used,
    (SELECT AVG(avg_response_time) FROM agent_instances WHERE avg_response_time > 0) as avg_response_time;

-- ============================================
-- View: platform_performance
-- Description: Performance metrics by platform
-- ============================================
CREATE OR REPLACE VIEW platform_performance AS
SELECT
    p.id as platform_id,
    p.name as platform_name,
    p.tier,
    COUNT(DISTINCT a.id) as agent_count,
    SUM(a.tasks_completed) as total_tasks_completed,
    SUM(a.tasks_failed) as total_tasks_failed,
    SUM(a.total_tokens) as total_tokens,
    AVG(a.avg_response_time) as avg_response_time,
    CASE
        WHEN SUM(a.tasks_completed) + SUM(a.tasks_failed) > 0
        THEN ROUND((SUM(a.tasks_completed)::NUMERIC / (SUM(a.tasks_completed) + SUM(a.tasks_failed))) * 100, 2)
        ELSE 0
    END as success_rate
FROM ai_platforms p
LEFT JOIN agent_instances a ON a.platform_id = p.id
GROUP BY p.id, p.name, p.tier
ORDER BY total_tasks_completed DESC;

-- ============================================
-- View: hourly_metrics
-- Description: Aggregated hourly metrics
-- ============================================
CREATE OR REPLACE VIEW hourly_metrics AS
SELECT
    DATE_TRUNC('hour', timestamp) as hour,
    AVG(total_agents) as avg_agents,
    AVG(agents_working) as avg_working,
    SUM(completed_tasks) as tasks_completed,
    SUM(failed_tasks) as tasks_failed,
    SUM(total_tokens_used) as tokens_used,
    AVG(avg_response_time) as avg_response_time,
    COUNT(CASE WHEN is_healthy = FALSE THEN 1 END) as unhealthy_periods
FROM agent_farm_metrics
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC
LIMIT 168; -- Last 7 days (24 * 7)

-- ============================================
-- Apply triggers
-- ============================================
DROP TRIGGER IF EXISTS update_ai_platforms_updated_at ON ai_platforms;
CREATE TRIGGER update_ai_platforms_updated_at
    BEFORE UPDATE ON ai_platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_instances_updated_at ON agent_instances;
CREATE TRIGGER update_agent_instances_updated_at
    BEFORE UPDATE ON agent_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE ai_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_farm_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on ai_platforms"
    ON ai_platforms FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_instances"
    ON agent_instances FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on orchestration_tasks"
    ON orchestration_tasks FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_farm_metrics"
    ON agent_farm_metrics FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on workflow_executions"
    ON workflow_executions FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- Initial Platform Data
-- ============================================
INSERT INTO ai_platforms (id, name, description, tier, trial_credits, signup_url, env_var_name, capabilities, priority)
VALUES
    ('anthropic_claude', 'Anthropic Claude', 'Advanced AI assistant with strong reasoning', 'free_tier', '$5 free API credits', 'https://console.anthropic.com/signup', 'ANTHROPIC_API_KEY', '["chat", "reasoning", "code", "analysis"]', 1),
    ('openai_gpt', 'OpenAI GPT', 'Powerful language models including GPT-4', 'free_tier', '$5 free API credits', 'https://platform.openai.com/signup', 'OPENAI_API_KEY', '["chat", "code", "vision", "function_calling"]', 2),
    ('google_gemini', 'Google Gemini', 'Multimodal AI with generous free tier', 'free_tier', '60 requests/minute free', 'https://aistudio.google.com/', 'GOOGLE_API_KEY', '["chat", "vision", "code", "multimodal"]', 3),
    ('groq', 'Groq', 'Ultra-fast LLM inference', 'free_tier', 'Free tier with rate limits', 'https://console.groq.com/', 'GROQ_API_KEY', '["chat", "code", "fast_inference"]', 7),
    ('together_ai', 'Together AI', 'Open-source models with free credits', 'free_trial', '$25 free credits', 'https://api.together.xyz/', 'TOGETHER_API_KEY', '["chat", "code", "embeddings"]', 8),
    ('huggingface', 'Hugging Face', 'Open-source ML models', 'free_tier', 'Free inference API', 'https://huggingface.co/join', 'HUGGINGFACE_API_KEY', '["text_generation", "embeddings", "classification"]', 6),
    ('perplexity', 'Perplexity AI', 'AI search engine with real-time data', 'free_tier', 'Free tier available', 'https://www.perplexity.ai/', 'PERPLEXITY_API_KEY', '["search", "chat", "real_time_data"]', 9),
    ('replicate', 'Replicate', 'Run open-source ML models', 'free_trial', 'Free credits for new users', 'https://replicate.com/', 'REPLICATE_API_TOKEN', '["text_generation", "image_generation", "audio"]', 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Cleanup old metrics (retention policy)
-- ============================================
-- Run this periodically to keep table size manageable
-- DELETE FROM agent_farm_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
