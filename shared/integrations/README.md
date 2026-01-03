# API Integrations

Централизирани интеграции с външни сървиси и APIs.

## Налични интеграции

### Supabase
Database и authentication услуги.

```javascript
const { supabaseClient } = require('../shared/integrations/supabase');

// Usage
const { data, error } = await supabaseClient
  .from('users')
  .select('*');
```

### OpenAI
AI модели и генерация на съдържание.

```javascript
const { openaiClient } = require('../shared/integrations/openai');

// Usage
const completion = await openaiClient.createCompletion({
  model: 'gpt-4',
  prompt: 'Your prompt here'
});
```

### Google Sheets
Data storage и синхронизация.

```javascript
const { sheetsClient } = require('../shared/integrations/google-sheets');

// Usage
const data = await sheetsClient.getSheetData('spreadsheetId', 'Sheet1');
```

### Social Media APIs

#### Telegram
```javascript
const { telegramClient } = require('../shared/integrations/telegram');
```

#### Instagram
```javascript
const { instagramClient } = require('../shared/integrations/instagram');
```

## Конфигурация

Всяка интеграция изисква environment variables:

```bash
# Supabase
SUPABASE_URL=your_url
SUPABASE_KEY=your_key

# OpenAI
OPENAI_API_KEY=your_key

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS=path_to_credentials.json

# Telegram
TELEGRAM_API_ID=your_id
TELEGRAM_API_HASH=your_hash
```

## Adding New Integration

1. Create new file in `integrations/`
2. Implement client with standard interface
3. Add configuration template
4. Export client
5. Document in this README
6. Add tests

## Best Practices

- Use environment variables for credentials
- Implement retry logic for API calls
- Add rate limiting
- Log API calls and errors
- Cache responses when appropriate
