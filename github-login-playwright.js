#!/usr/bin/env node

/**
 * GitHub Web Login with Playwright
 * 
 * This script demonstrates a complete implementation of browser automation
 * to open a new browser session and login to GitHub using Playwright.
 * 
 * Installation:
 * npm install
 * 
 * Usage:
 * GITHUB_USERNAME=your_username GITHUB_PASSWORD=your_password node github-login-playwright.js
 */

const { chromium } = require('playwright');

/**
 * Open browser and login to GitHub
 */
async function loginToGitHub() {
    const username = process.env.GITHUB_USERNAME;
    const password = process.env.GITHUB_PASSWORD;
    
    if (!username || !password) {
        console.error('Error: GITHUB_USERNAME and GITHUB_PASSWORD environment variables are required');
        console.error('Usage: GITHUB_USERNAME=user GITHUB_PASSWORD=pass node github-login-playwright.js');
        process.exit(1);
    }
    
    console.log('Starting browser automation...\n');
    
    // Launch browser in non-headless mode so you can see the session
    console.log('[1/7] Launching browser...');
    const browser = await chromium.launch({
        headless: false, // Set to false to see the browser
        slowMo: 100 // Slow down by 100ms for visibility
    });
    
    // Create a new browser context (like an incognito window)
    console.log('[2/7] Creating new browser context...');
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    // Open a new page/tab
    console.log('[3/7] Opening new page...');
    const page = await context.newPage();
    
    try {
        // Navigate to GitHub login page
        console.log('[4/7] Navigating to GitHub login page...');
        await page.goto('https://github.com/login', {
            waitUntil: 'domcontentloaded'
        });
        
        // Fill in the username
        console.log('[5/7] Entering credentials...');
        await page.fill('input[name="login"]', username);
        await page.fill('input[name="password"]', password);
        
        // Submit the login form
        console.log('[6/7] Submitting login form...');
        await page.click('input[type="submit"][value="Sign in"]');
        
        // Wait for navigation after login
        await page.waitForLoadState('networkidle');
        
        // Check if login was successful
        console.log('[7/7] Verifying login...');
        const currentUrl = page.url();
        
        if (currentUrl.includes('github.com') && !currentUrl.includes('login')) {
            console.log('\n✓ SUCCESS: Logged into GitHub!');
            console.log(`Current URL: ${currentUrl}`);
            
            // Keep the browser open for 30 seconds to see the logged-in state
            console.log('\nBrowser session will remain open for 30 seconds...');
            await page.waitForTimeout(30000);
        } else {
            console.log('\n✗ WARNING: Login may have failed or requires 2FA');
            console.log(`Current URL: ${currentUrl}`);
            
            // Keep browser open longer if login failed to allow manual intervention
            console.log('\nBrowser session will remain open for 60 seconds...');
            await page.waitForTimeout(60000);
        }
        
    } catch (error) {
        console.error('\n✗ ERROR during login process:');
        console.error(error.message);
    } finally {
        // Clean up
        console.log('\nClosing browser...');
        await browser.close();
        console.log('Browser closed.');
    }
}

// Run the script
loginToGitHub()
    .then(() => {
        console.log('\nScript completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nScript failed:');
        console.error(error);
        process.exit(1);
    });
