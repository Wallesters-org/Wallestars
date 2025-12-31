# Multiple Phone Numbers Management Platform

## Описание

Платформа за управление на множество телефонни номера с функционалности за мониторинг, OTP обработка и data tracking.

## Функционалности

### 1. Номера Management
- Следене за нови номера
- Премахване на използвани
- Организация по категории
- Статус индикатори

### 2. OTP обработка
- Автоматично получаване на OTP кодове
- SMS forwarding
- Multi-device синхронизация
- История на получени кодове

### 3. Data Tracking
- Дати на използване
- Свързани сървиси
- Verification история
- Статистики

### 4. Автоматизации
- Auto-renewal при нужда
- Rotation логика
- Cleanup на стари номера
- Bulk операции

## Архитектура

```
Phone Numbers API → Number Pool Manager → OTP Handler → Database
                            ↓                  ↓
                    Status Monitor      SMS Gateway
```

## Providers Integration

### Поддържани доставчици:
- Twilio
- Nexmo/Vonage
- SMS-Activate
- Custom SMS API

## Dashboard Features

### Numbers View
- List all numbers
- Filter by status/provider
- Search functionality
- Bulk actions

### OTP Monitor
- Real-time OTP receiving
- Auto-copy to clipboard
- History log
- Service associations

### Analytics
- Usage statistics
- Cost tracking
- Success rates
- Provider performance

## API Endpoints

```
GET /api/numbers - List all phone numbers
POST /api/numbers/add - Add new number
DELETE /api/numbers/{id} - Remove number
GET /api/numbers/{id}/otp - Get OTP codes for number
POST /api/numbers/rotate - Rotate numbers pool
```

## Configuration

```json
{
  "providers": [
    {
      "name": "twilio",
      "api_key": "${TWILIO_API_KEY}",
      "enabled": true,
      "max_numbers": 50
    }
  ],
  "otp": {
    "auto_forward": true,
    "retention_days": 30,
    "notify_on_receive": true
  },
  "rotation": {
    "enabled": true,
    "interval_days": 90,
    "keep_active_count": 10
  }
}
```

## Use Cases

### Use Case 1: Social Media Verification
```
1. Get available number
2. Use for account creation
3. Receive OTP automatically
4. Mark as used for platform X
5. Schedule for rotation after 3 months
```

### Use Case 2: Multi-account Management
```
- Maintain pool of 20 numbers
- Assign to different services
- Track verification history
- Auto-rotate unused numbers
```

## Security

- Encrypted storage
- Access logs
- Rate limiting
- Provider credential security

## Best Practices

1. **Regular rotation** - Rotate numbers every 60-90 days
2. **Provider diversity** - Use multiple providers
3. **Cost optimization** - Release unused numbers
4. **Backup** - Keep critical number records
5. **Monitoring** - Track success rates and issues
