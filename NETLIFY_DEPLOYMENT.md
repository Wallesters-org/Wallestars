# Netlify Deployment Guide for Wallestars Control Center

## Overview

This guide explains how to deploy the Wallestars Control Center to Netlify.

## Quick Deploy

Click the button below to deploy to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Wallesters-org/Wallestars)

## Configuration Files

The repository includes the following Netlify configuration files:

### 1. `netlify.toml`
Main configuration file that defines:
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Node version: 20
- Redirect rules
- Security headers
- Environment-specific settings

### 2. `public/_redirects`
Redirect rules for:
- SPA (Single Page Application) routing
- API proxy configuration

### 3. `.netlifyignore`
Specifies files to exclude from deployment

### 4. `netlify/functions/`
Directory for Netlify Functions (serverless functions)

## Deployment Steps

### Option 1: Quick Deploy Button

1. Click the "Deploy to Netlify" button above
2. Authorize Netlify to access your GitHub account
3. Configure your site settings
4. Add environment variables (see below)
5. Click "Deploy site"

### Option 2: Manual Deployment

1. **Fork or clone the repository**

2. **Sign up for Netlify**
   - Go to https://netlify.com
   - Sign up or log in

3. **Create a new site**
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub)
   - Select the Wallestars repository

4. **Configure build settings** (these are already in netlify.toml)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20.x

5. **Add environment variables**
   - Go to Site settings → Environment variables
   - Add the following environment variables:
     - `ANTHROPIC_API_KEY` = `your_anthropic_api_key`
     - `NODE_ENV` = `production`

6. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 3: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify project (run once)
netlify init

# Deploy to production
netlify deploy --prod

# Or deploy a preview
netlify deploy
```

## Important Limitations

### Full Backend Features Not Supported

Netlify is optimized for static sites and serverless functions. The following features of Wallestars Control Center have limitations on Netlify:

❌ **Computer Use (Linux Desktop Control)**
- Requires system-level access
- Needs persistent process for screen streaming
- Not available in Netlify's serverless environment

❌ **Android Control via ADB**
- Requires ADB daemon running
- Needs direct device connection
- Not available in Netlify's environment

❌ **WebSocket Persistent Connections**
- Netlify Functions have 10-second timeout
- Real-time bidirectional communication limited
- Socket.IO features won't work as expected

✅ **Static Frontend**
- React UI works perfectly
- Client-side routing works
- All UI components functional

⚠️ **Claude AI Chat**
- Can work with Netlify Functions
- Limited to request/response (no streaming)
- Each message requires new serverless function invocation

## Recommended Deployment Strategy

### Strategy 1: Frontend Only on Netlify

Deploy the frontend to Netlify and host the backend separately:

1. Deploy frontend to Netlify (static site)
2. Host backend on VPS (DigitalOcean, Linode) or container platform (Render, Railway)
3. Update frontend to point to backend API URL
4. Configure CORS on backend to allow Netlify domain

### Strategy 2: Full Stack on Other Platforms

For full functionality, use:
- **Azure Web Apps** (GitHub Actions workflow included)
- **Docker platforms** (Render, Railway, Fly.io)
- **VPS** (DigitalOcean, Linode, AWS EC2)

## Environment Variables

Required environment variables for Netlify deployment:

```env
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional
NODE_ENV=production
ENABLE_COMPUTER_USE=false  # Not supported on Netlify
ENABLE_ANDROID=false       # Not supported on Netlify
```

## Custom Domain

To use a custom domain:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure DNS
4. Netlify will automatically provision SSL certificate

## Continuous Deployment

Netlify automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests
- **Branch deploys**: Pushes to other branches (if enabled)

## Troubleshooting

### Build Fails

1. Check build logs in Netlify dashboard
2. Verify Node version matches (20.x)
3. Ensure all dependencies are in `package.json`
4. Check for missing environment variables

### API Calls Fail

1. Verify environment variables are set
2. Check browser console for CORS errors
3. Ensure API endpoints are configured correctly

### SPA Routing Issues

1. Verify `_redirects` file exists in `dist/` after build
2. Check that all routes redirect to `/index.html`

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Continuous Deployment](https://docs.netlify.com/site-deploys/overview/)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## Support

For issues specific to this deployment:
- Check the [main README](README.md)
- Open an issue on GitHub
- Review Netlify build logs

For full backend functionality, consider the recommended deployment strategies above.
