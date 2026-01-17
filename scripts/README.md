# Scripts Directory

Helper scripts for managing Wallestars automation workflows.

## Available Scripts

### `manage-workflows.sh`
Workflow management helper for triggering and monitoring GitHub Actions workflows.

**Usage:**
```bash
# List all workflows
./scripts/manage-workflows.sh list

# Trigger a workflow
./scripts/manage-workflows.sh trigger pr-session-management

# Validate workflow YAML syntax
./scripts/manage-workflows.sh validate
```

**Requirements:**
- GitHub CLI (`gh`) installed
- Authenticated with GitHub

### `setup-automation.sh`
Initial setup script for the automation system.

**Usage:**
```bash
./scripts/setup-automation.sh
```

**What it does:**
- Checks system requirements
- Installs dependencies
- Validates workflow files
- Checks configuration files
- Provides next steps

## Quick Start

1. **Make scripts executable:**
   ```bash
   chmod +x scripts/*.sh
   ```

2. **Run setup:**
   ```bash
   ./scripts/setup-automation.sh
   ```

3. **Manage workflows:**
   ```bash
   ./scripts/manage-workflows.sh list
   ```

## Development

### Adding New Scripts

1. Create script in `scripts/` directory
2. Add shebang: `#!/bin/bash`
3. Make executable: `chmod +x scripts/your-script.sh`
4. Document in this README
5. Test thoroughly before committing

### Script Guidelines

- Use `set -e` for error handling
- Add help text with `-h` flag
- Use consistent color coding
- Validate inputs
- Provide clear error messages
- Include usage examples

## Troubleshooting

### Permission Denied
```bash
chmod +x scripts/*.sh
```

### GitHub CLI Not Found
Install from: https://cli.github.com/

### Python Not Found
Most scripts use Python 3 for YAML validation:
```bash
# Ubuntu/Debian
sudo apt install python3

# macOS
brew install python3
```

## Additional Resources

- [Complete Automation Guide](../COMPLETE_AUTOMATION_GUIDE.md)
- [Repository Consolidation Roadmap](../REPOSITORY_CONSOLIDATION_ROADMAP.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
