# Гид за n8n Интеграция за DJ Workflow Multi-Chain Приложение

## Преглед
Този гид предоставя стъпка по стъпка инструкции за интегриране на n8n workflows с GitHub автоматизация и Claude AI за DJ Workflow multi-chain приложението.

## Предварителни Изисквания
- n8n VPS (KVM2) инстанция в работа
- GitHub акаунт с достъп до repository
- Claude AI API достъп (Team или Enterprise план) - [Започни тук](https://www.anthropic.com/legal/aup)
- Node.js 20.x или по-висока версия
- Ubuntu Pro subscription (опционално, за enhanced security)

## Стъпка 1: Настройка на n8n VPS (KVM2)

### Инсталиране на n8n на VPS
```bash
# Инсталиране на n8n глобално
npm install -g n8n

# Или използване на Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Конфигуриране на n8n Environment
```bash
# Задаване на environment variables
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=your-secure-password
export N8N_HOST=your-vps-domain.com
export N8N_PORT=5678
export N8N_PROTOCOL=https
export WEBHOOK_URL=https://your-vps-domain.com
```

## Стъпка 2: Свързване на GitHub с n8n

### Настройка на GitHub Credentials
1. Отидете на GitHub Settings > Developer Settings > Personal Access Tokens
2. Генерирайте нов token с права:
   - `repo` (пълен контрол)
   - `workflow` (обновяване на workflows)
   - `write:discussion` (за потребителски взаимодействия)
3. Добавете token в n8n credentials:
   - Име: `GitHub API`
   - Access Token: `your-github-token`

### Конфигурация на Webhook
1. В GitHub repository, отидете на Settings > Webhooks
2. Добавете webhook:
   - Payload URL: `https://your-vps-domain.com/webhook/github`
   - Content type: `application/json`
   - Events: Изберете `Issues`, `Pull requests`, `Discussions`

## Стъпка 3: Конфигуриране на Claude AI Интеграция

### Настройка на Claude API
Базирано на [Claude Code for Teams/Enterprise](https://support.claude.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan):

1. Получете Claude API key от Anthropic Console
2. Добавете в n8n credentials:
   - Име: `Claude AI API`
   - API Key: `your-claude-api-key`
   - Model: `claude-3-5-sonnet-20241022` (препоръчителен)

### Claude Интеграция - Най-добри Практики
- Използвайте system prompts за дефиниране на AI поведение
- Имплементирайте rate limiting (спазвайте API лимитите)
- Кеширайте често използвани контексти
- Мониторирайте token usage

## Стъпка 4: Импортиране на n8n Workflow Templates

### Налични Templates
1. **GitHub Issue Auto-Responder** - Автоматично отговаря на нови issues
2. **Pull Request Reviewer** - AI-базиран асистент за code review
3. **User Contact Automation** - Управлява потребителски взаимодействия
4. **Multi-Chain App Workflow** - DJ Workflow оркестрация

### Инструкции за Импортиране
1. Отворете n8n интерфейс: `https://your-vps-domain.com:5678`
2. Кликнете "Workflows" > "Import from File"
3. Изберете JSON файла от `/workflows/` директорията
4. Конфигурирайте credentials за всеки node
5. Активирайте workflow-а

## Стъпка 5: DJ Workflow Multi-Chain App Конфигурация

### Workflow Компоненти
1. **GitHub Trigger** - Мониторира repository събития
2. **Claude AI Node** - Обработва заявки с AI
3. **Response Handler** - Форматира и изпраща отговори
4. **Multi-Chain Router** - Маршрутизира към подходящ blockchain

### Стъпки за Конфигурация
```javascript
// Примерна workflow конфигурация
{
  "nodes": [
    {
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.githubTrigger",
      "credentials": "GitHub API"
    },
    {
      "name": "Claude AI Processing",
      "type": "n8n-nodes-base.httpRequest",
      "credentials": "Claude AI API"
    },
    {
      "name": "GitHub Response",
      "type": "n8n-nodes-base.github"
    }
  ]
}
```

## Стъпка 6: Автоматизиране на Потребителски Контакти

### Функционалности за Автоматизация на Контакти
- **Автоматичен отговор на issues** с AI-генерирани отговори
- **Интелигентна категоризация** на потребителски заявки
- **Автоматизирано проследяване** на неприключени issues
- **Потребителски онбординг** с персонализирани съобщения

### Настройка на Workflow
1. Импортирайте `user-contact-automation.json`
2. Конфигурирайте GitHub webhook trigger
3. Настройте Claude AI prompt templates
4. Тестване с примерен issue

## Тестване на Интеграцията

### Контролен Списък за Тестване
- [ ] GitHub webhook получава събития
- [ ] n8n workflow се тригерва успешно
- [ ] Claude AI отговаря с релевантно съдържание
- [ ] GitHub действия се изпълняват коректно
- [ ] Error handling работи правилно

### Команди за Тестване
```bash
# Тестване на webhook endpoint
curl -X POST https://your-vps-domain.com/webhook/github \
  -H "Content-Type: application/json" \
  -d '{"action": "opened", "issue": {"title": "Test issue"}}'

# Проверка на n8n logs
docker logs n8n

# Верифициране на workflow изпълнение
# Достъп до n8n UI и проверка на execution history
```

## Мониторинг и Поддръжка

### Ключови Метрики за Мониторинг
- Workflow execution success rate
- API response times
- Claude AI token usage
- GitHub API rate limits

### Задачи за Поддръжка
- Редовна ротация на credentials
- Оптимизация на workflow
- Изчистване на logs
- Backup на workflow конфигурации

## Отстраняване на Проблеми

### Често Срещани Проблеми

**Webhook не се тригерва:**
- Проверете дали webhook URL е достъпен
- Проверете GitHub webhook delivery статус
- Уверете се, че n8n работи и портът е отворен

**Claude AI грешки:**
- Верифицирайте, че API key е валиден
- Проверете rate limits
- Прегледайте prompt token count

**GitHub API лимити:**
- Имплементирайте exponential backoff
- Използвайте conditional requests с ETags
- Кеширайте отговори когато е възможно

## Съображения за Сигурност

- Съхранявайте всички credentials в n8n credential store
- Използвайте environment variables за чувствителни данни
- Активирайте HTTPS за всички връзки
- Имплементирайте IP whitelisting за webhooks
- Редовни security audits
- Използвайте Ubuntu Pro за enhanced security

## Допълнителни Ресурси

### Официална Документация
- [n8n Документация](https://docs.n8n.io)
- [GitHub Actions Документация](https://docs.github.com/actions)
- [Claude AI API Документация](https://docs.anthropic.com)
- [n8n Community Workflows](https://n8n.io/workflows)

### Wallestars Ресурси
- [VPS Setup Гид](./vps-setup-guide-bg.md)
- [Workflow Конфигурация](../workflows/README.md)
- [Project Summary](./summary-bg.md)

### Quick Access Links
- [Claude Pro Plans](https://www.anthropic.com/legal/aup)
- [PR #31 Discussion](https://github.com/Wallesters-org/Wallestars/pull/31#discussion_r2654755211)

## Поддръжка

За проблеми и въпроси:
- GitHub Issues: Създайте issue в това repository
- n8n Community: [community.n8n.io](https://community.n8n.io)
- Claude Support: [support.claude.com](https://support.claude.com)

---

**Последно обновление:** 2026-01-01  
**Версия:** 1.0.0  
**Автор:** Wallestars Team
