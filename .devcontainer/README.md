# Dev Container Configuration

This directory contains the configuration for GitHub Codespaces and Visual Studio Code Dev Containers.

## What's Configured

The `devcontainer.json` file sets up a complete development environment with:

### Base Image
- **Node.js 20**: Required for running the Hostinger MCP server via `npx`

### Additional Features
- **Python 3.11**: For the web-based setup interface (`web-setup.py`)

### VS Code Extensions
- ESLint: For JavaScript linting
- Prettier: For code formatting

### Port Forwarding
- **Port 8000**: Web Setup Interface (automatically forwarded)
- **Port 3000**: Development Server (automatically forwarded)

### Post-Create Commands
The container automatically makes scripts executable after creation, so you can immediately run:
```bash
./setup.sh
```

## How It Works

When you open this repository in GitHub Codespaces or VS Code with the Dev Containers extension:

1. The container is built using the configuration in `devcontainer.json`
2. All required tools (Node.js, Python) are automatically installed
3. Ports are forwarded so you can access the web interface
4. The `postCreateCommand` runs to prepare the environment
5. You're ready to configure your Hostinger VPS connection!

## Usage

### In GitHub Codespaces
1. Click "Code" → "Codespaces" → "Create codespace"
2. Wait for the environment to build (first time only)
3. Run `./setup.sh` to start configuration

### In VS Code Locally
1. Install the "Dev Containers" extension
2. Open the repository in VS Code
3. Click "Reopen in Container" when prompted
4. Run `./setup.sh` to start configuration

## Customization

You can customize this configuration by editing `devcontainer.json`. Common changes:

- Add more VS Code extensions in the `extensions` array
- Change Node.js or Python versions in the `features` section
- Forward additional ports in the `forwardPorts` array
- Add custom startup commands in `postCreateCommand`

## Learn More

- [Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [Wallestars Setup Guide](../CODESPACES.md)
