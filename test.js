#!/usr/bin/env node

/**
 * Test Script for GitHub Login Automation
 * 
 * This script tests the GitHub login automation without actually
 * logging in. It verifies that all components are working correctly.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    log(`✓ ${message}`, 'green');
}

function error(message) {
    log(`✗ ${message}`, 'red');
}

function info(message) {
    log(`ℹ ${message}`, 'blue');
}

function warning(message) {
    log(`⚠ ${message}`, 'yellow');
}

/**
 * Test suite
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    log('GitHub Login Automation - Test Suite', 'blue');
    console.log('='.repeat(60) + '\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Check if required files exist
    info('Test 1: Checking if required files exist...');
    const requiredFiles = [
        'package.json',
        'github-login.js',
        'github-login-playwright.js',
        'README.md',
        '.gitignore'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            success(`  ${file} exists`);
            passed++;
        } else {
            error(`  ${file} is missing`);
            failed++;
        }
    }
    
    // Test 2: Verify package.json structure
    info('\nTest 2: Verifying package.json structure...');
    try {
        const packageJson = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
        );
        
        if (packageJson.name) {
            success(`  Package name: ${packageJson.name}`);
            passed++;
        } else {
            error('  Package name is missing');
            failed++;
        }
        
        if (packageJson.dependencies && packageJson.dependencies.playwright) {
            success(`  Playwright dependency found: ${packageJson.dependencies.playwright}`);
            passed++;
        } else {
            error('  Playwright dependency is missing');
            failed++;
        }
        
        if (packageJson.scripts && packageJson.scripts.login) {
            success(`  Login script found: ${packageJson.scripts.login}`);
            passed++;
        } else {
            error('  Login script is missing');
            failed++;
        }
    } catch (err) {
        error(`  Failed to parse package.json: ${err.message}`);
        failed++;
    }
    
    // Test 3: Check if scripts are executable
    info('\nTest 3: Checking if scripts have proper structure...');
    try {
        const demoScript = fs.readFileSync(
            path.join(__dirname, 'github-login.js'),
            'utf8'
        );
        
        if (demoScript.includes('loginToGitHub')) {
            success('  Demo script has loginToGitHub function');
            passed++;
        } else {
            error('  Demo script is missing loginToGitHub function');
            failed++;
        }
        
        if (demoScript.includes('GITHUB_USERNAME') && demoScript.includes('GITHUB_PASSWORD')) {
            success('  Demo script handles environment variables');
            passed++;
        } else {
            warning('  Demo script may not handle environment variables');
        }
    } catch (err) {
        error(`  Failed to read demo script: ${err.message}`);
        failed++;
    }
    
    // Test 4: Verify Playwright script structure
    info('\nTest 4: Verifying Playwright script...');
    try {
        const playwrightScript = fs.readFileSync(
            path.join(__dirname, 'github-login-playwright.js'),
            'utf8'
        );
        
        if (playwrightScript.includes('chromium')) {
            success('  Playwright script imports chromium');
            passed++;
        } else {
            error('  Playwright script does not import chromium');
            failed++;
        }
        
        if (playwrightScript.includes('page.goto')) {
            success('  Playwright script has navigation logic');
            passed++;
        } else {
            error('  Playwright script is missing navigation logic');
            failed++;
        }
        
        if (playwrightScript.includes('page.fill')) {
            success('  Playwright script has form filling logic');
            passed++;
        } else {
            error('  Playwright script is missing form filling logic');
            failed++;
        }
        
        if (playwrightScript.includes('github.com/login')) {
            success('  Playwright script targets GitHub login URL');
            passed++;
        } else {
            error('  Playwright script does not target GitHub login URL');
            failed++;
        }
    } catch (err) {
        error(`  Failed to read Playwright script: ${err.message}`);
        failed++;
    }
    
    // Test 5: Test the demo script execution
    info('\nTest 5: Testing demo script execution...');
    try {
        const { execSync } = require('child_process');
        const output = execSync(
            'GITHUB_USERNAME=test GITHUB_PASSWORD=test node github-login.js',
            { encoding: 'utf8', cwd: __dirname }
        );
        
        if (output.includes('SUCCESS')) {
            success('  Demo script executes successfully');
            passed++;
        } else {
            error('  Demo script does not show success message');
            failed++;
        }
        
        if (output.includes('Starting browser session')) {
            success('  Demo script shows browser session message');
            passed++;
        } else {
            error('  Demo script missing browser session message');
            failed++;
        }
    } catch (err) {
        error(`  Demo script execution failed: ${err.message}`);
        failed++;
    }
    
    // Test 6: Verify README documentation
    info('\nTest 6: Verifying README documentation...');
    try {
        const readme = fs.readFileSync(
            path.join(__dirname, 'README.md'),
            'utf8'
        );
        
        if (readme.includes('Installation')) {
            success('  README includes installation instructions');
            passed++;
        } else {
            warning('  README missing installation section');
        }
        
        if (readme.includes('Usage')) {
            success('  README includes usage instructions');
            passed++;
        } else {
            warning('  README missing usage section');
        }
        
        if (readme.includes('npm run login')) {
            success('  README documents npm run login command');
            passed++;
        } else {
            warning('  README missing login command documentation');
        }
    } catch (err) {
        error(`  Failed to read README: ${err.message}`);
        failed++;
    }
    
    // Test 7: Check .gitignore
    info('\nTest 7: Verifying .gitignore...');
    try {
        const gitignore = fs.readFileSync(
            path.join(__dirname, '.gitignore'),
            'utf8'
        );
        
        if (gitignore.includes('node_modules')) {
            success('  .gitignore excludes node_modules');
            passed++;
        } else {
            error('  .gitignore does not exclude node_modules');
            failed++;
        }
        
        if (gitignore.includes('.env')) {
            success('  .gitignore excludes .env files');
            passed++;
        } else {
            warning('  .gitignore does not exclude .env files');
        }
    } catch (err) {
        error(`  Failed to read .gitignore: ${err.message}`);
        failed++;
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    log('Test Summary', 'blue');
    console.log('='.repeat(60));
    success(`Passed: ${passed}`);
    if (failed > 0) {
        error(`Failed: ${failed}`);
    }
    console.log('='.repeat(60) + '\n');
    
    if (failed === 0) {
        success('All tests passed! ✨');
        return 0;
    } else {
        error(`${failed} test(s) failed.`);
        return 1;
    }
}

// Run the tests
runTests()
    .then((exitCode) => {
        process.exit(exitCode);
    })
    .catch((error) => {
        error(`Test suite crashed: ${error.message}`);
        process.exit(1);
    });
