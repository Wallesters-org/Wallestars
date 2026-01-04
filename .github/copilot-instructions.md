# Copilot Instructions for Wallestars Control Center

This repository contains **Wallestars Control Center**, a professional platform for Claude AI automation on Linux and Android with beautiful real-time visualization.

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Getting Started](#-getting-started)
4. [Code Style & Conventions](#-code-style--conventions)
5. [Common Development Tasks](#-common-development-tasks)
6. [Security Guidelines](#-security-guidelines)
7. [Testing & Quality](#-testing--quality)
8. [Debugging Guide](#-debugging-guide)
9. [Deployment](#-deployment)
10. [Best Practices](#-best-practices)

---

## 🎯 Project Overview

### Technology Stack

**Frontend:**
- React 18.2 with Vite 5.0
- Tailwind CSS 3.4 for styling
- Framer Motion 11.0 for animations

**Backend:**
- Express.js REST API
- Socket.io for real-time communication
- Node.js 20.x+

**AI Integration:**
- Anthropic Claude API (Sonnet 4.5)
- Model Context Protocol (MCP)

### Key Features

- **Claude AI Chat**: Interactive interface with Computer Use API
- **Linux Automation**: Desktop control via xdotool
- **Android Control**: Device management via ADB
- **Real-time Communication**: WebSocket-based updates
- **MCP Server**: Integration with Claude Desktop
- **Prompt Generation**: Templates for Spark applications

---

## 🏗️ Architecture

### Project Structure

```
wallestars/
├── .github/            # GitHub configuration
│   ├── copilot-instructions.md
│   └── workflows/      # CI/CD pipelines
├── server/             # Express.js backend
│   ├── index.js       # Main server + MCP support
│   ├── routes/        # API endpoints
│   │   ├── claude.js      # Claude AI integration
│   │   ├── computerUse.js # Linux automation
│   │   └── android.js     # Android control
│   └── socket/        # WebSocket handlers
├── src/               # React frontend
│   ├── pages/         # Route pages
│   ├── components/    # Reusable UI components
│   ├── context/       # React context (Socket)
│   └── index.css      # Global styles
├── prompts/           # AI prompt templates
├── .env.example       # Environment template
└── package.json       # Dependencies
```

### Communication Flow

1. **Web Application Flow**
   - React UI → Express REST API → Claude AI / System Commands
   - Real-time updates via Socket.io

2. **MCP Integration Flow**
   - Claude Desktop → MCP Protocol (stdio) → Wallestars Server → Tool Execution

3. **Data Flow**
   - Frontend uses Socket.io context for real-time state
   - Backend validates requests before execution
   - System commands executed with security constraints

---

## 🚀 Getting Started

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Edit .env and add your API key
# ANTHROPIC_API_KEY=your_key_here
```

### Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start individually
npm run server    # Backend only (nodemon, port 3000)
npm run client    # Frontend only (Vite, port 5173)
```

### Build & Production

```bash
# Build for production
npm run build     # Outputs to dist/

# Start production server
npm start         # Serves built files

# Preview production build
npm run preview   # Test before deployment
```

---

## 📝 Code Style & Conventions

### General Principles

- **Module System**: ES Modules (`import`/`export`)
- **Async Patterns**: `async`/`await` over promises
- **Error Handling**: Always use try-catch blocks
- **Configuration**: Environment variables via `.env`

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `ClaudeChat.jsx` |
| Functions/Variables | camelCase | `fetchMessages`, `userData` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Files (React) | PascalCase.jsx | `Dashboard.jsx` |
| Files (Utilities) | camelCase.js | `apiClient.js` |

### File Organization

**Import Order:**
1. External packages (React, libraries)
2. Internal modules (components, utils)
3. Styles and assets

```javascript
// ✅ Good
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MyComponent from './components/MyComponent';
import './styles.css';
```

### React Patterns

**Component Structure:**
```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ComponentName({ title, onAction }) {
  // 1. State declarations
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // 3. Event handlers
  const handleClick = () => {
    onAction(data);
  };
  
  // 4. Render
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="p-4"
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <button onClick={handleClick}>Action</button>
      )}
    </motion.div>
  );
}
```

**Best Practices:**
- Use functional components with hooks
- Destructure props in function signature
- Prefix event handlers with `handle`
- Use `useContext` for global state
- Keep components focused and small

### Backend Patterns

**Route Handler Structure:**
```javascript
import express from 'express';
const router = express.Router();

router.post('/endpoint', async (req, res) => {
  try {
    // 1. Validate input
    const { param } = req.body;
    if (!param) {
      return res.status(400).json({ 
        error: 'Missing required parameter' 
      });
    }
    
    // 2. Process request
    const result = await processRequest(param);
    
    // 3. Return response
    res.json({ success: true, data: result });
  } catch (error) {
    // 4. Error handling
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;
```

**Best Practices:**
- Use Express Router for modular routes
- Validate all inputs before processing
- Return consistent error structures
- Log errors for debugging
- Use appropriate HTTP status codes

### Styling Guidelines

**Tailwind CSS Usage:**
```jsx
// ✅ Preferred - Utility classes
<div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
  <h2 className="text-xl font-semibold text-sky-500">Title</h2>
</div>

// ⚠️ Use sparingly - Custom CSS
// Add to src/index.css only when Tailwind is insufficient
```

**Theme Conventions:**
- Primary color: Sky blue (`sky-500`, `#0ea5e9`)
- Background: Dark theme (`gray-800`, `gray-900`)
- Text: Light (`gray-100`, `gray-200`)
- Animations: Framer Motion for complex effects

---

## 🛠️ Common Development Tasks

### Adding a New API Endpoint

1. **Create route file** (if new domain):
   ```bash
   touch server/routes/newFeature.js
   ```

2. **Implement route**:
   ```javascript
   import express from 'express';
   const router = express.Router();
   
   router.post('/action', async (req, res) => {
     // Implementation
   });
   
   export default router;
   ```

3. **Register in server**:
   ```javascript
   // server/index.js
   import newFeatureRoutes from './routes/newFeature.js';
   app.use('/api/new-feature', newFeatureRoutes);
   ```

4. **Test the endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/new-feature/action \
     -H "Content-Type: application/json" \
     -d '{"param": "value"}'
   ```

### Adding a New Page

1. **Create page component**:
   ```bash
   touch src/pages/NewPage.jsx
   ```

2. **Implement component**:
   ```jsx
   export default function NewPage() {
     return (
       <div className="p-6">
         <h1 className="text-3xl font-bold">New Page</h1>
       </div>
     );
   }
   ```

3. **Add route**:
   ```jsx
   // src/App.jsx
   import NewPage from './pages/NewPage';
   
   <Route path="/new-page" element={<NewPage />} />
   ```

4. **Add navigation**:
   ```jsx
   // src/components/Sidebar.jsx
   <Link to="/new-page">New Page</Link>
   ```

### Integrating AI Features

1. **Add to Claude route** (`server/routes/claude.js`):
   ```javascript
   router.post('/new-ai-feature', async (req, res) => {
     try {
       const message = await anthropic.messages.create({
         model: 'claude-sonnet-4-20250514',
         max_tokens: 1024,
         messages: [{ role: 'user', content: req.body.prompt }]
       });
       res.json({ result: message.content });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

2. **Create frontend integration**:
   ```jsx
   const callAIFeature = async (prompt) => {
     const response = await fetch('/api/claude/new-ai-feature', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ prompt })
     });
     return response.json();
   };
   ```

3. **Handle responses with error states**:
   ```jsx
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   
   const handleAIRequest = async () => {
     try {
       setLoading(true);
       setError(null);
       const result = await callAIFeature(prompt);
       // Handle success
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   
   // In render:
   {loading && <LoadingSpinner />}
   {error && <ErrorMessage message={error} />}
   ```

### Adding MCP Tools

1. **Define tool** in `server/index.js`:
   ```javascript
   const tools = [
     {
       name: 'new_tool',
       description: 'Tool description',
       inputSchema: {
         type: 'object',
         properties: {
           param: { type: 'string' }
         },
         required: ['param']
       }
     }
   ];
   ```

2. **Implement handler**:
   ```javascript
   case 'new_tool':
     return { result: await executeNewTool(args) };
   ```

3. **Update documentation** in `MCP_SETUP.md`

4. **Test with Claude Desktop**

---

## 🔒 Security Guidelines

### API Keys & Secrets Management

**✅ DO:**
- Store all secrets in `.env` file
- Use environment variables in code
- Add `.env` to `.gitignore`
- Validate env vars on startup
- Use different keys for dev/prod

**❌ DON'T:**
- Commit API keys to repository
- Hardcode secrets in code
- Log sensitive information
- Share keys in pull requests
- Expose keys in client-side code

**Example Validation:**
```javascript
// server/index.js startup
const requiredEnvVars = ['ANTHROPIC_API_KEY'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

### Input Validation & Sanitization

**Command Execution:**
```javascript
// ❌ Dangerous - Command injection risk
exec(`xdotool ${userInput}`);

// ✅ Safe - Whitelist approach
const allowedCommands = ['mousemove', 'click', 'type'];
if (!allowedCommands.includes(command)) {
  throw new Error('Invalid command');
}
exec(`xdotool ${command} ${sanitizedArgs}`);
```

**Path Validation:**
```javascript
// ✅ Prevent path traversal
import path from 'path';

function validatePath(userPath) {
  const normalized = path.normalize(userPath);
  if (normalized.includes('..')) {
    throw new Error('Invalid path');
  }
  return normalized;
}
```

### System Command Safety

**Best Practices:**
1. **Whitelist commands**: Only allow predefined safe operations
2. **Sanitize inputs**: Escape special characters
3. **User confirmation**: Require approval for destructive actions
4. **Minimal permissions**: Run with least privilege necessary
5. **Audit logging**: Log all system operations

**Example Implementation:**
```javascript
const ALLOWED_COMMANDS = {
  screenshot: 'import -window root',
  mouseMove: 'xdotool mousemove',
  click: 'xdotool click'
};

function executeCommand(action, params) {
  if (!ALLOWED_COMMANDS[action]) {
    throw new Error('Unauthorized command');
  }
  
  // Sanitize parameters
  const sanitized = params.map(p => 
    String(p).replace(/[;&|`$]/g, '')
  );
  
  // Execute safely
  const command = `${ALLOWED_COMMANDS[action]} ${sanitized.join(' ')}`;
  return exec(command);
}
```

### Dependency Security

**Maintenance Tasks:**
```bash
# Check for vulnerabilities
npm audit

# Fix auto-fixable issues
npm audit fix

# Update dependencies (carefully)
npm update

# Check outdated packages
npm outdated
```

**Guidelines:**
- Run `npm audit` before adding dependencies
- Review package reputation and maintenance
- Use exact versions for production
- Keep dependencies minimal
- Check licenses for compliance

---

## 🧪 Testing & Quality

### Test Infrastructure

**Current State:**
- Minimal test infrastructure
- Placeholder test command: `npm run test`

**Recommended Tools:**
- **Backend**: Jest or Mocha + Chai
- **Frontend**: Vitest + React Testing Library
- **E2E**: Playwright or Cypress

### Testing Guidelines

**When adding tests:**

1. **Unit Tests**: Test individual functions
   ```javascript
   // Example with Jest
   describe('sanitizeInput', () => {
     it('should remove dangerous characters', () => {
       expect(sanitizeInput('test;rm')).toBe('testrm');
     });
   });
   ```

2. **Integration Tests**: Test API endpoints
   ```javascript
   describe('POST /api/claude/message', () => {
     it('should return AI response', async () => {
       const res = await request(app)
         .post('/api/claude/message')
         .send({ message: 'Hello' });
       expect(res.status).toBe(200);
       expect(res.body).toHaveProperty('response');
     });
   });
   ```

3. **Component Tests**: Test React components
   ```javascript
   test('renders heading', () => {
     render(<Dashboard />);
     expect(screen.getByText('Dashboard')).toBeInTheDocument();
   });
   ```

### Code Quality

**Linting:**
```bash
# Add ESLint (when needed)
npm install --save-dev eslint
npx eslint --init

# Run linter
npm run lint
```

**Type Checking:**
- Consider TypeScript for large features
- Use JSDoc comments for type hints

---

## 🐛 Debugging Guide

### Frontend Debugging

**Browser DevTools:**
1. Check Console for JavaScript errors
2. Use Network tab to verify API calls
3. Inspect Components with React DevTools
4. Check Socket.io connection in Network WS tab

**Common Issues:**
```javascript
// Check API connectivity
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log);

// Verify Socket.io connection
import { useSocket } from './context/SocketContext';
const socket = useSocket();
console.log('Socket connected:', socket.connected);
```

### Backend Debugging

**Logging:**
```javascript
// Add detailed logging
console.log('[API] Request:', req.method, req.path);
console.log('[API] Body:', req.body);
console.log('[API] Response:', result);
```

**Testing Endpoints:**
```bash
# Test with curl
curl -X POST http://localhost:3000/api/claude/message \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Or use Postman/Insomnia
```

**Common Issues:**
- **Port in use**: Change port in `.env` or kill process
- **API key errors**: Verify `ANTHROPIC_API_KEY` is set
- **Module errors**: Clear cache and reinstall (`rm -rf node_modules && npm install`)

### MCP Debugging

**Configuration Check:**
```bash
# Verify config file exists
cat ~/.config/claude/claude_desktop_config.json

# Test MCP server manually
node server/index.js
```

**Claude Desktop Logs:**
- macOS: `~/Library/Logs/Claude/`
- Check for connection errors
- Verify absolute paths in config

**Troubleshooting:**
1. Ensure `ANTHROPIC_API_KEY` is accessible
2. Use absolute paths in configuration
3. Test server runs standalone
4. Check file permissions

### Build Issues

**Cache Problems:**
```bash
# Clear all caches
rm -rf node_modules package-lock.json .vite
npm install

# Or use npm clean install
npm ci
```

**Version Issues:**
```bash
# Check Node version (requires 20.x+)
node --version

# Update Node if needed
nvm install 20
nvm use 20
```

---

## 🚢 Deployment

### CI/CD Pipeline

**GitHub Actions Workflow:**
- File: `.github/workflows/azure-webapps-node.yml`
- Trigger: Push to `main` branch
- Steps: Install → Build → Test → Deploy
- Target: Azure Web Apps

### Environment Configuration

**GitHub Secrets:**
1. Go to repository Settings → Secrets
2. Add required secrets:
   - `ANTHROPIC_API_KEY`
   - Azure deployment credentials

**Azure Configuration:**
1. Set environment variables in App Settings
2. Configure Node.js runtime: 20.x
3. Set startup command: `node server/index.js`
4. Enable Application Insights (optional)

### Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS certificate set up
- [ ] Domain DNS configured
- [ ] Health check endpoint working
- [ ] Error monitoring enabled
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] Secrets rotated from development

---

## 💡 Best Practices

### Development Workflow

**When Adding Features:**
1. ✅ Start with minimal, focused changes
2. ✅ Test locally before committing
3. ✅ Update documentation alongside code
4. ✅ Review security implications
5. ✅ Avoid unnecessary dependencies
6. ✅ Follow existing code patterns

**When Fixing Bugs:**
1. ✅ Reproduce the issue first
2. ✅ Identify root cause, not symptoms
3. ✅ Make minimal necessary changes
4. ✅ Add tests to prevent regression
5. ✅ Document non-obvious fixes

**When Refactoring:**
1. ✅ Preserve existing behavior
2. ✅ Separate refactoring from features
3. ✅ Test thoroughly after changes
4. ✅ Review for unintended side effects

### Code Review Guidelines

**For Authors:**
- Keep changes focused and small
- Write clear commit messages
- Update tests and documentation
- Self-review before requesting review

**For Reviewers:**
- Check for security issues
- Verify tests cover changes
- Ensure consistency with conventions
- Provide constructive feedback

### Git Commit Messages

**Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style/formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add Android screen capture endpoint

Implements new /api/android/screenshot endpoint that captures
the current screen using ADB screencap command.

Closes #123
```

---

## 📚 Additional Resources

### Documentation Files

- **`/README.md`**: Project overview and quick start
- **`/QUICKSTART.md`**: Detailed setup instructions
- **`/ARCHITECTURE.md`**: System architecture details
- **`/MCP_SETUP.md`**: MCP integration guide
- **`/MCP_INTEGRATION_SUMMARY.md`**: MCP feature summary

### External Resources

- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Getting Help

1. **Check Documentation**: Review files listed above
2. **Search Issues**: Look for similar problems in GitHub Issues
3. **Review Examples**: Study existing code in similar areas
4. **Ask for Help**: Open a discussion or issue with details

---

**Last Updated**: January 2026  
**Maintained by**: Wallestars Development Team
