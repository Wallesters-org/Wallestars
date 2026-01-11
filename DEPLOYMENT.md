# 🚀 Deployment Guide for Wallestars Control Center

This guide covers how to build and deploy the Wallestars Control Center platform.

## Prerequisites

- Node.js 20.x or higher
- npm (comes with Node.js)
- Azure account (for Azure deployment)
- Anthropic API key

## Local Development

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies and generate `package-lock.json`.

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional
PORT=3000
NODE_ENV=development
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
```

### 3. Build the Frontend

```bash
npm run build
```

This creates a production-ready build in the `dist/` directory.

### 4. Run the Server

For development with hot reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

The application will be available at:
- Frontend: `http://localhost:5173` (dev) or served from backend (production)
- Backend API: `http://localhost:3000`
- WebSocket: `ws://localhost:3000`

## Azure Web Apps Deployment

### Method 1: GitHub Actions (Automated)

The repository includes a GitHub Actions workflow for automated deployment to Azure Web Apps.

#### Setup Steps:

1. **Create an Azure Web App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Web App with Node.js 20 runtime
   - Note the app name

2. **Download Publish Profile**
   - In Azure Portal, go to your Web App
   - Click "Get publish profile" in the Overview section
   - Download the `.PublishSettings` file

3. **Configure GitHub Secrets**
   - Go to your GitHub repository settings
   - Navigate to Secrets and Variables > Actions
   - Add a new secret:
     - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
     - Value: Paste the entire contents of the `.PublishSettings` file

4. **Update Workflow Configuration**
   
   Edit `.github/workflows/azure-webapps-node.yml`:
   
   ```yaml
   env:
     AZURE_WEBAPP_NAME: your-app-name    # Change to your Azure Web App name
     NODE_VERSION: '20.x'
   ```

5. **Configure Environment Variables in Azure**
   - In Azure Portal, go to your Web App
   - Navigate to Configuration > Application settings
   - Add these settings:
     ```
     ANTHROPIC_API_KEY=sk-ant-your-key-here
     NODE_ENV=production
     ENABLE_COMPUTER_USE=true
     ENABLE_ANDROID=false
     WEBSITE_NODE_DEFAULT_VERSION=20.x
     SCM_DO_BUILD_DURING_DEPLOYMENT=true
     ```

6. **Deploy**
   - Push to the `main` branch or manually trigger the workflow
   - The workflow will automatically build and deploy your app
   - Monitor the deployment in the Actions tab

### Method 2: Manual Azure Deployment

Using Azure CLI:

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name wallestars-rg --location eastus

# Create App Service plan
az appservice plan create --name wallestars-plan --resource-group wallestars-rg --sku B1 --is-linux

# Create Web App
az webapp create --resource-group wallestars-rg --plan wallestars-plan --name your-app-name --runtime "NODE:20-lts"

# Configure environment variables
az webapp config appsettings set --resource-group wallestars-rg --name your-app-name --settings ANTHROPIC_API_KEY=your-key NODE_ENV=production

# Deploy from local git
cd /path/to/Wallestars
npm install
npm run build
az webapp deployment source config-local-git --name your-app-name --resource-group wallestars-rg
git remote add azure <deployment-url>
git push azure main
```

## Docker Deployment

### Create Dockerfile (if not exists)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

### Build and Run

```bash
# Build image
docker build -t wallestars-control-center .

# Run container
docker run -d \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your-key \
  -e NODE_ENV=production \
  --name wallestars \
  wallestars-control-center
```

## Verifying Deployment

After deployment, verify the application is running:

1. **Health Check Endpoint**
   ```bash
   curl https://your-app-name.azurewebsites.net/api/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-04T00:00:00.000Z",
     "services": {
       "claude": true,
       "computerUse": true,
       "android": false
     }
   }
   ```

2. **Access the Web Interface**
   - Open `https://your-app-name.azurewebsites.net` in your browser
   - You should see the Wallestars Control Center dashboard

## Troubleshooting

### Build Failures

**Issue**: `npm install` fails in CI
- **Solution**: Ensure `package-lock.json` is committed to the repository

**Issue**: Build fails with memory error
- **Solution**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Deployment Failures

**Issue**: Azure deployment fails with "Cannot find module"
- **Solution**: Ensure `node_modules` is not in `.gitignore` for deployment, or use `npm ci` in build step

**Issue**: Application starts but shows errors
- **Solution**: Check Azure logs: `az webapp log tail --name your-app-name --resource-group wallestars-rg`

### Runtime Issues

**Issue**: Claude API not working
- **Solution**: Verify `ANTHROPIC_API_KEY` is set correctly in Azure Application Settings

**Issue**: WebSocket connection fails
- **Solution**: Ensure Azure Web App has WebSocket support enabled:
  ```bash
  az webapp config set --name your-app-name --resource-group wallestars-rg --web-sockets-enabled true
  ```

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured correctly
- [ ] API keys secured (not in code)
- [ ] Build process tested locally
- [ ] Health check endpoint returns 200
- [ ] CORS configured for production domain
- [ ] WebSockets enabled in Azure
- [ ] Monitoring and logging configured
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured (if needed)
- [ ] Backup strategy in place

## CI/CD Pipeline

The GitHub Actions workflow performs these steps:

1. **Build Job**
   - Checkout code
   - Set up Node.js 20.x with npm caching
   - Install dependencies (`npm install`)
   - Build frontend (`npm run build`)
   - Run tests (`npm test`)
   - Upload build artifact

2. **Deploy Job**
   - Download build artifact
   - Deploy to Azure Web App using publish profile
   - Verify deployment

## Monitoring and Maintenance

### Azure Monitoring

Enable Application Insights for monitoring:

```bash
az monitor app-insights component create \
  --app wallestars-insights \
  --location eastus \
  --resource-group wallestars-rg
```

### Log Access

View application logs:

```bash
# Stream logs
az webapp log tail --name your-app-name --resource-group wallestars-rg

# Download logs
az webapp log download --name your-app-name --resource-group wallestars-rg
```

## Scaling

To scale your application:

```bash
# Scale up (increase instance size)
az appservice plan update --name wallestars-plan --resource-group wallestars-rg --sku P1V2

# Scale out (increase instance count)
az appservice plan update --name wallestars-plan --resource-group wallestars-rg --number-of-workers 2
```

## Security Best Practices

1. **API Keys**: Never commit API keys. Use Azure Key Vault for production.
2. **HTTPS**: Always use HTTPS in production (enabled by default in Azure).
3. **Environment Variables**: Store sensitive data in Azure Application Settings.
4. **Access Control**: Configure Azure AD authentication if needed.
5. **Updates**: Regularly update dependencies (`npm audit` and `npm update`).

## Support

For issues or questions:
- Check the [README.md](README.md) for general information
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- See [MCP_SETUP.md](MCP_SETUP.md) for Claude Desktop integration

---

**Built with ❤️ by the Wallestars Team**
