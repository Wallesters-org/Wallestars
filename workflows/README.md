# Wallestars Workflows - Документация

## Преглед

Тази директория съдържа n8n workflow templates за автоматизация на различни процеси в Wallestars проекта.

## Налични Workflows

### 1. User Contact Automation (`user-contact-automation.json`)

**Описание**: Автоматизира потребителски взаимодействия в GitHub repository чрез AI-базирани отговори.

**Функционалности**:
- Автоматично отговаря на нови GitHub issues
- Категоризира issues с подходящи labels
- Използва Claude AI за генериране на контекстуално релевантни отговори
- Проследява потребителски заявки
- 24/7 моментална поддръжка

**Изисквания**:
- GitHub API credentials
- Claude AI API credentials
- Webhook настроен в GitHub repository

**Конфигурация**:
```javascript
{
  "githubToken": "your-github-token",
  "claudeApiKey": "your-claude-api-key",
  "repositoryOwner": "Wallesters-org",
  "repositoryName": "Wallestars"
}
```

**Използване**:
1. Импортирайте workflow-а в n8n
2. Конфигурирайте GitHub и Claude credentials
3. Актуализирайте repository параметри
4. Активирайте workflow-а
5. Създайте тестов issue за верификация

### 2. DJ Workflow Multi-Chain (`dj-workflow-multichain.json`)

**Описание**: Управлява multi-chain blockchain deployments и маршрутизация.

**Функционалности**:
- Анализира Git commits с Claude AI
- Определя подходяща blockchain мрежа за deployment
- Маршрутизира към Ethereum, Polygon, Solana или други chains
- Актуализира deployment статус в GitHub
- Мониторинг на transaction статус

**Изисквания**:
- GitHub API credentials
- Claude AI API credentials
- Blockchain RPC endpoints
- Smart contract deployment keys (security sensitive!)

**Конфигурация**:
```javascript
{
  "githubToken": "your-github-token",
  "claudeApiKey": "your-claude-api-key",
  "ethereumRPC": "https://mainnet.infura.io/v3/YOUR-KEY",
  "polygonRPC": "https://polygon-rpc.com",
  "solanaRPC": "https://api.mainnet-beta.solana.com"
}
```

**Използване**:
1. Импортирайте workflow-а в n8n
2. Конфигурирайте всички credentials
3. Настройте RPC endpoints
4. Тествайте с test deployment
5. Активирайте за production

## Общи Стъпки за Импортиране

### Стъпка 1: Достъп до n8n

```bash
# Достъп до n8n web интерфейс
https://your-vps-domain.com:5678
```

### Стъпка 2: Импортиране на Workflow

1. Влезте в n8n
2. Кликнете "Workflows" в менюто
3. Кликнете "Import from File"
4. Изберете JSON файла от тази директория
5. Кликнете "Import"

### Стъпка 3: Конфигуриране на Credentials

За всеки node в workflow-а:
1. Кликнете на node-а
2. В секция "Credentials", изберете съществуващ credential или създайте нов
3. Запазете промените

### Стъпка 4: Тестване

1. Кликнете "Execute Workflow" за ръчно тестване
2. Проверете execution log за грешки
3. Верифицирайте очакваните резултати

### Стъпка 5: Активиране

1. Кликнете на toggle в горния десен ъгъл
2. Workflow-ът е активен и ще се изпълнява автоматично при trigger

## Credential Management

### GitHub API Credentials

**Тип**: GitHub API Token  
**Необходими права**:
- `repo` - Full control of repositories
- `workflow` - Update workflows
- `write:discussion` - Write discussions

**Създаване**:
1. GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Изберете необходимите scopes
4. Копирайте token-а

### Claude AI API Credentials

**Тип**: HTTP Header Auth  
**Header Name**: `x-api-key`  
**Header Value**: Your Claude API key

**Получаване**:
1. Достъп до [Anthropic Console](https://console.anthropic.com)
2. Създайте нов API key
3. Копирайте key-а (показва се само веднъж)

**Информация за Claude Pro**: За пълна функционалност се изисква Claude Pro subscription. Вижте [Anthropic AUP](https://www.anthropic.com/legal/aup).

## Webhook Configuration

### GitHub Webhook Setup

1. Отидете на repository Settings → Webhooks
2. Кликнете "Add webhook"
3. Конфигурирайте:
   - **Payload URL**: `https://your-domain.com/webhook/github`
   - **Content type**: `application/json`
   - **Events**: Issues, Pull requests, Discussions
4. Запазете webhook-а

## Тестване на Workflows

### Тестване на User Contact Automation

```bash
# Създайте тестов GitHub issue
curl -X POST \
  https://api.github.com/repos/Wallesters-org/Wallestars/issues \
  -H "Authorization: token YOUR-GITHUB-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue for Automation",
    "body": "This is a test issue to verify the workflow automation."
  }'
```

### Тестване на DJ Workflow Multi-Chain

```bash
# Създайте тестов commit и push
git commit -m "[ethereum] Test deployment" --allow-empty
git push origin main
```

## Troubleshooting

### Workflow не се тригерва

**Възможни причини**:
- Webhook не е правилно конфигуриран
- n8n не е достъпен от интернет
- Firewall блокира входящи заявки
- Workflow не е активиран

**Решения**:
1. Проверете GitHub webhook delivery status
2. Тествайте webhook URL с curl
3. Проверете n8n logs
4. Верифицирайте firewall настройки

### Claude AI грешки

**Възможни причини**:
- Невалиден API key
- Rate limit exceeded
- Невалиден request формат

**Решения**:
1. Верифицирайте API key в credentials
2. Проверете rate limits в Anthropic Console
3. Прегледайте request body в execution log
4. Имплементирайте exponential backoff

### GitHub API грешки

**Възможни причини**:
- Изтекъл token
- Недостатъчни права
- Rate limit exceeded

**Решения**:
1. Регенерирайте GitHub token
2. Проверете token scopes
3. Имплементирайте caching
4. Използвайте conditional requests

## Best Practices

### Security

1. **Никога не commit-вайте credentials** в workflow files
2. **Използвайте n8n credential store** за всички API keys
3. **Ротирайте credentials редовно**
4. **Активирайте HTTPS** за всички connections
5. **Ограничете API token permissions** до минимално необходимото

### Performance

1. **Кеширайте резултати** когато е възможно
2. **Имплементирайте rate limiting**
3. **Използвайте batch operations** за multiple requests
4. **Оптимизирайте AI prompts** за по-малко tokens
5. **Мониторирайте execution times**

### Maintenance

1. **Backup workflows редовно**
2. **Тествайте workflows след промени**
3. **Мониторирайте error rates**
4. **Актуализирайте dependencies**
5. **Документирайте промени**

## Monitoring

### Key Metrics

- **Success Rate**: % успешни executions
- **Response Time**: Средно време за изпълнение
- **API Usage**: Token usage и rate limits
- **Error Rate**: % неуспешни executions

### Monitoring Tools

```bash
# Проверка на n8n execution history
# Достъп през web интерфейс: https://your-domain.com:5678

# Проверка на logs
docker logs n8n -f

# Мониторинг на system resources
htop
```

## Workflow Versions

| Workflow | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| user-contact-automation | 1.0.0 | 2026-01-01 | ✅ Stable |
| dj-workflow-multichain | 1.0.0 | 2026-01-01 | ✅ Stable |

## Contributing

### Добавяне на нов Workflow

1. Създайте workflow в n8n
2. Тествайте thoroughly
3. Export като JSON
4. Добавете в тази директория
5. Актуализирайте документацията
6. Submit pull request

### Модификация на съществуващ Workflow

1. Import в n8n
2. Направете промени
3. Тествайте
4. Export обновения JSON
5. Актуализирайте version number
6. Документирайте промените
7. Submit pull request

## Resources

### Документация
- [n8n Integration Guide](../docs/n8n-integration-guide-bg.md)
- [VPS Setup Guide](../docs/vps-setup-guide-bg.md)
- [Project Summary](../docs/summary-bg.md)

### External Links
- [n8n Documentation](https://docs.n8n.io)
- [Claude AI Documentation](https://docs.anthropic.com)
- [GitHub Webhooks](https://docs.github.com/webhooks)

### Quick Access
- [Claude Pro](https://www.anthropic.com/legal/aup)
- [Ubuntu Pro](https://ubuntu.com/pro)
- [PR #31 Discussion](https://github.com/Wallesters-org/Wallestars/pull/31#discussion_r2654755211)

## Support

За въпроси и проблеми:
- Създайте issue в repository
- Проверете документацията
- Консултирайте n8n community

## License

Част от Wallestars проекта.

---

**Последно обновление:** 2026-01-01  
**Версия:** 1.0.0  
**Автор:** Wallestars Team
