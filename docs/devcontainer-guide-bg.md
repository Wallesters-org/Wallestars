# Wallestars Dev Container - Comprehensive Documentation

## Общ Преглед

Този dev container е специално конфигуриран за Wallestars проекта и включва всички необходими инструменти за full-stack development с AI автоматизация, blockchain интеграция и enterprise security.

## 🎯 Ключови Функционалности

### 1. AI Integration (Мощни AI Асистенти)
- **Cline (Claude Dev)** - 1M context window модел
  - Model: `claude-sonnet-4-20250514`
  - Max tokens: 1,000,000
  - Пълен достъп до файлова система
  - Авто-запазване на промени
  - Интеграция с KeePassXC за secrets

- **GitHub Copilot** - Enterprise план включен
  - Code completion
  - Chat assistant  
  - Labs features
  - Integration with GitHub Sparks

- **Continue.dev** - Open-source AI code assistant
  - Tab autocomplete
  - Custom model support
  - Local и cloud models

### 2. Platform Integrations

#### GitHub Enterprise + Sparks
- **GitHub Sparks** - Автоматизирана AI помощ за development
- GitHub Actions integration
- Pull Request automation
- Issue management with AI

#### Supabase Integration
- **Supabase Extension** вградена
- PostgreSQL database client
- Authentication management
- Storage management
- Real-time subscriptions
- Edge Functions support

### 3. Security & Secrets Management

#### KeePassXC Integration
- **Database Path**: `~/.keepass/wallestars.kdbx`
- CLI tools за достъп до credentials
- Persistent storage support (Tails OS)
- Автоматично криптиране с passphrase
- Python библиотека (pykeepass) за програматичен достъп

#### Environment Variables
Всички sensitive данни се зареждат от environment variables:
- GitHub tokens
- Anthropic API keys
- Supabase credentials
- Blockchain RPC endpoints
- Ubuntu Pro tokens
- Database passwords

#### Tails OS Persistent Storage Support
- Mount point: `~/.tails-persistent`
- Read-only достъп за сигурност
- Интеграция с KeePassXC database

### 4. Development Tools

#### Frontend Development
- React, Next.js, Vue.js
- TailwindCSS support
- Live Server
- Hot Module Replacement
- Preview environments

#### Backend Development
- Node.js 20.x (LTS)
- Python 3.11 с Jupyter
- .NET Core
- Go lang
- Rust

#### Database Tools
- PostgreSQL client (Supabase)
- MySQL client
- SQLite support
- MongoDB support
- Redis tools
- Prisma ORM

#### Blockchain Development
- **Solidity** - Smart contract development
- **Hardhat** - Ethereum development environment
- **Truffle** - Alternative framework
- **Ganache** - Local blockchain
- **Web3.js** - Ethereum JavaScript API
- **Solana CLI** - Solana development
- Multi-chain support (Ethereum, Polygon, Solana, BSC)

#### n8n Workflow Automation
- Pre-installed n8n
- Auto-start configuration available
- Port 5678 forwarded
- Webhook support
- Integration с Claude AI и GitHub

### 5. DevOps & Infrastructure

#### Docker & Kubernetes
- Docker-in-Docker enabled
- Kubernetes tools (kubectl, helm)
- Minikube for local clusters
- Container registry access

#### Cloud Platforms
- Azure CLI
- AWS Toolkit
- Terraform
- Infrastructure as Code

#### Ubuntu Pro & VPS Management
- **Ubuntu Pro Token** - Configured
- **15 VMs Total** (5 free + 10 bonus)
- SSH key management
- Multi-VPS orchestration support

## 📋 Installed Extensions (100+ Extensions)

### AI & Productivity
✅ Claude Dev (Cline) - 1M context  
✅ Continue.dev  
✅ GitHub Copilot + Chat + Labs  
✅ IntelliCode  
✅ AWS Toolkit  

### Code Quality
✅ ESLint + Prettier  
✅ SonarLint  
✅ Snyk Security  
✅ Error Lens  
✅ Todo Tree  

### Git & Version Control
✅ GitLens  
✅ Git Graph  
✅ GitHub Actions  
✅ Pull Request Manager  

### Database & Backend
✅ SQLTools (PostgreSQL, MySQL, SQLite)  
✅ MongoDB  
✅ **Supabase Extension**  
✅ Prisma  
✅ Redis Tools  

### Blockchain & Web3
✅ Solidity  
✅ Hardhat  
✅ Solidity Visual Auditor  
✅ Solidity Language Support  

### Testing
✅ Jest Runner  
✅ Test Explorer  
✅ Quokka (Live JavaScript)  

### Frontend
✅ React Snippets  
✅ TailwindCSS IntelliSense  
✅ Auto Close/Rename Tag  
✅ GraphQL  
✅ Styled Components  

### Documentation
✅ Markdown All-in-One  
✅ Markdown Preview  
✅ Mermaid Diagrams  

### Remote Development
✅ Remote SSH  
✅ Remote Containers  
✅ Remote WSL  
✅ Live Share + Audio  

## 🚀 Getting Started

### 1. Environment Setup

Copy environment template:
```bash
cp ~/.env.template .env
```

Edit `.env` с вашите credentials:
- GitHub token (Enterprise)
- Anthropic API key (Claude Pro)
- Supabase credentials
- Blockchain RPC endpoints
- Ubuntu Pro token

### 2. KeePassXC Setup

Създайте или свържете вашата KeePassXC database:

```bash
# Създаване на нова database
keepassxc-cli db-create ~/.keepass/wallestars.kdbx

# Добавяне на entry
keepassxc-cli add ~/.keepass/wallestars.kdbx

# Показване на entries
keepassxc-cli show ~/.keepass/wallestars.kdbx
```

**Важно**: Запазете master password-а на сигурно място!

### 3. Start Services

#### n8n Workflow Engine
```bash
ws-n8n
# или
pm2 start n8n --name "wallestars-n8n" -- start --tunnel
```

#### Supabase Local
```bash
sb-start
```

#### Local Blockchain (Hardhat)
```bash
hardhat-node
```

### 4. Project Commands

```bash
ws-start      # Open project in VS Code
ws-status     # Check service status
ws-logs       # View logs
ws-rebuild    # Rebuild project
ws-clean      # Clean and reinstall dependencies
```

## 📊 Port Forwarding

| Port  | Service | Auto-Forward | Description |
|-------|---------|--------------|-------------|
| 3000  | Frontend | ✅ Notify | React/Next.js app |
| 3001  | Frontend Alt | Silent | Alternative frontend |
| 5000  | Backend | ✅ Notify | API server |
| 5678  | n8n | ✅ Notify | Workflow engine (HTTPS) |
| 8000  | Python | Silent | Python web server |
| 8080  | Dev Server | Silent | Development proxy |
| 8545  | Blockchain | Silent | Hardhat/Ganache |
| 9000  | Custom | Silent | Additional service |
| 54321 | Supabase | ✅ Notify | Supabase local |

## 🔐 Security Best Practices

### 1. Credentials Management

**НИКОГА не commit-вайте**:
- `.env` файлове
- API keys
- Passwords
- Private keys
- SSH keys
- KeePassXC databases

**Използвайте**:
- Environment variables
- KeePassXC за съхранение
- GitHub Secrets за CI/CD
- Encrypted storage

### 2. KeePassXC Workflow

Препоръчителен workflow за credentials:
1. Съхранявайте всички credentials в KeePassXC
2. Използвайте CLI за достъп: `keepassxc-cli`
3. Автоматизирайте извличането с scripts
4. Никога не hardcode-вайте credentials

### 3. Tails OS Integration

Ако използвате Tails OS persistent storage:
1. Mount point е read-only в container
2. Копирайте KeePassXC DB на mount при boot
3. Синхронизирайте промени след unmount
4. Използвайте passphrase защита

## 🔄 Workflow Examples

### AI-Assisted Development (Cline)

```javascript
// Cline може да:
// 1. Чете и анализира code files
// 2. Предлага промени и improvements
// 3. Генерира нов код
// 4. Интегрира с Git за commits
// 5. Достъпва KeePassXC за credentials

// Example: Автоматично генериране на API endpoint
// Питайте Cline: "Create a REST API endpoint for user authentication"
```

### GitHub Sparks Integration

```bash
# GitHub Sparks автоматично:
# - Анализира Pull Requests
# - Предлага code improvements
# - Генерира тестове
# - Документира промени
# - Помага с debugging
```

### Supabase Database Operations

```javascript
// Използвайте Supabase extension за:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// CRUD operations
const { data, error } = await supabase
  .from('users')
  .select('*');
```

### Multi-Chain Blockchain Development

```javascript
// Ethereum (Hardhat)
npx hardhat compile
npx hardhat test
npx hardhat deploy

// Solana
solana-test-validator  # Local validator
solana program deploy  # Deploy program

// Polygon, BSC - same Web3.js API
```

## 📈 Performance Optimization

### Container Resources
- **Memory**: Recommend 8GB+
- **CPU**: 4+ cores
- **Storage**: 50GB+ SSD

### VS Code Settings
- Bracket pair colorization enabled
- Inline suggestions enabled
- Auto save после 1s delay
- Format on save
- ESLint auto-fix on save

### Node.js Optimization
- npm cache агресивен caching
- parallel installation
- `--frozen-lockfile` за CI/CD

## 🆘 Troubleshooting

### Port Conflicts
```bash
# Check ports
ports
netstat -tulanp

# Kill process on port
sudo kill -9 $(lsof -t -i:5678)
```

### n8n Issues
```bash
# Check n8n logs
pm2 logs n8n-workflow

# Restart n8n
pm2 restart n8n-workflow

# Reset n8n
rm -rf ~/.n8n && n8n start
```

### Supabase Connection
```bash
# Check Supabase status
sb-status

# Restart Supabase
sb-stop && sb-start

# View logs
sb-logs
```

### KeePassXC Access
```bash
# Test database access
keepassxc-cli ls ~/.keepass/wallestars.kdbx

# Change master password
keepassxc-cli db-edit ~/.keepass/wallestars.kdbx
```

## 🔧 Customization

### Add More Extensions
Edit `.devcontainer/devcontainer.json`:
```json
"extensions": [
  "your.extension-id"
]
```

### Add Environment Variables
Edit `.devcontainer/devcontainer.json`:
```json
"containerEnv": {
  "YOUR_VAR": "${localEnv:YOUR_VAR}"
}
```

### Add System Packages
Edit `.devcontainer/setup.sh`:
```bash
sudo apt-get install -y your-package
```

## 📞 Support & Resources

### Documentation
- `/workspaces/Wallestars/docs/` - Project documentation
- `~/.welcome.sh` - Quick start guide
- `~/.env.template` - Environment variables template

### External Resources
- [Cline Documentation](https://github.com/cline/cline)
- [GitHub Copilot Docs](https://docs.github.com/copilot)
- [Supabase Docs](https://supabase.com/docs)
- [n8n Docs](https://docs.n8n.io)
- [Ubuntu Pro](https://ubuntu.com/pro)

### Issues & Questions
- Create issue в GitHub repository
- Check existing documentation
- Консултирайте с AI assistants (Cline, Copilot)

## 🎉 Ready to Code!

Вашият development environment е напълно конфигуриран с:
✅ AI assistants (Cline 1M context, Copilot, Continue)  
✅ GitHub Enterprise + Sparks  
✅ Supabase integration  
✅ KeePassXC security  
✅ Blockchain development (Ethereum, Solana, Polygon, BSC)  
✅ n8n workflow automation  
✅ Ubuntu Pro + 15 VMs  
✅ 100+ VS Code extensions  
✅ Full-stack development tools  

**Happy coding! 🚀**

---

**Last Updated**: 2026-01-02  
**Version**: 1.0.0  
**Author**: Wallestars Team
