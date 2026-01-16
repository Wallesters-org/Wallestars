-- ============================================
-- Migration: 004_create_registration_progress
-- Description: Registration Progress Tracking Table
-- Date: 2026-01-16
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Enum: Registration Steps
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_step') THEN
        CREATE TYPE registration_step AS ENUM (
            'INITIATED',
            'PHONE_NUMBER_ALLOCATED',
            'BROWSER_SESSION_CREATED',
            'FORM_OPENED',
            'PHONE_ENTERED',
            'SMS_OTP_REQUESTED',
            'SMS_OTP_RECEIVED',
            'SMS_OTP_SUBMITTED',
            'EMAIL_ENTERED',
            'EMAIL_OTP_REQUESTED',
            'EMAIL_OTP_RECEIVED',
            'EMAIL_OTP_SUBMITTED',
            'BUSINESS_DETAILS_ENTERED',
            'OWNER_DETAILS_ENTERED',
            'FINAL_SUBMIT',
            'COMPLETED',
            'FAILED',
            'MANUAL_INTERVENTION_REQUIRED'
        );
    END IF;
END$$;

-- ============================================
-- Enum: Registration Status
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
        CREATE TYPE registration_status AS ENUM (
            'IN_PROGRESS',
            'WAITING_SMS',
            'WAITING_EMAIL',
            'WAITING_USER_INPUT',
            'PAUSED',
            'COMPLETED',
            'FAILED',
            'RETRYING'
        );
    END IF;
END$$;

-- ============================================
-- Table: registration_progress
-- Description: Tracks full registration progress with error logging
-- ============================================
CREATE TABLE IF NOT EXISTS registration_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key to business profile (optional, may not exist yet)
    owner_id UUID REFERENCES verified_business_profiles(id) ON DELETE SET NULL,

    -- Business identification
    business_eik TEXT NOT NULL,
    business_name TEXT,

    -- Current state
    current_step TEXT DEFAULT 'INITIATED',
    status TEXT DEFAULT 'IN_PROGRESS',

    -- Resources used during registration
    resources JSONB DEFAULT '{}',
    -- Expected format: {
    --   phoneNumber: "+1234567890",
    --   phoneOrderId: "duoplus-order-123",
    --   email: "business@example.com",
    --   emailAlias: "business.alias@33mail.com",
    --   sessionId: "airtop-session-123",
    --   windowId: "window-456",
    --   browserUrl: "https://..."
    -- }

    -- Error tracking
    error_log JSONB[] DEFAULT '{}',
    -- Array of: { timestamp, error_type, message, retryable, context }

    last_error JSONB,
    -- Latest error: { timestamp, error_type, message, retryable }

    -- Retry management
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN completed_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER
            ELSE NULL
        END
    ) STORED,

    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    -- Can include: automation_version, triggered_by, country, etc.

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_step CHECK (current_step IN (
        'INITIATED', 'PHONE_NUMBER_ALLOCATED', 'BROWSER_SESSION_CREATED',
        'FORM_OPENED', 'PHONE_ENTERED', 'SMS_OTP_REQUESTED', 'SMS_OTP_RECEIVED',
        'SMS_OTP_SUBMITTED', 'EMAIL_ENTERED', 'EMAIL_OTP_REQUESTED',
        'EMAIL_OTP_RECEIVED', 'EMAIL_OTP_SUBMITTED', 'BUSINESS_DETAILS_ENTERED',
        'OWNER_DETAILS_ENTERED', 'FINAL_SUBMIT', 'COMPLETED', 'FAILED',
        'MANUAL_INTERVENTION_REQUIRED'
    )),
    CONSTRAINT valid_status CHECK (status IN (
        'IN_PROGRESS', 'WAITING_SMS', 'WAITING_EMAIL', 'WAITING_USER_INPUT',
        'PAUSED', 'COMPLETED', 'FAILED', 'RETRYING'
    ))
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reg_progress_eik ON registration_progress(business_eik);
CREATE INDEX IF NOT EXISTS idx_reg_progress_status ON registration_progress(status);
CREATE INDEX IF NOT EXISTS idx_reg_progress_step ON registration_progress(current_step);
CREATE INDEX IF NOT EXISTS idx_reg_progress_started ON registration_progress(started_at);
CREATE INDEX IF NOT EXISTS idx_reg_progress_owner ON registration_progress(owner_id);

-- Partial index for active registrations
CREATE INDEX IF NOT EXISTS idx_reg_progress_active ON registration_progress(status, started_at)
    WHERE status NOT IN ('COMPLETED', 'FAILED');

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_registration_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reg_progress_updated_at ON registration_progress;
CREATE TRIGGER trigger_reg_progress_updated_at
    BEFORE UPDATE ON registration_progress
    FOR EACH ROW EXECUTE FUNCTION update_registration_progress_timestamp();

-- ============================================
-- Function: Update Registration Step
-- ============================================
CREATE OR REPLACE FUNCTION update_registration_step(
    p_business_eik TEXT,
    p_new_step TEXT,
    p_new_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := FALSE;
BEGIN
    UPDATE registration_progress
    SET
        current_step = p_new_step,
        status = COALESCE(p_new_status, status),
        updated_at = NOW()
    WHERE business_eik = p_business_eik
      AND status NOT IN ('COMPLETED', 'FAILED');

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Log Registration Error
-- ============================================
CREATE OR REPLACE FUNCTION log_registration_error(
    p_business_eik TEXT,
    p_error_type TEXT,
    p_error_message TEXT,
    p_retryable BOOLEAN DEFAULT TRUE,
    p_context JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_error_entry JSONB;
    v_updated BOOLEAN := FALSE;
BEGIN
    -- Build error entry
    v_error_entry := jsonb_build_object(
        'timestamp', NOW(),
        'error_type', p_error_type,
        'message', p_error_message,
        'retryable', p_retryable,
        'context', p_context
    );

    UPDATE registration_progress
    SET
        error_log = array_append(COALESCE(error_log, '{}'), v_error_entry),
        last_error = v_error_entry,
        retry_count = retry_count + 1,
        status = CASE
            WHEN p_retryable AND retry_count < max_retries THEN 'RETRYING'
            WHEN NOT p_retryable THEN 'FAILED'
            ELSE 'FAILED'
        END,
        updated_at = NOW()
    WHERE business_eik = p_business_eik
      AND status NOT IN ('COMPLETED', 'FAILED');

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Complete Registration
-- ============================================
CREATE OR REPLACE FUNCTION complete_registration(
    p_business_eik TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := FALSE;
BEGIN
    UPDATE registration_progress
    SET
        current_step = 'COMPLETED',
        status = 'COMPLETED',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE business_eik = p_business_eik
      AND status NOT IN ('COMPLETED', 'FAILED');

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Get Stuck Registrations
-- Description: Find registrations that haven't progressed
-- ============================================
CREATE OR REPLACE FUNCTION get_stuck_registrations(
    p_minutes_threshold INTEGER DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    business_eik TEXT,
    business_name TEXT,
    current_step TEXT,
    status TEXT,
    last_error JSONB,
    retry_count INTEGER,
    minutes_since_update INTEGER,
    resources JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rp.id,
        rp.business_eik,
        rp.business_name,
        rp.current_step,
        rp.status,
        rp.last_error,
        rp.retry_count,
        EXTRACT(EPOCH FROM (NOW() - rp.updated_at))::INTEGER / 60 AS minutes_since_update,
        rp.resources
    FROM registration_progress rp
    WHERE rp.status NOT IN ('COMPLETED', 'FAILED')
      AND rp.updated_at < NOW() - (p_minutes_threshold || ' minutes')::INTERVAL
    ORDER BY rp.updated_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Update Resources
-- Description: Merge new resource data into existing
-- ============================================
CREATE OR REPLACE FUNCTION update_registration_resources(
    p_business_eik TEXT,
    p_new_resources JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := FALSE;
BEGIN
    UPDATE registration_progress
    SET
        resources = resources || p_new_resources,
        updated_at = NOW()
    WHERE business_eik = p_business_eik
      AND status NOT IN ('COMPLETED', 'FAILED');

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE registration_progress ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on registration_progress"
    ON registration_progress FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- View: Registration Summary
-- Description: Quick overview of registration states
-- ============================================
CREATE OR REPLACE VIEW registration_summary AS
SELECT
    status,
    current_step,
    COUNT(*) as count,
    AVG(retry_count) as avg_retries,
    MIN(started_at) as oldest_started,
    MAX(updated_at) as latest_update
FROM registration_progress
GROUP BY status, current_step
ORDER BY status, current_step;

-- ============================================
-- Sample Usage Examples (commented out)
-- ============================================
/*
-- Initialize new registration
INSERT INTO registration_progress (business_eik, business_name, metadata)
VALUES (
    '123456789',
    'Test Company EOOD',
    '{"automation_version": "2.0", "triggered_by": "webhook", "country": "BG"}'::jsonb
);

-- Update step
SELECT update_registration_step('123456789', 'PHONE_NUMBER_ALLOCATED', 'IN_PROGRESS');

-- Add resources
SELECT update_registration_resources('123456789',
    '{"phoneNumber": "+12025551234", "phoneOrderId": "order-123"}'::jsonb
);

-- Log error
SELECT log_registration_error(
    '123456789',
    'SMS_TIMEOUT',
    'Failed to receive SMS after 12 attempts',
    true
);

-- Find stuck registrations (inactive for 30+ minutes)
SELECT * FROM get_stuck_registrations(30);

-- Complete registration
SELECT complete_registration('123456789');

-- View summary
SELECT * FROM registration_summary;
*/

-- ============================================
-- Migration complete
-- ============================================
