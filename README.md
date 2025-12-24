# Wallestars 🌟

A modern SAAS platform built with Node.js and Express, optimized for deployment on Replit.

## Features

- 🚀 Fast and easy deployment
- 🔒 Secure by default
- ⚡ Scalable architecture
- 🎨 Modern, responsive UI
- 🛠️ Built with Express.js

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser at `http://localhost:3000`

## Deployment on Replit

### Method 1: Direct Import (Recommended)

1. Go to [Replit](https://replit.com)
2. Log in with your account (krasavetsa1@icloud.com)
3. Click "Create Repl"
4. Choose "Import from GitHub"
5. Enter the repository URL: `https://github.com/Wallesters-org/Wallestars`
6. Replit will automatically detect the configuration from `.replit` and `replit.nix`
7. Click "Import from GitHub" to complete

### Method 2: Manual Setup

1. Go to [Replit](https://replit.com) and log in
2. Click "Create Repl"
3. Select "Node.js" as the template
4. Name your repl "Wallestars"
5. After creation, import this repository or copy the files
6. The `.replit` and `replit.nix` files will configure the environment automatically

### Configuration Files

The deployment uses the following configuration files:

- **`.replit`**: Main Replit configuration defining run commands, environment, and deployment settings
- **`replit.nix`**: Nix package configuration for dependencies
- **`package.json`**: Node.js dependencies and scripts
- **`index.js`**: Main application entry point

### Environment Variables

The following environment variables are configured in `.replit`:

- `PORT`: 3000 (default)
- `NODE_ENV`: production

### Deployment Settings

The app is configured for Replit's Cloud Run deployment:
- Automatic HTTPS
- Custom domain support
- Always-on hosting
- Zero-downtime deployments

## API Endpoints

- `GET /` - Main landing page
- `GET /api/health` - Health check endpoint

## Technology Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 4.x
- **Deployment**: Replit Cloud Run
- **Package Manager**: npm

## Project Structure

```
Wallestars/
├── .replit              # Replit configuration
├── replit.nix           # Nix dependencies
├── package.json         # Node.js dependencies
├── index.js             # Main application
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Support

For deployment issues, refer to:
- [Replit Documentation](https://docs.replit.com)
- [Express.js Guide](https://expressjs.com)

## License

ISC
