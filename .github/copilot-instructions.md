# Wallestars Control Center - Copilot Instructions

This is a professional platform for Claude AI automation on Linux and Android, built with Node.js, Express, React, and Vite. The project enables Claude AI to control computers and Android devices through a beautiful real-time visualization interface.

## Project Overview

Wallestars Control Center is a cutting-edge platform that brings Claude AI's powerful capabilities to:
- Linux desktop control via Computer Use API
- Android device automation via ADB
- Real-time system monitoring and visualization
- Model Context Protocol (MCP) integration for Claude Desktop

## Code Standards

### Technology Stack
- **Backend**: Node.js 20.x with Express.js (ES modules)
- **Frontend**: React 18.2 with Vite
- **Styling**: Tailwind CSS with custom theme
- **AI Integration**: Anthropic Claude API (Sonnet 4.5)
- **Real-time Communication**: Socket.io
- **Animations**: Framer Motion

### Required Before Each Commit
- Ensure code follows ES module syntax (`import`/`export`, not `require`)
- Maintain consistent code style with existing files
- Test changes locally before committing
- Verify environment variables are documented in `.env.example`

### Development Flow
- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev` (runs both backend and frontend)
- **Start backend only**: `npm run server`
- **Start frontend only**: `npm run client`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Run tests**: `npm test` (currently placeholder - tests will be added)

## Repository Structure

- `server/` - Backend Express.js server
  - `index.js` - Main server entry point with HTTP and WebSocket setup
  - `routes/` - API route handlers
    - `claude.js` - Claude AI integration routes
    - `computerUse.js` - Linux desktop control routes
    - `android.js` - Android device automation routes
  - `socket/` - WebSocket handlers for real-time communication
- `src/` - Frontend React application
  - `main.jsx` - React application entry point
  - `App.jsx` - Main app component with routing
  - `pages/` - Page components (Dashboard, ClaudeChat, ComputerControl, AndroidControl, PromptGenerator, Settings)
  - `components/` - Reusable UI components (Header, Sidebar, PlatformLinks)
  - `context/` - React context providers (SocketContext)
  - `index.css` - Global styles and Tailwind directives
- `public/` - Static assets
- `.github/` - GitHub configuration
  - `workflows/` - GitHub Actions workflows
  - `agents/` - Custom agent configurations
- `netlify/` - Netlify serverless functions
- `prompts/` - Prompt templates

### Configuration Files
- `.env.example` - Environment variables template
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS theme customization
- `netlify.toml` - Netlify deployment configuration
- `.mcp.json` - Model Context Protocol server configuration
- `claude_desktop_config.json.example` - Claude Desktop integration template

## Key Guidelines

### 1. Follow ES Module Patterns
All JavaScript files use ES modules. Always use:
```javascript
import express from 'express';
export const myFunction = () => {};
```

### 2. Maintain Existing Architecture
- Keep separation between frontend (React) and backend (Express)
- Use the existing Socket.io setup for real-time features
- Follow the established route structure in `server/routes/`
- Maintain the component hierarchy in `src/`

### 3. Environment Variables
- All configuration should use environment variables
- Document new variables in `.env.example`
- Never commit actual API keys or secrets
- Use dotenv for environment variable loading

### 4. API Design
- RESTful endpoints under `/api/`
- Claude AI endpoints: `/api/claude/*`
- Computer control endpoints: `/api/computer/*`
- Android control endpoints: `/api/android/*`
- Health check: `/api/health`
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return JSON responses with consistent error handling

### 5. Frontend Development
- Use functional React components with hooks
- Follow React best practices and patterns
- Use Tailwind CSS for styling (avoid inline styles unless necessary)
- Leverage Framer Motion for animations
- Use lucide-react for icons
- Maintain responsive design (works on all screen sizes)
- Follow the existing dark theme with glassmorphism effects

### 6. Error Handling
- Always include try-catch blocks for async operations
- Log errors with descriptive messages
- Return user-friendly error responses
- Use the centralized error handling middleware

### 7. Security Considerations
- Validate and sanitize all user inputs
- Use whitelisted commands for system execution
- Bind server to localhost only (no external exposure)
- Use CORS appropriately
- Never expose API keys in client-side code
- Follow security best practices for ADB and system control

### 8. Documentation
- Update README.md for major feature additions
- Document API endpoints and their parameters
- Include JSDoc comments for complex functions
- Update relevant markdown files in the repository
- Keep MCP documentation up to date

### 9. Dependencies
- Use npm for package management
- Keep dependencies up to date
- Prefer stable, well-maintained packages
- Document the purpose of new dependencies

### 10. Testing
- Write tests for new functionality when test infrastructure is added
- Test all API endpoints manually during development
- Verify both frontend and backend work together
- Test with actual Claude API, xdotool (Linux), and ADB (Android) when applicable

## Special Features

### Computer Use (Linux)
- Requires `xdotool` installed: `sudo apt install xdotool`
- Screenshot capture uses `screenshot-desktop` package
- Enable with `ENABLE_COMPUTER_USE=true`

### Android Control
- Requires Android SDK Platform Tools (adb)
- Enable with `ENABLE_ANDROID=true`
- Configure ADB_HOST and ADB_PORT as needed

### MCP Integration
- Supports Model Context Protocol for Claude Desktop integration
- Configure via `.mcp.json` or `claude_desktop_config.json`
- Uses stdio communication with JSON-RPC

### Prompt Generator
- Generates prompts for Spark applications
- Bilingual support (English and Bulgarian)
- Exports to clipboard and markdown files

## Common Tasks

### Adding a New API Endpoint
1. Create or update route file in `server/routes/`
2. Register route in `server/index.js`
3. Test endpoint manually
4. Update documentation if needed

### Adding a New Page
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Sidebar.jsx`
4. Ensure responsive design

### Adding a New Feature
1. Check if it requires environment variables (update `.env.example`)
2. Implement backend logic in appropriate route file
3. Implement frontend UI in appropriate page/component
4. Test end-to-end functionality
5. Update documentation

## Deployment

### Netlify
- Configured for deployment (see `netlify.toml`)
- Build command: `npm run build`
- Publish directory: `dist`
- Serverless functions in `netlify/functions/`

### Azure Web Apps
- GitHub Actions workflow configured
- See `.github/workflows/azure-webapps-node.yml`

### General
- Ensure all environment variables are set
- For full functionality (Computer Use, Android), use VPS or dedicated server
- Netlify deployment has limited system-level access

## Resources

- **Main Documentation**: `README.md`
- **MCP Setup**: `MCP_SETUP.md`
- **Quick Start**: `QUICKSTART.md`
- **Architecture**: `ARCHITECTURE.md`
- **Prompt Generator**: `PROMPT_GENERATOR_DOCS.md`
- **Netlify Deployment**: `NETLIFY_DEPLOYMENT.md`

## Getting Help

- Check existing documentation files
- Review code examples in the repository
- Refer to official documentation:
  - [Anthropic Claude API](https://docs.anthropic.com)
  - [React](https://react.dev)
  - [Express](https://expressjs.com)
  - [Vite](https://vitejs.dev)
  - [Tailwind CSS](https://tailwindcss.com)
  - [Model Context Protocol](https://modelcontextprotocol.io)
