# Wallestars MCP Setup Script for Windows
# This script helps configure Wallestars for use with Claude Desktop on Windows

Write-Host "🌟 Wallestars MCP Configuration Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$WALLESTARS_PATH = $PSScriptRoot
Write-Host "Wallestars path: $WALLESTARS_PATH"
Write-Host ""

# Claude Desktop config directory
$CLAUDE_CONFIG_DIR = Join-Path $env:APPDATA "Claude"
Write-Host "Claude config directory: $CLAUDE_CONFIG_DIR"
Write-Host ""

# Check if Claude Desktop config directory exists
if (-not (Test-Path $CLAUDE_CONFIG_DIR)) {
    Write-Host "⚠️  Claude Desktop config directory not found at: $CLAUDE_CONFIG_DIR" -ForegroundColor Yellow
    Write-Host "   Claude Desktop may not be installed." -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Would you like to create the directory? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        New-Item -ItemType Directory -Path $CLAUDE_CONFIG_DIR -Force | Out-Null
        Write-Host "✅ Created directory: $CLAUDE_CONFIG_DIR" -ForegroundColor Green
    } else {
        Write-Host "❌ Setup cancelled. Please install Claude Desktop first." -ForegroundColor Red
        exit 1
    }
}

$CONFIG_FILE = Join-Path $CLAUDE_CONFIG_DIR "claude_desktop_config.json"

# Check if config file exists
if (Test-Path $CONFIG_FILE) {
    Write-Host "⚠️  Existing Claude Desktop config found at:" -ForegroundColor Yellow
    Write-Host "   $CONFIG_FILE" -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Would you like to create a backup before modifying? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $BACKUP_FILE = "$CONFIG_FILE.backup.$timestamp"
        Copy-Item $CONFIG_FILE $BACKUP_FILE
        Write-Host "✅ Backup created at: $BACKUP_FILE" -ForegroundColor Green
        Write-Host ""
    }
}

# Get API key from user
Write-Host "Enter your Anthropic API Key (or press Enter to use environment variable):"
$API_KEY = Read-Host

if ([string]::IsNullOrWhiteSpace($API_KEY)) {
    $envFile = Join-Path $WALLESTARS_PATH ".env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        $apiKeyLine = $content | Where-Object { $_ -match "^ANTHROPIC_API_KEY=" }
        if ($apiKeyLine) {
            # Split only on first '=' and remove quotes
            $API_KEY = ($apiKeyLine -split '=', 2)[1].Trim().Trim('"').Trim("'")
            Write-Host "✅ Using API key from .env file" -ForegroundColor Green
        }
    }
    
    if ([string]::IsNullOrWhiteSpace($API_KEY)) {
        Write-Host "⚠️  No API key provided and .env file not found" -ForegroundColor Yellow
        $API_KEY = "sk-ant-your-api-key-here"
    }
}

# Ask about computer use
Write-Host ""
$response = Read-Host "Enable Computer Use (Linux desktop control)? (y/n)"
$ENABLE_COMPUTER_USE = if ($response -eq 'y' -or $response -eq 'Y') { "true" } else { "false" }

# Ask about Android
Write-Host ""
$response = Read-Host "Enable Android Control? (y/n)"
$ENABLE_ANDROID = if ($response -eq 'y' -or $response -eq 'Y') { "true" } else { "false" }

# Create the configuration
Write-Host ""
Write-Host "Creating Claude Desktop configuration..." -ForegroundColor Cyan

# Check if existing config has other servers
if (Test-Path $CONFIG_FILE) {
    Write-Host "⚠️  Note: This will replace your existing configuration." -ForegroundColor Yellow
    Write-Host "   If you have other MCP servers configured, you'll need to manually merge them." -ForegroundColor Yellow
    Write-Host ""
}

# Convert Windows path backslashes to forward slashes for JSON
$serverPath = Join-Path $WALLESTARS_PATH "server\index.js"
$serverPathJson = $serverPath.Replace('\', '/')

# Find node.exe path
$nodePath = (Get-Command node -ErrorAction SilentlyContinue)?.Source
if ([string]::IsNullOrWhiteSpace($nodePath)) {
    $nodePath = "node"
}

$config = @{
    mcpServers = @{
        "wallestars-control" = @{
            command = $nodePath
            args = @($serverPathJson)
            env = @{
                ANTHROPIC_API_KEY = $API_KEY
                PORT = "3000"
                NODE_ENV = "production"
                ENABLE_COMPUTER_USE = $ENABLE_COMPUTER_USE
                ENABLE_ANDROID = $ENABLE_ANDROID
                SCREENSHOT_INTERVAL = "2000"
                ADB_HOST = "localhost"
                ADB_PORT = "5037"
                WS_PORT = "3001"
            }
        }
    }
}

# Convert to JSON and save
$config | ConvertTo-Json -Depth 10 | Set-Content $CONFIG_FILE -Encoding UTF8

Write-Host "✅ Configuration created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Configuration file: $CONFIG_FILE" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Claude Desktop to load the new configuration"
Write-Host "2. Try asking Claude: 'Take a screenshot of my desktop'"
Write-Host "3. For more details, see MCP_SETUP.md"
Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green

# Pause to allow user to read the output
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
