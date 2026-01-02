# Wallestars - Интелигентна AI Автоматизация

## DJ Workflow - Multi-Chain Приложение с AI Автоматизация

Wallestars е интелигентна система за автоматизация на работни процеси, която интегрира GitHub, n8n и Claude AI за управление на multi-chain blockchain приложения и автоматизация на потребителски взаимодействия.

## 🚀 Основни Функционалности

- **AI-Базирана Автоматизация на Потребителски Контакти**: Автоматично отговаря на GitHub issues и дискусии използвайки Claude AI
- **Multi-Chain Blockchain Интеграция**: Интелигентна маршрутизация и deployment през Ethereum, Polygon, Solana и други
- **n8n Workflow Автоматизация**: Self-hosted workflow engine на VPS (KVM2)
- **GitHub Actions Интеграция**: Автоматизирана синхронизация и deployment на workflows
- **Enterprise Security**: SSL/TLS криптиране, управление на credentials и audit logging

## 📚 Документация

- [Гид за n8n Интеграция](./docs/n8n-integration-guide-bg.md) - Пълен гид за интегриране на n8n с GitHub и Claude AI
- [VPS Setup Гид](./docs/vps-setup-guide-bg.md) - Стъпка по стъпка инструкции за настройване на n8n на KVM2 VPS
- [Обща Документация](./docs/summary-bg.md) - Цялостен преглед на архитектурата, функционалности и имплементация
- [Workflow Конфигурация](./workflows/README.md) - Документация за налични workflows

## 🎯 Бърз Старт

### Предварителни Изисквания

- VPS сървър (KVM2) с Ubuntu 22.04+
- GitHub repository достъп
- Claude AI API key ([Започни тук](https://www.anthropic.com/legal/aup))
- Node.js 20.x или по-нова версия
- Ubuntu Pro subscription (опционално, за enhanced security)

### Инсталация

1. **Настройване на n8n на VPS**
   ```bash
   # Инсталиране на n8n с npm
   npm install -g n8n
   
   # Или използвайте Docker
   docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```

2. **Конфигуриране на GitHub Интеграция**
   - Генериране на GitHub Personal Access Token
   - Настройване на webhook в repository settings
   - Конфигуриране на credentials в n8n

3. **Добавяне на Claude AI Интеграция**
   - Получаване на API key от Anthropic Console
   - Конфигуриране на Claude API credentials в n8n

4. **Импортиране на Workflows**
   ```bash
   # Импортиране на workflow templates от /workflows директорията
   - user-contact-automation.json
   - dj-workflow-multichain.json
   ```

5. **Deployment**
   - Активиране на workflows в n8n
   - Тестване с примерен GitHub issue
   - Мониторинг на execution logs

За детайлни инструкции, вижте [VPS Setup Guide](./docs/vps-setup-guide-bg.md).

## 🔧 Налични Workflows

### 1. User Contact Automation (Автоматизация на Потребителски Контакти)
**Локация**: `workflows/user-contact-automation.json`

Автоматично обработва потребителски взаимодействия:
- Отговаря на нови issues с AI-генерирани съобщения
- Категоризира и етикетира issues
- Предоставя моментална поддръжка 24/7

### 2. DJ Workflow Multi-Chain
**Локация**: `workflows/dj-workflow-multichain.json`

Управлява multi-chain deployments:
- Анализира commits с Claude AI
- Маршрутизира към подходящи blockchain мрежи
- Актуализира deployment статус на GitHub

## 🏗️ Архитектура

```
GitHub Repository → Webhook → n8n VPS (KVM2) → Claude AI
                                      ↓
                          Multi-Chain Мрежи
                    (Ethereum, Polygon, Solana)
```

## 🔐 Сигурност

- SSL/TLS криптиране за всички комуникации
- Сигурно съхранение на credentials в n8n
- Управление на environment variables
- IP whitelisting поддръжка
- Редовни security audits
- Съвместимост с Ubuntu Pro за enhanced security

## 📋 Конфигурация

### Необходими GitHub Secrets

```bash
N8N_VPS_HOST        # VPS домейн или IP
N8N_VPS_USER        # SSH потребителско име
N8N_VPS_SSH_KEY     # SSH private key за deployment
```

### Необходими n8n Credentials

```bash
GitHub API          # GitHub Personal Access Token
Claude AI API       # Anthropic API key
```

## 🧪 Тестване

Тестване на интеграцията:

```bash
# Тестване на GitHub webhook
curl -X POST https://your-domain.com/webhook/github \
  -H "Content-Type: application/json" \
  -d '{"action": "opened", "issue": {"title": "Test"}}'

# Проверка на n8n logs
docker logs n8n -f
```

## 📊 Мониторинг

Ключови метрики за мониторинг:
- Workflow execution success rate
- API response times
- Claude AI token usage
- GitHub API rate limits

## 🔗 Бързи Връзки към Ресурси

### Claude AI Resources
- [Anthropic Acceptable Use Policy](https://www.anthropic.com/legal/aup)
- [Claude API Documentation](https://docs.anthropic.com)
- [Claude Pro Subscription](https://claude.ai/upgrade)

### VPS & Infrastructure
- Ubuntu Pro - Enhanced security и extended support
- 10 VMs + 5 VMs free tier
- KVM2 VPS infrastructure

### Related PRs & Discussions
- [PR #31 - Project Structure](https://github.com/Wallesters-org/Wallestars/pull/31)
- [Quick Access Discussion](https://github.com/Wallesters-org/Wallestars/pull/31#discussion_r2654755211)

## 🤝 Принос

Приносът е добре дошъл! Моля:
1. Fork на repository
2. Създаване на feature branch
3. Извършване на промени
4. Submit на pull request

## 📖 Ресурси

- [n8n Документация](https://docs.n8n.io)
- [Claude AI Документация](https://docs.anthropic.com)
- [GitHub Actions Документация](https://docs.github.com/actions)
- [GitHub Webhooks Гид](https://docs.github.com/webhooks)

## 💬 Поддръжка

- **Документация**: Проверете `/docs` директорията
- **Issues**: Създайте issue в това repository
- **Community**: [n8n Community Forum](https://community.n8n.io)

## 📄 Лиценз

Този проект е част от Wallestars екосистемата.

---

**Изградено с** ❤️ **използвайки n8n, GitHub Actions и Claude AI**

## 🌐 Езици / Languages

- 🇧🇬 [Български](./README.md) (Текуща страница)
- 🇬🇧 [English](./docs/README-EN.md)
