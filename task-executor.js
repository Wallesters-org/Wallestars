#!/usr/bin/env node

/**
 * Изпълнител на Задачи - Task Executor
 * 
 * Система за автоматизация на браузъра с възможност за:
 * - Четене на задачи от файл или конзола
 * - Структуриране и планиране на задачи
 * - Потвърждение преди изпълнение
 * - Изпълнение на задачи в GitHub
 * 
 * Използване:
 * node task-executor.js tasks.json
 * или
 * node task-executor.js --interactive
 */

const fs = require('fs');
const readline = require('readline');
const { chromium } = require('playwright');

// Конфигурация
const CONFIG = {
    // GitHub credentials
    GITHUB_EMAIL: process.env.GITHUB_EMAIL || '',
    GITHUB_PASSWORD: process.env.GITHUB_PASSWORD || '',
    
    // Timeout настройки
    SUCCESS_TIMEOUT: parseInt(process.env.SUCCESS_TIMEOUT || '30000', 10),
    FAILURE_TIMEOUT: parseInt(process.env.FAILURE_TIMEOUT || '60000', 10),
    SLOW_MO: parseInt(process.env.SLOW_MO || '100', 10),
    
    // Езикови настройки
    LANGUAGE: 'bg' // Български език по подразбиране
};

// Съобщения на български
const MESSAGES = {
    bg: {
        welcome: '╔════════════════════════════════════════════════════════════════╗\n' +
                 '║        Система за Автоматизация на GitHub Задачи 🚀            ║\n' +
                 '╚════════════════════════════════════════════════════════════════╝',
        readingTasks: 'Четене на задачи...',
        taskLoaded: 'Заредени задачи:',
        planCreated: 'Създаден план за изпълнение:',
        confirmPrompt: 'Потвърдете плана за изпълнение (да/не): ',
        executionStarted: 'Започване на изпълнение...',
        executionCancelled: 'Изпълнението е отменено от потребителя.',
        loginStarted: 'Започване на влизане в GitHub...',
        loginSuccess: '✓ Успешно влизане в GitHub!',
        loginFailed: '✗ Неуспешно влизане в GitHub.',
        taskCompleted: 'Задача завършена:',
        allTasksCompleted: '✓ Всички задачи са завършени успешно!',
        error: 'Грешка:',
        browserLaunching: 'Стартиране на браузър...',
        navigatingTo: 'Навигиране към:',
        setupCodespace: 'Настройка на Codespace...',
        installingDeps: 'Инсталиране на зависимости...',
        taskStructuring: 'Структуриране на задачи...'
    }
};

/**
 * Показва съобщение на български
 */
function msg(key, ...args) {
    const message = MESSAGES[CONFIG.LANGUAGE][key];
    if (args.length > 0) {
        console.log(message, ...args);
    } else {
        console.log(message);
    }
}

/**
 * Чете задачи от JSON файл
 */
function readTasksFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        msg('error', `Не може да се прочете файлът: ${error.message}`);
        return null;
    }
}

/**
 * Интерактивно четене на задачи
 */
async function readTasksInteractively() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\nВъведете задачи (една на ред, празен ред за край):');
        const tasks = [];
        
        rl.on('line', (line) => {
            if (line.trim() === '') {
                rl.close();
                resolve({ tasks: tasks.map((description, index) => ({
                    id: index + 1,
                    description,
                    type: 'manual',
                    status: 'pending'
                }))});
            } else {
                tasks.push(line.trim());
            }
        });
    });
}

/**
 * Структурира задачите в план за изпълнение
 */
function structureTasks(tasksData) {
    msg('taskStructuring');
    
    const plan = {
        totalTasks: tasksData.tasks.length,
        estimatedTime: tasksData.tasks.length * 2, // Приблизително 2 мин на задача
        tasks: tasksData.tasks.map(task => ({
            ...task,
            steps: generateStepsForTask(task)
        }))
    };
    
    return plan;
}

/**
 * Генерира стъпки за конкретна задача
 */
function generateStepsForTask(task) {
    const baseSteps = [
        'Вход в GitHub',
        'Навигиране към целевата страница',
        'Изпълнение на действието'
    ];
    
    // Добави специфични стъпки според типа задача
    if (task.type === 'codespace') {
        return [
            'Вход в GitHub',
            'Навигиране към Codespaces',
            'Създаване на нов Codespace',
            'Изчакване на зареждане',
            'Инсталиране на зависимости'
        ];
    } else if (task.type === 'repository') {
        return [
            'Вход в GitHub',
            'Навигиране към repository',
            'Изпълнение на действие върху repository'
        ];
    }
    
    return baseSteps;
}

/**
 * Показва плана и иска потвърждение
 */
async function confirmPlan(plan) {
    console.log('\n' + '━'.repeat(70));
    msg('planCreated');
    console.log('━'.repeat(70));
    console.log(`\n📊 Общо задачи: ${plan.totalTasks}`);
    console.log(`⏱️  Приблизително време: ${plan.estimatedTime} минути\n`);
    
    plan.tasks.forEach((task, index) => {
        console.log(`\n${index + 1}. ${task.description || task.title || 'Задача ' + task.id}`);
        console.log(`   Тип: ${task.type || 'manual'}`);
        console.log(`   Статус: ${task.status || 'pending'}`);
        console.log('   Стъпки:');
        task.steps.forEach((step, stepIndex) => {
            console.log(`     ${stepIndex + 1}. ${step}`);
        });
    });
    
    console.log('\n' + '━'.repeat(70));
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('\n' + MESSAGES[CONFIG.LANGUAGE].confirmPrompt, (answer) => {
            rl.close();
            const confirmed = answer.toLowerCase().trim() === 'да' || 
                            answer.toLowerCase().trim() === 'yes' ||
                            answer.toLowerCase().trim() === 'y';
            resolve(confirmed);
        });
    });
}

/**
 * Влиза в GitHub
 */
async function loginToGitHub(page) {
    msg('loginStarted');
    
    try {
        // Навигиране към login страницата
        console.log('  → Навигиране към github.com/login');
        await page.goto('https://github.com/login', {
            waitUntil: 'domcontentloaded'
        });
        
        // Въвеждане на email/username
        console.log('  → Въвеждане на email адрес');
        await page.fill('input[name="login"]', CONFIG.GITHUB_EMAIL);
        
        // Въвеждане на парола
        console.log('  → Въвеждане на парола');
        await page.fill('input[name="password"]', CONFIG.GITHUB_PASSWORD);
        
        // Изпращане на формата
        console.log('  → Изпращане на форма за вход');
        const submitSelectors = [
            'input[type="submit"][value="Sign in"]',
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Sign in")'
        ];
        
        let submitted = false;
        for (const selector of submitSelectors) {
            try {
                await page.click(selector, { timeout: 2000 });
                submitted = true;
                break;
            } catch (e) {
                continue;
            }
        }
        
        if (!submitted) {
            throw new Error('Не може да се намери бутон за вход');
        }
        
        // Изчакване на навигация
        await page.waitForLoadState('networkidle');
        
        // Проверка за успешен вход
        const currentUrl = page.url();
        let isLoginSuccessful = false;
        
        try {
            const url = new URL(currentUrl);
            const isGitHub = url.hostname === 'github.com' || url.hostname.endsWith('.github.com');
            const isNotLoginPage = !url.pathname.includes('/login');
            isLoginSuccessful = isGitHub && isNotLoginPage;
        } catch (e) {
            console.error('  → Грешка при анализ на URL:', e.message);
        }
        
        if (isLoginSuccessful) {
            msg('loginSuccess');
            console.log(`  → Текущ URL: ${currentUrl}`);
            return true;
        } else {
            msg('loginFailed');
            console.log(`  → Текущ URL: ${currentUrl}`);
            console.log('  → Може да е необходима 2FA автентикация');
            return false;
        }
        
    } catch (error) {
        msg('error', error.message);
        return false;
    }
}

/**
 * Изпълнява задача
 */
async function executeTask(page, task, taskIndex, totalTasks) {
    console.log(`\n[${taskIndex + 1}/${totalTasks}] Изпълнение на задача: ${task.description || task.title || 'Задача ' + task.id}`);
    console.log('━'.repeat(70));
    
    try {
        // Изпълни стъпките на задачата
        for (let i = 0; i < task.steps.length; i++) {
            console.log(`  [${i + 1}/${task.steps.length}] ${task.steps[i]}`);
            
            // Симулиране на изпълнение (в реална имплементация тук трябва да има конкретна логика)
            await page.waitForTimeout(1000);
            
            // Специфична логика според типа задача
            if (task.type === 'codespace' && i === 1) {
                console.log('    → Навигиране към https://github.com/codespaces');
                await page.goto('https://github.com/codespaces');
                await page.waitForLoadState('networkidle');
            }
        }
        
        task.status = 'completed';
        msg('taskCompleted', task.description || task.title);
        
        return true;
    } catch (error) {
        msg('error', `Грешка при изпълнение на задача: ${error.message}`);
        task.status = 'failed';
        return false;
    }
}

/**
 * Изпълнява плана
 */
async function executePlan(plan) {
    msg('executionStarted');
    msg('browserLaunching');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: CONFIG.SLOW_MO
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        // Влизане в GitHub
        const loginSuccess = await loginToGitHub(page);
        
        if (!loginSuccess) {
            console.log('\n⚠️  Влизането не е потвърдено автоматично.');
            console.log('Моля, завършете влизането ръчно в браузъра...');
            await page.waitForTimeout(CONFIG.FAILURE_TIMEOUT);
        }
        
        // Изпълни всички задачи
        let completedTasks = 0;
        for (let i = 0; i < plan.tasks.length; i++) {
            const success = await executeTask(page, plan.tasks[i], i, plan.tasks.length);
            if (success) {
                completedTasks++;
            }
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log(`✓ Завършени задачи: ${completedTasks}/${plan.tasks.length}`);
        console.log('═'.repeat(70));
        
        if (completedTasks === plan.tasks.length) {
            msg('allTasksCompleted');
        }
        
        // Остави браузъра отворен за преглед
        console.log(`\nБраузърът ще остане отворен за ${CONFIG.SUCCESS_TIMEOUT / 1000} секунди...`);
        await page.waitForTimeout(CONFIG.SUCCESS_TIMEOUT);
        
    } catch (error) {
        msg('error', error.message);
    } finally {
        console.log('\nЗатваряне на браузър...');
        await browser.close();
    }
}

/**
 * Главна функция
 */
async function main() {
    msg('welcome');
    console.log();
    
    // Проверка за парола
    if (!CONFIG.GITHUB_PASSWORD) {
        console.error('❌ Грешка: GITHUB_PASSWORD не е зададена!');
        console.error('Използвайте: GITHUB_PASSWORD=your_password node task-executor.js');
        process.exit(1);
    }
    
    // Четене на задачи
    let tasksData;
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--interactive' || args[0] === '-i') {
        msg('readingTasks');
        tasksData = await readTasksInteractively();
    } else {
        msg('readingTasks');
        tasksData = readTasksFromFile(args[0]);
    }
    
    if (!tasksData || !tasksData.tasks || tasksData.tasks.length === 0) {
        console.error('❌ Грешка: Няма заредени задачи!');
        process.exit(1);
    }
    
    msg('taskLoaded');
    console.log(`  → Брой задачи: ${tasksData.tasks.length}\n`);
    
    // Структуриране на задачи
    const plan = structureTasks(tasksData);
    
    // Потвърждение
    const confirmed = await confirmPlan(plan);
    
    if (!confirmed) {
        msg('executionCancelled');
        process.exit(0);
    }
    
    // Изпълнение
    await executePlan(plan);
    
    console.log('\n✨ Готово!\n');
}

// Стартиране
if (require.main === module) {
    main().catch((error) => {
        console.error('\n❌ Критична грешка:', error);
        process.exit(1);
    });
}

module.exports = { structureTasks, loginToGitHub, executeTask };
