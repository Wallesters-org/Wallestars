# Платформа за извличане и обработка на имейли

## Описание

Платформа за автоматизирано извличане, обработка и организиране на имейли от различни източници.

## Функционалности

### 1. Извличане на имейли
- Автоматично извличане от различни email providers
- Поддръжка на IMAP/POP3 протоколи
- Batch обработка на големи обеми

### 2. Обработка и анализ
- Класификация на имейли (важни, спам, промоционални)
- Извличане на ключова информация
- Откриване на patterns и trends

### 3. Организация
- Автоматично категоризиране
- Tagging система
- Приоритизация

### 4. Интеграции
- Gmail API
- Outlook/Exchange
- Custom SMTP/IMAP сървъри
- Supabase за съхранение

## Архитектура

```
Email Sources → Extraction Module → Processing Pipeline → Database → UI Dashboard
                       ↓                      ↓
                  Rate Limiting         AI Classification
```

## Използване

### Setup
1. Конфигуриране на email accounts
2. Задаване на extraction правила
3. Настройка на classification логика

### API Endpoints

```
POST /api/emails/extract
GET /api/emails/list
GET /api/emails/categories
PUT /api/emails/{id}/classify
```

## Конфигурация

```json
{
  "email_accounts": [
    {
      "type": "gmail",
      "credentials": "path/to/credentials",
      "filters": ["important", "unread"]
    }
  ],
  "processing": {
    "batch_size": 100,
    "frequency": "hourly"
  }
}
```

## Deployment

Вижте `DEPLOYMENT.md` за детайлни инструкции.
