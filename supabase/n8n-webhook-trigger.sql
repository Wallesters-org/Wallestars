-- ============================================
-- N8N Webhook Trigger Function for Wallestars
-- ============================================
-- This function triggers n8n workflows when new users are created
-- It sends a webhook to n8n to initiate profile creation and OTP verification

-- Create the webhook trigger function
CREATE OR REPLACE FUNCTION trigger_n8n_profile_creation()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT;
    payload JSON;
    http_request_id BIGINT;
BEGIN
    -- Set your n8n webhook URL
    -- Replace with your actual n8n webhook URL
    webhook_url := current_setting('app.n8n_webhook_url', true);

    -- If not set via settings, use environment variable or default
    IF webhook_url IS NULL OR webhook_url = '' THEN
        webhook_url := 'https://n8n.srv1201204.hstgr.cloud/webhook/supabase-user-created';
    END IF;

    -- Build the payload
    payload := json_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        'timestamp', NOW()
    );

    -- Log the trigger event
    RAISE NOTICE 'Triggering n8n webhook for user %', NEW.id;

    -- Use pg_net extension to make HTTP request (if available)
    -- Alternative: Use http extension or external service

    -- Note: This requires the http extension or pg_net extension
    -- To enable: CREATE EXTENSION IF NOT EXISTS http;
    -- or: CREATE EXTENSION IF NOT EXISTS pg_net;

    -- Using http extension (synchronous):
    BEGIN
        PERFORM net.http_post(
            url := webhook_url,
            body := payload::TEXT,
            headers := '{"Content-Type": "application/json"}'::JSONB
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Failed to send webhook to n8n: %', SQLERRM;
            -- Log the failure but don't fail the transaction
            INSERT INTO verification_logs (
                user_id,
                event_type,
                event_data
            ) VALUES (
                NEW.id,
                'webhook_failed',
                json_build_object(
                    'error', SQLERRM,
                    'webhook_url', webhook_url,
                    'timestamp', NOW()
                )
            );
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create Trigger on users_pending table
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_user_pending_created ON users_pending;

-- Create trigger for INSERT operations
CREATE TRIGGER on_user_pending_created
    AFTER INSERT ON users_pending
    FOR EACH ROW
    EXECUTE FUNCTION trigger_n8n_profile_creation();

-- Optional: Trigger on UPDATE as well (if status changes)
DROP TRIGGER IF EXISTS on_user_pending_updated ON users_pending;

CREATE TRIGGER on_user_pending_updated
    AFTER UPDATE ON users_pending
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION trigger_n8n_profile_creation();

-- ============================================
-- Alternative: Using Supabase Edge Functions
-- ============================================
-- If pg_net or http extensions are not available,
-- you can use Supabase Edge Functions or a queue table

-- Create a webhook queue table for async processing
CREATE TABLE IF NOT EXISTS webhook_queue (
    id BIGSERIAL PRIMARY KEY,
    webhook_url TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Index for processing
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_queue(status, created_at);

-- Function to queue webhook calls
CREATE OR REPLACE FUNCTION queue_n8n_webhook()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT;
    payload JSONB;
BEGIN
    -- Set your n8n webhook URL
    webhook_url := current_setting('app.n8n_webhook_url', true);

    IF webhook_url IS NULL OR webhook_url = '' THEN
        webhook_url := 'https://n8n.srv1201204.hstgr.cloud/webhook/supabase-user-created';
    END IF;

    -- Build the payload
    payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', row_to_json(NEW)::JSONB,
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::JSONB ELSE NULL END,
        'timestamp', NOW()
    );

    -- Insert into queue
    INSERT INTO webhook_queue (webhook_url, payload)
    VALUES (webhook_url, payload);

    RAISE NOTICE 'Queued webhook for user %', NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Configuration
-- ============================================

-- Set the n8n webhook URL (run this after deployment)
-- ALTER DATABASE postgres SET app.n8n_webhook_url = 'https://n8n.srv1201204.hstgr.cloud/webhook/supabase-user-created';

-- Or use a configuration table
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert webhook configuration
INSERT INTO app_config (key, value, description) VALUES
    ('n8n_webhook_url', 'https://n8n.srv1201204.hstgr.cloud/webhook/supabase-user-created', 'N8N webhook endpoint for user profile creation'),
    ('n8n_enabled', 'true', 'Enable/disable n8n webhook triggers')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- ============================================
-- Helper Functions
-- ============================================

-- Function to manually trigger webhook for existing user
CREATE OR REPLACE FUNCTION manual_trigger_profile_creation(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    webhook_url TEXT;
    result JSON;
BEGIN
    -- Get user record
    SELECT * INTO user_record FROM users_pending WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Get webhook URL
    SELECT value INTO webhook_url FROM app_config WHERE key = 'n8n_webhook_url';

    -- Queue the webhook
    INSERT INTO webhook_queue (webhook_url, payload)
    VALUES (
        webhook_url,
        jsonb_build_object(
            'type', 'MANUAL',
            'table', 'users_pending',
            'record', row_to_json(user_record)::JSONB,
            'timestamp', NOW()
        )
    );

    RETURN json_build_object(
        'success', true,
        'message', 'Webhook queued successfully',
        'user_id', p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Testing
-- ============================================

-- Test the trigger by inserting a test user
-- INSERT INTO users_pending (name, email, phone, status)
-- VALUES ('Test User', 'test@example.com', '+359888123456', 'pending')
-- RETURNING *;

-- Check webhook queue
-- SELECT * FROM webhook_queue ORDER BY created_at DESC LIMIT 10;

-- Manually trigger for existing user
-- SELECT manual_trigger_profile_creation('user-uuid-here');

-- ============================================
-- Cleanup and Maintenance
-- ============================================

-- Function to clean up old webhook queue entries
CREATE OR REPLACE FUNCTION cleanup_webhook_queue(days_old INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webhook_queue
    WHERE status IN ('success', 'failed')
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run manually or via cron)
-- SELECT cleanup_webhook_queue(7);

COMMENT ON FUNCTION trigger_n8n_profile_creation() IS 'Triggers n8n webhook when new user is created in users_pending table';
COMMENT ON FUNCTION queue_n8n_webhook() IS 'Queues webhook calls for async processing';
COMMENT ON FUNCTION manual_trigger_profile_creation(UUID) IS 'Manually trigger profile creation workflow for a specific user';
COMMENT ON FUNCTION cleanup_webhook_queue(INTEGER) IS 'Clean up old webhook queue entries';
