# 🏗️ Wallestars MCP Architecture

This document explains how Wallestars integrates with the Model Context Protocol (MCP) and Claude Desktop.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Desktop                         │
│  (User Interface for AI Assistant)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ MCP Protocol
                     │ (JSON-RPC over stdio)
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Wallestars Control Center                      │
│                  (MCP Server)                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Express.js REST API                         │ │
│  │                                                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Claude    │  │  Computer   │  │   Android   │ │ │
│  │  │  AI Routes  │  │  Use Routes │  │   Routes    │ │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │ │
│  └─────────┼─────────────────┼─────────────────┼────────┘ │
│            │                 │                 │          │
│            │                 │                 │          │
│  ┌─────────▼─────────────────▼─────────────────▼────────┐ │
│  │              Service Layer                           │ │
│  └─────────┬─────────────────┬─────────────────┬────────┘ │
└────────────┼─────────────────┼─────────────────┼──────────┘
             │                 │                 │
             │                 │                 │
    ┌────────▼────────┐  ┌────▼────────┐  ┌────▼────────┐
    │   Anthropic     │  │   xdotool   │  │     ADB     │
    │   Claude API    │  │  screenshot │  │   Android   │
    │  (Sonnet 4.5)   │  │   (Linux)   │  │   Devices   │
    └─────────────────┘  └─────────────┘  └─────────────┘
```

## Component Description

### 1. Claude Desktop
- **Role**: User interface and MCP client
- **Function**: Manages user conversations and tool invocations
- **Communication**: Uses MCP protocol (JSON-RPC) to communicate with Wallestars
- **Configuration**: `claude_desktop_config.json` specifies how to launch Wallestars

### 2. Wallestars Control Center (MCP Server)
- **Role**: MCP server providing AI capabilities
- **Technology**: Node.js with Express.js
- **Capabilities**:
  - Claude AI integration
  - Linux desktop control
  - Android device automation
  - System monitoring

### 3. API Routes

#### Claude AI Routes (`/api/claude/*`)
- **Chat**: Interactive conversation with Claude Sonnet 4.5
- **Computer Use**: Vision-based desktop automation
- **Capabilities**: Query available AI features

#### Computer Use Routes (`/api/computer/*`)
- **Screenshot**: Capture desktop images
- **Click**: Simulate mouse clicks
- **Type**: Keyboard text input
- **Key**: Keyboard key presses
- **Info**: System information
- **Execute**: Safe command execution

#### Android Routes (`/api/android/*`)
- **Devices**: List connected devices
- **Screenshot**: Capture device screen
- **Tap**: Touch simulation
- **Type**: Text input on device
- **Key**: Hardware button presses
- **Info**: Device information
- **Install**: APK installation

### 4. External Dependencies

#### Anthropic Claude API
- **Purpose**: Access to Claude Sonnet 4.5 AI model
- **Authentication**: API key required
- **Rate Limits**: Per Anthropic's usage limits

#### xdotool (Linux)
- **Purpose**: X11 desktop automation
- **Functions**: Mouse movement, clicks, keyboard input
- **Requirements**: X11 display server

#### screenshot-desktop (Node.js)
- **Purpose**: Cross-platform screenshot capture
- **Formats**: PNG, JPEG
- **Performance**: 2-second default interval

#### ADB (Android Debug Bridge)
- **Purpose**: Android device control
- **Connection**: USB or TCP/IP
- **Requirements**: Developer mode enabled on device

## Communication Flow

### Example: Taking a Screenshot via Claude Desktop

```
1. User -> Claude Desktop
   "Take a screenshot of my desktop"

2. Claude Desktop -> Wallestars (MCP Request)
   {
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "screenshot",
       "arguments": {}
     }
   }

3. Wallestars -> Express API
   GET /api/computer/screenshot

4. Express API -> screenshot-desktop
   Capture screen as PNG buffer

5. screenshot-desktop -> Express API
   Return base64-encoded image

6. Express API -> Wallestars
   {
     "success": true,
     "screenshot": "iVBORw0KGgoAAAANSUhEUg...",
     "timestamp": "2024-01-03T12:00:00.000Z"
   }

7. Wallestars -> Claude Desktop (MCP Response)
   {
     "jsonrpc": "2.0",
     "result": {
       "content": [{
         "type": "image",
         "data": "iVBORw0KGgoAAAANSUhEUg..."
       }]
     }
   }

8. Claude Desktop -> User
   [Displays screenshot and can analyze it]
```

## Security Considerations

### 1. API Key Protection
- Never commit API keys to version control
- Use environment variables or secure vaults
- Rotate keys regularly

### 2. Command Execution
- Whitelist of safe commands only
- No arbitrary shell execution
- Input sanitization and validation

### 3. Network Security
- Server binds to localhost only (127.0.0.1)
- No external network exposure by default
- CORS configured for local frontend

### 4. ADB Security
- Only connect trusted devices
- Verify device authorization
- Limit to development/testing environments

### 5. Screenshot Privacy
- Screenshots contain sensitive information
- Temporary files cleaned up
- No persistent storage by default

### 6. Repository Security

#### Branch Protection
To maintain code quality and prevent unauthorized changes, the `main` branch is protected with:

- **Force Push Protection**: Prevents rewriting commit history
  - Protects against accidental data loss
  - Prevents malicious history tampering
  - Maintains audit trail of all changes

- **Required Status Checks**: All code must pass CI before merging
  - Automated build verification
  - Test suite execution
  - Security vulnerability scanning
  - Ensures code quality standards

- **Pull Request Reviews**: Changes require peer review
  - Minimum 1 approval required
  - Stale reviews dismissed on new commits
  - Conversation resolution required
  - Promotes knowledge sharing

- **Linear History**: Maintains clean commit history
  - Requires rebase or squash merging
  - Prevents complex merge commit graphs
  - Easier to track and revert changes

- **Restricted Push Access**: Direct pushes blocked
  - All changes via pull requests
  - Administrators-only exceptions
  - Documented emergency procedures

#### Commit Signing
For enhanced security, consider:
- **GPG Signed Commits**: Verify commit authenticity
- **Verified Badge**: Shows trusted contributors
- **Non-repudiation**: Legal proof of authorship

#### Access Control
- **Least Privilege Principle**: Minimum necessary permissions
- **Regular Access Reviews**: Audit team permissions quarterly
- **MFA Required**: Multi-factor authentication for all contributors
- **Personal Access Tokens**: Time-limited, scope-restricted

#### Dependency Security
- **Automated Scanning**: GitHub Dependabot alerts
- **Regular Updates**: Monthly dependency reviews
- **Audit Checks**: CI workflow includes `npm audit`
- **Version Pinning**: Lock file committed to repo

#### Secrets Management
- **GitHub Secrets**: Store sensitive credentials
- **Environment Isolation**: Separate dev/prod keys
- **Rotation Policy**: Quarterly key rotation
- **No Hardcoding**: Never commit secrets to code

For detailed branch protection setup instructions, see [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md)

## Configuration Files

### `.mcp.json`
Base MCP configuration for the server itself.

**Purpose**: Document the MCP server capabilities and settings.

### `claude_desktop_config.json.example`
Template for Claude Desktop integration.

**Purpose**: Show users how to configure Claude Desktop to use Wallestars.

### `.env`
Environment variables for server configuration.

**Purpose**: Store API keys and runtime settings securely.

## Deployment Modes

### Mode 1: Claude Desktop Integration (Recommended)
- **Launch**: Claude Desktop starts Wallestars automatically
- **Lifecycle**: Server runs when Claude Desktop is active
- **Use Case**: Personal desktop automation

### Mode 2: Standalone HTTP Server
- **Launch**: `npm start` or `npm run dev`
- **Lifecycle**: Server runs independently
- **Use Case**: Development, testing, HTTP API access

### Mode 3: Production Deployment
- **Launch**: Process manager (pm2, systemd)
- **Lifecycle**: Always running
- **Use Case**: Team collaboration, remote access

## Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| Screenshot | ~100ms | Depends on screen resolution |
| Mouse click | ~50ms | xdotool execution time |
| Keyboard input | ~10ms/char | xdotool typing speed |
| ADB screenshot | ~500ms | Device connection overhead |
| Claude API call | ~2-5s | Network + AI inference |
| Health check | ~1ms | Simple status response |

## Scalability

- **Concurrent Requests**: Limited by Node.js event loop
- **Screenshot Rate**: Configurable via `SCREENSHOT_INTERVAL`
- **Android Devices**: Multiple devices supported via device ID
- **Claude API**: Subject to Anthropic rate limits

## Future Enhancements

Potential improvements to the architecture:

1. **MCP Protocol Extensions**
   - Custom tool definitions
   - Streaming responses
   - Progress notifications

2. **Multi-platform Support**
   - Windows automation (PowerShell)
   - macOS automation (AppleScript)

3. **Advanced Computer Use**
   - OCR text extraction
   - Element detection
   - Workflow recording

4. **Enhanced Security**
   - JWT authentication
   - Role-based access control
   - Audit logging

5. **Performance Optimization**
   - Screenshot caching
   - Batch operations
   - Connection pooling

---

**For implementation details, see the [MCP_SETUP.md](MCP_SETUP.md) guide.**
