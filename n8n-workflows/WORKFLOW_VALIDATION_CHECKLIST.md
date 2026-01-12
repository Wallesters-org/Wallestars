# N8N Workflow Validation Checklist

## Pre-Deployment Validation

Use this checklist to ensure all n8n workflows are correctly configured before activation.

---

## 1. Environment Variables Validation

### Required Variables

```bash
# Verify all required environment variables are set
# Run this in your server environment

echo "Checking N8N Integration..."
[ -n "$N8N_WEBHOOK_URL" ] && echo "✅ N8N_WEBHOOK_URL" || echo "❌ N8N_WEBHOOK_URL missing"
[ -n "$N8N_API_KEY" ] && echo "✅ N8N_API_KEY" || echo "❌ N8N_API_KEY missing"

echo -e "\nChecking SMS Service..."
[ -n "$SMSTOME_API_URL" ] && echo "✅ SMSTOME_API_URL" || echo "❌ SMSTOME_API_URL missing"
[ -n "$SMSTOME_API_KEY" ] && echo "✅ SMSTOME_API_KEY" || echo "❌ SMSTOME_API_KEY missing"

echo -e "\nChecking CompanyBook API..."
[ -n "$COMPANYBOOK_API_URL" ] && echo "✅ COMPANYBOOK_API_URL" || echo "❌ COMPANYBOOK_API_URL missing"
[ -n "$COMPANYBOOK_API_KEY" ] && echo "✅ COMPANYBOOK_API_KEY" || echo "❌ COMPANYBOOK_API_KEY missing"

echo -e "\nChecking Supabase..."
[ -n "$SUPABASE_URL" ] && echo "✅ SUPABASE_URL" || echo "❌ SUPABASE_URL missing"
[ -n "$SUPABASE_KEY" ] && echo "✅ SUPABASE_KEY" || echo "❌ SUPABASE_KEY missing"
[ -n "$SUPABASE_CREDENTIAL_ID" ] && echo "✅ SUPABASE_CREDENTIAL_ID" || echo "❌ SUPABASE_CREDENTIAL_ID missing"

echo -e "\nChecking Hostinger IMAP..."
[ -n "$HOSTINGER_EMAIL" ] && echo "✅ HOSTINGER_EMAIL" || echo "❌ HOSTINGER_EMAIL missing"
[ -n "$HOSTINGER_PASSWORD" ] && echo "✅ HOSTINGER_PASSWORD" || echo "❌ HOSTINGER_PASSWORD missing"
[ -n "$HOSTINGER_IMAP_CREDENTIAL_ID" ] && echo "✅ HOSTINGER_IMAP_CREDENTIAL_ID" || echo "❌ HOSTINGER_IMAP_CREDENTIAL_ID missing"
```

### Validation Status
- [ ] All environment variables configured
- [ ] .env file created from .env.example
- [ ] Environment variables loaded in shell session
- [ ] Sensitive values not committed to git

---

## 2. N8N Credentials Validation

### Supabase Credential
- [ ] Credential created in N8N
- [ ] Credential ID noted: `________________`
- [ ] Host configured (without https://)
- [ ] Service key entered
- [ ] Test connection successful

**Test Command:**
```bash
# Test Supabase connection
curl -X GET "$SUPABASE_URL/rest/v1/users_pending?select=*&limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY"
```

Expected: HTTP 200 with JSON response

### Hostinger IMAP Credential
- [ ] Credential created in N8N
- [ ] Credential ID noted: `________________`
- [ ] Host: `imap.hostinger.com`
- [ ] Port: `993`
- [ ] Security: `SSL/TLS`
- [ ] Email entered
- [ ] Password entered
- [ ] Test connection successful

**Test Command:**
```bash
# Test IMAP connection
openssl s_client -connect imap.hostinger.com:993 -quiet
# Type: a1 LOGIN "your_email@hostinger.com" "your_password"
# Should see: a1 OK LOGIN completed
```

### Smstome HTTP Header Auth
- [ ] Credential created in N8N
- [ ] Header name: `Authorization`
- [ ] Header value: `Bearer your_api_key`
- [ ] Test API call successful

**Test Command:**
```bash
# Test Smstome API
curl -X GET "$SMSTOME_API_URL/messages?status=unread&limit=1" \
  -H "Authorization: Bearer $SMSTOME_API_KEY"
```

Expected: HTTP 200 with messages array

### CompanyBook HTTP Header Auth
- [ ] Credential created in N8N
- [ ] Header name: `X-API-Key`
- [ ] Header value: `your_api_key`
- [ ] Test API call successful

**Test Command:**
```bash
# Test CompanyBook API
curl -X GET "$COMPANYBOOK_API_URL/api/people?name=Test" \
  -H "X-API-Key: $COMPANYBOOK_API_KEY"
```

Expected: HTTP 200 with people search results

---

## 3. Workflow Configuration Validation

### Registry Local Worker Workflow

#### Workflow Import
- [ ] Workflow imported to N8N
- [ ] Workflow saved with name: "Registry Local Worker"
- [ ] Webhook URL obtained: `________________`
- [ ] All nodes visible in workflow editor

#### Node Configuration Check

**Node 1: Webhook Trigger**
- [ ] Path: `registry-check`
- [ ] Method: `POST`
- [ ] Response mode: `lastNode`

**Node 2: Supabase Read Pending**
- [ ] Credential ID updated to actual ID
- [ ] Table: `users_pending`
- [ ] Filter: `status=eq.pending`
- [ ] Limit: `50`

**Node 3: CompanyBook People Search**
- [ ] URL uses `{{$env.COMPANYBOOK_API_URL}}`
- [ ] HTTP Header Auth credential attached
- [ ] Query parameter: `name={{$json.name}}`

**Node 4: Get Profile Details**
- [ ] URL pattern: `/people/{{$json.id}}`
- [ ] Query parameter: `with_data=true`

**Node 5: Get Ownership Details**
- [ ] URL pattern: `/relationships/{{$json.id}}`
- [ ] Query parameter: `type=ownership`

**Node 6: Filter EOOD/ET**
- [ ] Filter type: `string`
- [ ] Regex: `^(EOOD|ET)$`
- [ ] Field: `business_type`

**Node 7: Enrich Data**
- [ ] VAT number generation logic present
- [ ] Email alias generation logic present
- [ ] Address parsing logic present

**Node 8: Supabase Upsert Profile**
- [ ] Credential ID updated to actual ID
- [ ] Table: `verified_business_profiles`
- [ ] Operation: `upsert`
- [ ] Conflict type: `id`

#### Workflow Test
```bash
# Test webhook endpoint
curl -X POST "${N8N_WEBHOOK_URL}/webhook/registry-check" \
  -H "Content-Type: application/json"
```

- [ ] Webhook responds (HTTP 200 or 400)
- [ ] Execution appears in N8N Executions tab
- [ ] No errors in execution log
- [ ] Test data appears in Supabase

---

### SMS Monitor Workflow

#### Workflow Import
- [ ] Workflow imported to N8N
- [ ] Workflow saved with name: "SMS Monitor"
- [ ] Schedule trigger configured
- [ ] All nodes visible in workflow editor

#### Node Configuration Check

**Node 1: Schedule Trigger**
- [ ] Type: `scheduleTrigger`
- [ ] Interval: `30 seconds`
- [ ] Enabled: `true`

**Node 2: Poll Smstome.com**
- [ ] URL uses `{{$env.SMSTOME_API_URL}}/messages`
- [ ] HTTP Header Auth credential attached
- [ ] Query params: `status=unread`, `limit=10`

**Node 3: Regex Extract Code**
- [ ] Code type: `JavaScript`
- [ ] Regex pattern: `\b(\d{4,6})\b`
- [ ] Outputs: phone, code, raw_message, received_at

**Node 4: Match Pending Request**
- [ ] Credential ID updated to actual ID
- [ ] Table: `users_pending`
- [ ] Filter: `phone=eq.{{$json.phone}},status=eq.awaiting_sms`
- [ ] Limit: `1`

**Node 5: If Match Found**
- [ ] Condition type: `number`
- [ ] Check: `{{$json.length}} > 0`

**Node 6: Set Verification Code**
- [ ] Field 1: `sms_verification_code` = `{{code}}`
- [ ] Field 2: `sms_verified_at` = `{{$now}}`

**Node 7: Update SMS Code**
- [ ] Credential ID updated to actual ID
- [ ] Table: `verified_business_profiles`
- [ ] Operation: `update`
- [ ] Filter: `user_id=eq.{{$json[0].id}}`

#### Workflow Test

**Create Test User:**
```sql
-- In Supabase
INSERT INTO users_pending (name, phone, status)
VALUES ('Test User SMS', '+359888123456', 'awaiting_sms');
```

**Send Test SMS:**
Via Smstome dashboard or API, send SMS to the phone number:
```
Your verification code is: 123456
```

**Wait and Check:**
- [ ] Wait 30 seconds for next poll
- [ ] Check N8N Executions for SMS Monitor
- [ ] Verify execution was successful
- [ ] Check Supabase for updated record:

```sql
SELECT sms_verification_code, sms_verified_at 
FROM verified_business_profiles 
WHERE sms_verification_code = '123456';
```

- [ ] Code matches: `123456`
- [ ] Timestamp is recent

---

### Email Monitor Workflow

#### Workflow Import
- [ ] Workflow imported to N8N
- [ ] Workflow saved with name: "Email Monitor"
- [ ] IMAP trigger configured
- [ ] All nodes visible in workflow editor

#### Node Configuration Check

**Node 1: IMAP Watcher**
- [ ] Type: `emailReadImap`
- [ ] Credential ID updated to actual ID
- [ ] Mailbox: `INBOX`
- [ ] Post-process action: `markRead`

**Node 2: Extract Body**
- [ ] Code type: `JavaScript`
- [ ] Extracts: verification_link, verification_code, email_alias
- [ ] HTML tag removal present
- [ ] Regex patterns: `/https?:\/\/[^\s]+verify[^\s]*/i`, `/\b(\d{6})\b/`, `/([^@]+)@.*\.33mail\.com/`

**Node 3: If Has Alias**
- [ ] Condition type: `string`
- [ ] Check: `{{$json.email_alias}}` isNotEmpty

**Node 4: Match 33mail Alias**
- [ ] Credential ID updated to actual ID
- [ ] Table: `verified_business_profiles`
- [ ] Filter: `email_alias=ilike.%{{$json.email_alias}}%`
- [ ] Limit: `1`

**Node 5: If Profile Found**
- [ ] Condition type: `number`
- [ ] Check: `{{$json.length}} > 0`

**Node 6: Set Email Verification**
- [ ] Field 1: `email_confirmation_code` = `{{verification_code}}`
- [ ] Field 2: `email_verification_link` = `{{verification_link}}`
- [ ] Field 3: `email_verified_at` = `{{$now}}`

**Node 7: Update Email Code**
- [ ] Credential ID updated to actual ID
- [ ] Table: `verified_business_profiles`
- [ ] Operation: `update`
- [ ] Filter: `id=eq.{{$json[0].id}}`

#### Workflow Test

**Create Test Profile:**
```sql
-- In Supabase
INSERT INTO verified_business_profiles 
  (name, email_alias, sms_verified_at)
VALUES 
  ('Test User Email', 'test-user@wallester.33mail.com', NOW());
```

**Send Test Email:**
Send email to: `test-user@wallester.33mail.com`

Subject: `Email Verification`

Body:
```
Your verification code is 789012.

Click here to verify your account:
https://example.com/verify/abc123xyz
```

**Wait and Check:**
- [ ] Wait 5-10 seconds for IMAP trigger
- [ ] Check N8N Executions for Email Monitor
- [ ] Verify execution was successful
- [ ] Check Supabase for updated record:

```sql
SELECT email_confirmation_code, email_verification_link, email_verified_at
FROM verified_business_profiles 
WHERE email_alias = 'test-user@wallester.33mail.com';
```

- [ ] Code matches: `789012`
- [ ] Link matches: `https://example.com/verify/abc123xyz`
- [ ] Timestamp is recent

---

## 4. Supabase Database Validation

### Schema Check

**Table: users_pending**
```sql
-- Verify table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'users_pending';
```
- [ ] Table exists

**Required Columns:**
```sql
-- Verify columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users_pending' 
ORDER BY ordinal_position;
```

- [ ] `id` (uuid)
- [ ] `name` (text)
- [ ] `phone` (text)
- [ ] `email_alias` (text)
- [ ] `status` (text)
- [ ] `created_at` (timestamptz)
- [ ] `updated_at` (timestamptz)

**Table: verified_business_profiles**
```sql
-- Verify table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'verified_business_profiles';
```
- [ ] Table exists

**Required Columns:**
```sql
-- Verify columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'verified_business_profiles' 
ORDER BY ordinal_position;
```

- [ ] `id` (uuid)
- [ ] `user_id` (uuid)
- [ ] `name` (text)
- [ ] `eik` (text)
- [ ] `vat_number` (text)
- [ ] `business_type` (text)
- [ ] `email_alias` (text)
- [ ] `address` (jsonb)
- [ ] `sms_verification_code` (text)
- [ ] `sms_verified_at` (timestamptz)
- [ ] `email_confirmation_code` (text)
- [ ] `email_verification_link` (text)
- [ ] `email_verified_at` (timestamptz)
- [ ] `created_at` (timestamptz)
- [ ] `updated_at` (timestamptz)

### Indexes Check
```sql
-- Verify indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'verified_business_profiles';
```

- [ ] Index on `email_alias`
- [ ] Index on `sms_verified_at`
- [ ] Index on `email_verified_at`

### RLS Policies (if enabled)
- [ ] Row Level Security configured appropriately
- [ ] Service role key has full access
- [ ] Anon key has appropriate read/write permissions

---

## 5. Workflow Activation Validation

### Activation Status

**In N8N Dashboard:**
- [ ] Navigate to Workflows
- [ ] Locate "Registry Local Worker"
  - [ ] Active toggle is ON (green)
  - [ ] No error indicators
- [ ] Locate "SMS Monitor"
  - [ ] Active toggle is ON (green)
  - [ ] Schedule is running
  - [ ] No error indicators
- [ ] Locate "Email Monitor"
  - [ ] Active toggle is ON (green)
  - [ ] IMAP connection active
  - [ ] No error indicators

### Recent Executions Check

**SMS Monitor:**
- [ ] Navigate to Executions
- [ ] Filter by workflow: "SMS Monitor"
- [ ] Recent execution exists (within last 30 seconds)
- [ ] Status: Success (green checkmark)
- [ ] Click execution to view details
  - [ ] All nodes executed
  - [ ] No error messages

**Email Monitor:**
- [ ] Navigate to Executions
- [ ] Filter by workflow: "Email Monitor"
- [ ] IMAP connection established
- [ ] Waiting for emails (no errors)

**Registry Local Worker:**
- [ ] Navigate to Executions
- [ ] Filter by workflow: "Registry Local Worker"
- [ ] Test execution exists (from webhook test)
- [ ] Status: Success or handled error (if no test data)

---

## 6. End-to-End Integration Test

### Test Scenario: Complete Verification Flow

**Step 1: Create Test User**
```sql
INSERT INTO users_pending (name, phone, email_alias, status)
VALUES ('E2E Test Business EOOD', '+359888999000', 'e2e-test', 'pending');
```
- [ ] Record created successfully
- [ ] Status is 'pending'

**Step 2: Trigger Registry Check**
```bash
curl -X POST "${N8N_WEBHOOK_URL}/webhook/registry-check" \
  -H "Content-Type: application/json"
```
- [ ] HTTP 200 response received
- [ ] Check N8N execution log
- [ ] No errors in execution

**Step 3: Verify Registry Result**
```sql
SELECT * FROM verified_business_profiles 
WHERE email_alias LIKE '%e2e-test%';
```
- [ ] Profile created
- [ ] `vat_number` populated
- [ ] `email_alias` = `e2e-test@wallester.33mail.com` (or similar)
- [ ] `business_type` is 'EOOD' or 'ET' (if real business found)

**Step 4: Send Test SMS**
- [ ] Send SMS via Smstome to `+359888999000`
- [ ] Message: "Your code is 111222"
- [ ] Wait 30 seconds

**Step 5: Verify SMS Capture**
```sql
SELECT sms_verification_code, sms_verified_at 
FROM verified_business_profiles 
WHERE email_alias LIKE '%e2e-test%';
```
- [ ] `sms_verification_code` = '111222'
- [ ] `sms_verified_at` is set

**Step 6: Send Test Email**
- [ ] Send email to alias from profile
- [ ] Subject: "Verify Email"
- [ ] Body includes: "Code: 333444" and "Link: https://test.com/verify"
- [ ] Wait 10 seconds

**Step 7: Verify Email Capture**
```sql
SELECT email_confirmation_code, email_verification_link, email_verified_at
FROM verified_business_profiles 
WHERE email_alias LIKE '%e2e-test%';
```
- [ ] `email_confirmation_code` = '333444'
- [ ] `email_verification_link` contains 'verify'
- [ ] `email_verified_at` is set

**Step 8: Full Verification Check**
```sql
SELECT 
  sms_verified_at IS NOT NULL AS sms_ok,
  email_verified_at IS NOT NULL AS email_ok,
  (sms_verified_at IS NOT NULL AND email_verified_at IS NOT NULL) AS fully_verified
FROM verified_business_profiles 
WHERE email_alias LIKE '%e2e-test%';
```
- [ ] `sms_ok` = true
- [ ] `email_ok` = true
- [ ] `fully_verified` = true

✅ **End-to-End Test PASSED**

---

## 7. Performance Validation

### SMS Monitor Performance

**Test Polling Speed:**
- [ ] Check 5 consecutive executions in N8N
- [ ] Verify interval between executions ≈ 30 seconds
- [ ] Average execution time < 5 seconds

**Test OTP Extraction:**
- [ ] Send 3 SMS with different formats:
  - "Code: 1234"
  - "Your verification code is 12345"
  - "OTP 123456"
- [ ] All codes extracted correctly

### Email Monitor Performance

**Test Real-time Trigger:**
- [ ] Send email to test alias
- [ ] Time from send to N8N execution: < 30 seconds
- [ ] Execution completes in < 10 seconds

**Test Multiple Formats:**
- [ ] Email with just code
- [ ] Email with just link
- [ ] Email with both code and link
- [ ] All data extracted correctly

### Registry Worker Performance

**Test API Response Time:**
- [ ] Trigger webhook with test data
- [ ] Total execution time < 15 seconds
- [ ] All API calls successful (no timeouts)

---

## 8. Error Handling Validation

### Test Error Scenarios

**SMS Monitor Errors:**
- [ ] Smstome API down → Workflow continues, logs error
- [ ] No matching user → No error, continues to next poll
- [ ] Supabase update fails → Error logged, alert sent

**Email Monitor Errors:**
- [ ] IMAP connection lost → Workflow retries automatically
- [ ] No alias match → No error, continues watching
- [ ] Malformed email → Extracts available data, continues

**Registry Worker Errors:**
- [ ] CompanyBook API timeout → Error logged, returns error response
- [ ] Invalid business type → Filtered out, no profile created
- [ ] Supabase upsert fails → Error logged in execution

---

## 9. Security Validation

### Credentials Security
- [ ] No API keys hardcoded in workflow JSON
- [ ] All credentials use N8N credential system
- [ ] .env file in .gitignore
- [ ] No secrets in git history

### Network Security
- [ ] All API calls use HTTPS
- [ ] IMAP uses SSL/TLS (port 993)
- [ ] Webhook endpoint accessible only from expected IPs (if configured)

### Data Security
- [ ] Verification codes not logged in plain text
  - Implementation: Use console.log('Code verified: [REDACTED]') instead of logging actual codes
  - N8N workflows should avoid outputting sensitive data in execution logs
- [ ] Email content not stored permanently
  - Implementation: Email Monitor marks emails as read and doesn't store full body
  - Only extract and store: verification_code, verification_link, timestamp
- [ ] Old codes cleared after verification
  - Implementation: Add scheduled workflow to clear codes older than 24 hours:
    ```sql
    -- Clear SMS codes that are older than 24 hours after SMS verification
    UPDATE verified_business_profiles
    SET sms_verification_code = NULL
    WHERE sms_verified_at IS NOT NULL
      AND sms_verified_at < NOW() - INTERVAL '24 hours'
      AND sms_verification_code IS NOT NULL;
    
    -- Clear Email codes that are older than 24 hours after Email verification
    UPDATE verified_business_profiles
    SET email_confirmation_code = NULL,
        email_verification_link = NULL
    WHERE email_verified_at IS NOT NULL
      AND email_verified_at < NOW() - INTERVAL '24 hours'
      AND (email_confirmation_code IS NOT NULL OR email_verification_link IS NOT NULL);
    ```
  - Schedule: Daily at 2 AM
  - Retention policy: Keep codes for 24 hours post-verification for audit

---

## 10. Documentation Validation

### Documentation Completeness
- [ ] VERIFICATION_WORKFLOWS_GUIDE.md exists and is up-to-date
- [ ] WORKFLOW_VALIDATION_CHECKLIST.md exists (this file)
- [ ] README.md references verification workflows
- [ ] IMPLEMENTATION_GUIDE.md includes verification setup steps
- [ ] .env.example includes all required variables

### Documentation Accuracy
- [ ] All credential IDs match actual N8N setup
- [ ] All API endpoints are correct
- [ ] All example commands work
- [ ] Troubleshooting section is complete

---

## Final Sign-Off

### Pre-Production Checklist
- [ ] All environment variables configured
- [ ] All N8N credentials created and tested
- [ ] All workflows imported and active
- [ ] Supabase schema created and verified
- [ ] End-to-end test completed successfully
- [ ] Performance validated
- [ ] Error handling tested
- [ ] Security measures in place
- [ ] Documentation complete and accurate

### Production Readiness
- [ ] Workflows running for 24 hours without errors
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Team trained on monitoring dashboards

### Sign-Off
- Date: ________________
- Validated by: ________________
- Production deployment approved: [ ] Yes [ ] No

---

## Validation Summary

**Total Checkpoints:** 150+

**Categories:**
- Environment Variables: 20 checks
- N8N Credentials: 25 checks
- Workflow Configuration: 50 checks
- Database Schema: 20 checks
- Activation Status: 10 checks
- Integration Testing: 15 checks
- Performance: 10 checks
- Error Handling: 10 checks
- Security: 10 checks
- Documentation: 10 checks

**Recommendation:**
Complete at least 90% of checkpoints before production deployment.

---

## Quick Validation Script

Save this as `validate-workflows.sh`:

```bash
#!/bin/bash

echo "=== N8N Workflow Validation ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Environment Variables
echo "1. Environment Variables:"
[ -n "$N8N_WEBHOOK_URL" ] && echo -e "${GREEN}✅${NC} N8N_WEBHOOK_URL" || echo -e "${RED}❌${NC} N8N_WEBHOOK_URL"
[ -n "$SMSTOME_API_KEY" ] && echo -e "${GREEN}✅${NC} SMSTOME_API_KEY" || echo -e "${RED}❌${NC} SMSTOME_API_KEY"
[ -n "$COMPANYBOOK_API_KEY" ] && echo -e "${GREEN}✅${NC} COMPANYBOOK_API_KEY" || echo -e "${RED}❌${NC} COMPANYBOOK_API_KEY"
[ -n "$SUPABASE_URL" ] && echo -e "${GREEN}✅${NC} SUPABASE_URL" || echo -e "${RED}❌${NC} SUPABASE_URL"
[ -n "$HOSTINGER_EMAIL" ] && echo -e "${GREEN}✅${NC} HOSTINGER_EMAIL" || echo -e "${RED}❌${NC} HOSTINGER_EMAIL"

echo ""
echo "2. API Connectivity:"

# Test Smstome API
if curl -s -o /dev/null -w "%{http_code}" "$SMSTOME_API_URL/messages?limit=1" \
  -H "Authorization: Bearer $SMSTOME_API_KEY" | grep -q "200"; then
  echo -e "${GREEN}✅${NC} Smstome API"
else
  echo -e "${RED}❌${NC} Smstome API"
fi

# Test CompanyBook API
if curl -s -o /dev/null -w "%{http_code}" "$COMPANYBOOK_API_URL/api/people?name=Test" \
  -H "X-API-Key: $COMPANYBOOK_API_KEY" | grep -q "200"; then
  echo -e "${GREEN}✅${NC} CompanyBook API"
else
  echo -e "${RED}❌${NC} CompanyBook API"
fi

# Test Supabase
if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/users_pending?limit=1" \
  -H "apikey: $SUPABASE_KEY" | grep -q "200"; then
  echo -e "${GREEN}✅${NC} Supabase API"
else
  echo -e "${RED}❌${NC} Supabase API"
fi

# Test IMAP
if openssl s_client -connect imap.hostinger.com:993 -quiet </dev/null 2>&1 | grep -q "OK"; then
  echo -e "${GREEN}✅${NC} Hostinger IMAP"
else
  echo -e "${RED}❌${NC} Hostinger IMAP"
fi

echo ""
echo "3. N8N Webhook:"

# Test Registry Webhook
if curl -s -o /dev/null -w "%{http_code}" -X POST "$N8N_WEBHOOK_URL/webhook/registry-check" | grep -q "200\|400"; then
  echo -e "${GREEN}✅${NC} Registry Webhook Accessible"
else
  echo -e "${RED}❌${NC} Registry Webhook Accessible"
fi

echo ""
echo "=== Validation Complete ==="
```

Run with:
```bash
chmod +x validate-workflows.sh
./validate-workflows.sh
```
