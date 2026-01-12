# N8N Workflow Templates

This directory contains n8n workflow templates for the Registry & Verification Architect system.

## Workflows

### 1. Registry Local Worker (`registry-local-worker.json`)
- **Purpose**: Business verification via CompanyBook API
- **Trigger**: Webhook (`POST /webhook/registry-check`)
- **Flow**: Read pending users → Search business → Get details → Filter EOOD/ET → Enrich data → Save to Supabase

### 2. SMS Monitor (`sms-monitor.json`)
- **Purpose**: Monitor SMS verification codes
- **Trigger**: Schedule (every 30 seconds)
- **Flow**: Poll smstome.com → Extract codes via regex → Match pending requests → Update verification status

### 3. Email Monitor (`email-monitor.json`)
- **Purpose**: Monitor email verification links/codes
- **Trigger**: IMAP watcher (Hostinger)
- **Flow**: Watch inbox → Extract verification data → Match 33mail alias → Update profile

## Import Instructions

1. Open n8n dashboard at https://n8n.srv1201204.hstgr.cloud
2. Click **Create workflow** or **Import from file**
3. Select the JSON file
4. Configure credentials:
   - Supabase API credentials
   - CompanyBook API headers (for registry-local-worker)
   - Smstome.com API credentials (for sms-monitor)
   - Hostinger IMAP credentials (for email-monitor)
5. Activate the workflow

## Required Environment Variables

```env
COMPANYBOOK_API_URL=https://api.companybook.bg
COMPANYBOOK_API_KEY=your_api_key
SMSTOME_API_URL=https://api.smstome.com
SMSTOME_API_KEY=your_api_key
```

## Required Supabase Tables

Run the schema from `../supabase/schema.sql` to create:
- `users_pending` - Users awaiting verification
- `verified_business_profiles` - Verified business data
- `verification_logs` - Audit trail
