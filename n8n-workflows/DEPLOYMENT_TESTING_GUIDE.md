# N8N Workflows - Deployment и Testing Guide

## 📊 Текущо Състояние (2026-01-12 07:30)

### Неактивни Workflows (OFF)
| Workflow | Статус | Последна Активност | Проблем |
|----------|--------|-------------------|---------|
| **Wallester Combined (MAIN)** | ❌ OFF | 2 седмици | Няма активност |
| **SMS OTP Scraper** | ❌ OFF | 1 час | Модифициран, неактивен |
| **My workflow 3** | ❌ OFF | Jan 11 | 404 errors на SMS API |
| **My workflow 4** | ❌ OFF | 34 минути | Test webhook |

### Последни Grešки
- **My workflow 3**: `404 Not Found` на `sms-online.co/p/...` (17:29, Jan 11)
- SMS URLs не са достъпни или структурата е променена

---

## ✅ Нови Working Workflows

### 1. `sms-verification-agent-working.json`
**AI Agent-Based SMS Scraper**

**Features:**
- 🤖 Използва Anthropic Claude Agent за web scraping
- 📱 Извлича verification codes от SMS URLs
- 💾 Записва в Supabase автоматично
- 🔄 Webhook trigger за on-demand проверки

**Как работи:**
```
1. Webhook POST → /sms-check
2. AI Agent посещава SMS URL
3. Scrapes последен SMS
4. Извлича 4-6 digit code
5. Update Supabase
6. Return JSON response
```

**Test Request:**
```bash
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook-test/sms-check \
  -H "Content-Type: application/json" \
  -d '{
    "phone_url": "https://sms-online.co/receive-free-sms/12025550198",
    "user_id": "test-user-123",
    "expected_sender": "Wallester"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "code": "123456",
  "verified_at": "2026-01-12T07:30:00Z"
}
```

---

### 2. `agent-task-monitor.json`
**GitHub + N8N Monitoring**

**Runs:** Every 15 minutes  
**Monitors:**
- Open GitHub Issues (P0/P1 agent tasks)
- Failed n8n executions
- Sends alerts за P0 priorities

---

### 3. `implementation-tracker.json`
**Workflow Health Monitor**

**Runs:** Every 10 minutes  
**Tracks:**
- Implemented workflows vs required
- Success rate на executions
- Health score (0-100)
- Alerts при health < 70%

---

## 🚀 Deployment Steps

### Prerequisites
1. **Anthropic API Key** configured в n8n credentials
2. **Supabase API** credentials
3. **N8N** version 1.0+ с AI Agent support

### Import Process

#### Option 1: Via n8n UI
1. Open n8n → Workflows
2. Click `...` menu → **Import from File**
3. Select файла (напр. `sms-verification-agent-working.json`)
4. Click Import
5. Configure credentials:
   - Anthropic API
   - Supabase API
6. **Activate** workflow (toggle ON)

#### Option 2: Via API
```bash
# Get n8n API key from Settings → API
N8N_API_KEY="your_api_key"

# Import workflow
curl -X POST https://n8n.srv1201204.hstgr.cloud/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @sms-verification-agent-working.json


# Activate it
curl -X PATCH https://n8n.srv1201204.hstgr.cloud/api/v1/workflows/{workflow_id} \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d '{"active": true}'
```

---

## 🧪 Testing Guide

### Test 1: SMS Verification Agent

**Manual Test (n8n UI):**
1. Open `SMS Verification Agent - WORKING`
2. Click **Test Workflow** button
3. Provide test data:
```json
{
  "phone_url": "https://sms-online.co/receive-free-sms/12025550198",
  "user_id": "test-123",
  "expected_sender": "Wallester"
}
```
4. Execute and check output

**Via Webhook:**
```bash
# Get webhook URL from workflow settings
WEBHOOK_URL="https://n8n.srv1201204.hstgr.cloud/webhook-test/sms-check"

# Send test request
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "phone_url": "https://receive-smss.com/sms/447520635326/",
    "user_id": "user_001"
  }'
```

### Test 2: Task Monitor
**Automatic** - No action needed, runs every 15 min

**Manual Check:**
1. Create GitHub issue with label `P0` or `agent-task`
2. Wait 15 minutes
3. Check Wallestars API: `/api/webhooks/n8n/agent-monitoring`

### Test 3: Implementation Tracker
**Automatic** - Runs every 10 min

**Check Results:**
```bash
curl http://localhost:3000/api/webhooks/n8n/implementation-status
```

---

## 🔧 Troubleshooting

### Issue: AI Agent 404 Error
**Причина:** SMS URL недостъпен или променен

**Solution:**
1. Провери URL-а в browser
2. Потърси алтернативен phone number:
   - https://receive-smss.com
   - https://sms-online.co
   - https://freephonenum.com
3. Update workflow с нов URL

### Issue: Anthropic API Quota
**Error:** `Rate limit exceeded`

**Solution:**
- Check API usage в Anthropic console
- Implement retry logic с exponential backoff
- Or add delay между requests

### Issue: Supabase Connection
**Error:** `ECONNREFUSED` or `401 Unauthorized`

**Check:**
```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/verified_business_profiles \
  -H "apikey: your_anon_key" \
  -H "Authorization: Bearer your_service_key"
```

---

## 📊 Monitoring Dashboard

Create real-time dashboard:

1. **Wallestars Frontend** - Add visualization page
2. **Endpoints:**
   - `/api/webhooks/n8n/dashboard` - Overall status
   - `/api/webhooks/n8n/agent-monitoring` - Task status
   - `/api/webhooks/n8n/implementation-status` - Health metrics

3. **Display:**
   - Active workflows count
   - Recent executions (success/fail)
   - P0 tasks pending
   - Health score trend

---

## 📝 Next Steps

1. **Import workflows** в n8n
2. **Configure credentials** (Anthropic + Supabase)
3. **Test SMS agent** с real phone URL
4. **Activate monitors** (auto-run)
5. **Monitor dashboard** за errors

---

## 🔗 Resources

- **N8N Docs**: https://docs.n8n.io
- **Anthropic Claude**: https://docs.anthropic.com/claude/reference/messages_post
- **Supabase REST API**: https://supabase.com/docs/reference/javascript

---

**Last Updated**: 2026-01-12 07:30  
**Status**: ✅ Ready for deployment
