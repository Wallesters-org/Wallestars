#!/usr/bin/env node

/**
 * Airtop Workflow Testing and Validation Script
 * Tests workflow configurations, schema compatibility, and structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Helper functions
function logTest(name, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
  results.tests.push({ name, status, message });
  
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else results.warnings++;
}

function testSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

// Test 1: Validate all workflow JSON files
function testWorkflowJSONValidity() {
  testSection('Test 1: Workflow JSON Validation');
  
  const workflows = [
    'airtop-sms-otp-automation.json',
    'airtop-email-otp-automation.json',
    'profile-creation-orchestrator.json',
    'supabase-user-trigger.json'
  ];
  
  workflows.forEach(filename => {
    const filepath = path.join(rootDir, 'n8n-workflows', filename);
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const parsed = JSON.parse(content);
      
      // Check required fields
      if (!parsed.name) {
        logTest(`${filename} - has name`, 'fail', 'Missing workflow name');
        return;
      }
      
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        logTest(`${filename} - has nodes`, 'fail', 'Missing or invalid nodes array');
        return;
      }
      
      logTest(`${filename}`, 'pass', `Valid (${parsed.nodes.length} nodes)`);
      
    } catch (err) {
      logTest(`${filename}`, 'fail', err.message);
    }
  });
}

// Test 2: Validate workflow structure
function testWorkflowStructure() {
  testSection('Test 2: Workflow Structure Validation');
  
  const workflows = {
    'airtop-sms-otp-automation.json': {
      requiredNodes: ['webhook', 'supabase'],
      expectedWebhookPath: 'airtop-sms-otp'
    },
    'airtop-email-otp-automation.json': {
      requiredNodes: ['webhook', 'supabase'],
      expectedWebhookPath: 'airtop-email-otp'
    },
    'profile-creation-orchestrator.json': {
      requiredNodes: ['webhook', 'supabase'],
      expectedWebhookPath: 'profile-creation-orchestrator'
    },
    'supabase-user-trigger.json': {
      requiredNodes: ['webhook'],
      expectedWebhookPath: 'supabase-user-created'
    }
  };
  
  Object.entries(workflows).forEach(([filename, config]) => {
    const filepath = path.join(rootDir, 'n8n-workflows', filename);
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const parsed = JSON.parse(content);
      
      // Check for webhook node
      const hasWebhook = parsed.nodes.some(node => 
        node.type && node.type.includes('webhook')
      );
      
      if (!hasWebhook) {
        logTest(`${filename} - webhook node`, 'fail', 'Missing webhook trigger');
        return;
      }
      
      // Check for Supabase nodes if required
      if (config.requiredNodes.includes('supabase')) {
        const hasSupabase = parsed.nodes.some(node => 
          node.type && node.type.includes('supabase')
        );
        
        if (!hasSupabase) {
          logTest(`${filename} - supabase node`, 'warn', 'No Supabase nodes found');
        } else {
          logTest(`${filename} - structure`, 'pass', 'All required nodes present');
        }
      } else {
        logTest(`${filename} - structure`, 'pass', 'Structure valid');
      }
      
    } catch (err) {
      logTest(`${filename} - structure`, 'fail', err.message);
    }
  });
}

// Test 3: Check documentation completeness
function testDocumentation() {
  testSection('Test 3: Documentation Validation');
  
  const requiredDocs = [
    'n8n-workflows/TESTING_GUIDE.md',
    'n8n-workflows/PROJECT_SUMMARY.md',
    'n8n-workflows/WALLESTARS_PROFILE_AUTOMATION_GUIDE.md'
  ];
  
  requiredDocs.forEach(docPath => {
    const fullPath = path.join(rootDir, docPath);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if documentation is substantial
      if (content.length < 100) {
        logTest(path.basename(docPath), 'warn', 'Documentation seems incomplete');
      } else {
        logTest(path.basename(docPath), 'pass', `${(content.length / 1024).toFixed(1)}KB`);
      }
    } catch (err) {
      logTest(path.basename(docPath), 'fail', 'File not found');
    }
  });
}

// Test 4: Validate Supabase schema references
function testSupabaseSchemaReferences() {
  testSection('Test 4: Supabase Schema References');
  
  const supabaseSchemaPath = path.join(rootDir, 'supabase');
  
  // Check if supabase directory exists
  if (!fs.existsSync(supabaseSchemaPath)) {
    logTest('Supabase directory', 'warn', 'Supabase directory not found');
    return;
  }
  
  // Look for SQL schema files
  const files = fs.readdirSync(supabaseSchemaPath);
  const sqlFiles = files.filter(f => f.endsWith('.sql'));
  
  if (sqlFiles.length === 0) {
    logTest('SQL schema files', 'warn', 'No SQL files found in supabase/');
  } else {
    logTest('SQL schema files', 'pass', `Found ${sqlFiles.length} SQL files`);
    
    // Check for key tables/functions
    const keySchemaElements = [
      'users_pending',
      'verified_business_profiles',
      'verification_logs',
      'webhook_queue'
    ];
    
    sqlFiles.forEach(sqlFile => {
      const content = fs.readFileSync(path.join(supabaseSchemaPath, sqlFile), 'utf8');
      keySchemaElements.forEach(element => {
        if (content.includes(element)) {
          logTest(`Schema: ${element}`, 'pass', `Found in ${sqlFile}`);
        }
      });
    });
  }
}

// Test 5: Check for Airtop-specific configurations
function testAirtopConfigurations() {
  testSection('Test 5: Airtop Configuration Check');
  
  const airtopWorkflows = [
    'airtop-sms-otp-automation.json',
    'airtop-email-otp-automation.json'
  ];
  
  airtopWorkflows.forEach(filename => {
    const filepath = path.join(rootDir, 'n8n-workflows', filename);
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      
      // Check for Airtop-specific content
      const hasAirtopReferences = content.includes('airtop') || content.includes('Airtop');
      const hasBrowserAutomation = content.includes('browser') || content.includes('session');
      const hasAIExtraction = content.includes('extract') || content.includes('code');
      
      if (!hasAirtopReferences) {
        logTest(`${filename} - Airtop refs`, 'warn', 'No Airtop references found');
      } else {
        logTest(`${filename} - Airtop refs`, 'pass', 'Contains Airtop configuration');
      }
      
      if (hasBrowserAutomation) {
        logTest(`${filename} - Browser automation`, 'pass', 'Browser automation configured');
      }
      
      if (hasAIExtraction) {
        logTest(`${filename} - AI extraction`, 'pass', 'AI extraction logic present');
      }
      
    } catch (err) {
      logTest(`${filename}`, 'fail', err.message);
    }
  });
}

// Test 6: Validate webhook paths
function testWebhookPaths() {
  testSection('Test 6: Webhook Path Validation');
  
  const expectedPaths = {
    'supabase-user-trigger.json': 'supabase-user-created',
    'profile-creation-orchestrator.json': 'profile-creation-orchestrator',
    'airtop-sms-otp-automation.json': 'airtop-sms-otp',
    'airtop-email-otp-automation.json': 'airtop-email-otp'
  };
  
  Object.entries(expectedPaths).forEach(([filename, expectedPath]) => {
    const filepath = path.join(rootDir, 'n8n-workflows', filename);
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const parsed = JSON.parse(content);
      
      const webhookNode = parsed.nodes.find(node => 
        node.type && node.type.includes('webhook')
      );
      
      if (!webhookNode) {
        logTest(`${filename} - webhook path`, 'fail', 'No webhook node found');
        return;
      }
      
      const actualPath = webhookNode.parameters?.path || webhookNode.webhookId;
      
      if (actualPath === expectedPath) {
        logTest(`${filename} - webhook path`, 'pass', `/webhook/${actualPath}`);
      } else {
        logTest(`${filename} - webhook path`, 'warn', 
          `Expected "${expectedPath}", got "${actualPath}"`);
      }
      
    } catch (err) {
      logTest(`${filename} - webhook path`, 'fail', err.message);
    }
  });
}

// Test 7: Check for credentials configuration
function testCredentialsSetup() {
  testSection('Test 7: Credentials Configuration Check');
  
  const workflows = [
    'airtop-sms-otp-automation.json',
    'airtop-email-otp-automation.json',
    'profile-creation-orchestrator.json',
    'supabase-user-trigger.json'
  ];
  
  workflows.forEach(filename => {
    const filepath = path.join(rootDir, 'n8n-workflows', filename);
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const parsed = JSON.parse(content);
      
      // Check if any nodes have credentials configured
      const nodesWithCredentials = parsed.nodes.filter(node => 
        node.credentials && Object.keys(node.credentials).length > 0
      );
      
      if (nodesWithCredentials.length > 0) {
        logTest(`${filename} - credentials`, 'pass', 
          `${nodesWithCredentials.length} nodes with credentials`);
      } else {
        logTest(`${filename} - credentials`, 'warn', 
          'No credentials configured (may need setup)');
      }
      
    } catch (err) {
      logTest(`${filename} - credentials`, 'fail', err.message);
    }
  });
}

// Test 8: Integration test readiness
function testIntegrationReadiness() {
  testSection('Test 8: Integration Test Readiness');
  
  // Check if testing guide has test cases
  const testingGuidePath = path.join(rootDir, 'n8n-workflows/TESTING_GUIDE.md');
  
  try {
    const content = fs.readFileSync(testingGuidePath, 'utf8');
    
    // Count test cases
    const testCaseMatches = content.match(/### Test Case \d+:/g);
    const testCaseCount = testCaseMatches ? testCaseMatches.length : 0;
    
    if (testCaseCount >= 10) {
      logTest('Test cases documented', 'pass', `${testCaseCount} test cases found`);
    } else if (testCaseCount > 0) {
      logTest('Test cases documented', 'warn', `Only ${testCaseCount} test cases found`);
    } else {
      logTest('Test cases documented', 'fail', 'No test cases found');
    }
    
    // Check for automation scripts
    const hasAutomationScript = content.includes('automated-test.sh') || 
                                 content.includes('automation');
    
    if (hasAutomationScript) {
      logTest('Automation scripts', 'pass', 'Automation scripts documented');
    } else {
      logTest('Automation scripts', 'warn', 'No automation scripts mentioned');
    }
    
  } catch (err) {
    logTest('Testing guide', 'fail', err.message);
  }
}

// Generate test summary
function generateSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📊 Total: ${results.tests.length}`);
  
  const successRate = ((results.passed / results.tests.length) * 100).toFixed(1);
  console.log(`\n🎯 Success Rate: ${successRate}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Workflows are ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the failures above.');
  }
  
  // Export results as JSON
  const resultsPath = path.join(rootDir, 'test-results-airtop-workflows.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full results saved to: ${resultsPath}`);
  
  return results.failed === 0 ? 0 : 1;
}

// Main execution
async function main() {
  console.log('🧪 Airtop Workflow Testing Suite');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  
  try {
    testWorkflowJSONValidity();
    testWorkflowStructure();
    testDocumentation();
    testSupabaseSchemaReferences();
    testAirtopConfigurations();
    testWebhookPaths();
    testCredentialsSetup();
    testIntegrationReadiness();
    
    const exitCode = generateSummary();
    process.exit(exitCode);
    
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Run tests
main();
