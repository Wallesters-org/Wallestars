-- Migration: 003_create_scoring_tables.sql
-- Description: Create tables for AI response quality scoring

CREATE TABLE IF NOT EXISTS ai_response_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  original_query TEXT,
  response_text TEXT,
  relevance_score INT CHECK (relevance_score BETWEEN 0 AND 100),
  confidence_score INT CHECK (confidence_score BETWEEN 0 AND 100),
  completeness_score INT CHECK (completeness_score BETWEEN 0 AND 100),
  final_score INT CHECK (final_score BETWEEN 0 AND 100),
  execution_time_ms INT,
  token_count INT,
  retry_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_scores_session ON ai_response_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_scores_final ON ai_response_scores(final_score);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON ai_response_scores(created_at);

-- Add comment
COMMENT ON TABLE ai_response_scores IS 'Stores AI agent performance metrics and quality scores for Wallestars v2.2';
