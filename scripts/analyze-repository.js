#!/usr/bin/env node

/**
 * Wallestars Repository Analyzer
 * 
 * Analyzes the repository structure and exports detailed information about:
 * - Branches and commits
 * - Chat system and agent sessions
 * - API routes and endpoints
 * - UI components and pages
 * - Configuration and dependencies
 * - MCP integration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Utility functions
function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', cwd: ROOT_DIR });
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function scanDirectory(dirPath, filter = () => true) {
  const results = [];
  
  function scan(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const relPath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (filter(item, stat)) {
        if (stat.isDirectory()) {
          results.push({ type: 'dir', path: relPath });
          scan(fullPath, relPath);
        } else {
          results.push({ type: 'file', path: relPath, size: stat.size });
        }
      }
    }
  }
  
  scan(dirPath);
  return results;
}

// Analysis functions
function analyzeGitBranches() {
  const branches = executeCommand('git branch -a');
  const currentBranch = executeCommand('git branch --show-current').trim();
  const commits = executeCommand('git log --all --oneline --graph -20');
  
  return {
    branches: branches.split('\n').filter(b => b.trim()),
    currentBranch,
    recentCommits: commits.split('\n').filter(c => c.trim())
  };
}

function analyzePackageJson() {
  const packageJson = readJsonFile(path.join(ROOT_DIR, 'package.json'));
  
  if (!packageJson) return null;
  
  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    scripts: packageJson.scripts,
    dependencies: Object.keys(packageJson.dependencies || {}),
    devDependencies: Object.keys(packageJson.devDependencies || {})
  };
}

function analyzeMcpConfig() {
  const mcpJson = readJsonFile(path.join(ROOT_DIR, '.mcp.json'));
  return mcpJson;
}

function analyzeServerRoutes() {
  const routesDir = path.join(ROOT_DIR, 'server', 'routes');
  const routes = [];
  
  if (fs.existsSync(routesDir)) {
    const files = fs.readdirSync(routesDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
        const endpoints = [];
        
        // Extract route definitions
        const routeRegex = /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = routeRegex.exec(content)) !== null) {
          endpoints.push({
            method: match[1].toUpperCase(),
            path: match[2]
          });
        }
        
        routes.push({
          file: file,
          endpoints: endpoints
        });
      }
    }
  }
  
  return routes;
}

function analyzeComponents() {
  const componentsDir = path.join(ROOT_DIR, 'src', 'components');
  const pagesDir = path.join(ROOT_DIR, 'src', 'pages');
  
  const components = [];
  const pages = [];
  
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    components.push(...files.filter(f => f.endsWith('.jsx') || f.endsWith('.js')));
  }
  
  if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir);
    pages.push(...files.filter(f => f.endsWith('.jsx') || f.endsWith('.js')));
  }
  
  return { components, pages };
}

function analyzeSocketHandlers() {
  const handlersPath = path.join(ROOT_DIR, 'server', 'socket', 'handlers.js');
  
  if (!fs.existsSync(handlersPath)) {
    return { events: [], description: 'Socket handlers not found' };
  }
  
  const content = fs.readFileSync(handlersPath, 'utf-8');
  const events = [];
  
  // Extract socket.on events
  const eventRegex = /socket\.on\(['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = eventRegex.exec(content)) !== null) {
    events.push(match[1]);
  }
  
  return {
    events: [...new Set(events)],
    description: 'WebSocket event handlers for real-time communication'
  };
}

function analyzeDocumentation() {
  const docs = [];
  const files = fs.readdirSync(ROOT_DIR);
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const stat = fs.statSync(path.join(ROOT_DIR, file));
      docs.push({
        name: file,
        size: stat.size,
        lines: fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8').split('\n').length
      });
    }
  }
  
  return docs;
}

function generateReport() {
  console.log('🔍 Analyzing Wallestars Repository...\n');
  
  const analysis = {
    timestamp: new Date().toISOString(),
    git: analyzeGitBranches(),
    package: analyzePackageJson(),
    mcp: analyzeMcpConfig(),
    routes: analyzeServerRoutes(),
    ui: analyzeComponents(),
    socket: analyzeSocketHandlers(),
    documentation: analyzeDocumentation()
  };
  
  // Generate report
  console.log('📊 Analysis Complete!\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📦 Package Information:');
  console.log(`  Name: ${analysis.package.name}`);
  console.log(`  Version: ${analysis.package.version}`);
  console.log(`  Description: ${analysis.package.description}\n`);
  
  console.log('🌿 Git Branches:');
  console.log(`  Current: ${analysis.git.currentBranch}`);
  console.log(`  Total branches: ${analysis.git.branches.length}\n`);
  
  console.log('📝 Recent Commits:');
  analysis.git.recentCommits.slice(0, 5).forEach(commit => {
    console.log(`  ${commit}`);
  });
  console.log('');
  
  console.log('🛣️  API Routes:');
  analysis.routes.forEach(route => {
    console.log(`  ${route.file}:`);
    route.endpoints.forEach(ep => {
      console.log(`    ${ep.method} ${ep.path}`);
    });
  });
  console.log('');
  
  console.log('🎨 UI Components:');
  console.log(`  Components: ${analysis.ui.components.length}`);
  analysis.ui.components.forEach(c => console.log(`    - ${c}`));
  console.log(`  Pages: ${analysis.ui.pages.length}`);
  analysis.ui.pages.forEach(p => console.log(`    - ${p}`));
  console.log('');
  
  console.log('🔌 WebSocket Events:');
  analysis.socket.events.forEach(event => {
    console.log(`  - ${event}`);
  });
  console.log('');
  
  console.log('📚 Documentation Files:');
  analysis.documentation.forEach(doc => {
    console.log(`  - ${doc.name} (${doc.lines} lines)`);
  });
  console.log('');
  
  console.log('📦 Dependencies:');
  console.log(`  Production: ${analysis.package.dependencies.length}`);
  console.log(`  Development: ${analysis.package.devDependencies.length}\n`);
  
  console.log('🔌 MCP Configuration:');
  if (analysis.mcp && analysis.mcp.mcpServers) {
    Object.keys(analysis.mcp.mcpServers).forEach(server => {
      console.log(`  Server: ${server}`);
      console.log(`  Command: ${analysis.mcp.mcpServers[server].command}`);
    });
  }
  console.log('');
  
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Save to JSON
  const outputPath = path.join(ROOT_DIR, 'repository-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`✅ Detailed analysis saved to: ${outputPath}\n`);
  
  return analysis;
}

// Export for programmatic use
export { generateReport, analyzeGitBranches, analyzePackageJson, analyzeMcpConfig };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport();
}
