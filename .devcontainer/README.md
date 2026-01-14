# DevContainer Configuration Documentation

## Overview

This document describes the comprehensive DevContainer configuration for the Wallestars project - a Full Stack AI Platform with Claude Code integration.

## 🏗️ Architecture

### Base Image
- **Image**: Microsoft Dev Containers TypeScript-Node (version 1-22-bookworm)
- **Node.js**: Version 22
- **Python**: Version 3.12
- **Timezone**: Europe/Sofia

### Custom Dockerfile
The configuration uses a custom Dockerfile (`Dockerfile.claude`) that includes:
- Git Delta for enhanced git diffs
- Claude Code integration tools
- Development utilities
- Zsh shell with Oh My Zsh

## 📦 Features Installed

### Core Development Tools
1. **common-utils** - Essential development utilities with Zsh and Oh My Zsh
2. **node** - Node.js with NVM support (version 22)
3. **python** - Python 3.12 with tools and JupyterLab
4. **git** - Latest Git version with PPA support
5. **github-cli** - GitHub CLI for GitHub integration
6. **docker-in-docker** - Docker support with Docker Compose v2

### Infrastructure Tools
7. **kubectl-helm-minikube** - Kubernetes tooling
8. **postgres-asdf** - PostgreSQL 16
9. **redis-asdf** - Redis cache
10. **age** & **sops** - Encryption and secret management

### Utility Tools
11. **curl**, **wget**, **jq**, **yq** - Command-line utilities
12. **azure-cli** - Azure cloud integration
13. **aws-cli** - AWS cloud integration
14. **act** - GitHub Actions local testing
15. **pre-commit** - Git hooks management

## 🎨 VS Code Extensions

### AI & Code Assistants
- GitHub Copilot & Copilot Chat
- Anthropic Claude Code
- Claude Dev
- Continue

### JavaScript/TypeScript
- ESLint, Prettier, Tailwind CSS
- React snippets
- TypeScript support
- Auto rename/close tags

### Python
- Python, Pylance, Black formatter

### Database & API
- Supabase
- SQL Tools with PostgreSQL driver
- REST Client
- Thunder Client

### DevOps & Cloud
- Docker
- Kubernetes Tools
- AWS Toolkit

### Version Control
- GitLens
- Git Graph
- Git History
- GitHub Pull Requests & Actions

### Testing & Quality
- Jest & Jest Runner
- Playwright
- Test Explorer
- Trunk.io
- Snyk Security Scanner
- SonarLint

### Blockchain
- Solidity
- Hardhat

### Documentation & Utilities
- Markdown All in One
- Markdown Mermaid
- Error Lens
- TODO Tree
- Better Comments
- Rainbow CSV

## 🔌 Port Forwarding

| Port | Service | Auto-Forward Behavior |
|------|---------|----------------------|
| 3000 | Frontend / Main Application | Notify |
| 5000 | Backend API | Notify |
| 5678 | n8n Workflow Automation | Open Browser |
| 5432 | PostgreSQL Database | Silent |
| 6379 | Redis Cache | Silent |
| 8000 | Dev Server | Silent |
| 8080 | Alternative HTTP Server | Silent |
| 9229 | Node.js Debugger | Silent |

## 📁 Volume Mounts

### Host Bindings (Read-Only)
- `~/.ssh` → `/home/node/.ssh` - SSH keys
- `~/.gitconfig` → `/home/node/.gitconfig` - Git configuration

### Named Volumes
- `wallestars-node-modules` → `/workspaces/Wallestars/node_modules`
- `claude-code-bashhistory` → `/commandhistory`
- `claude-code-config` → `/home/node/.claude`
- `wallestars-config` → `/home/node/.config/wallestars`

## 🔒 Security Configuration

### Capabilities
- `NET_ADMIN` - Network administration
- `NET_RAW` - Raw socket operations
- `SYS_PTRACE` - Process tracing

### Security Options
- `seccomp=unconfined` - Unrestricted system calls (for development)

## 🚀 Lifecycle Scripts

### 1. on-create.sh
**Runs**: Once when the container is created
**Purpose**:
- Set up file permissions
- Install global npm packages (npm, pnpm, yarn)
- Configure git safe directories
- Create necessary directories

### 2. post-create.sh
**Runs**: After container is created
**Purpose**:
- Copy `.env.example` to `.env`
- Install project dependencies with npm
- Set up pre-commit hooks
- Initialize PostgreSQL and Redis

### 3. post-start.sh
**Runs**: Every time the container starts
**Purpose**:
- Display environment information
- Verify tool installations
- Show version information

### 4. post-attach.sh
**Runs**: When you attach to the container
**Purpose**:
- Display welcome message
- Show quick start commands
- List port mappings
- Check for required environment variables

## 🌍 Environment Variables

### Remote Environment (Host → Container)
```bash
NODE_ENV=development
LOG_LEVEL=info
WALLESTARS_WORKSPACE=/workspaces/Wallestars
ANTHROPIC_API_KEY=${localEnv:ANTHROPIC_API_KEY}
ENABLE_COMPUTER_USE=false
ENABLE_ANDROID=false
```

### Container Environment
```bash
TZ=Europe/Sofia
NODE_OPTIONS=--max-old-space-size=4096
CLAUDE_CONFIG_DIR=/home/node/.claude
POWERLEVEL9K_DISABLE_GITSTATUS=true
WALLESTARS_ENV=development
```

## 👤 User Configuration

- **Container User**: `node`
- **Remote User**: `node`
- **Workspace Folder**: `/workspaces/Wallestars`

## 🔧 Editor Settings

### Code Formatting
- **Format on Save**: Enabled
- **Default Formatter**: Prettier
- **Tab Size**: 2 spaces
- **Auto Fix ESLint**: Enabled
- **Auto Organize Imports**: Enabled

### Terminal
- **Default Shell**: Zsh
- **Font**: MesloLGS NF
- **Font Size**: 14

### Git
- **Auto Fetch**: Enabled
- **Confirm Sync**: Disabled
- **Smart Commit**: Enabled

## 📝 Feature Installation Order

To ensure proper dependency resolution, features are installed in this order:
1. common-utils
2. git
3. node
4. docker-in-docker

## 🚦 Getting Started

### Prerequisites
- Docker Desktop installed
- VS Code with Dev Containers extension
- `ANTHROPIC_API_KEY` environment variable set (optional)

### First Time Setup

1. **Open in DevContainer**
   ```
   Ctrl+Shift+P → Dev Containers: Reopen in Container
   ```

2. **Wait for Setup**
   The container will run all lifecycle scripts automatically:
   - Install dependencies
   - Configure environment
   - Set up tools

3. **Verify Installation**
   Check the post-attach welcome message for environment info.

### Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build project
npm run build

# Run tests
npm test
```

## 🐛 Troubleshooting

### Container Build Fails
- Check Docker Desktop is running
- Verify internet connection for downloading features
- Check Dockerfile.claude syntax

### Scripts Fail to Execute
- Verify scripts have execute permissions: `chmod +x .devcontainer/scripts/*.sh`
- Check script paths in devcontainer.json

### Port Already in Use
- Check if ports 3000, 5432, 6379, etc. are available
- Stop conflicting services on host machine

### Environment Variables Not Set
- Verify `.env` file exists
- Check `ANTHROPIC_API_KEY` in system environment

## 🔍 Debugging

### View Container Logs
```bash
# In VS Code
Ctrl+Shift+P → Dev Containers: Show Container Log
```

### Rebuild Container
```bash
# In VS Code
Ctrl+Shift+P → Dev Containers: Rebuild Container
```

### SSH into Container
```bash
docker exec -it wallestars-devcontainer /bin/zsh
```

## 📊 Resource Allocation

### Memory
- Node.js max old space: 4096 MB
- Recommended host RAM: 8GB+

### Storage
- Container: ~5-10 GB
- Volumes: ~2-5 GB (node_modules, etc.)

## 🔐 Security Best Practices

1. **SSH Keys**: Mounted read-only from host
2. **Secrets**: Use environment variables, not committed files
3. **API Keys**: Store in `.env` file (gitignored)
4. **Git Config**: Mounted from host, not stored in container

## 📚 Additional Resources

- [Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Documentation](https://docs.docker.com/)
- [Claude Code Documentation](https://docs.anthropic.com/)

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review container logs
3. Check GitHub issues
4. Contact the development team

---

**Last Updated**: 2026-01-03
**Version**: 1.0.0
