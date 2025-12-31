# Project Structure Documentation

## Обзор

Този документ описва организацията на Wallestars проекта и логиката зад структурата.

## Принципи на организация

### 1. Модулност
Всяка платформа е независим модул, който може да се развива и deploy-ва самостоятелно.

### 2. Споделени ресурси
Общи компоненти, utilities и интеграции са в `shared/` директорията.

### 3. Централизирана документация
- Специфична документация в съответните модули
- Обща документация в `docs/`

### 4. Eva като ядро
Eva алгоритъмът е централна компонента, която се интегрира с всички платформи.

## Директорийна структура

### /eva-core
```
eva-core/
├── config/              # Конфигурационни файлове
│   ├── eva-config.template.json
│   ├── platforms.json   # Platform-specific configs
│   └── rules/          # Business rules
│
├── workflows/          # Workflow definitions
│   ├── social-media/
│   ├── content-gen/
│   └── automation/
│
├── social-automations/ # Social media modules
│   ├── instagram/
│   ├── telegram/
│   ├── facebook/
│   └── ...
│
├── docs/              # Eva documentation
│   ├── EVA-DOCUMENTATION.md
│   ├── api-reference.md
│   └── examples/
│
└── tests/             # Test suites
    ├── unit/
    ├── integration/
    └── e2e/
```

### /platforms
Всяка платформа има стандартна структура:
```
platform-name/
├── README.md          # Platform documentation
├── src/              # Source code
├── config/           # Configuration files
├── api/              # API endpoints
├── ui/               # User interface
├── tests/            # Tests
└── docs/             # Additional docs
```

### /shared
```
shared/
├── utils/            # Common utilities
│   ├── logger.js
│   ├── validators.js
│   └── helpers.js
│
├── integrations/     # Third-party integrations
│   ├── supabase/
│   ├── openai/
│   └── google-sheets/
│
└── api-clients/      # Reusable API clients
    ├── telegram-client.js
    ├── social-media.js
    └── email-client.js
```

### /docs
```
docs/
├── platforms/        # Platform guides
├── eva/             # Eva documentation
├── guides/          # How-to guides
│   ├── deployment.md
│   ├── configuration.md
│   └── best-practices.md
│
└── api/             # API documentation
    ├── endpoints.md
    └── authentication.md
```

## Naming Conventions

### Файлове
- Configuration files: `kebab-case.json`
- Documentation: `CAPS-WITH-DASHES.md`
- Source code: `camelCase.js` или `PascalCase.js`
- Tests: `*.test.js` или `*.spec.js`

### Директории
- Lowercase with hyphens: `platform-name/`
- Descriptive names: `social-automations/` не `socials/`

## Git Strategy

### Branches
- `main` - Production ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commits
Conventional commits format:
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Dependency Management

### Package Managers
- Node.js projects: `npm`
- Python projects: `pip` + `requirements.txt`

### Shared Dependencies
Common dependencies should be in root `package.json` if possible.

### Version Control
Use exact versions for critical dependencies:
```json
{
  "dependencies": {
    "critical-package": "1.2.3",
    "other-package": "^2.0.0"
  }
}
```

## Environment Variables

### Structure
```
.env                    # Local development
.env.example           # Template with dummy values
.env.production        # Production (not in git)
.env.test             # Testing
```

### Naming
```
# Service name_Resource_Type
SUPABASE_API_KEY
OPENAI_API_KEY
TELEGRAM_BOT_TOKEN
EVA_CONFIG_PATH
```

## Testing Strategy

### Levels
1. **Unit Tests** - Individual functions/modules
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Full workflows
4. **Manual Tests** - UI/UX validation

### Coverage Goals
- Core Eva: 80%+ coverage
- Platforms: 70%+ coverage
- Utilities: 90%+ coverage

## Documentation Standards

### README.md Structure
1. Title & Description
2. Features
3. Installation
4. Configuration
5. Usage Examples
6. API Reference
7. Contributing
8. License

### Code Comments
- JSDoc for functions
- Inline comments for complex logic
- Bulgarian or English (consistent per file)

## Security

### Sensitive Data
- Never commit credentials
- Use environment variables
- Encrypt sensitive configs
- Regular security audits

### Access Control
- Role-based permissions
- API key rotation
- Audit logging
- Rate limiting

## Performance

### Optimization
- Lazy loading
- Caching strategies
- Database indexing
- API rate limiting

### Monitoring
- Error tracking
- Performance metrics
- Resource usage
- User analytics

## Deployment

### Environments
1. **Development** - Local machines
2. **Staging** - Pre-production testing
3. **Production** - Live systems

### CI/CD
- Automated testing
- Code quality checks
- Security scanning
- Automated deployment

## Maintenance

### Regular Tasks
- Update dependencies
- Review and merge PRs
- Update documentation
- Performance optimization
- Security patches

### Deprecation Process
1. Mark as deprecated
2. Add warnings
3. Provide migration guide
4. Remove after grace period

## Future Considerations

### Scalability
- Microservices architecture
- Load balancing
- Database sharding
- Caching layers

### Extensibility
- Plugin system
- API versioning
- Webhook support
- Third-party integrations

## Questions & Support

За въпроси относно структурата или организацията на проекта, вижте:
- Документацията в съответните модули
- GitHub Issues за дискусии
- Pull Request templates за contribution

---

**Last Updated:** 2025-12-31  
**Version:** 1.0.0
