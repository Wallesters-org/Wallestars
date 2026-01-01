# n8n VPS Настройка и Конфигурация

## Бърз Старт Гид

Този документ предоставя стъпка по стъпка инструкции за настройване на n8n на KVM2 VPS и интегрирането му с GitHub и Claude AI.

## Съдържание

1. [VPS Изисквания](#vps-изисквания)
2. [Стъпки за Инсталация](#стъпки-за-инсталация)
3. [Конфигурация](#конфигурация)
4. [GitHub Интеграция](#github-интеграция)
5. [Claude AI Настройка](#claude-ai-настройка)
6. [Импортиране на Workflow](#импортиране-на-workflow)
7. [Тестване](#тестване)
8. [Отстраняване на Проблеми](#отстраняване-на-проблеми)

## VPS Изисквания

- **ОС**: Ubuntu 22.04 LTS или по-висока
- **RAM**: Минимум 2GB (препоръчително 4GB)
- **Дисково пространство**: Минимум 20GB
- **Мрежа**: Public IP адрес
- **Портове**: 5678 (n8n), 443 (HTTPS)
- **Опционално**: Ubuntu Pro subscription за enhanced security

## Стъпки за Инсталация

### Стъпка 1: Свързване към VPS

```bash
ssh root@your-vps-ip
```

### Стъпка 2: Инсталиране на Node.js

```bash
# Инсталиране на Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Верифициране на инсталацията
node --version
npm --version
```

### Стъпка 3: Инсталиране на n8n

Изберете един от следните методи:

#### Опция А: NPM Инсталация (Препоръчително за development)

```bash
# Инсталиране на n8n глобално
npm install -g n8n

# Създаване на n8n data директория
mkdir -p ~/.n8n
```

#### Опция Б: Docker Инсталация (Препоръчително за production)

```bash
# Инсталиране на Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Генерирайте сигурна парола ПРЕДИ deployment
# ⚠️ ВАЖНО: НИКОГА не използвайте примерни пароли в production!
export SECURE_PASSWORD=$(openssl rand -base64 32)

# Стартиране на n8n container със сигурна парола
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD="${SECURE_PASSWORD}" \
  n8nio/n8n

# Запазете генерираната парола на сигурно място
echo "Your n8n password: ${SECURE_PASSWORD}" > ~/.n8n/admin_password.txt
chmod 600 ~/.n8n/admin_password.txt
echo "✓ Password saved to ~/.n8n/admin_password.txt"
```

**🔒 ВАЖНА БЕЛЕЖКА ЗА СИГУРНОСТ**: 
- Винаги генерирайте силна, случайна парола преди deployment
- Никога не използвайте примерни или default пароли в production
- Запазете паролата на сигурно място
- Използвайте password manager за съхранение на credentials

### Стъпка 4: Настройка на SSL с Let's Encrypt

```bash
# Инсталиране на Certbot
sudo apt-get update
sudo apt-get install -y certbot

# Получаване на SSL сертификат
sudo certbot certonly --standalone -d your-domain.com

# Запазете пътищата на сертификатите:
# Certificate: /etc/letsencrypt/live/your-domain.com/fullchain.pem
# Private Key: /etc/letsencrypt/live/your-domain.com/privkey.pem
```

## Конфигурация

### Environment Variables

Създайте environment файл:

```bash
cat > ~/.n8n/env << EOF
# Основна Конфигурация
N8N_PROTOCOL=https
N8N_HOST=your-domain.com
N8N_PORT=5678

# Автентикация
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password

# SSL Конфигурация
N8N_SSL_KEY=/etc/letsencrypt/live/your-domain.com/privkey.pem
N8N_SSL_CERT=/etc/letsencrypt/live/your-domain.com/fullchain.pem

# Webhook URL
WEBHOOK_URL=https://your-domain.com

# Часова зона
GENERIC_TIMEZONE=Europe/Sofia

# Execution Конфигурация
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Сигурност
N8N_SECURE_COOKIE=true
EOF
```

### Стартиране на n8n с Конфигурация

```bash
# NPM метод
n8n start --env-file=~/.n8n/env

# Docker метод
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --env-file ~/.n8n/env \
  n8nio/n8n
```

### Настройка като System Service (NPM метод)

```bash
# Създаване на systemd service файл
sudo cat > /etc/systemd/system/n8n.service << EOF
[Unit]
Description=n8n Workflow Automation
After=network.target

[Service]
Type=simple
User=$USER
EnvironmentFile=/home/$USER/.n8n/env
ExecStart=/usr/bin/n8n start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Активиране и стартиране на service
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n

# Проверка на статус
sudo systemctl status n8n
```

## GitHub Интеграция

### Стъпка 1: Генериране на GitHub Personal Access Token

1. Отидете на GitHub Settings → Developer Settings → Personal Access Tokens
2. Кликнете "Generate new token (classic)"
3. Изберете scopes:
   - ✅ `repo` (Пълен контрол на private repositories)
   - ✅ `workflow` (Обновяване на GitHub Action workflows)
   - ✅ `write:discussion` (Write достъп до discussions)
   - ✅ `admin:repo_hook` (Пълен контрол на repository hooks)
4. Генерирайте и копирайте token-а

### Стъпка 2: Конфигуриране на GitHub Credentials в n8n

1. Отворете n8n: `https://your-domain.com:5678`
2. Влезте с admin credentials
3. Отидете на Settings → Credentials
4. Кликнете "Add Credential"
5. Изберете "GitHub API"
6. Въведете:
   - **Name**: GitHub API
   - **Access Token**: Вашият генериран token
7. Кликнете "Save"

### Стъпка 3: Настройка на GitHub Webhook

1. В GitHub repository, отидете на Settings → Webhooks
2. Кликнете "Add webhook"
3. Конфигурирайте:
   - **Payload URL**: `https://your-domain.com/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: (опционално, но препоръчително)
   - **Events**: Изберете индивидуални събития:
     - ✅ Issues
     - ✅ Issue comments
     - ✅ Pull requests
     - ✅ Pull request reviews
     - ✅ Pushes
     - ✅ Releases
4. Кликнете "Add webhook"

## Claude AI Настройка

### Стъпка 1: Получаване на Claude API Key

Базирано на [Claude Enterprise Guide](https://support.claude.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan):

1. Достъп до Anthropic Console: https://console.anthropic.com
2. Навигирайте до секция API Keys
3. Създайте нов API key
4. Копирайте key-а (ще бъде показан само веднъж)

**Важно**: За пълна функционалност се изисква Claude Pro subscription. Вижте [Anthropic AUP](https://www.anthropic.com/legal/aup) за повече информация.

### Стъпка 2: Конфигуриране на Claude API в n8n

1. В n8n, отидете на Settings → Credentials
2. Кликнете "Add Credential"
3. Изберете "HTTP Header Auth" (за custom API интеграция)
4. Конфигурирайте:
   - **Name**: Claude AI API
   - **Name**: `x-api-key`
   - **Value**: Вашият Claude API key
5. Кликнете "Save"

### Стъпка 3: Тестване на Claude Интеграция

Използвайте HTTP Request node в тестов workflow:

```json
{
  "url": "https://api.anthropic.com/v1/messages",
  "method": "POST",
  "headers": {
    "x-api-key": "{{credentials}}",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  "body": {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Здравей, Claude!"
      }
    ]
  }
}
```

## Импортиране на Workflow

### Стъпка 1: Клониране на Repository

```bash
cd ~
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

### Стъпка 2: Импортиране на Workflows

1. В n8n web интерфейс, кликнете "Workflows"
2. Кликнете "Import from File"
3. Изберете workflow файлове от `workflows/` директория:
   - `user-contact-automation.json`
   - `dj-workflow-multichain.json`
4. Конфигурирайте credentials за всеки node
5. Активирайте workflow-а

### Стъпка 3: Конфигуриране на Workflow Variables

За всеки импортиран workflow:

1. Отворете workflow-а
2. Кликнете на всеки node, който изисква credentials
3. Изберете подходящия credential от dropdown
4. Актуализирайте repository-specific стойности (owner, repo name)
5. Запазете workflow-а

## Тестване

### Тестване на GitHub Webhook

```bash
# Тестване на webhook delivery
curl -X POST https://your-domain.com/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -d '{
    "action": "opened",
    "issue": {
      "number": 1,
      "title": "Test Issue",
      "body": "Това е тестов issue"
    },
    "repository": {
      "owner": {"login": "your-username"},
      "name": "your-repo"
    }
  }'
```

### Тестване на Claude AI Response

1. Създайте тестов workflow с HTTP Request node
2. Използвайте Claude AI endpoint
3. Изпълнете workflow-а manually
4. Проверете execution log за response

### Тестване на Complete Flow

1. Създайте реален GitHub issue във вашето repository
2. Проверете n8n execution log
3. Верифицирайте, че AI response е публикуван като коментар
4. Потвърдете, че labels са добавени

## Отстраняване на Проблеми

### n8n не стартира

```bash
# Проверка на logs (NPM метод)
journalctl -u n8n -f

# Проверка на logs (Docker метод)
docker logs n8n -f
```

### Webhook не се тригерва

1. Проверете GitHub webhook delivery статус
2. Верифицирайте, че n8n е достъпен от интернет
3. Проверете firewall правила: `sudo ufw status`
4. Тествайте webhook URL: `curl https://your-domain.com/webhook-test/test`

### Claude API Грешки

1. Верифицирайте, че API key е правилен
2. Проверете rate limits в Anthropic Console
3. Прегледайте request body формат
4. Проверете anthropic-version header

### Credential Проблеми

1. Презапазете credentials в n8n
2. Проверете token изтичане (GitHub)
3. Верифицирайте API key формат (Claude)

## Най-добри Практики за Сигурност

1. **Използвайте HTTPS**: Винаги активирайте SSL/TLS
2. **Силни Пароли**: Използвайте комплексни пароли за n8n
3. **Firewall**: Ограничете достъпа само до необходими портове
4. **IP Whitelisting**: Ограничете достъпа до известни IP-та ако е възможно
5. **Редовни Обновления**: Поддържайте n8n и Node.js актуални
6. **Backup**: Редовен backup на `~/.n8n` директория
7. **Secrets**: Съхранявайте чувствителни данни в n8n credentials, не в workflows
8. **Ubuntu Pro**: Използвайте Ubuntu Pro за enhanced security и extended support

## Backup и Recovery

### Backup на n8n Конфигурация

```bash
# Backup на workflows и credentials
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz ~/.n8n/

# Копиране на сигурно място
scp n8n-backup-*.tar.gz user@backup-server:/backups/
```

### Възстановяване от Backup

```bash
# Извличане на backup
tar -xzf n8n-backup-20260101.tar.gz -C ~/

# Рестартиране на n8n
sudo systemctl restart n8n  # или docker restart n8n
```

## Мониторинг

### Настройка на Мониторинг

```bash
# Инсталиране на monitoring tools
sudo apt-get install -y htop iotop

# Мониторинг на n8n resource usage
htop

# Проверка на n8n logs
journalctl -u n8n -f  # NPM метод
docker logs -f n8n     # Docker метод
```

### Настройка на Alerts

Конфигурирайте n8n да изпраща alerts при workflow failures:

1. Създайте "Error Trigger" workflow
2. Добавете email/Slack notification node
3. Активирайте workflow-а

## Допълнителни Ресурси

### Официална Документация
- [n8n Документация](https://docs.n8n.io)
- [n8n Community Forum](https://community.n8n.io)
- [Claude AI Документация](https://docs.anthropic.com)
- [GitHub Webhooks Гид](https://docs.github.com/webhooks)

### Wallestars Ресурси
- [n8n Integration Guide](./n8n-integration-guide-bg.md)
- [Workflow Configuration](../workflows/README.md)
- [Project Summary](./summary-bg.md)

### Quick Access Links
- [Claude Pro & API Keys](https://www.anthropic.com/legal/aup)
- [Ubuntu Pro](https://ubuntu.com/pro)
- [PR #31 Discussion](https://github.com/Wallesters-org/Wallestars/pull/31#discussion_r2654755211)

## Поддръжка

За проблеми специфични за тази настройка:
- Създайте issue в това repository
- Проверете съществуващата документация
- Прегледайте n8n community forums

## Лиценз

Тази конфигурация е част от Wallestars проекта.

---

**Последно обновление:** 2026-01-01  
**Версия:** 1.0.0  
**Автор:** Wallestars Team
