# Wallestars Dev Container - Quick Reference

## 🚀 Бързи Команди

### Project Management
```bash
ws-start        # Open project in VS Code
ws-status       # Check all services status
ws-logs         # View application logs
ws-rebuild      # Rebuild entire project
ws-clean        # Clean and reinstall all dependencies
ws-secrets      # Open secrets directory
ws-env          # Edit environment variables
```

### n8n Workflow Engine
```bash
ws-n8n          # Start n8n workflow engine
n8n start       # Start n8n directly
pm2 start n8n --name "n8n" -- start --tunnel
pm2 logs n8n    # View n8n logs
pm2 restart n8n # Restart n8n
```

### Supabase
```bash
sb-start        # Start Supabase local
sb-stop         # Stop Supabase
sb-status       # Check Supabase status
sb-logs         # View Supabase logs
supabase db reset  # Reset database
supabase db push   # Push migrations
```

### Git Operations
```bash
gst             # git status
gco <branch>    # git checkout
gaa             # git add --all
gcm "message"   # git commit -m "message"
gp              # git push
gl              # git pull
glog            # git log --oneline --graph
```

### Docker
```bash
dps             # docker ps
dpa             # docker ps -a
di              # docker images
dcu             # docker-compose up -d
dcd             # docker-compose down
dcl             # docker-compose logs -f
```

### Blockchain Development
```bash
hardhat-node    # Start local Ethereum node
hardhat-compile # Compile smart contracts
hardhat-test    # Run tests
ganache-start   # Start Ganache (alternative)
```

### KeePassXC (Password Manager)
```bash
# Create new database
keepassxc-cli db-create ~/.keepass/wallestars.kdbx

# List entries
keepassxc-cli ls ~/.keepass/wallestars.kdbx

# Show specific entry
keepassxc-cli show ~/.keepass/wallestars.kdbx EntryName

# Add new entry
keepassxc-cli add ~/.keepass/wallestars.kdbx

# Edit entry
keepassxc-cli edit ~/.keepass/wallestars.kdbx EntryName

# Remove entry
keepassxc-cli rm ~/.keepass/wallestars.kdbx EntryName
```

## 🔧 Environment Variables

### Required Variables
```bash
# GitHub (Enterprise)
GITHUB_TOKEN=your_token
GITHUB_SPARKS_ENABLED=true

# Claude AI (Pro)
ANTHROPIC_API_KEY=your_key
CLAUDE_MAX_TOKENS=1000000

# Supabase
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Ubuntu Pro
UBUNTU_PRO_TOKEN=your_token
VPS_COUNT=15

# Blockchain
ETHEREUM_RPC=your_rpc_url
POLYGON_RPC=your_rpc_url
SOLANA_RPC=your_rpc_url
```

## 📊 Forwarded Ports

| Port | Service | URL |
|------|---------|-----|
| 3000 | Frontend | http://localhost:3000 |
| 5000 | Backend API | http://localhost:5000 |
| 5678 | n8n | https://localhost:5678 |
| 8545 | Blockchain | http://localhost:8545 |
| 54321 | Supabase | http://localhost:54321 |

## 🎯 AI Assistants

### Cline (Claude Dev)
- **Model**: claude-sonnet-4-20250514
- **Context**: 1M tokens
- **Usage**: Ask questions, generate code, refactor
- **Command Palette**: `Cmd/Ctrl + Shift + P` → "Cline"

### GitHub Copilot
- **Inline**: Start typing, accept suggestion with `Tab`
- **Chat**: `Cmd/Ctrl + I` for inline chat
- **Command**: `Cmd/Ctrl + Shift + I` for chat panel
- **Labs**: Experimental features in side panel

### Continue.dev
- **Autocomplete**: Enabled for all files
- **Custom**: Can add local models
- **Chat**: Use chat interface for questions

## 🔐 Security Checklist

- [ ] KeePassXC database created and protected
- [ ] Master password stored securely (not in repo!)
- [ ] All API keys in environment variables
- [ ] `.env` file added to `.gitignore`
- [ ] SSH keys read-only mounted
- [ ] Tails persistent storage configured (if using)
- [ ] GitHub token has minimal required permissions
- [ ] Secrets directory permissions: `chmod 700`

## 📦 Key Installed Tools

### Languages & Runtimes
- Node.js 20.x (LTS)
- Python 3.11
- Go (latest)
- Rust (latest)
- .NET Core (latest)

### Package Managers
- npm, yarn, pnpm
- pip, pipenv
- cargo
- dotnet

### Global npm Packages
- n8n
- prisma
- supabase
- hardhat, truffle, ganache
- typescript, ts-node
- eslint, prettier
- pm2, nodemon

### Python Packages
- numpy, pandas
- pykeepass (KeePassXC library)
- web3, solana
- fastapi, uvicorn
- pytest, black, pylint

### CLI Tools
- gh (GitHub CLI)
- docker, docker-compose
- kubectl, helm
- terraform
- azure-cli

## 🚨 Troubleshooting Quick Fixes

### Service Won't Start
```bash
# Check if port is in use
sudo lsof -i :5678

# Kill process
sudo kill -9 $(lsof -t -i:5678)

# Restart service
pm2 restart all
```

### Permission Denied
```bash
# Fix permissions
chmod +x script.sh
chmod 700 ~/.secrets
chmod 600 ~/.env
```

### Can't Access KeePassXC
```bash
# Check database exists
ls -l ~/.keepass/wallestars.kdbx

# Test access
keepassxc-cli ls ~/.keepass/wallestars.kdbx
```

### VS Code Extension Issues
```bash
# Rebuild extensions
Cmd/Ctrl + Shift + P → "Developer: Reload Window"

# Clear cache
rm -rf ~/.vscode-server/extensions
```

### npm Issues
```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## 📚 Important Paths

```
/workspaces/Wallestars/          # Project root
~/.keepass/                       # KeePassXC databases
~/.secrets/                       # Local secrets (not in repo!)
~/.env.template                   # Environment variables template
~/.n8n/                          # n8n configuration
~/.config/supabase/              # Supabase configuration
~/workspace/projects/             # Additional projects
~/workspace/logs/                 # Application logs
```

## 🎓 Learning Resources

### AI Development
- [Cline GitHub](https://github.com/cline/cline)
- [Copilot Docs](https://docs.github.com/copilot)
- [Continue Docs](https://continue.dev/docs)

### Infrastructure
- [Supabase Tutorial](https://supabase.com/docs/guides/getting-started)
- [n8n Academy](https://docs.n8n.io/courses)
- [Ubuntu Pro](https://ubuntu.com/pro)

### Blockchain
- [Hardhat Tutorial](https://hardhat.org/tutorial)
- [Solana Cookbook](https://solanacookbook.com)
- [Web3.js Docs](https://web3js.readthedocs.io)

### Security
- [KeePassXC User Guide](https://keepassxc.org/docs)
- [Tails Documentation](https://tails.boum.org/doc)

## ⚡ Pro Tips

1. **Use AI assistants**: Ask Cline or Copilot before googling
2. **Secure credentials**: Always use KeePassXC, never hardcode
3. **Monitor services**: Check `pm2 status` regularly
4. **Save often**: Auto-save is enabled but manual save is safer
5. **Git commits**: Small, focused commits with clear messages
6. **Test locally**: Use local Supabase and blockchain before deploying
7. **Document**: Update docs as you develop
8. **Security first**: Review code before committing sensitive data

## 🆘 Need Help?

1. Check documentation in `/workspaces/Wallestars/docs/`
2. Run `~/.welcome.sh` for quick guide
3. Ask AI assistant (Cline, Copilot, Continue)
4. Create GitHub issue
5. Check logs: `ws-logs` or `pm2 logs`

---

**Happy Coding! 🚀**

Keep this file handy for quick reference during development.
