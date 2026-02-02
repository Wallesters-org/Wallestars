# Molty's Long-Term Memory

## System Configuration

### Environment
- **Platform**: Wallestars Business Registration System
- **Database**: Supabase (PostgreSQL)
- **Automation**: n8n workflows
- **Browser Automation**: Airtop with Bulgarian proxy

### Key Tables
- `verified_owners` - Business owners with their companies
- `virtual_phone_numbers` - SMS verification phone pool
- `verification_logs` - Audit trail for all verifications

### Workflows
- `wallesters-registration-main-workflow` - Main registration orchestrator
- `email-otp-extractor-subworkflow` - Gmail OTP extraction
- `airtop-session-create-subworkflow` - Browser session with BG proxy

## User Preferences

<!-- Molty will populate this section as it learns user preferences -->

## Important Decisions

<!-- Record significant decisions made during operation -->

## Durable Facts

### Business Types (Bulgaria)
- **ЕООД** - Еднолично Дружество с Ограничена Отговорност (Single-member LLC)
- **ООД** - Дружество с Ограничена Отговорност (LLC)
- **ЕТ** - Едноличен Търговец (Sole Proprietor)
- **АД** - Акционерно Дружество (Joint-Stock Company)
- **ЕАД** - Еднолично Акционерно Дружество (Single-member JSC)

### Wallesters Registration Steps
1. Navigate to registration URL with promo code
2. Decline cookies popup
3. Fill: Country (Bulgaria), Company Name (EN), Phone
4. Accept legal notice and privacy policy
5. Click Continue
6. Enter SMS OTP code
7. Enter Email address
8. Enter Email OTP code
9. Complete registration

### OTP Timing
- SMS typically arrives within 30-60 seconds
- Email typically arrives within 15-45 seconds
- Maximum wait time: 150 seconds (10 retries × 15 seconds)

## Project Status

<!-- Track ongoing registrations and their status -->

## Action Items

<!-- Pending tasks and follow-ups -->

## Notes

<!-- General notes and observations -->

---

*Last updated: Initialized on setup*
