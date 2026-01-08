# Scripts Directory

## Repository Analyzer

### 📊 analyze-repository.js

Comprehensive repository analysis tool that exports detailed information about the Wallestars project structure.

#### What it analyzes:

- **Git Information**
  - All branches (local and remote)
  - Current branch
  - Recent commits with graph visualization

- **Package Information**
  - Dependencies (production and development)
  - NPM scripts
  - Project metadata

- **API Routes**
  - All server endpoints
  - HTTP methods
  - Route parameters

- **UI Components**
  - React components
  - Page components
  - Component hierarchy

- **WebSocket Events**
  - Socket.io event handlers
  - Real-time communication events

- **MCP Configuration**
  - Model Context Protocol setup
  - Server configuration
  - Environment variables

- **Documentation**
  - All markdown files
  - File sizes and line counts

#### Usage:

```bash
# Run the analyzer
npm run analyze

# Or directly
node scripts/analyze-repository.js
```

#### Output:

1. **Console Output** - Human-readable summary printed to terminal
2. **JSON File** - Detailed analysis saved to `repository-analysis.json`

#### Example Output:

```
🔍 Analyzing Wallestars Repository...

📊 Analysis Complete!

═══════════════════════════════════════════════════════════

📦 Package Information:
  Name: wallestars-control-center
  Version: 1.0.0
  Description: Professional platform for Claude AI control...

🌿 Git Branches:
  Current: main
  Total branches: 5

🛣️  API Routes:
  claude.js:
    POST /chat
    POST /computer-use
    GET /capabilities
  ...

✅ Detailed analysis saved to: repository-analysis.json
```

#### Programmatic Usage:

You can also import and use the analyzer functions in your own scripts:

```javascript
import { generateReport, analyzeGitBranches } from './scripts/analyze-repository.js';

// Generate full report
const report = generateReport();

// Or use individual analyzers
const gitInfo = analyzeGitBranches();
console.log('Current branch:', gitInfo.currentBranch);
```

#### When to Run:

- Before major releases to document current state
- When onboarding new team members
- To generate project documentation
- For code audits and reviews
- To track project evolution over time

---

**Note:** The generated `repository-analysis.json` file is ignored by git by default. If you want to commit it, remove it from `.gitignore`.
