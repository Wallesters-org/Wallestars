# Hostinger VPS Connection Setup Guide

This guide will help you connect Claude Code to your Hostinger VPS using the Hostinger MCP (Model Context Protocol) server.

## Prerequisites

- A Hostinger account with VPS access
- A Hostinger API key
- Claude Code installed

## Security Notice ⚠️

**NEVER commit your actual API key to version control!** This repository includes a `.gitignore` file to prevent accidental commits of sensitive files, but always be careful when handling API keys.

## Setup Instructions

### Setup in GitHub Codespaces

If you're using GitHub Codespaces, the setup is streamlined:

1. **Open this repository in GitHub Codespaces**
   - Click the "Code" button on GitHub
   - Select "Codespaces" tab
   - Click "Create codespace on main" (or your branch)

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Choose your setup method**
   - **Web Interface (Recommended)**: Press 'Y' or Enter to launch the web-based setup
   - **Command Line**: Press 'N' to continue with the terminal-based setup

4. **Using the Web Interface**
   - The web server will start automatically
   - Your browser should open the setup page (or check the Ports panel for port 8000)
   - Enter your Hostinger API token in the web form
   - Click "Save Configuration"
   - Done! The `.claude-code.json` file is created automatically

5. **Using Command Line**
   - Follow the prompts to enter your API key
   - The script will create the configuration file for you

The Codespaces environment is pre-configured with:
- Node.js for running the Hostinger MCP server
- Python for the web setup interface
- Auto-forwarded ports (8000, 3000) for easy access

### Setup on Local Machine

### Step 1: Get Your Hostinger API Key

1. Log in to your Hostinger account
2. Navigate to the API section
3. Generate or copy your API key
4. Keep this key secure - treat it like a password

### Step 2: Create Your Configuration File

1. Copy the template file to create your actual configuration:
   ```bash
   cp .claude-code.template.json .claude-code.json
   ```

2. Open `.claude-code.json` in a text editor

3. Replace `YOUR_HOSTINGER_API_KEY_HERE` with your actual Hostinger API key:
   ```json
   {
     "inputs": [
       {
         "id": "api_token",
         "type": "promptString",
         "description": "Enter your Hostinger API token (required)"
       }
     ],
     "servers": {
       "hostinger-mcp": {
         "type": "stdio",
         "command": "npx",
         "args": [
           "hostinger-api-mcp@latest"
         ],
         "env": {
           "API_TOKEN": "your_actual_api_key_here"
         }
       }
     }
   }
   ```

4. Save the file

### Step 3: Connect Claude Code

1. Open Claude Code
2. The configuration in `.claude-code.json` will be automatically detected
3. Claude Code will connect to the Hostinger MCP server using your API key
4. You should now have access to Hostinger VPS management features through Claude Code

## Configuration Details

### What the Configuration Does

- **inputs**: Defines an input prompt for the API token (interactive mode)
- **servers**: Configures the Hostinger MCP server
  - **type**: `stdio` - Uses standard input/output for communication
  - **command**: `npx` - Uses Node Package Runner
  - **args**: Runs the latest version of `hostinger-api-mcp`
  - **env**: Sets the `API_TOKEN` environment variable for authentication

### Alternative: Environment Variable Approach

For better security, you can use environment variables instead of hardcoding the API key in the JSON file:

1. Set the environment variable in your shell:
   ```bash
   export HOSTINGER_API_TOKEN="your_api_key_here"
   ```

2. Modify your `.claude-code.json` to reference the environment variable:
   ```json
   {
     "servers": {
       "hostinger-mcp": {
         "type": "stdio",
         "command": "npx",
         "args": [
           "hostinger-api-mcp@latest"
         ],
         "env": {
           "API_TOKEN": "${HOSTINGER_API_TOKEN}"
         }
       }
     }
   }
   ```

## Troubleshooting

### Connection Issues

- Verify your API key is correct and has not expired
- Ensure you have internet connectivity
- Check that `npx` is installed (comes with Node.js)
- Verify the `hostinger-api-mcp` package is accessible

### Permission Issues

- Ensure your API key has the necessary permissions for VPS management
- Check your Hostinger account status

## Security Best Practices

1. ✅ **DO**: Keep your API key private
2. ✅ **DO**: Use environment variables when possible
3. ✅ **DO**: Rotate your API keys regularly
4. ✅ **DO**: Use `.gitignore` to prevent committing sensitive files
5. ❌ **DON'T**: Share your API key in public repositories
6. ❌ **DON'T**: Commit your `.claude-code.json` file to version control
7. ❌ **DON'T**: Include API keys in screenshots or logs

## Files in This Repository

- `.claude-code.template.json` - Template configuration file (safe to commit)
- `.gitignore` - Prevents sensitive files from being committed
- `HOSTINGER_SETUP.md` - This documentation file
- `README.md` - Project overview

## Support

For issues with:
- **Hostinger API**: Contact Hostinger support
- **MCP Server**: Check the `hostinger-api-mcp` package documentation
- **Claude Code**: Refer to Claude Code documentation

## Additional Resources

- [Hostinger API Documentation](https://hostinger.com/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://claude.ai/)
