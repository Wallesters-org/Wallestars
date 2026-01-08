# Copilot Instructions for Wallestars Control Center

This repository contains **Wallestars Control Center**, a professional platform for Claude AI automation on Linux and Android with beautiful real-time visualization.

## 🎯 Project Overview

**Stack:**
- **Frontend**: React 18.2 + Vite 5.x
- **Backend**: Express.js + Socket.io
- **Styling**: Tailwind CSS 3.4 + Framer Motion
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Protocols**: MCP (Model Context Protocol)

**Key Features:**
- Claude AI chat interface with Computer Use API
- Linux desktop automation via xdotool
- Android device control via ADB
- Real-time WebSocket communication
- MCP server for Claude Desktop integration
- Prompt generator for Spark applications

## 🏗️ Architecture

```
├── server/              # Express.js backend
│   ├── index.js        # Main server with MCP support
│   ├── routes/         # API routes (claude, computerUse, android)
│   └── socket/         # WebSocket handlers
├── src/                # React frontend
│   ├── pages/          # Page components
│   ├── components/     # Reusable UI components
│   └── context/        # React context (Socket)
├── prompts/            # Prompt templates for AI
└── .env.example        # Environment configuration template
```

### Communication Flow
1. **Web UI** → Express REST API → Claude AI / System Commands
2. **Claude Desktop** → MCP Protocol (stdio) → Wallestars Server → Tools
3. **Real-time updates** → Socket.io → React UI

## 🛠️ Build & Test Commands

### Setup
```bash
npm install              # Install all dependencies
cp .env.example .env     # Create environment file
# Edit .env with ANTHROPIC_API_KEY
```

### Development
```bash
npm run dev              # Start both server and client (concurrently)
npm run server           # Start backend only (nodemon)
npm run client           # Start frontend only (vite)
```

### Production
```bash
npm run build            # Build frontend (vite build)
npm start                # Start production server
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run tests (currently placeholder)
```

**Note**: Tests are minimal currently. When adding tests, use appropriate frameworks:
- Backend: Jest or Mocha
- Frontend: Vitest or React Testing Library

## 📝 Code Style & Conventions

### General Principles
- **ES Modules**: Use `import/export` syntax (type: "module" in package.json)
- **Async/Await**: Prefer over `.then()` chains
- **Error Handling**: Always wrap async operations in try-catch
- **Environment Variables**: Never commit secrets; use .env

### JavaScript/JSX Style
- **Naming**: 
  - Components: PascalCase (e.g., `ClaudeChat.jsx`)
  - Functions/variables: camelCase (e.g., `fetchMessages`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **File Extensions**: 
  - `.jsx` for React components
  - `.js` for utilities and backend code
- **Imports**: Group in order:
  1. External packages (React, libraries)
  2. Internal modules (components, utils)
  3. Styles and assets

### React Conventions
- **Components**: Functional components with hooks
- **State Management**: useState, useContext for global state
- **Side Effects**: useEffect for API calls, subscriptions
- **Props**: Destructure in function signature
- **Event Handlers**: Prefix with `handle` (e.g., `handleSubmit`)

Example:
```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MyComponent({ title, onAction }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    };
    fetchData();
  }, []);
  
  const handleClick = () => {
    onAction(data);
  };
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </motion.div>
  );
}
```

### Backend Conventions
- **Route Handlers**: Use Express Router
- **Error Responses**: Consistent structure with status codes
  ```javascript
  res.status(500).json({ error: 'Error message', details: err.message });
  ```
- **Validation**: Validate inputs before processing
- **Logging**: Use console.log for development (consider adding proper logger like Winston)

### Styling Conventions
- **Tailwind CSS**: Primary styling method
- **Component-level**: Prefer Tailwind utility classes
- **Custom Styles**: Add to `src/index.css` only when necessary
- **Animations**: Use Framer Motion for complex animations
- **Theme**: Follow existing dark theme with blue accent (#0ea5e9)

## 🔒 Security Considerations

### API Keys & Secrets
- **Never commit**: API keys, tokens, passwords
- **Use Environment Variables**: Store in `.env` (gitignored)
- **Backend Only**: API keys should only exist on server side
- **Validation**: Validate that required env vars are set on startup

### Input Validation
- **Sanitize User Input**: Especially for commands and shell execution
- **Whitelist Commands**: Use allowed command lists for system operations
- **Path Validation**: Prevent path traversal attacks
- **Rate Limiting**: Consider adding for API endpoints

### Computer Use & ADB
- **Controlled Execution**: Whitelist allowed commands
- **User Confirmation**: For destructive operations
- **Sandboxing**: Run with minimal necessary permissions
- **Logging**: Log all automated actions for audit

### Dependencies
- **Regular Updates**: Run `npm audit` and address vulnerabilities
- **Minimal Packages**: Only add necessary dependencies
- **License Compliance**: Verify licenses before adding packages

## 🚀 Common Tasks

### Adding a New API Route
1. Create route file in `server/routes/`
2. Implement with Express Router
3. Add error handling and validation
4. Register in `server/index.js`
5. Document the endpoint

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Sidebar.jsx`
4. Use consistent layout and styling
5. Test responsive design

### Integrating New AI Features
1. Add API call in appropriate route (e.g., `server/routes/claude.js`)
2. Use Anthropic SDK methods
3. Handle streaming responses if needed
4. Update frontend to display results
5. Add error handling for API failures

### Adding MCP Tools
1. Extend tool definitions in `server/index.js`
2. Implement tool handlers
3. Update MCP setup documentation
4. Test with Claude Desktop

## 📚 Important Files

- **`server/index.js`**: Main server entry, MCP setup, route registration
- **`src/App.jsx`**: React router configuration
- **`src/context/SocketContext.jsx`**: WebSocket connection management
- **`server/routes/claude.js`**: Claude AI integration
- **`server/routes/computerUse.js`**: Linux automation endpoints
- **`server/routes/android.js`**: Android control endpoints
- **`.env.example`**: Template for environment configuration
- **`MCP_SETUP.md`**: Detailed MCP configuration guide
- **`ARCHITECTURE.md`**: System architecture documentation

## 🐛 Debugging Tips

### Frontend Issues
- Check browser console for errors
- Verify API endpoints are accessible (http://localhost:3000)
- Check Socket.io connection status
- Review React DevTools for component state

### Backend Issues
- Check server console logs
- Verify environment variables are set
- Test API endpoints with curl or Postman
- Check that required system tools are installed (xdotool, adb)

### MCP Issues
- Check Claude Desktop logs
- Verify absolute paths in config
- Ensure server can be launched from terminal
- Check that ANTHROPIC_API_KEY is accessible

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node.js version: `node --version` (requires 20.x+)

## 🔄 Deployment

**CI/CD**: GitHub Actions workflow configured for Azure Web Apps
- Workflow: `.github/workflows/azure-webapps-node.yml`
- Triggers: Push to `main` branch
- Steps: Install → Build → Test → Deploy

**Environment Setup**:
1. Configure secrets in GitHub repository settings
2. Set `ANTHROPIC_API_KEY` in Azure App Settings
3. Ensure Node.js 20.x runtime
4. Configure startup command: `node server/index.js`

## 💡 Best Practices

### When Adding Features
1. **Start Small**: Make minimal, focused changes
2. **Test Locally**: Verify functionality before committing
3. **Update Docs**: Keep README and related docs current
4. **Consider Security**: Review security implications
5. **Check Dependencies**: Avoid adding unnecessary packages

### When Fixing Bugs
1. **Reproduce First**: Understand the issue completely
2. **Root Cause**: Find the underlying problem, not just symptoms
3. **Minimal Fix**: Change as little code as possible
4. **Add Tests**: Prevent regression if test infrastructure exists
5. **Document**: Add comments if the fix is non-obvious

### When Refactoring
1. **Preserve Behavior**: Don't change functionality
2. **One Thing at a Time**: Separate refactoring from feature work
3. **Test Thoroughly**: Ensure nothing breaks
4. **Review Carefully**: Extra attention to potential side effects

## 🤝 Contributing

When working on this repository:
- Follow existing code patterns and conventions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed
- Consider the user experience
- Keep security in mind

## 📞 Getting Help

- **Documentation**: Check `/README.md`, `/MCP_SETUP.md`, `/ARCHITECTURE.md`
- **Examples**: Look at existing code in similar areas
- **Issues**: Review open GitHub issues for context
- **Quick Start**: See `/QUICKSTART.md` for setup guidance
