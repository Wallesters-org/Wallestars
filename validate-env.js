#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are properly configured
 * Run before starting the application in production
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Required environment variables
const REQUIRED_VARS = [
  {
    name: 'ANTHROPIC_API_KEY',
    description: 'Anthropic Claude API key',
    pattern: /^sk-ant-/,
    example: 'sk-ant-api03-...'
  }
];

// Optional environment variables with defaults
const OPTIONAL_VARS = [
  {
    name: 'PORT',
    description: 'Server port',
    default: '3000',
    pattern: /^\d+$/
  },
  {
    name: 'NODE_ENV',
    description: 'Environment mode',
    default: 'development',
    allowed: ['development', 'production', 'test']
  },
  {
    name: 'ENABLE_COMPUTER_USE',
    description: 'Enable Linux computer use features',
    default: 'true',
    allowed: ['true', 'false']
  },
  {
    name: 'ENABLE_ANDROID',
    description: 'Enable Android control features',
    default: 'false',
    allowed: ['true', 'false']
  }
];

// Load .env file manually to check
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    return null;
  }
}

function validateVar(varConfig, value) {
  const errors = [];
  
  if (!value || value === 'your_api_key_here' || value === 'YOUR_KEY_HERE') {
    errors.push('Value is not configured (still using placeholder)');
  }
  
  if (varConfig.pattern && value && !varConfig.pattern.test(value)) {
    errors.push(`Value does not match expected pattern (example: ${varConfig.example})`);
  }
  
  if (varConfig.allowed && value && !varConfig.allowed.includes(value)) {
    errors.push(`Value must be one of: ${varConfig.allowed.join(', ')}`);
  }
  
  return errors;
}

function printHeader() {
  console.log(`\n${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                                                       ║${colors.reset}`);
  console.log(`${colors.cyan}║   🔐 Environment Variable Validation Check 🔐        ║${colors.reset}`);
  console.log(`${colors.cyan}║                                                       ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}\n`);
}

function main() {
  printHeader();
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check if .env file exists
  const envVars = loadEnvFile();
  if (!envVars) {
    console.log(`${colors.red}❌ ERROR: .env file not found${colors.reset}`);
    console.log(`${colors.yellow}   Run: cp .env.example .env${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✅ .env file found${colors.reset}\n`);
  
  // Validate required variables
  console.log(`${colors.blue}📋 Checking Required Variables:${colors.reset}\n`);
  
  REQUIRED_VARS.forEach(varConfig => {
    const value = process.env[varConfig.name] || envVars[varConfig.name];
    const errors = validateVar(varConfig, value);
    
    if (!value) {
      console.log(`${colors.red}❌ ${varConfig.name}${colors.reset}`);
      console.log(`   ${colors.red}ERROR: Not set${colors.reset}`);
      console.log(`   Description: ${varConfig.description}`);
      if (varConfig.example) {
        console.log(`   Example: ${varConfig.example}`);
      }
      hasErrors = true;
    } else if (errors.length > 0) {
      console.log(`${colors.red}❌ ${varConfig.name}${colors.reset}`);
      errors.forEach(error => {
        console.log(`   ${colors.red}ERROR: ${error}${colors.reset}`);
      });
      hasErrors = true;
    } else {
      const masked = value.length > 8 
        ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
        : '***';
      console.log(`${colors.green}✅ ${varConfig.name}${colors.reset}`);
      console.log(`   Value: ${masked}`);
    }
    console.log();
  });
  
  // Validate optional variables
  console.log(`${colors.blue}📋 Checking Optional Variables:${colors.reset}\n`);
  
  OPTIONAL_VARS.forEach(varConfig => {
    const value = process.env[varConfig.name] || envVars[varConfig.name];
    const errors = validateVar(varConfig, value);
    
    if (!value) {
      console.log(`${colors.yellow}⚠️  ${varConfig.name}${colors.reset}`);
      console.log(`   Using default: ${varConfig.default}`);
      hasWarnings = true;
    } else if (errors.length > 0) {
      console.log(`${colors.yellow}⚠️  ${varConfig.name}${colors.reset}`);
      errors.forEach(error => {
        console.log(`   ${colors.yellow}WARNING: ${error}${colors.reset}`);
      });
      hasWarnings = true;
    } else {
      console.log(`${colors.green}✅ ${varConfig.name}${colors.reset}`);
      console.log(`   Value: ${value}`);
    }
    console.log();
  });
  
  // Security checks
  console.log(`${colors.blue}🔒 Security Checks:${colors.reset}\n`);
  
  // Check for common mistakes
  const securityIssues = [];
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (value.includes('example') || value.includes('EXAMPLE')) {
      securityIssues.push(`${key} contains 'example' - may be using placeholder value`);
    }
    if (value.includes('test') && process.env.NODE_ENV === 'production') {
      securityIssues.push(`${key} contains 'test' in production environment`);
    }
  });
  
  if (securityIssues.length > 0) {
    securityIssues.forEach(issue => {
      console.log(`${colors.yellow}⚠️  ${issue}${colors.reset}`);
    });
    hasWarnings = true;
    console.log();
  } else {
    console.log(`${colors.green}✅ No security issues detected${colors.reset}\n`);
  }
  
  // Print summary
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  if (hasErrors) {
    console.log(`${colors.red}❌ VALIDATION FAILED${colors.reset}`);
    console.log(`${colors.red}   Please fix the errors above before starting the application${colors.reset}\n`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}⚠️  VALIDATION PASSED WITH WARNINGS${colors.reset}`);
    console.log(`${colors.yellow}   Review warnings above - application may not work as expected${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ VALIDATION PASSED${colors.reset}`);
    console.log(`${colors.green}   All environment variables are properly configured${colors.reset}\n`);
    process.exit(0);
  }
}

// Run validation
main();
