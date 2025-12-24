# Примерен план и имплементация за интегриране на Activepieces и n8n

Този документ описва примерна имплементация и стъпки за съчетаване на Activepieces (AI‑first автоматизация) и n8n (гъвкава workflow платформа), така че да работят заедно в система за управление на AI задачи и проекти.

## 1. Настройване на самостоятелни инстанции

1. **Инсталиране на Activepieces**  
   - Изберете подходящ сървър (VM, VPS или локален).  
   - Инсталирайте Docker и docker‑compose.  
   - Създайте `docker-compose.yml` за Activepieces:
     ```yaml
     version: '3.8'
     services:
       activepieces:
         image: activepieces/activepieces:latest
         ports:
           - "3000:80"
         environment:
           DATABASE_URL: "postgresql://user:pass@postgres:5432/activepieces"
           AP_PRIVATE_KEY: "<your-secret>"
         depends_on:
           - postgres
       postgres:
         image: postgres:15
         environment:
           POSTGRES_USER: user
           POSTGRES_PASSWORD: pass
           POSTGRES_DB: activepieces
         volumes:
           - postgres_data:/var/lib/postgresql/data
     volumes:
       postgres_data:
     ```
   - Стартирайте със `docker-compose up -d`. Платформата ще работи на порт `3000`.

2. **Инсталиране на n8n (self‑hosted)**  
   - Създайте отделен Docker compose файл или използвайте същия. Пример:
     ```yaml
     version: '3.8'
     services:
       n8n:
         image: n8nio/n8n:latest
         ports:
           - "5678:5678"
         environment:
           N8N_BASIC_AUTH_ACTIVE: "true"
           N8N_BASIC_AUTH_USER: "admin"
           N8N_BASIC_AUTH_PASSWORD: "secure_password"
           WEBHOOK_TUNNEL_URL: "https://your-public-url"
         volumes:
           - n8n_data:/home/node/.n8n
     volumes:
       n8n_data:
     ```
   - Стартирайте с `docker-compose up -d`. Инстанцията ще работи на порт `5678`.

## 2. Създаване на AI анализ и планиране в Activepieces

1. **Създайте нов работен поток (Flow):**  
   - Изберете спусък „Webhook“ за приемане на входящи заявки (например форма или API, където потребителят изпраща описание на цел/проект).  
   - Добавете **AI стъпка (OpenAI или Claude)** за анализ на входящия текст. Настройте подканата (prompt) да извлича задачи, цели и да генерира структурирана JSON схема на плана. Например:
     ```text
     Prompt: „Ти си AI асистент, който строи бизнес модел. Вход: {{steps.trigger.input}}. 
     Изведи JSON с ключове: tasks (списък), dependencies (граф), personal_goals (списък).“
     ```
2. **Добавете стъпка „HTTP request“ (POST) към n8n:**  
   - Endpoint: `http://n8n:5678/webhook/activepieces` (или публично изложен URL).  
   - Payload: резултатът от AI стъпката – JSON планът.

## 3. Изграждане на обработващ поток в n8n

1. **Създайте нов webhook в n8n** със следния URL: `/webhook/activepieces` и метод `POST`. Това ще бъде използвано от Activepieces.
2. **Парсване и обработка на JSON:**  
   - Добавете възел „Set“ или „Function“ за да разпределите входящите данни по задачи, зависимости и лични цели.  
   - Използвайте „IF“/„Switch“ възли за условна логика или приоритизиране.
3. **Изпълнение на действия:**  
   - За всяка задача добавете подходящи интеграции (например създаване на задачи в Asana/Trello, изпращане на имейл, извикване на API).  
   - Използвайте вградени възли за управление на зависимостите (например „Wait“ за изчакване на предходни задачи).
4. **Обратна връзка към Activepieces (по избор):**  
   - След завършване, използвайте HTTP възел за да изпратите резултат/статус обратно към Activepieces, където може да бъде записан или анализиран от допълнителен AI модул.

## 4. Синхронизация и управление

- **Логически връзки:** Activepieces управлява планирането и AI анализите, докато n8n изпълнява тежките интеграции и обработка. Това позволява последователност и проследяемост.
- **Мониторинг:**  
  - Използвайте вградените логове на Activepieces за наблюдение на AI генерацията.  
  - В n8n следете „Executions“ таба за всяка изпълнена задача.  
  - Създайте обща табла (например в Notion или Custom Dashboard), която обединява статусите.
- **Разширяемост:**  
  - Добавяйте нови „pieces“ в Activepieces за поддръжка на допълнителни приложения.  
  - Използвайте богатия набор от >1100 възли на n8n за сложни интеграции.  
  - Реализация на обратни връзки (feedback loop) между двата инструмента за оптимизиране на моделите и процесите.

## 5. Публикуване в GitHub

След като подготвите тези конфигурации и примерния файл, можете да качите документа (`integration_plan.md`) и съответните `docker-compose.yml` файлове в репозитория **Wallesters‑org/Wallestars** или друг подходящ проект. Стъпките са:

1. Създайте клон (например `integration-plan`).
2. Добавете файловете:
   - `integration_plan.md` – този документ.
   - `docker-compose-activepieces.yml` и `docker-compose-n8n.yml` (или общ compose файл).
3. Извършете commit и push към GitHub.
4. Отворете Pull Request и опишете целта на имплементацията.

Когато имате достъп до GitHub CodeSpaces, можете да копирате тези файлове и да ги запазите там, след което да ги публикувате. Ако желаете да продължа с реалната имплементация в CodeSpaces, ще ми трябва да се логнете в GitHub, след което мога да създам файловете и да подготвя commit.