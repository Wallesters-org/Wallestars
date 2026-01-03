@echo off
REM Wallestars Launch Script for Windows
REM This script automates the setup and launch process

echo =========================================================
echo.
echo    🌟 WALLESTARS CONTROL CENTER - LAUNCHER 🌟
echo.
echo =========================================================
echo.

REM Check Node.js
echo 🔍 Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20.x or higher.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% detected

REM Install dependencies if needed
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo.
    echo ⚙️  Creating .env file from template...
    copy .env.example .env >nul
    echo ✅ .env file created
    echo.
    echo ⚠️  IMPORTANT: Please edit .env and add your Anthropic API key!
    echo    File location: %CD%\.env
    echo    Get your API key from: https://console.anthropic.com
    echo.
    pause
) else (
    echo ✅ .env file exists
)

REM Check if API key is set
findstr /C:"your_api_key_here" .env >nul 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  WARNING: API key not configured in .env file!
    echo    The server will start, but Claude features won't work.
    echo.
    set /p CONTINUE="Continue anyway? (y/N): "
    if /i not "%CONTINUE%"=="y" (
        echo Please edit .env and add your API key, then run this script again.
        pause
        exit /b 0
    )
)

REM Launch the application
echo.
echo 🚀 Launching Wallestars Control Center...
echo.
echo =========================================================
echo.
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3000
echo    Health:   http://localhost:3000/api/health
echo.
echo    Press Ctrl+C to stop the servers
echo.
echo =========================================================
echo.

REM Start the application
call npm run dev
