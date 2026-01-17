# Wallestars Automated Profile Creation with OTP Verification Guide

## Обзор (Overview)

Този документ описва пълната система за автоматизирано създаване на профили в Wallestars с SMS и Email OTP верификация чрез n8n и Airtop.

This document describes the complete system for automated profile creation in Wallestars with SMS and Email OTP verification using n8n and Airtop.

## Архитектура (Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase Database                         │
│                    (users_pending table)                         │
│                                                                   │
│         INSERT новия user → trigger_n8n_profile_creation()       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP Webhook
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              n8n Workflow: Supabase User Trigger                 │
│  • Validates payload                                             │
│  • Logs to verification_logs                                     │
│  • Triggers Profile Creation Orchestrator                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│         n8n Workflow: Profile Creation Orchestrator              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Update status → 'processing'                          │   │
│  │ 2. Create business profile в verified_business_profiles  │   │
│  │ 3. Check if SMS verification needed                      │   │
│  │ 4. Check if Email verification needed                    │   │
│  │ 5. Update final status                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                │                        │
│                         ▼                ▼                        │
│              ┌──────────────┐  ┌──────────────┐                 │
│              │ SMS needed?  │  │ Email needed?│                 │
│              └──────┬───────┘  └──────┬───────┘                 │
└─────────────────────┼──────────────────┼─────────────────────────┘
                      │                  │
                      ▼                  ▼
         ┌────────────────────┐  ┌────────────────────┐
         │ Airtop SMS OTP     │  │ Airtop Email OTP   │
         │ Automation         │  │ Automation         │
         └────────────────────┘  └────────────────────┘
                      │                  │
                      ▼                  ▼
         ┌────────────────────────────────────────┐
         │   Update verified_business_profiles    │
         │   • SMS code                           │
         │   • Email code/link                    │
         │   • Verification timestamps            │
         └────────────────────────────────────────┘
```

## Компоненти (Components)

### 1. Supabase Trigger (`n8n-webhook-trigger.sql`)
- Database trigger function activated when new user inserted
- Sends webhook to n8n with user data
- Includes queue mechanism for reliability

### 2. Supabase User Trigger Workflow (`supabase-user-trigger.json`)
- Receives webhook from Supabase
- Validates and formats payload
- Logs verification start
- Triggers orchestrator workflow

### 3. Profile Creation Orchestrator (`profile-creation-orchestrator.json`)
- Main coordination workflow
- Creates business profile
- Orchestrates SMS and Email OTP
- Updates status throughout process
- Logs completion

### 4. Airtop SMS OTP Automation (`airtop-sms-otp-automation.json`)
- Uses Airtop browser automation
- Navigates to SMS provider (receive-sms-online.info or similar)
- Extracts verification code using AI
- Updates database with SMS code

### 5. Airtop Email OTP Automation (`airtop-email-otp-automation.json`)
- Creates temporary email alias (33mail)
- Uses Airtop to check inbox
- Extracts verification code and link using AI
- Updates database with email verification data

## Предварителни изисквания (Prerequisites)

### 1. Services Required
- ✅ n8n instance running (https://n8n.srv1201204.hstgr.cloud)
- ✅ Supabase database with schema deployed
- ✅ Airtop API account and API key
- ✅ PostgreSQL extensions: `pg_net` or `http` (for webhooks)

### 2. API Keys and Credentials
```env
# n8n Environment Variables
N8N_WEBHOOK_URL=https://n8n.srv1201204.hstgr.cloud

# Airtop
AIRTOP_API_KEY=your_airtop_api_key
AIRTOP_API_URL=https://api.airtop.ai

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# SMS Provider (optional custom)
SMS_PROVIDER_URL=https://receive-sms-online.info
```

## Инсталация (Installation)

### Step 1: Deploy Supabase Schema

```bash
# Connect to your Supabase database
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Run the main schema
\i supabase/schema.sql

# Run the webhook trigger setup
\i supabase/n8n-webhook-trigger.sql

# Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
-- OR
CREATE EXTENSION IF NOT EXISTS http;
```

### Step 2: Configure Supabase Webhook URL

```sql
-- Update webhook URL configuration
INSERT INTO app_config (key, value, description) VALUES
    ('n8n_webhook_url', 'https://n8n.srv1201204.hstgr.cloud/webhook/supabase-user-created', 'N8N webhook endpoint')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Step 3: Import n8n Workflows

1. **Access n8n Dashboard**
   ```
   https://n8n.srv1201204.hstgr.cloud
   ```

2. **Import Each Workflow:**

   a. **Supabase User Trigger**
   - Click "Add workflow"
   - Import from File: `n8n-workflows/supabase-user-trigger.json`
   - Name: `Supabase User Trigger - Profile Creation`

   b. **Profile Creation Orchestrator**
   - Import: `n8n-workflows/profile-creation-orchestrator.json`
   - Name: `Profile Creation Orchestrator with OTP`

   c. **SMS OTP Automation**
   - Import: `n8n-workflows/airtop-sms-otp-automation.json`
   - Name: `Airtop SMS OTP Automation`

   d. **Email OTP Automation**
   - Import: `n8n-workflows/airtop-email-otp-automation.json`
   - Name: `Airtop Email OTP Automation`

### Step 4: Configure n8n Credentials

#### A. Supabase Credentials

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for "Supabase"
3. Configure:
   - **Name**: `Supabase API`
   - **Host**: Your Supabase URL (e.g., `xxx.supabase.co`)
   - **Service Role Secret**: Your Supabase service key
4. Test and Save

#### B. Airtop Credentials

1. Add Credential → **HTTP Header Auth** (or create custom Airtop credential)
2. Configure:
   - **Name**: `Airtop API`
   - **Header Name**: `Authorization`
   - **Value**: `Bearer YOUR_AIRTOP_API_KEY`
3. Save

#### C. Update Workflow Credential References

For each workflow, update the credential IDs:
- Open workflow in n8n
- Click on nodes that use credentials
- Select the credential you created
- Save workflow

### Step 5: Configure Environment Variables in n8n

In n8n settings or ecosystem.config.js:

```javascript
env: {
  N8N_WEBHOOK_URL: 'https://n8n.srv1201204.hstgr.cloud',
  AIRTOP_API_URL: 'https://api.airtop.ai',
  SMS_PROVIDER_URL: 'https://receive-sms-online.info'
}
```

### Step 6: Activate Workflows

1. Open each workflow in n8n
2. Toggle **Active** switch to ON
3. Verify webhook URLs are accessible

## Тестване (Testing)

### Test 1: Manual User Creation

```sql
-- Insert test user in Supabase
INSERT INTO users_pending (name, email, phone, status)
VALUES (
    'Test Company EOOD',
    'test@example.com',
    '+359888123456',
    'pending'
)
RETURNING *;
```

**Expected Results:**
1. Webhook triggers automatically
2. Check n8n executions - should see "Supabase User Trigger" workflow running
3. Profile created in `verified_business_profiles`
4. Status updates in `users_pending`
5. Logs in `verification_logs`

### Test 2: Check Webhook Queue

```sql
-- View queued webhooks
SELECT * FROM webhook_queue ORDER BY created_at DESC LIMIT 10;

-- Check verification logs
SELECT * FROM verification_logs ORDER BY created_at DESC LIMIT 20;
```

### Test 3: Verify n8n Workflow Execution

1. Go to n8n → **Executions**
2. Check recent runs
3. Click on execution to see detailed flow
4. Verify all nodes executed successfully

### Test 4: Manual Trigger

```sql
-- Manually trigger profile creation for existing user
SELECT manual_trigger_profile_creation('user-uuid-here');
```

### Test 5: End-to-End SMS Verification

```bash
# Use curl to test SMS OTP workflow directly
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/airtop-sms-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-uuid",
    "profile_id": "profile-uuid",
    "phone": "+359888123456",
    "name": "Test Company"
  }'
```

### Test 6: End-to-End Email Verification

```bash
# Test Email OTP workflow
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/airtop-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-uuid",
    "profile_id": "profile-uuid",
    "email": "test@example.com",
    "name": "Test Company"
  }'
```

## Мониторинг (Monitoring)

### Check Workflow Status

```sql
-- Users pending verification
SELECT id, name, status, created_at, updated_at
FROM users_pending
WHERE status IN ('pending', 'processing', 'awaiting_sms', 'awaiting_email')
ORDER BY created_at DESC;

-- Recent verification events
SELECT
    vl.event_type,
    vl.created_at,
    up.name,
    up.status
FROM verification_logs vl
JOIN users_pending up ON vl.user_id = up.id
ORDER BY vl.created_at DESC
LIMIT 50;

-- Success rate
SELECT
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users_pending
GROUP BY status;
```

### n8n Execution Monitoring

1. **Dashboard**: `https://n8n.srv1201204.hstgr.cloud/workflow`
2. **Executions**: Check for failed runs
3. **Logs**: View execution details for debugging

### Webhook Queue Monitoring

```sql
-- Check webhook queue status
SELECT
    status,
    COUNT(*) as count,
    MAX(created_at) as last_created
FROM webhook_queue
GROUP BY status;

-- Failed webhooks
SELECT * FROM webhook_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Issue 1: Webhook Not Triggering

**Symptoms:** New user inserted but no workflow execution

**Solutions:**
```sql
-- Check if trigger is enabled
SELECT * FROM pg_trigger WHERE tgname LIKE '%user_pending%';

-- Check webhook queue
SELECT * FROM webhook_queue ORDER BY created_at DESC LIMIT 5;

-- Manually trigger
SELECT manual_trigger_profile_creation('user-id');
```

### Issue 2: Airtop Session Fails

**Symptoms:** SMS/Email extraction fails

**Solutions:**
- Check Airtop API key validity
- Verify Airtop quota/limits
- Check browser session timeout settings
- Review Airtop logs in n8n execution

### Issue 3: SMS/Email Code Not Extracted

**Symptoms:** Workflow succeeds but no code found

**Solutions:**
- Verify SMS provider website is accessible
- Check AI prompt clarity
- Review Airtop response in workflow execution
- Try alternative SMS/Email providers

### Issue 4: Supabase Connection Errors

**Symptoms:** Database updates fail

**Solutions:**
```sql
-- Verify service role permissions
SELECT * FROM pg_roles WHERE rolname = 'service_role';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('users_pending', 'verified_business_profiles');
```

## Поддръжка (Maintenance)

### Daily Tasks
```sql
-- Clean up old webhook queue entries (7+ days old)
SELECT cleanup_webhook_queue(7);

-- Monitor verification success rate
SELECT
    DATE(created_at) as date,
    status,
    COUNT(*) as count
FROM users_pending
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), status
ORDER BY date DESC;
```

### Weekly Tasks
- Review failed workflow executions in n8n
- Check Airtop usage and quota
- Backup n8n workflows (already in git)
- Review and optimize slow queries

### Monthly Tasks
- Update Airtop browser configurations
- Review and update SMS/Email provider URLs
- Audit verification logs
- Performance optimization

## Security Considerations

### 1. API Keys
- Store in n8n encrypted credentials
- Rotate regularly
- Never commit to git

### 2. Webhook Security
```sql
-- Add webhook secret validation (future enhancement)
ALTER TABLE app_config ADD COLUMN IF NOT EXISTS
    webhook_secret TEXT DEFAULT md5(random()::text);
```

### 3. Rate Limiting
- Configure in n8n workflow settings
- Add rate limiting to webhook endpoints
- Monitor for abuse

### 4. Data Privacy
- Temporary email cleanup
- SMS verification code expiry
- Audit logging compliance

## Performance Optimization

### 1. Webhook Queue Processing
```sql
-- Add index for faster processing
CREATE INDEX IF NOT EXISTS idx_webhook_queue_pending
ON webhook_queue(status, created_at)
WHERE status = 'pending';
```

### 2. n8n Workflow Optimization
- Use async where possible
- Implement proper timeouts
- Enable workflow queue mode for high volume

### 3. Database Optimization
```sql
-- Analyze tables regularly
ANALYZE users_pending;
ANALYZE verified_business_profiles;
ANALYZE verification_logs;
ANALYZE webhook_queue;
```

## Deployment Checklist

- [ ] Supabase schema deployed
- [ ] Webhook triggers created
- [ ] pg_net or http extension enabled
- [ ] App config table populated
- [ ] All n8n workflows imported
- [ ] Credentials configured in n8n
- [ ] Environment variables set
- [ ] Workflows activated
- [ ] Test user creation works
- [ ] SMS OTP extraction works
- [ ] Email OTP extraction works
- [ ] Monitoring queries tested
- [ ] Error handling verified
- [ ] Documentation reviewed
- [ ] Team trained

## Next Steps

1. ✅ Deploy to production
2. ✅ Monitor first 24 hours closely
3. ✅ Gather metrics on success rates
4. ✅ Optimize based on real data
5. ✅ Add additional verification methods if needed
6. ✅ Create dashboard for real-time monitoring
7. ✅ Implement alerting for failures

## Support

For issues or questions:
- Check n8n execution logs
- Review Supabase logs
- Check this documentation
- Create GitHub issue

## Changelog

**v1.0.0 (2026-01-16)**
- Initial implementation
- Supabase trigger setup
- n8n workflow creation
- Airtop SMS/Email OTP automation
- Documentation complete
