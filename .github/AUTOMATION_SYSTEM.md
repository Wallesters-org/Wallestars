# 🤖 Enhanced Automation System for PR Management & Workflow Orchestration

## Overview

This comprehensive automation system uses **GitHub Actions**, **N8N Workflows**, **Supabase Database**, and **MCP (Model Context Protocol)** for intelligent PR management, monitoring, testing, and automated merging.

## 🎯 Core Components

### 1. GitHub Actions Workflows

#### 📋 PR Automation (`pr-automation.yml`)
**Functions:**
- Automatic PR delegation to agents using rotation
- 4 active agents: `copilot-agent-1`, `copilot-agent-2`, `copilot-agent-3`, `copilot-agent-4`
- Automated code review (checks for console.log, debugger statements)
- Automatic comments with instructions
- N8N webhook integration

**Triggers:**
- On PR open/update
- Schedule: Every 15 minutes
- Manual trigger

#### 🔍 Agent Monitoring (`agent-monitoring.yml`)
**Functions:**
- Agent activity monitoring
- Stale PR detection (>7 days)
- Daily report generation
- Alert creation for inactive agents

**Triggers:**
- Schedule: Every 10 minutes
- Daily report: 09:00 UTC
- Manual trigger

#### 🧪 Testing Automation (`testing-automation.yml`)
**Functions:**
- Test matrix: Unit, Integration, E2E
- Multiple Node.js versions: 20.x, 22.x
- Code quality checks (ESLint, formatting)
- Security scanning (npm audit, dependency review)
- Build verification
- Automatic test session creation

**Triggers:**
- On PR changes
- Push to main/develop
- Schedule: Every 30 minutes
- Manual trigger

#### 🎯 Active PR Session Manager (`pr-active-session-manager.yml`) **[NEW]**
**Functions:**
- Track all active PR sessions in real-time
- Auto-merge approved PRs with proper checks
- PR health monitoring and metrics
- Merge conflict detection
- Stale PR identification
- Health alert generation

**Triggers:**
- On PR events (opened, review, checks)
- Schedule: Every 10 minutes
- Manual trigger

**Key Features:**
- **Auto-Merge Logic:**
  - Requires at least 1 approval
  - All checks must pass
  - No changes requested
  - Has `auto-merge` or `ready-to-merge` label
  - Uses squash merge by default
  
- **Health Monitoring:**
  - Stale PRs (>7 days)
  - Merge conflicts
  - PRs needing attention
  - Automated alert issues

#### 🎭 MCP Workflow Orchestrator (`mcp-workflow-orchestrator.yml`) **[NEW]**
**Functions:**
- Coordinate all automation workflows
- MCP tool integration status
- Agent workload balancing
- Code quality analysis
- System health scoring
- Workflow triggering

**Triggers:**
- On PR events and pushes
- Schedule: Every 20 minutes
- Manual trigger with full scan option

**Key Features:**
- **MCP Integration:**
  - Claude AI availability
  - Computer Use capabilities
  - Android control tools
  - GitHub API integration
  - N8N webhooks
  - Supabase database
  
- **Orchestration:**
  - Triggers dependent workflows
  - Balances agent workload
  - Generates comprehensive reports
  - Health score calculation

- **Tool Validation:**
  - MCP configuration check
  - Server startup validation
  - Tool availability verification

### 2. N8N Workflows

#### 📊 PR Monitoring System (`pr-monitoring-system.json`)
**Webhooks:**
- `/webhook/pr-delegated` - Получава информация за делегирани PR-ове
- `/webhook/agent-status` - Получава статус на агентите
- `/webhook/test-results` - Получава резултати от тестове

**Процеси:**
1. **PR Delegated Flow:**
   - Създава коментар в GitHub
   - Записва в Supabase
   - Проверява статуса
   - Изпраща напомняния след 30 минути

2. **Agent Status Flow:**
   - Анализира статус на агентите
   - Създава alerts за критични случаи
   - Генерира GitHub issues

3. **Test Results Flow:**
   - Обработва резултати
   - Създава коментар в PR
   - Записва в базата данни

#### 🔄 Continuous Agent Monitor (`continuous-agent-monitor.json`)
**Функции:**
- **Continuous Monitoring (на всеки 5 минути):**
  - Взима всички PR-ове
  - Групира по агенти
  - Проверява активността
  - Създава alerts за неактивни агенти
  - Логва в Supabase

- **Analytics (на всеки 4 часа):**
  - Генерира статистика за агентите
  - Създава аналитични доклади
  - Публикува в GitHub issues

### 3. Supabase Database Schema

#### 📊 Таблици

**`pr_tracking`** - Основна таблица за PR-ове
```sql
- pr_number (INTEGER, UNIQUE)
- agent (VARCHAR)
- status (VARCHAR)
- delegated_at (TIMESTAMP)
- last_updated (TIMESTAMP)
- repository (VARCHAR)
- metadata (JSONB)
```

**`test_results`** - Резултати от тестове
```sql
- pr_number (FK)
- workflow (VARCHAR)
- all_passed (BOOLEAN)
- tests_passed, code_quality, security_scan, build_verification
- timestamp (TIMESTAMP)
- details (JSONB)
```

**`agent_activity_log`** - Логове на активност
```sql
- agent_name (VARCHAR)
- assigned_prs (INTEGER)
- last_activity (TIMESTAMP)
- is_active (BOOLEAN)
- hours_since_activity (NUMERIC)
- prs_data (JSONB)
```

**`agent_metrics`** - Метрики за производителност
```sql
- agent_name (VARCHAR)
- total_prs_assigned, total_prs_completed, total_prs_merged
- avg_completion_time_hours (NUMERIC)
- success_rate (NUMERIC)
- period_start, period_end (TIMESTAMP)
```

**`workflow_execution_log`** - Логове на workflow изпълнения
```sql
- workflow_name, workflow_id (VARCHAR)
- execution_status (VARCHAR)
- execution_time_ms (INTEGER)
- error_message (TEXT)
- metadata (JSONB)
```

**`alert_history`** - История на alerts
```sql
- alert_type, severity (VARCHAR)
- agent_name, pr_number
- message (TEXT)
- is_resolved (BOOLEAN)
- metadata (JSONB)
```

#### 📈 Views за Analytics

**`v_agent_dashboard`** - Dashboard за агенти
- Общо PR-ове, merge-нати, затворени, отворени
- Средно време за затваряне
- Последна активност

**`v_recent_pr_activity`** - Скорошна PR активност
- Статус, агент, време от последна актуализация
- Резултати от последните тестове

**`v_alert_summary`** - Обобщение на alerts
- Типове, severity, брой, resolved/open

## 🚀 Setup Instructions

### 1. GitHub Repository Setup

#### A. Добави Secrets
В GitHub Repository Settings → Secrets and variables → Actions:

```bash
N8N_WEBHOOK_URL=https://n8n.srv1201204.hstgr.cloud
GITHUB_TOKEN=<your_github_token>
```

#### B. Активирай Workflows
Workflows се активират автоматично след push на файловете

### 2. N8N Setup

#### A. Import Workflows
1. Отвори n8n: https://n8n.srv1201204.hstgr.cloud
2. Workflows → Import from File
3. Импортирай:
   - `pr-monitoring-system.json`
   - `continuous-agent-monitor.json`

#### B. Configure Credentials
1. **GitHub OAuth2:**
   - Settings → Credentials → Add Credential
   - Type: GitHub OAuth2 API
   - Authorize with GitHub

2. **Supabase PostgreSQL:**
   - Type: Postgres
   - Host: `<your-supabase-host>.supabase.co`
   - Database: `postgres`
   - User: `postgres`
   - Password: `<your-supabase-password>`
   - Port: `5432`
   - SSL: Enabled

#### C. Activate Workflows
- Отвори всеки workflow
- Кликни на "Active" toggle горе дясно

### 3. Supabase Setup

#### A. Изпълни Schema
1. Supabase Dashboard → SQL Editor
2. Копирай съдържанието на `pr-agent-tracking-schema.sql`
3. Run

#### B. Провери Tables
```sql
SELECT * FROM pr_tracking;
SELECT * FROM agent_activity_log;
SELECT * FROM v_agent_dashboard;
```

## 📋 Използване

### Автоматично Делегиране на PR
1. Създай нов PR в GitHub
2. Системата автоматично ще:
   - Назначи агент по ротация
   - Добави labels (`agent:copilot-agent-X`, `automated`)
   - Създаде коментар с инструкции
   - Изпрати webhook към n8n
   - Запише в Supabase

### Мониторинг на Агенти
- **Автоматично:** N8N проверява на всеки 5 минути
- **Ръчно:** Виж GitHub Issues с label `agent-alert`
- **Dashboard:** Запитай Supabase `v_agent_dashboard`

### Доклади
- **Дневни:** Създават се автоматично в 09:00 UTC
- **4-часови analytics:** N8N генерира и публикува в GitHub
- **Manual:** Тригерни workflows ръчно от Actions tab

## 📊 Мониторинг и Метрики

### GitHub Actions Dashboard
- Repository → Actions tab
- Виж execution history
- Проверяслай Job Summaries

### N8N Executions
- n8n → Executions tab
- Филтрирай по workflow
- Виж details и logs

### Supabase Analytics
```sql
-- Agent Performance
SELECT * FROM v_agent_dashboard;

-- Recent Activity
SELECT * FROM v_recent_pr_activity;

-- Alerts Summary
SELECT * FROM v_alert_summary;

-- Calculate Metrics
SELECT * FROM calculate_agent_metrics('copilot-agent-1', 168);
```

## 🔧 Troubleshooting

### PR не се делегира автоматично
1. Провери дали workflow е активен (Actions tab)
2. Виж логовете на `pr-automation` workflow
3. Провери дали PR е draft (draft PR-ове се пропускат)

### Агент се показва като неактивен
1. Проверидали агента има коментари в PR-овете
2. Виж `agent_activity_log` в Supabase
3. Тригерни `agent-monitoring` workflow ръчно

### N8N webhook не работи
1. Провери дали workflow е активен
2. Тествай webhook URL-а директно
3. Виж Executions за errors
4. Провери credentials (GitHub, Supabase)

### Тестове не се пускат
1. Провери дали има `test:ci` script в `package.json`
2. Виж build logs в Actions
3. Проверид dependencies

## 🎯 Best Practices

### За Агенти
1. Коментирай редовно в PR-овете
2. Използвай checklist от автоматичния коментар
3. Добавяй labels за статус (`in-review`, `approved`, `needs-changes`)

### За Workflows
1. Не променяй agent labels ръчно
2. Използвай GitHub UI за merge (не CLI)
3. Добавяй описание в PR-овете

### За Maintenance
1. Проверявай дневните доклади
2. Resolved alerts promptly
3. Monitor Supabase storage
4. Archive old data месечно

## 📈 Metrics to Track

### Agent Performance
- PR completion rate
- Average time to review
- Success rate (merged vs closed)

### System Health
- Workflow execution success rate
- Alert frequency
- Response time

### Quality Metrics
- Test pass rate
- Build success rate
- Security scan results

## 🔄 Continuous Improvement

### Weekly Review
- Виж analytics доклади
- Identify bottlenecks
- Adjust agent allocation

### Monthly Maintenance
- Archive old records
- Update workflow logic
- Review and optimize

## 📞 Support

За въпроси и проблеми:
1. Създай GitHub Issue с label `support`
2. Виж Executions logs в n8n
3. Проверид Supabase logs

---

**Created:** 2026-01-12  
**Version:** 1.0.0  
**Last Updated:** 2026-01-12
