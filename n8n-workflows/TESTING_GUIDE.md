# Ръководство за тестване на Wallestars Profile Automation
# Testing Guide for Wallestars Profile Automation

## Преглед (Overview)

Това ръководство предоставя детайлни тестови сценарии за валидиране на автоматизираната система за създаване на профили с SMS и Email OTP верификация.

This guide provides detailed testing scenarios to validate the automated profile creation system with SMS and Email OTP verification.

## Предварителна подготовка (Pre-Test Setup)

### 1. Проверка на услугите (Service Health Check)

```bash
# Check n8n is running
curl -I https://n8n.srv1201204.hstgr.cloud/healthz

# Check Supabase connectivity
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres" -c "SELECT NOW();"

# Verify Airtop API
curl -H "Authorization: Bearer YOUR_AIRTOP_API_KEY" \
  https://api.airtop.ai/v1/sessions
```

### 2. Валидиране на схемата на базата данни (Database Schema Validation)

```sql
-- Check all required tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'users_pending',
    'verified_business_profiles',
    'verification_logs',
    'webhook_queue',
    'app_config'
  );

-- Should return 5 rows

-- Check triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%user_pending%';

-- Should show triggers on users_pending table
```

### 3. Проверка на n8n Workflows (n8n Workflow Verification)

```bash
# List all workflows (via n8n UI or API)
curl -X GET https://n8n.srv1201204.hstgr.cloud/rest/workflows \
  -H "X-N8N-API-KEY: YOUR_API_KEY"

# Expected workflows:
# - Supabase User Trigger - Profile Creation
# - Profile Creation Orchestrator with OTP
# - Airtop SMS OTP Automation
# - Airtop Email OTP Automation
```

## Тестови сценарии (Test Scenarios)

### Test Case 1: Базово създаване на потребител (Basic User Creation)

**Цел:** Валидиране на Supabase trigger и webhook

**Стъпки:**
```sql
-- 1. Insert test user
INSERT INTO users_pending (name, email, phone, status)
VALUES (
    'Test Company Ltd',
    'test-tc1@example.com',
    '+359888111111',
    'pending'
)
RETURNING *;

-- Save the returned user_id for validation
```

**Очаквани резултати:**
1. User created with status 'pending'
2. Webhook queued in webhook_queue table
3. Verification log entry created

**Валидация:**
```sql
-- Check webhook was queued
SELECT * FROM webhook_queue
WHERE payload->>'record'->>'email' = 'test-tc1@example.com'
ORDER BY created_at DESC LIMIT 1;

-- Check verification log
SELECT * FROM verification_logs
WHERE event_type = 'registry_check_started'
ORDER BY created_at DESC LIMIT 1;
```

**Очакван статус:** ✅ PASS if webhook_queue entry exists

---

### Test Case 2: Profile Creation Flow (Пълен Поток за Създаване на Профил)

**Цел:** Валидиране на пълния orchestrator workflow

**Стъпки:**
```sql
-- 1. Create user with both email and phone
INSERT INTO users_pending (name, email, phone, status, metadata)
VALUES (
    'Full Test Company EOOD',
    'fulltest@example.com',
    '+359888222222',
    'pending',
    '{"test": "full_flow", "test_id": "TC2"}'::jsonb
)
RETURNING *;

-- 2. Wait 10-30 seconds for workflow to process

-- 3. Check status progression
SELECT id, name, status, updated_at
FROM users_pending
WHERE email = 'fulltest@example.com';
```

**Очаквани резултати:**
1. Status changes: pending → processing → awaiting_sms → awaiting_email
2. Profile created in verified_business_profiles
3. Both SMS and Email workflows triggered

**Валидация:**
```sql
-- Check profile was created
SELECT
    vbp.id,
    vbp.company_name,
    vbp.email,
    vbp.phone,
    vbp.created_at,
    up.status
FROM verified_business_profiles vbp
JOIN users_pending up ON vbp.user_id = up.id
WHERE vbp.email = 'fulltest@example.com';

-- Check verification events
SELECT
    event_type,
    event_data,
    created_at
FROM verification_logs
WHERE user_id = (SELECT id FROM users_pending WHERE email = 'fulltest@example.com')
ORDER BY created_at ASC;

-- Expected events:
-- 1. registry_check_started
-- 2. sms_sent
-- 3. email_sent
-- 4. (potentially) sms_verified, email_verified
```

**Очакван статус:** ✅ PASS if profile exists and events logged

---

### Test Case 3: SMS Only Verification (Само SMS Верификация)

**Цел:** Test workflow with only phone number

**Стъпки:**
```sql
-- Insert user with only phone
INSERT INTO users_pending (name, phone, status)
VALUES (
    'SMS Only Company',
    '+359888333333',
    'pending'
)
RETURNING *;

-- Wait for processing
```

**Валидация:**
```sql
-- Check SMS workflow was triggered
SELECT * FROM verification_logs
WHERE event_type IN ('sms_sent', 'sms_verified')
  AND user_id = (SELECT id FROM users_pending WHERE phone = '+359888333333')
ORDER BY created_at DESC;

-- Check no email events
SELECT * FROM verification_logs
WHERE event_type IN ('email_sent', 'email_verified')
  AND user_id = (SELECT id FROM users_pending WHERE phone = '+359888333333');

-- Should return 0 rows
```

**Очакван статус:** ✅ PASS if only SMS events exist

---

### Test Case 4: Email Only Verification (Само Email Верификация)

**Цел:** Test workflow with only email

**Стъпки:**
```sql
-- Insert user with only email
INSERT INTO users_pending (name, email, status)
VALUES (
    'Email Only Company',
    'emailonly@example.com',
    'pending'
)
RETURNING *;

-- Wait for processing
```

**Валидация:**
```sql
-- Check Email workflow was triggered
SELECT * FROM verification_logs
WHERE event_type IN ('email_sent', 'email_verified')
  AND user_id = (SELECT id FROM users_pending WHERE email = 'emailonly@example.com')
ORDER BY created_at DESC;

-- Check no SMS events
SELECT * FROM verification_logs
WHERE event_type IN ('sms_sent', 'sms_verified')
  AND user_id = (SELECT id FROM users_pending WHERE email = 'emailonly@example.com');

-- Should return 0 rows

-- Check email alias was created
SELECT email_alias FROM verified_business_profiles
WHERE email = 'emailonly@example.com';

-- Should contain a 33mail alias
```

**Очакван статус:** ✅ PASS if only email events exist and alias created

---

### Test Case 5: Airtop SMS Extraction (SMS Код Екстракция)

**Цел:** Test Airtop SMS code extraction directly

**Стъпки:**
```bash
# 1. Create a test profile first
psql -c "INSERT INTO verified_business_profiles (email, phone, company_name)
VALUES ('airtop-sms-test@example.com', '+359888444444', 'Airtop SMS Test')
RETURNING id;"

# Save the profile_id

# 2. Trigger SMS OTP workflow directly
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/airtop-sms-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-uuid",
    "profile_id": "PROFILE_ID_FROM_STEP_1",
    "phone": "+359888444444",
    "name": "Airtop SMS Test"
  }'
```

**Валидация:**
```sql
-- Check SMS code was extracted
SELECT
    sms_verification_code,
    sms_verified_at,
    updated_at
FROM verified_business_profiles
WHERE phone = '+359888444444';

-- Check verification log
SELECT * FROM verification_logs
WHERE event_type IN ('sms_sent', 'sms_verified')
  AND profile_id = 'PROFILE_ID_FROM_STEP_1'
ORDER BY created_at DESC;
```

**Очакван резултат:** SMS code extracted (4-6 digits)

**Очакван статус:** ✅ PASS if sms_verification_code is not null

---

### Test Case 6: Airtop Email Extraction (Email Код Екстракция)

**Цел:** Test Airtop email code extraction directly

**Стъпки:**
```bash
# 1. Create a test profile
psql -c "INSERT INTO verified_business_profiles (email, phone, company_name)
VALUES ('airtop-email-test@example.com', '+359888555555', 'Airtop Email Test')
RETURNING id;"

# Save the profile_id

# 2. Trigger Email OTP workflow directly
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/airtop-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-uuid",
    "profile_id": "PROFILE_ID_FROM_STEP_1",
    "email": "airtop-email-test@example.com",
    "name": "Airtop Email Test"
  }'
```

**Валидация:**
```sql
-- Check email verification data
SELECT
    email_alias,
    email_confirmation_code,
    email_verification_link,
    email_verified_at,
    updated_at
FROM verified_business_profiles
WHERE email = 'airtop-email-test@example.com';

-- Should have:
-- - email_alias (33mail address)
-- - email_confirmation_code OR email_verification_link
-- - email_verified_at timestamp

-- Check logs
SELECT * FROM verification_logs
WHERE event_type IN ('email_sent', 'email_verified')
  AND profile_id = 'PROFILE_ID_FROM_STEP_1'
ORDER BY created_at DESC;
```

**Очакван статус:** ✅ PASS if email data extracted

---

### Test Case 7: Webhook Queue Processing (Обработка на Опашка)

**Цел:** Test async webhook queue mechanism

**Стъпки:**
```sql
-- 1. Manually queue a webhook
INSERT INTO webhook_queue (webhook_url, payload)
VALUES (
    'https://n8n.srv1201204.hstgr.cloud/webhook/supabase-user-created',
    jsonb_build_object(
        'type', 'INSERT',
        'table', 'users_pending',
        'record', jsonb_build_object(
            'id', gen_random_uuid(),
            'name', 'Queue Test Company',
            'email', 'queuetest@example.com',
            'phone', '+359888666666',
            'status', 'pending',
            'created_at', NOW()
        ),
        'timestamp', NOW()
    )
);

-- 2. Check queue status
SELECT id, status, attempts, created_at
FROM webhook_queue
WHERE payload->>'record'->>'email' = 'queuetest@example.com';
```

**Manual Processing (if automatic processing not set up):**
```bash
# Process the queued webhook manually via psql or external script
# This would typically be done by a background worker
```

**Валидация:**
```sql
-- Check queue was processed
SELECT id, status, attempts, last_error, processed_at
FROM webhook_queue
WHERE payload->>'record'->>'email' = 'queuetest@example.com';

-- Expected: status = 'success', processed_at is set
```

**Очакван статус:** ✅ PASS if status = 'success'

---

### Test Case 8: Error Handling (Обработка на Грешки)

**Цел:** Validate error handling and logging

**Стъпки:**
```sql
-- 1. Create user with invalid data (missing name)
INSERT INTO users_pending (email, phone, status)
VALUES ('invalid@example.com', '+359888777777', 'pending')
RETURNING *;

-- This should trigger error in workflow
```

**Валидация:**
```sql
-- Check for error logs
SELECT * FROM verification_logs
WHERE event_type = 'webhook_failed'
  AND event_data->>'error' IS NOT NULL
ORDER BY created_at DESC;

-- Check n8n execution logs (via UI)
-- Expected: Error logged but transaction not rolled back
```

**Очакван статус:** ✅ PASS if errors logged gracefully

---

### Test Case 9: Manual Trigger Function (Ръчно Задействане)

**Цел:** Test manual trigger functionality

**Стъпки:**
```sql
-- 1. Create a user without triggering automation
ALTER TABLE users_pending DISABLE TRIGGER on_user_pending_created;

INSERT INTO users_pending (name, email, phone, status)
VALUES ('Manual Trigger Test', 'manual@example.com', '+359888888888', 'pending')
RETURNING id;

-- Save the user_id

ALTER TABLE users_pending ENABLE TRIGGER on_user_pending_created;

-- 2. Manually trigger profile creation
SELECT manual_trigger_profile_creation('USER_ID_FROM_ABOVE');
```

**Валидация:**
```sql
-- Check webhook was queued
SELECT * FROM webhook_queue
WHERE payload->>'record'->>'email' = 'manual@example.com'
ORDER BY created_at DESC LIMIT 1;

-- Check profile creation started
SELECT * FROM users_pending WHERE email = 'manual@example.com';

-- Status should change from 'pending'
```

**Очакван статус:** ✅ PASS if workflow triggered manually

---

### Test Case 10: Concurrent Users (Паралелни Потребители)

**Цел:** Test system under concurrent load

**Стъпки:**
```sql
-- Insert multiple users simultaneously
BEGIN;

INSERT INTO users_pending (name, email, phone, status)
SELECT
    'Concurrent Test ' || i,
    'concurrent' || i || '@example.com',
    '+35988800000' || i,
    'pending'
FROM generate_series(1, 10) AS i;

COMMIT;

-- Wait 60 seconds for processing
```

**Валидация:**
```sql
-- Check all users processed
SELECT
    COUNT(*) as total,
    status,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM users_pending
WHERE email LIKE 'concurrent%@example.com'
GROUP BY status;

-- Check profiles created
SELECT COUNT(*) FROM verified_business_profiles
WHERE email LIKE 'concurrent%@example.com';

-- Should match number of users

-- Check for any errors
SELECT * FROM verification_logs
WHERE event_type = 'verification_failed'
  AND user_id IN (
    SELECT id FROM users_pending WHERE email LIKE 'concurrent%@example.com'
  );
```

**Очакван статус:** ✅ PASS if all users processed without errors

---

## Performance Tests (Тестове за Производителност)

### Test Case 11: Workflow Execution Time

```sql
-- Measure average execution time
WITH workflow_times AS (
    SELECT
        user_id,
        MIN(created_at) FILTER (WHERE event_type = 'registry_check_started') as start_time,
        MAX(created_at) FILTER (WHERE event_type IN ('verification_completed', 'verification_failed')) as end_time
    FROM verification_logs
    WHERE created_at > NOW() - INTERVAL '1 hour'
    GROUP BY user_id
)
SELECT
    COUNT(*) as total_workflows,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_seconds,
    MIN(EXTRACT(EPOCH FROM (end_time - start_time))) as min_seconds,
    MAX(EXTRACT(EPOCH FROM (end_time - start_time))) as max_seconds
FROM workflow_times
WHERE end_time IS NOT NULL;

-- Expected: avg_seconds < 120 (2 minutes)
```

### Test Case 12: Database Performance

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT
    up.id,
    up.name,
    up.status,
    vbp.sms_verification_code,
    vbp.email_confirmation_code
FROM users_pending up
LEFT JOIN verified_business_profiles vbp ON up.id = vbp.user_id
WHERE up.status IN ('awaiting_sms', 'awaiting_email')
ORDER BY up.created_at DESC
LIMIT 100;

-- Expected: Execution time < 50ms with indexes
```

## Cleanup (Почистване)

### Изтриване на тестови данни (Delete Test Data)

```sql
-- Delete test users and related data
DELETE FROM verification_logs
WHERE user_id IN (
    SELECT id FROM users_pending
    WHERE email LIKE '%test%@example.com'
       OR email LIKE 'concurrent%@example.com'
);

DELETE FROM verified_business_profiles
WHERE email LIKE '%test%@example.com'
   OR email LIKE 'concurrent%@example.com';

DELETE FROM users_pending
WHERE email LIKE '%test%@example.com'
   OR email LIKE 'concurrent%@example.com';

DELETE FROM webhook_queue
WHERE payload->>'record'->>'email' LIKE '%test%@example.com';

-- Verify cleanup
SELECT COUNT(*) FROM users_pending WHERE email LIKE '%test%@example.com';
-- Should return 0
```

## Test Summary Template

```markdown
## Test Execution Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Production / Staging / Development

### Test Results

| Test Case | Status | Duration | Notes |
|-----------|--------|----------|-------|
| TC1: Basic User Creation | ✅ PASS | 2s | - |
| TC2: Profile Creation Flow | ✅ PASS | 45s | - |
| TC3: SMS Only Verification | ✅ PASS | 30s | - |
| TC4: Email Only Verification | ✅ PASS | 35s | - |
| TC5: Airtop SMS Extraction | ✅ PASS | 25s | - |
| TC6: Airtop Email Extraction | ✅ PASS | 40s | - |
| TC7: Webhook Queue Processing | ✅ PASS | 5s | - |
| TC8: Error Handling | ✅ PASS | 3s | - |
| TC9: Manual Trigger | ✅ PASS | 8s | - |
| TC10: Concurrent Users | ✅ PASS | 90s | - |
| TC11: Performance | ✅ PASS | - | Avg: 85s |
| TC12: Database Performance | ✅ PASS | - | 15ms |

### Issues Found
- None / List issues here

### Recommendations
- Add your recommendations here

### Sign-off
- [ ] All tests passed
- [ ] Ready for production deployment
```

## Automated Testing Script

```bash
#!/bin/bash
# automated-test.sh

echo "Running Wallestars Profile Automation Tests..."

# Test 1: Basic User Creation
echo "Test 1: Creating test user..."
psql "$DATABASE_URL" -c "
INSERT INTO users_pending (name, email, phone, status)
VALUES ('Automated Test', 'autotest@example.com', '+359888999999', 'pending')
RETURNING id;
" > /tmp/test1_result.txt

# Wait for processing
sleep 10

# Check results
psql "$DATABASE_URL" -c "
SELECT COUNT(*) as profile_count FROM verified_business_profiles
WHERE email = 'autotest@example.com';
" > /tmp/test1_validation.txt

# Add more automated tests...

echo "Tests complete. Check /tmp/test*.txt for results."
```

## Мониторинг на Живо (Live Monitoring)

```sql
-- Real-time monitoring query (run in watch mode)
SELECT
    (SELECT COUNT(*) FROM users_pending WHERE status = 'pending') as pending,
    (SELECT COUNT(*) FROM users_pending WHERE status = 'processing') as processing,
    (SELECT COUNT(*) FROM users_pending WHERE status = 'awaiting_sms') as awaiting_sms,
    (SELECT COUNT(*) FROM users_pending WHERE status = 'awaiting_email') as awaiting_email,
    (SELECT COUNT(*) FROM users_pending WHERE status = 'verified') as verified,
    (SELECT COUNT(*) FROM users_pending WHERE status = 'failed') as failed,
    (SELECT COUNT(*) FROM webhook_queue WHERE status = 'pending') as queued_webhooks,
    NOW() as check_time;
```

Use with:
```bash
watch -n 5 'psql "$DATABASE_URL" -f monitoring_query.sql'
```

## Заключение (Conclusion)

След успешното изпълнение на всички тестове:
1. ✅ Документирайте резултатите
2. ✅ Архивирайте тестовите данни
3. ✅ Създайте production deployment checklist
4. ✅ Обучете екипа за използване на системата

After successfully executing all tests:
1. ✅ Document the results
2. ✅ Archive test data
3. ✅ Create production deployment checklist
4. ✅ Train team on system usage
