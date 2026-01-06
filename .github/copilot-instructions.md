# Copilot Instructions for Wallestars Control Center

## Project Overview

**Wallestars Control Center** is a professional platform that brings Claude AI's powerful capabilities to Linux desktop control and Android device automation. The project provides a beautiful, modern web interface with real-time visualization for AI-powered automation.

### Core Capabilities
- 💬 Chat with Claude AI using Sonnet 4.5 model
- 🖥️ Linux desktop control via Computer Use API
- 📱 Android device automation via ADB
- 📊 Real-time system monitoring
- 🔌 Model Context Protocol (MCP) integration

## Technology Stack

### Frontend
- **Framework**: React 18.2 with Vite 5.x
- **Styling**: Tailwind CSS 3.4 with custom components
- **Animations**: Framer Motion 11.x
- **Icons**: Lucide React
- **WebSocket**: Socket.IO Client 4.6

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.x
- **AI Integration**: Anthropic Claude SDK 0.30
- **Real-time Communication**: Socket.IO 4.6
- **Environment**: dotenv for configuration

### System Integration
- **Linux Automation**: xdotool for Computer Use
- **Screenshot**: screenshot-desktop library
- **Android Control**: ADB (Android Debug Bridge)
- **Protocol**: MCP (Model Context Protocol) support

## Development Setup

### Installation Commands
```bash
npm install           # Install all dependencies
npm run dev          # Start both server and client in development mode
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm start            # Start production server
```

### Environment Configuration
Always use the `.env.example` file as a template. Required environment variables:
- `ANTHROPIC_API_KEY` - Claude API key (required)
- `PORT` - Server port (default: 3000)
- `ENABLE_COMPUTER_USE` - Enable Linux desktop control (true/false)
- `ENABLE_ANDROID` - Enable Android control (true/false)
- `SCREENSHOT_INTERVAL` - Screenshot capture interval in ms (default: 2000)

### Development Workflow
1. Copy `.env.example` to `.env` and configure
2. Install dependencies with `npm install`
3. Start development server with `npm run dev`
4. Frontend runs on `http://localhost:5173`
5. Backend API runs on `http://localhost:3000`

## Code Style and Conventions

### JavaScript/React
- Use ES6+ modern JavaScript features
- Prefer functional components with hooks over class components
- Use `import/export` syntax (ES modules)
- Follow consistent naming: camelCase for variables/functions, PascalCase for components
- Keep components focused and single-responsibility
- Use destructuring for props and state

### File Organization
```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── context/         # React Context providers
├── App.jsx          # Main application component
└── main.jsx         # Application entry point

server/
├── routes/          # Express route handlers
│   ├── claude.js    # Claude AI endpoints
│   ├── computerUse.js  # Computer Use endpoints
│   └── android.js   # Android control endpoints
├── socket/          # Socket.IO handlers
└── index.js         # Server entry point
```

### API Route Structure
- **Claude routes**: `/api/claude/*` - AI chat and capabilities
- **Computer Use routes**: `/api/computer/*` - Linux desktop control
- **Android routes**: `/api/android/*` - Android device automation
- **Health check**: `/api/health` - Service status

### Component Patterns
- Use Tailwind utility classes for styling
- Leverage Framer Motion for animations
- Implement responsive design (mobile-first approach)
- Use Lucide React icons for consistency
- Follow glassmorphism design pattern for UI elements

## Security Best Practices

### Critical Security Rules
1. **Never commit API keys or secrets** - Always use environment variables
2. **Validate all user inputs** - Especially for command execution and shell interactions
3. **Sanitize data** - Clean inputs before using in system commands or database queries
4. **Use whitelisted commands** - Only allow safe, predefined commands for execution
5. **Bind to localhost** - Server should default to `127.0.0.1` to prevent external exposure

### Specific Security Considerations
- **API Keys**: Store in `.env`, never in code
- **Command Execution**: Use whitelist approach, validate all parameters
- **Screenshot Data**: Handle temporary files securely, clean up after use
- **ADB Access**: Only connect trusted devices in development environments
- **CORS**: Configure properly for production (restrict origins)

## Testing Guidelines

### Current Test Setup
- Basic test infrastructure in place (`npm test`)
- Tests to be expanded in future development

### Testing Approach When Adding Tests
- Write unit tests for utility functions
- Add integration tests for API endpoints
- Test error handling and edge cases
- Mock external dependencies (Claude API, ADB, xdotool)
- Validate WebSocket communication

## MCP Integration

### Model Context Protocol Support
Wallestars acts as an MCP server, allowing Claude Desktop and other MCP clients to interact with computer and Android control capabilities.

### MCP Configuration
- Configuration example: `claude_desktop_config.json.example`
- MCP capabilities defined in `.mcp.json`
- Server runs via Node.js stdio communication

### MCP Architecture
- Express.js REST API provides the backend services
- MCP protocol wraps API calls for Claude Desktop integration
- Tools exposed: screenshot, mouse control, keyboard input, device control

For detailed MCP setup, refer to `MCP_SETUP.md` and `ARCHITECTURE.md`.

## Common Development Tasks

### Adding a New API Endpoint
1. Create or update route handler in `server/routes/`
2. Define the route logic with proper error handling
3. Register the route in `server/index.js`
4. Update frontend to consume the endpoint
5. Test the endpoint with example requests

### Adding a New React Component
1. Create component file in `src/components/` or `src/pages/`
2. Use functional component pattern with hooks
3. Apply Tailwind CSS for styling
4. Add Framer Motion for animations if needed
5. Import and use Lucide icons for UI elements
6. Export and integrate into parent components

### Adding a New Feature
1. Review existing architecture and patterns
2. Plan minimal changes to accomplish the goal
3. Update relevant documentation files
4. Test locally with `npm run dev`
5. Build for production with `npm run build`
6. Ensure no secrets are committed

### Debugging Issues
- Check server logs in terminal running `npm run server`
- Inspect browser console for frontend errors
- Verify environment variables in `.env`
- Test API endpoints with curl or Postman
- Check WebSocket connection in browser DevTools

## Documentation Files

Key documentation to reference:
- `README.md` - Project overview, features, installation
- `ARCHITECTURE.md` - Technical architecture and MCP details
- `MCP_SETUP.md` - MCP integration setup guide
- `PROMPT_GENERATOR_DOCS.md` - Prompt generator feature documentation
- `QUICKSTART.md` - Quick start guide
- `HOW_TO_USE_PROMPT_GENERATOR.md` - Prompt generator usage

## Build and Deployment

### Build Process
```bash
npm run build        # Creates production build in dist/
```

### Deployment
- GitHub Actions workflow configured for Azure Web Apps
- Workflow file: `.github/workflows/azure-webapps-node.yml`
- Requires Node.js 20.x or higher
- Build artifacts served from `dist/` directory

### Production Considerations
- Set `NODE_ENV=production`
- Configure proper `FRONTEND_URL` for CORS
- Ensure all required services are available (xdotool, adb)
- Monitor API rate limits (Anthropic Claude API)

## Important Notes for AI Assistants

### When Making Changes
1. **Make minimal, surgical changes** - Only modify what's necessary
2. **Preserve existing functionality** - Don't break working features
3. **Follow existing patterns** - Match the codebase style and structure
4. **Test your changes** - Run `npm run dev` and verify functionality
5. **Update documentation** - If adding features, update relevant docs
6. **Security first** - Never compromise security for convenience
7. **No secrets in code** - Always use environment variables

### When Adding Dependencies
1. Prefer established, well-maintained packages
2. Check for security vulnerabilities before adding
3. Update `package.json` with `npm install <package>`
4. Document why the dependency is needed
5. Keep dependencies minimal and purposeful

### When Debugging
1. Check existing logs and error messages first
2. Verify environment configuration (`.env` file)
3. Test API endpoints independently
4. Check WebSocket connection status
5. Review browser console and network tab

### When Writing Code
- Use async/await for asynchronous operations
- Handle errors gracefully with try/catch
- Provide meaningful error messages
- Log important events for debugging
- Comment complex logic, but keep code self-documenting

## Project-Specific Guidelines

### Prompt Generator Feature
- Bilingual support (English and Bulgarian)
- Templates for Spark application generation
- Copy to clipboard and download functionality
- Located in dedicated page component

### Computer Use Feature
- Requires Linux with X11 display server
- Uses xdotool for mouse and keyboard control
- Screenshot streaming at configurable intervals
- Safety features for command execution

### Android Control Feature
- Requires ADB installed and in PATH
- Supports multiple connected devices
- Device selection via dropdown
- Touch simulation and navigation controls

### Real-time Features
- WebSocket for live data streaming
- Socket.IO for bidirectional communication
- Real-time system metrics display
- Activity logging with timestamps

## Common Pitfalls to Avoid

1. **Don't expose API keys** - Check .env and never commit secrets
2. **Don't bypass security whitelists** - Use safe command patterns
3. **Don't ignore error handling** - Always handle promise rejections
4. **Don't break MCP compatibility** - Maintain protocol compliance
5. **Don't skip environment checks** - Verify required tools are installed
6. **Don't hardcode URLs or paths** - Use environment variables
7. **Don't disable CORS without reason** - Keep proper security settings

## Getting Help

- Review documentation files in the repository root
- Check existing code for similar patterns
- Test changes incrementally with `npm run dev`
- Verify API responses match expected formats
- Consult MCP_SETUP.md for protocol-specific issues

---

**Remember**: This is a professional platform for AI-powered automation. Prioritize security, user experience, and code quality in all changes.
