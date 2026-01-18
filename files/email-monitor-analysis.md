## Email Monitor Workflow Details

### Architecture
```
┌─────────────────────────────────┐
│  IMAP Watcher (Real-time)       │
│  Host: imap.hostinger.com       │
│  Port: 993 (SSL)                │
│  Folder: INBOX                  │
└────────────┬────────────────────┘
             │ New Email Event
             ▼
┌─────────────────────────────────┐
│  Extract Body                   │
│  - Parse HTML/Text              │
│  - Find verification_code       │
│  - Find verification_link       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  If Has Alias                   │
│  Check for 33mail pattern       │
└────────┬──────────┬─────────────┘
         │ YES      │ NO (skip)
         ▼          ▼
┌──────────────────┐ ┌────────────┐
│ Match 33mail     │ │  End       │
│ Alias in Supabase│ │            │
└────────┬─────────┘ └────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  If Profile Found               │
│  (found matching user)          │
└────────┬──────────┬─────────────┘
         │ YES      │ NO (skip)
         ▼          ▼
┌──────────────────┐ ┌────────────┐
│ Set Email        │ │  End       │
│ Verification     │ │            │
└────────┬─────────┘ └────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Update Email Code (Supabase)   │
│  SET email_confirmation_code=...│
│  SET email_verification_link=... │
│  SET email_verified_at=NOW()    │
└─────────────────────────────────┘
```

### Email Parsing Logic
```javascript
const email = $input.first().json;
const linkMatch = email.html.match(/href="(https: \/\/.*?verify.*?)"/i);
const codeMatch = email.text.match(/code[:\s]+(\d{4,6})/i);

return {
  verification_link: linkMatch ? linkMatch[1] : null,
  verification_code: codeMatch ? codeMatch[1] : null
};
```

### 33mail Alias Matching
```javascript
// Extract alias from email recipient
const to = email.to; // e.g., "unique-alias@33mail.com"
const alias = to.split('@')[0];

// Query Supabase for matching profile
SELECT * FROM verified_business_profiles
WHERE email_alias = '${alias}'
```

### Update Query
```json
{
  "operation": "update",
  "tableId": "verified_business_profiles",
  "filterType": "string",
  "filterString": "id=eq.{{$json[0].id}}",
  "values": {
    "email_confirmation_code": "{{extracted_code}}",
    "email_verification_link": "{{extracted_link}}",
    "email_verified_at": "{{$now}}"
  }
}
```

### Status: ✅ FULLY FUNCTIONAL
- Trigger: Real-time IMAP
- Email parsing: HTML + Text
- Link extraction: Regex-based
- Code extraction: Regex-based
- Auto-update:  Yes
- Real-time:  Instant (IMAP push)