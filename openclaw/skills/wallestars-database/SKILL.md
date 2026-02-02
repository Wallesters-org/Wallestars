---
name: "Wallestars Database"
description: "Query and manage Wallestars database via Supabase"
icon: "🗄️"
version: "1.0.0"
author: "Wallestars"
requires:
  - "@supabase/supabase-js"
env:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
---

# Wallestars Database Skill

## Description

This skill provides Molty with access to the Wallestars Supabase database for querying verified owners, companies, and managing registration data.

## Capabilities

### Query Verified Owners
Search and retrieve verified owner records.

**Filters:**
- `full_name` - Search by full name (partial match)
- `owner_first_name_en` - Search by English first name
- `owner_last_name_en` - Search by English last name
- `processing_status` - Filter by status (pending, processing, completed, failed)

### Get Owner Details
Retrieve complete details for a specific owner including their companies.

**Input:**
- `owner_id` - UUID of the owner

**Output:**
- Owner profile data
- Companies in waiting_list
- Allocated phone and email
- Processing status

### Query Companies
Search for companies by EIK or name.

**Input:**
- `eik` - Bulgarian company registration number
- `company_name` - Company name (partial match)

### Get Phone Pool Status
Check available phone numbers for SMS verification.

**Output:**
- Total numbers in pool
- Available numbers
- Numbers in use
- Numbers in cooldown

### Log Verification Event
Record verification events in the audit log.

**Input:**
- `owner_id` - Owner UUID
- `event_type` - Type of event
- `event_data` - Additional data (JSON)

## Usage Examples

### Finding an Owner
```
User: Find owner named Иван Петров
Molty: 🔍 Searching for "Иван Петров"...

       Found 1 owner:
       ┌─────────────────────────────────────┐
       │ ID: abc-123-def-456                 │
       │ Name: Иван Петров                   │
       │ English: Ivan Petrov                │
       │ Status: pending                     │
       │ Companies: 2 waiting                │
       └─────────────────────────────────────┘
```

### Checking Phone Pool
```
User: How many phones are available?
Molty: 📱 Phone Pool Status:
       - Total: 10
       - Available: 7
       - In Use: 2
       - Cooldown: 1
```

## Security

- Read-only access to sensitive tables
- Write access only for logs and status updates
- All queries are logged
- Rate limited to 100 queries per minute
