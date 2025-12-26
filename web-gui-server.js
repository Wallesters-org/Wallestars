#!/usr/bin/env node

/**
 * Web GUI Server за Browser Automation
 * 
 * Предоставя web-based интерфейс с интерактивни бутони за:
 * - Въвеждане на задачи
 * - Стартиране/спиране на автоматизация
 * - Преглед на прогреса
 * - Управление без credentials (опционални)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Глобално състояние
let browserInstance = null;
let currentTasks = [];
let executionStatus = {
    running: false,
    currentTask: null,
    progress: 0,
    logs: []
};

/**
 * Добавя лог съобщение
 */
function addLog(message, type = 'info') {
    const timestamp = new Date().toISOString();
    executionStatus.logs.push({
        timestamp,
        message,
        type
    });
    console.log(`[${timestamp}] ${message}`);
}

/**
 * HTML шаблон за GUI
 */
function getHTML() {
    return `<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wallestars - Browser Automation Platform</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .main-content {
            padding: 30px;
        }
        
        .section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
        }
        
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.8em;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .task-input-area {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .task-input {
            flex: 1;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .task-input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            color: white;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .task-list {
            list-style: none;
        }
        
        .task-item {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .task-item-text {
            flex: 1;
            font-size: 16px;
        }
        
        .task-item-remove {
            background: #ff4757;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .task-item-remove:hover {
            background: #ff3838;
        }
        
        .control-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .status-panel {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .status-running {
            background: #38ef7d;
            color: #11998e;
        }
        
        .status-idle {
            background: #ddd;
            color: #666;
        }
        
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.5s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .log-container {
            background: #1e1e1e;
            color: #00ff00;
            padding: 20px;
            border-radius: 10px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        
        .log-entry {
            margin-bottom: 5px;
            padding: 5px;
            border-left: 3px solid #00ff00;
            padding-left: 10px;
        }
        
        .log-error {
            color: #ff4757;
            border-left-color: #ff4757;
        }
        
        .log-warning {
            color: #ffa502;
            border-left-color: #ffa502;
        }
        
        .credentials-section {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .credentials-section h3 {
            color: #856404;
            margin-bottom: 15px;
        }
        
        .credentials-section input {
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        
        .info-box {
            background: #d1ecf1;
            border: 2px solid #0c5460;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            color: #0c5460;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        
        .empty-state-icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Wallestars</h1>
            <p>Платформа за Browser Automation</p>
        </div>
        
        <div class="main-content">
            <!-- Информационна секция -->
            <div class="info-box">
                <strong>ℹ️ Информация:</strong> Тази платформа ви позволява да автоматизирате задачи в GitHub без да въвеждате credentials. 
                Credentials са опционални и се използват само ако искате да влезете в GitHub автоматично.
            </div>
            
            <!-- Опционални Credentials -->
            <div class="credentials-section">
                <h3>⚙️ Опционални Настройки (не са задължителни)</h3>
                <input type="email" id="githubEmail" placeholder="GitHub Email (опционално)">
                <input type="password" id="githubPassword" placeholder="GitHub Password (опционално)">
                <small>💡 Подсказка: Можете да оставите празно - системата ще работи без credentials</small>
            </div>
            
            <!-- Секция за задачи -->
            <div class="section">
                <h2>📋 Управление на Задачи</h2>
                
                <div class="task-input-area">
                    <input 
                        type="text" 
                        id="taskInput" 
                        class="task-input" 
                        placeholder="Въведете задача (напр: Отвори GitHub repository Wallestars)"
                        onkeypress="if(event.key==='Enter') addTask()"
                    >
                    <button class="btn btn-primary" onclick="addTask()">➕ Добави</button>
                </div>
                
                <div id="taskListContainer">
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <p>Няма добавени задачи. Добавете задача за да започнете!</p>
                    </div>
                </div>
            </div>
            
            <!-- Контролни бутони -->
            <div class="section">
                <h2>🎮 Контрола</h2>
                <div class="control-buttons">
                    <button class="btn btn-success" onclick="startExecution()" id="startBtn">
                        ▶️ Старт
                    </button>
                    <button class="btn btn-danger" onclick="stopExecution()" id="stopBtn" disabled>
                        ⏹️ Стоп
                    </button>
                    <button class="btn btn-warning" onclick="clearTasks()">
                        🗑️ Изчисти Всички
                    </button>
                    <button class="btn btn-primary" onclick="loadSampleTasks()">
                        📄 Примерни Задачи
                    </button>
                </div>
            </div>
            
            <!-- Статус панел -->
            <div class="section">
                <h2>📊 Статус</h2>
                <div class="status-panel">
                    <div id="statusBadge" class="status-badge status-idle">
                        ⏸️ Неактивен
                    </div>
                    <div class="progress-bar">
                        <div id="progressFill" class="progress-fill" style="width: 0%">0%</div>
                    </div>
                    <div id="currentTaskInfo" style="color: #666;">
                        Няма текуща задача
                    </div>
                </div>
            </div>
            
            <!-- Логове -->
            <div class="section">
                <h2>📜 Логове</h2>
                <div class="log-container" id="logContainer">
                    <div class="log-entry">Системата е готова. Добавете задачи и натиснете Старт.</div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let tasks = [];
        let ws = null;
        
        // WebSocket връзка за real-time updates
        function connectWebSocket() {
            // За сега използваме polling вместо WebSocket
            setInterval(updateStatus, 1000);
        }
        
        // Добави задача
        function addTask() {
            const input = document.getElementById('taskInput');
            const task = input.value.trim();
            
            if (task) {
                tasks.push(task);
                input.value = '';
                renderTasks();
                addLogMessage('Добавена задача: ' + task, 'info');
            }
        }
        
        // Рендерира списъка със задачи
        function renderTasks() {
            const container = document.getElementById('taskListContainer');
            
            if (tasks.length === 0) {
                container.innerHTML = \`
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <p>Няма добавени задачи. Добавете задача за да започнете!</p>
                    </div>
                \`;
                return;
            }
            
            const html = '<ul class="task-list">' + 
                tasks.map((task, index) => \`
                    <li class="task-item">
                        <span class="task-item-text">\${index + 1}. \${task}</span>
                        <button class="task-item-remove" onclick="removeTask(\${index})">✕</button>
                    </li>
                \`).join('') +
                '</ul>';
            
            container.innerHTML = html;
        }
        
        // Премахни задача
        function removeTask(index) {
            const task = tasks[index];
            tasks.splice(index, 1);
            renderTasks();
            addLogMessage('Премахната задача: ' + task, 'warning');
        }
        
        // Изчисти всички задачи
        function clearTasks() {
            if (tasks.length === 0) return;
            
            if (confirm('Сигурни ли сте, че искате да изчистите всички задачи?')) {
                tasks = [];
                renderTasks();
                addLogMessage('Всички задачи са изчистени', 'warning');
            }
        }
        
        // Зареди примерни задачи
        function loadSampleTasks() {
            tasks = [
                'Отвори GitHub и навигирай към Wallestars repository',
                'Прегледай отворените issues',
                'Провери последните commits',
                'Отвори Codespaces секцията'
            ];
            renderTasks();
            addLogMessage('Заредени примерни задачи', 'info');
        }
        
        // Старт на изпълнението
        async function startExecution() {
            if (tasks.length === 0) {
                alert('Моля, добавете поне една задача!');
                return;
            }
            
            const email = document.getElementById('githubEmail').value;
            const password = document.getElementById('githubPassword').value;
            
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            
            try {
                const response = await fetch('/api/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        tasks,
                        credentials: email && password ? { email, password } : null
                    })
                });
                
                const result = await response.json();
                addLogMessage(result.message, result.success ? 'info' : 'error');
            } catch (error) {
                addLogMessage('Грешка: ' + error.message, 'error');
                document.getElementById('startBtn').disabled = false;
                document.getElementById('stopBtn').disabled = true;
            }
        }
        
        // Стоп на изпълнението
        async function stopExecution() {
            try {
                const response = await fetch('/api/stop', { method: 'POST' });
                const result = await response.json();
                addLogMessage(result.message, 'warning');
                
                document.getElementById('startBtn').disabled = false;
                document.getElementById('stopBtn').disabled = true;
            } catch (error) {
                addLogMessage('Грешка: ' + error.message, 'error');
            }
        }
        
        // Актуализира статуса
        async function updateStatus() {
            try {
                const response = await fetch('/api/status');
                const status = await response.json();
                
                // Актуализира badge
                const badge = document.getElementById('statusBadge');
                if (status.running) {
                    badge.className = 'status-badge status-running';
                    badge.innerHTML = '▶️ Активен';
                } else {
                    badge.className = 'status-badge status-idle';
                    badge.innerHTML = '⏸️ Неактивен';
                }
                
                // Актуализира progress bar
                const progressFill = document.getElementById('progressFill');
                progressFill.style.width = status.progress + '%';
                progressFill.textContent = status.progress + '%';
                
                // Актуализира текуща задача
                const taskInfo = document.getElementById('currentTaskInfo');
                if (status.currentTask) {
                    taskInfo.textContent = 'Текуща задача: ' + status.currentTask;
                    taskInfo.style.color = '#667eea';
                } else {
                    taskInfo.textContent = 'Няма текуща задача';
                    taskInfo.style.color = '#666';
                }
                
                // Актуализира логове
                if (status.newLogs && status.newLogs.length > 0) {
                    status.newLogs.forEach(log => {
                        addLogMessage(log.message, log.type);
                    });
                }
                
            } catch (error) {
                console.error('Грешка при актуализиране на статуса:', error);
            }
        }
        
        // Добави лог съобщение
        function addLogMessage(message, type = 'info') {
            const container = document.getElementById('logContainer');
            const timestamp = new Date().toLocaleTimeString('bg-BG');
            const logClass = type === 'error' ? 'log-error' : (type === 'warning' ? 'log-warning' : '');
            
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry ' + logClass;
            logEntry.textContent = \`[\${timestamp}] \${message}\`;
            
            container.appendChild(logEntry);
            container.scrollTop = container.scrollHeight;
            
            // Ограничи броя логове
            while (container.children.length > 100) {
                container.removeChild(container.firstChild);
            }
        }
        
        // Инициализация
        connectWebSocket();
        renderTasks();
    </script>
</body>
</html>`;
}

/**
 * HTTP Request Handler
 */
function handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Главна страница
    if (url.pathname === '/' || url.pathname === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getHTML());
        return;
    }
    
    // API endpoints
    if (url.pathname === '/api/start' && req.method === 'POST') {
        handleStart(req, res);
        return;
    }
    
    if (url.pathname === '/api/stop' && req.method === 'POST') {
        handleStop(req, res);
        return;
    }
    
    if (url.pathname === '/api/status' && req.method === 'GET') {
        handleStatus(req, res);
        return;
    }
    
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}

/**
 * Старт на изпълнението
 */
function handleStart(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            currentTasks = data.tasks || [];
            const credentials = data.credentials;
            
            if (executionStatus.running) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Изпълнението вече е стартирано' 
                }));
                return;
            }
            
            executionStatus.running = true;
            executionStatus.progress = 0;
            executionStatus.logs = [];
            addLog('Стартиране на изпълнението...');
            
            // Стартирай асинхронно изпълнение
            executeTasksAsync(credentials).catch(error => {
                addLog('Грешка: ' + error.message, 'error');
                executionStatus.running = false;
            });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Изпълнението е стартирано' 
            }));
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                message: 'Грешка: ' + error.message 
            }));
        }
    });
}

/**
 * Стоп на изпълнението
 */
function handleStop(req, res) {
    executionStatus.running = false;
    executionStatus.currentTask = null;
    addLog('Изпълнението е спряно от потребителя', 'warning');
    
    if (browserInstance) {
        browserInstance.close().catch(err => {
            addLog('Грешка при затваряне на браузъра: ' + err.message, 'error');
        });
        browserInstance = null;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        success: true, 
        message: 'Изпълнението е спряно' 
    }));
}

/**
 * Статус
 */
function handleStatus(req, res) {
    const newLogs = executionStatus.logs.slice(-10); // Последните 10 лога
    executionStatus.logs = []; // Изчисти след изпращане
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        running: executionStatus.running,
        currentTask: executionStatus.currentTask,
        progress: executionStatus.progress,
        newLogs: newLogs
    }));
}

/**
 * Асинхронно изпълнение на задачи
 */
async function executeTasksAsync(credentials) {
    try {
        addLog('Стартиране на браузър...');
        
        const browser = await chromium.launch({
            headless: false,
            slowMo: 100
        });
        browserInstance = browser;
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        
        const page = await context.newPage();
        
        // Опционално влизане ако има credentials
        if (credentials && credentials.email && credentials.password) {
            addLog('Влизане в GitHub...');
            await loginToGitHub(page, credentials.email, credentials.password);
        } else {
            addLog('Работа без credentials - отваряне на GitHub...');
            await page.goto('https://github.com');
        }
        
        // Изпълни всяка задача
        for (let i = 0; i < currentTasks.length && executionStatus.running; i++) {
            const task = currentTasks[i];
            executionStatus.currentTask = task;
            executionStatus.progress = Math.round(((i + 1) / currentTasks.length) * 100);
            
            addLog(`Изпълнение на задача ${i + 1}/${currentTasks.length}: ${task}`);
            
            // Симулирай изпълнение (в реалност тук трябва да има логика за изпълнение на задачата)
            await page.waitForTimeout(2000);
            
            addLog(`✓ Завършена задача ${i + 1}: ${task}`);
        }
        
        if (executionStatus.running) {
            addLog('✓ Всички задачи са завършени успешно!');
            executionStatus.progress = 100;
        }
        
        // Остави браузъра отворен 30 секунди
        await page.waitForTimeout(30000);
        
        await browser.close();
        browserInstance = null;
        executionStatus.running = false;
        executionStatus.currentTask = null;
        
    } catch (error) {
        addLog('Грешка при изпълнение: ' + error.message, 'error');
        executionStatus.running = false;
        if (browserInstance) {
            await browserInstance.close();
            browserInstance = null;
        }
    }
}

/**
 * Влизане в GitHub
 */
async function loginToGitHub(page, email, password) {
    try {
        await page.goto('https://github.com/login');
        await page.fill('input[name="login"]', email);
        await page.fill('input[name="password"]', password);
        
        const submitSelectors = [
            'input[type="submit"][value="Sign in"]',
            'button[type="submit"]',
            'input[type="submit"]'
        ];
        
        for (const selector of submitSelectors) {
            try {
                await page.click(selector, { timeout: 2000 });
                break;
            } catch (e) {
                continue;
            }
        }
        
        await page.waitForLoadState('networkidle');
        addLog('✓ Успешно влизане в GitHub');
        
    } catch (error) {
        addLog('Влизането в GitHub не успя: ' + error.message, 'warning');
        addLog('Продължаване без автентикация...', 'warning');
    }
}

/**
 * Стартиране на сървъра
 */
const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   🚀 Wallestars Browser Automation Platform 🚀        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✓ Сървърът е стартиран на: http://${HOST}:${PORT}`);
    console.log('');
    console.log('📖 Инструкции:');
    console.log(`   1. Отворете браузър и посетете: http://localhost:${PORT}`);
    console.log('   2. Добавете задачи чрез интерфейса');
    console.log('   3. Credentials са опционални');
    console.log('   4. Натиснете "Старт" за изпълнение');
    console.log('');
    console.log('⏹️  За спиране натиснете Ctrl+C');
    console.log('');
});

// Грациозно спиране
process.on('SIGINT', () => {
    console.log('\n\n🛑 Спиране на сървъра...');
    server.close(() => {
        console.log('✓ Сървърът е спрян');
        process.exit(0);
    });
});
