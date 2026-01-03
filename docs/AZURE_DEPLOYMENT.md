# 🚀 Azure Web Apps - Ръководство за Деплоймънт

## 📋 Съдържание

1. [Какво е Azure Web Apps](#какво-е-azure-web-apps)
2. [Необходими стъпки за конфигурация](#необходими-стъпки-за-конфигурация)
3. [Създаване на Azure Web App](#създаване-на-azure-web-app)
4. [Конфигуриране на GitHub Secrets](#конфигуриране-на-github-secrets)
5. [Автоматичен деплоймънт](#автоматичен-деплоймънт)
6. [Проблеми и решения](#проблеми-и-решения)

---

## 🔷 Какво е Azure Web Apps?

**Azure Web Apps** е Platform-as-a-Service (PaaS) решение от Microsoft, което позволява лесен деплоймънт и хостване на уеб приложения без да се грижите за инфраструктурата.

### ✨ Предимства:

- ✅ Автоматично скалиране
- ✅ Вграден SSL сертификат
- ✅ CI/CD интеграция с GitHub
- ✅ Мониторинг и логове
- ✅ Подкрепа за Node.js, Python, .NET, Java

### 🔗 Връзка с проекта:

```
GitHub Repository (Wallestars)
         ↓
   GitHub Actions Workflow
         ↓
   Azure Web App Service
         ↓
   Production Environment
```

---

## 📝 Необходими стъпки за конфигурация

### 🎯 Стъпка 1: Създаване на Azure акаунт

1. Отидете на [portal.azure.com](https://portal.azure.com)
2. Създайте безплатен акаунт (включва $200 кредит за 30 дни)
3. Влезте в Azure Portal

### 🎯 Стъпка 2: Инсталиране на Azure CLI (опционално)

```bash
# Linux/WSL
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Влизане
az login
```

---

## 🏗️ Създаване на Azure Web App

### Визуален процес:

```
┌─────────────────────────────────────────────────────────┐
│  AZURE PORTAL                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. ➕ Create a resource                                │
│  2. 🔍 Search "Web App"                                 │
│  3. 📝 Fill form:                                       │
│     • Name: wallestars-control-center                   │
│     • Publish: Code                                     │
│     • Runtime: Node 20 LTS                              │
│     • Region: West Europe (или най-близък)              │
│     • Pricing: B1 Basic (или Free F1)                   │
│                                                         │
│  4. ✅ Review + Create                                  │
│  5. 🚀 Go to resource                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Чрез Azure CLI:

```bash
# Създаване на Resource Group
az group create --name wallestars-rg --location westeurope

# Създаване на App Service Plan
az appservice plan create \
  --name wallestars-plan \
  --resource-group wallestars-rg \
  --is-linux \
  --sku B1

# Създаване на Web App
az webapp create \
  --name wallestars-control-center \
  --resource-group wallestars-rg \
  --plan wallestars-plan \
  --runtime "NODE:20-lts"
```

---

## 🔐 Конфигуриране на GitHub Secrets

### Стъпка 1: Изтегляне на Publish Profile

**Метод 1: От Azure Portal**

```
Azure Portal → Your Web App
    ↓
Get Publish Profile (бутон в горната лента)
    ↓
Изтегля се XML файл
    ↓
Копирайте цялото съдържание
```

**Метод 2: Чрез Azure CLI**

```bash
az webapp deployment list-publishing-profiles \
  --name wallestars-control-center \
  --resource-group wallestars-rg \
  --xml
```

### Стъпка 2: Добавяне на Secret в GitHub

```
GitHub Repository → Settings → Secrets and variables → Actions
    ↓
New repository secret
    ↓
Name: AZURE_WEBAPP_PUBLISH_PROFILE
Value: [Поставете XML съдържанието]
    ↓
Add secret ✅
```

### Визуална схема на процеса:

```
┌────────────────────────────────────────────────────────┐
│  GitHub Secrets Configuration                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📦 Repository                                         │
│    └─ ⚙️  Settings                                     │
│        └─ 🔐 Secrets and variables                    │
│            └─ ⚡ Actions                               │
│                └─ ➕ New repository secret            │
│                    ├─ 📝 Name                         │
│                    │   AZURE_WEBAPP_PUBLISH_PROFILE   │
│                    │                                  │
│                    └─ 📄 Value                        │
│                        <publishData>...</publishData>  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔧 Конфигуриране на Environment Variables в Azure

### Метод 1: Azure Portal

```
Web App → Configuration → Application settings
    ↓
+ New application setting
    ↓
Добавете:
  - ANTHROPIC_API_KEY: your_api_key
  - NODE_ENV: production
  - ENABLE_COMPUTER_USE: false
  - ENABLE_ANDROID: false
    ↓
Save ✅
```

### Метод 2: Azure CLI

```bash
az webapp config appsettings set \
  --name wallestars-control-center \
  --resource-group wallestars-rg \
  --settings \
    ANTHROPIC_API_KEY="sk-ant-your-key" \
    NODE_ENV="production" \
    ENABLE_COMPUTER_USE="false" \
    ENABLE_ANDROID="false"
```

---

## 🚀 Автоматичен Деплоймънт

### Работен процес на GitHub Actions:

```
┌────────────────────────────────────────────────────────┐
│  GitHub Actions Workflow                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1️⃣  TRIGGER                                           │
│     • Push to main branch                             │
│     • Manual workflow dispatch                        │
│           ↓                                           │
│  2️⃣  BUILD JOB                                         │
│     • Checkout code                                   │
│     • Setup Node.js 20.x                              │
│     • npm install                                     │
│     • npm run build                                   │
│     • Upload artifact                                 │
│           ↓                                           │
│  3️⃣  DEPLOY JOB                                        │
│     • Download artifact                               │
│     • Deploy to Azure Web App                         │
│     • Use publish profile from secrets                │
│           ↓                                           │
│  4️⃣  RESULT                                            │
│     ✅ App live at: wallestars-control-center.azurewebsites.net │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Стартиране на деплоймънт:

```bash
# Автоматично при push към main
git push origin main

# Или ръчно от GitHub
# Actions → Azure Web Apps Deploy → Run workflow
```

---

## ⚠️ Проблеми и решения

### ❌ Проблем 1: "Value 'Development' is not valid"

**Решение:** ✅ Променено на `'production'` в workflow файла

```yaml
environment:
  name: "production" # Вместо 'Development'
```

### ❌ Проблем 2: "Secret AZURE_WEBAPP_PUBLISH_PROFILE not found"

**Решение:**

1. Проверете дали секретът е добавен правилно в GitHub
2. Уверете се, че името е точно `AZURE_WEBAPP_PUBLISH_PROFILE`
3. Regenerate publish profile ако е необходимо

### ❌ Проблем 3: Build фейлва

**Решение:**

```bash
# Тествайте локално преди push
npm install
npm run build
npm start
```

### ❌ Проблем 4: App не стартира в Azure

**Проверки:**

1. Прегледайте логовете: Azure Portal → Log stream
2. Проверете Environment Variables
3. Уверете се, че порт 3000 се използва (Azure го изисква)

```javascript
// server/index.js
const PORT = process.env.PORT || 3000;
```

---

## 📊 Мониторинг

### Application Insights (препоръчително)

```bash
# Добавяне към проекта
npm install applicationinsights

# В server/index.js
import appInsights from 'applicationinsights';
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .start();
```

### Достъп до логове:

```
Azure Portal → Web App → Monitoring → Log stream
```

---

## 🎯 Следващи стъпки

1. ✅ Конфигурирайте Custom Domain
2. ✅ Активирайте SSL сертификат
3. ✅ Настройте Scaling rules
4. ✅ Конфигурирайте Backup
5. ✅ Добавете Application Insights

---

## 📞 Помощни ресурси

- 📖 [Azure Web Apps Documentation](https://docs.microsoft.com/azure/app-service/)
- 🎓 [GitHub Actions for Azure](https://github.com/Azure/actions)
- 💬 [Azure Support](https://azure.microsoft.com/support/)
- 🔧 [Node.js on Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
