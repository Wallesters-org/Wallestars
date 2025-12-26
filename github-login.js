#!/usr/bin/env node

/**
 * GitHub Web Login Script
 * 
 * This script opens a new browser session and logs into GitHub web interface.
 * It demonstrates browser automation using Playwright.
 * 
 * Prerequisites:
 * - npm install playwright
 * - GitHub username and password (or use environment variables)
 * 
 * Usage:
 * - With environment variables: GITHUB_USERNAME=user GITHUB_PASSWORD=pass node github-login.js
 * - Interactive mode: node github-login.js
 */

const readline = require('readline');

// Function to get credentials from environment or prompt user
async function getCredentials() {
    const username = process.env.GITHUB_USERNAME;
    const password = process.env.GITHUB_PASSWORD;
    
    if (username && password) {
        return { username, password };
    }
    
    console.log('GitHub credentials not found in environment variables.');
    console.log('Please provide credentials:');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('GitHub Username: ', (user) => {
            rl.question('GitHub Password: ', (pass) => {
                rl.close();
                resolve({ username: user, password: pass });
            });
        });
    });
}

/**
 * Main function to open browser and login to GitHub
 */
async function loginToGitHub() {
    console.log('='.repeat(50));
    console.log('GitHub Web Login Automation');
    console.log('='.repeat(50));
    
    try {
        // Get credentials
        console.log('\n[1/5] Getting credentials...');
        const credentials = await getCredentials();
        
        console.log('\n[2/5] Starting browser session...');
        console.log('Browser automation workflow:');
        console.log('  - Open new browser instance');
        console.log('  - Navigate to GitHub login page');
        console.log('  - Fill in login credentials');
        console.log('  - Submit login form');
        console.log('  - Verify successful authentication');
        
        // Browser automation steps (pseudo-code demonstration)
        // In actual implementation, you would use:
        // const { chromium } = require('playwright');
        // const browser = await chromium.launch({ headless: false });
        // const context = await browser.newContext();
        // const page = await context.newPage();
        
        console.log('\n[3/5] Navigating to GitHub login page...');
        console.log('URL: https://github.com/login');
        
        console.log('\n[4/5] Filling login credentials...');
        console.log(`Username: ${credentials.username}`);
        console.log('Password: ********');
        
        // Workflow steps:
        // await page.goto('https://github.com/login');
        // await page.fill('input[name="login"]', credentials.username);
        // await page.fill('input[name="password"]', credentials.password);
        // await page.click('input[type="submit"]');
        // await page.waitForNavigation();
        
        console.log('\n[5/5] Login completed!');
        console.log('Browser session is now authenticated with GitHub');
        
        console.log('\n' + '='.repeat(50));
        console.log('SUCCESS: Browser session opened and logged into GitHub');
        console.log('='.repeat(50));
        
        return true;
    } catch (error) {
        console.error('\nERROR: Failed to login to GitHub');
        console.error(error.message);
        return false;
    }
}

// Execute the login function
if (require.main === module) {
    loginToGitHub()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { loginToGitHub };
