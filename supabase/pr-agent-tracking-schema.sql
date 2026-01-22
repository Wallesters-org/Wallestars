-- ============================================
-- PR TRACKING & AGENT MONITORING TABLES
-- ============================================

-- PR Tracking Table
CREATE TABLE IF NOT EXISTS pr_tracking (
  id BIGSERIAL PRIMARY KEY,
  pr_number INTEGER NOT NULL UNIQUE,
  agent VARCHAR(100),
  status VARCHAR(50) DEFAULT 'open',
  delegated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  repository VARCHAR(200) DEFAULT 'Wallestars',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index за бързо търсене
CREATE INDEX idx_pr_tracking_agent ON pr_tracking(agent);
CREATE INDEX idx_pr_tracking_status ON pr_tracking(status);
CREATE INDEX idx_pr_tracking_repository ON pr_tracking(repository);

-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
  id BIGSERIAL PRIMARY KEY,
  pr_number INTEGER NOT NULL,
  workflow VARCHAR(100) NOT NULL,
  all_passed BOOLEAN DEFAULT false,
  tests_passed VARCHAR(50),
  code_quality VARCHAR(50),
  security_scan VARCHAR(50),
  build_verification VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (pr_number) REFERENCES pr_tracking(pr_number) ON DELETE CASCADE
);

-- Index за тестови резултати
CREATE INDEX idx_test_results_pr ON test_results(pr_number);
CREATE INDEX idx_test_results_workflow ON test_results(workflow);
CREATE INDEX idx_test_results_timestamp ON test_results(timestamp DESC);

-- Agent Activity Log Table
CREATE TABLE IF NOT EXISTS agent_activity_log (
  id BIGSERIAL PRIMARY KEY,
  agent_name VARCHAR(100) NOT NULL,
  assigned_prs INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false,
  hours_since_activity NUMERIC(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prs_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index за agent logs
CREATE INDEX idx_agent_log_name ON agent_activity_log(agent_name);
CREATE INDEX idx_agent_log_timestamp ON agent_activity_log(timestamp DESC);
CREATE INDEX idx_agent_log_active ON agent_activity_log(is_active);

-- Agent Performance Metrics Table
CREATE TABLE IF NOT EXISTS agent_metrics (
  id BIGSERIAL PRIMARY KEY,
  agent_name VARCHAR(100) NOT NULL,
  total_prs_assigned INTEGER DEFAULT 0,
  total_prs_completed INTEGER DEFAULT 0,
  total_prs_merged INTEGER DEFAULT 0,
  avg_completion_time_hours NUMERIC(10, 2),
  success_rate NUMERIC(5, 2),
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index за metrics
CREATE INDEX idx_agent_metrics_name ON agent_metrics(agent_name);
CREATE INDEX idx_agent_metrics_period ON agent_metrics(period_start, period_end);

-- Workflow Execution Log Table
CREATE TABLE IF NOT EXISTS workflow_execution_log (
  id BIGSERIAL PRIMARY KEY,
  workflow_name VARCHAR(200) NOT NULL,
  workflow_id VARCHAR(100),
  execution_status VARCHAR(50),
  execution_time_ms INTEGER,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index за workflow logs
CREATE INDEX idx_workflow_log_name ON workflow_execution_log(workflow_name);
CREATE INDEX idx_workflow_log_status ON workflow_execution_log(execution_status);
CREATE INDEX idx_workflow_log_timestamp ON workflow_execution_log(timestamp DESC);

-- Alert History Table
CREATE TABLE IF NOT EXISTS alert_history (
  id BIGSERIAL PRIMARY KEY,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  agent_name VARCHAR(100),
  pr_number INTEGER,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index за alerts
CREATE INDEX idx_alert_type ON alert_history(alert_type);
CREATE INDEX idx_alert_severity ON alert_history(severity);
CREATE INDEX idx_alert_resolved ON alert_history(is_resolved);
CREATE INDEX idx_alert_timestamp ON alert_history(timestamp DESC);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Agent Performance Dashboard View
CREATE OR REPLACE VIEW v_agent_dashboard AS
SELECT 
  a.agent_name,
  COUNT(DISTINCT p.pr_number) as total_assigned,
  COUNT(DISTINCT CASE WHEN p.status = 'merged' THEN p.pr_number END) as total_merged,
  COUNT(DISTINCT CASE WHEN p.status = 'closed' THEN p.pr_number END) as total_closed,
  COUNT(DISTINCT CASE WHEN p.status = 'open' THEN p.pr_number END) as currently_open,
  ROUND(AVG(EXTRACT(EPOCH FROM (p.last_updated - p.delegated_at))/3600)::numeric, 2) as avg_hours_to_close,
  MAX(al.timestamp) as last_activity_check,
  MAX(al.is_active) as is_currently_active
FROM agent_activity_log a
LEFT JOIN pr_tracking p ON a.agent_name = p.agent
GROUP BY a.agent_name
ORDER BY total_assigned DESC;

-- Recent PR Activity View
CREATE OR REPLACE VIEW v_recent_pr_activity AS
SELECT 
  p.pr_number,
  p.agent,
  p.status,
  p.delegated_at,
  p.last_updated,
  EXTRACT(EPOCH FROM (NOW() - p.last_updated))/3600 as hours_since_update,
  t.all_passed as tests_passed,
  t.timestamp as last_test_run
FROM pr_tracking p
LEFT JOIN LATERAL (
  SELECT * FROM test_results 
  WHERE pr_number = p.pr_number 
  ORDER BY timestamp DESC 
  LIMIT 1
) t ON true
WHERE p.status = 'open'
ORDER BY p.last_updated DESC;

-- Alert Summary View
CREATE OR REPLACE VIEW v_alert_summary AS
SELECT 
  alert_type,
  severity,
  COUNT(*) as total_alerts,
  COUNT(CASE WHEN is_resolved THEN 1 END) as resolved_count,
  COUNT(CASE WHEN NOT is_resolved THEN 1 END) as open_count,
  MAX(timestamp) as latest_alert
FROM alert_history
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY alert_type, severity
ORDER BY severity DESC, total_alerts DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update PR status
CREATE OR REPLACE FUNCTION update_pr_status(
  p_pr_number INTEGER,
  p_status VARCHAR(50)
) RETURNS VOID AS $$
BEGIN
  UPDATE pr_tracking
  SET status = p_status,
      last_updated = NOW()
  WHERE pr_number = p_pr_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate agent metrics
CREATE OR REPLACE FUNCTION calculate_agent_metrics(
  p_agent_name VARCHAR(100),
  p_period_hours INTEGER DEFAULT 168 -- Default 1 week
) RETURNS TABLE (
  total_prs INTEGER,
  completed_prs INTEGER,
  merged_prs INTEGER,
  avg_completion_hours NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_prs,
    COUNT(CASE WHEN status IN ('merged', 'closed') THEN 1 END)::INTEGER as completed_prs,
    COUNT(CASE WHEN status = 'merged' THEN 1 END)::INTEGER as merged_prs,
    ROUND(AVG(EXTRACT(EPOCH FROM (last_updated - delegated_at))/3600)::numeric, 2) as avg_completion_hours,
    ROUND((COUNT(CASE WHEN status = 'merged' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) as success_rate
  FROM pr_tracking
  WHERE agent = p_agent_name
    AND delegated_at > NOW() - (p_period_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to log workflow execution
CREATE OR REPLACE FUNCTION log_workflow_execution(
  p_workflow_name VARCHAR(200),
  p_workflow_id VARCHAR(100),
  p_status VARCHAR(50),
  p_execution_time_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_log_id BIGINT;
BEGIN
  INSERT INTO workflow_execution_log (
    workflow_name,
    workflow_id,
    execution_status,
    execution_time_ms,
    error_message,
    metadata
  ) VALUES (
    p_workflow_name,
    p_workflow_id,
    p_status,
    p_execution_time_ms,
    p_error_message,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pr_tracking_update_timestamp
BEFORE UPDATE ON pr_tracking
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample agents
INSERT INTO agent_activity_log (agent_name, assigned_prs, is_active) VALUES
  ('copilot-agent-1', 0, true),
  ('copilot-agent-2', 0, true),
  ('copilot-agent-3', 0, true),
  ('copilot-agent-4', 0, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANTS (Adjust based on your security needs)
-- ============================================

-- Grant permissions to authenticated users
GRANT ALL ON pr_tracking TO authenticated;
GRANT ALL ON test_results TO authenticated;
GRANT ALL ON agent_activity_log TO authenticated;
GRANT ALL ON agent_metrics TO authenticated;
GRANT ALL ON workflow_execution_log TO authenticated;
GRANT ALL ON alert_history TO authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions on views
GRANT SELECT ON v_agent_dashboard TO authenticated;
GRANT SELECT ON v_recent_pr_activity TO authenticated;
GRANT SELECT ON v_alert_summary TO authenticated;

COMMENT ON TABLE pr_tracking IS 'Tracks PR assignments to agents';
COMMENT ON TABLE test_results IS 'Stores automated test results for PRs';
COMMENT ON TABLE agent_activity_log IS 'Logs agent activity and status checks';
COMMENT ON TABLE agent_metrics IS 'Aggregated metrics for agent performance';
COMMENT ON TABLE workflow_execution_log IS 'Logs n8n workflow executions';
COMMENT ON TABLE alert_history IS 'Historical record of all system alerts';
