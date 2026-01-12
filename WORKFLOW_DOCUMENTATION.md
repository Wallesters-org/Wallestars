# GitHub Actions Workflow Documentation

This document describes the GitHub Actions workflows configured for the Wallestars Control Center project.

## Overview

The project uses two main workflows:
1. **CI Workflow** (`ci.yml`) - Continuous Integration for testing and building
2. **Azure Deployment Workflow** (`azure-webapps-node.yml`) - Automated deployment to Azure Web Apps

---

## CI Workflow (`ci.yml`)

### Purpose
Runs automated tests, security audits, and builds on every push to `main` branch and all pull requests.

### Trigger Events
- Push to `main` branch
- Pull requests targeting `main` branch

### Jobs

#### 1. Test Job
- **Matrix Strategy**: Tests on Node.js 20.x and 22.x
- **Steps**:
  1. Checkout repository
  2. Setup Node.js with npm caching
  3. Install dependencies with `npm ci --legacy-peer-deps`
  4. Run linting (if script exists)
  5. Run tests with coverage (`npm run test:ci`)

#### 2. Security Job
- **Node Version**: 20.x
- **Steps**:
  1. Checkout repository
  2. Setup Node.js with npm caching
  3. Install dependencies with `npm ci --legacy-peer-deps`
  4. Run security audit (continues on error)

#### 3. Build Job
- **Dependencies**: Requires test job to pass
- **Node Version**: 20.x
- **Steps**:
  1. Checkout repository
  2. Setup Node.js with npm caching
  3. Install dependencies with `npm ci --legacy-peer-deps`
  4. Build for production
  5. Upload build artifacts (retained for 7 days)

### Key Features
- Multi-version Node.js testing (20.x and 22.x)
- Automated security scanning
- Build artifact storage
- Parallel job execution (test and security run concurrently)

---

## Azure Deployment Workflow (`azure-webapps-node.yml`)

### Purpose
Automatically builds and deploys the application to Azure Web Apps when changes are pushed to `main` branch.

### Trigger Events
- Push to `main` branch
- Manual trigger via `workflow_dispatch`

### Environment Variables
- `AZURE_WEBAPP_NAME`: `wallestars-control-center`
- `AZURE_WEBAPP_PACKAGE_PATH`: `.` (repository root)
- `NODE_VERSION`: `20.x`

### Jobs

#### 1. Build Job
- **Steps**:
  1. Checkout repository
  2. Setup Node.js 20.x with npm caching
  3. Install dependencies with `npm ci --legacy-peer-deps`
  4. Run tests
  5. Build application
  6. Upload complete repository as artifact

#### 2. Deploy Job
- **Dependencies**: Requires build job to complete
- **Environment**: Development
- **Steps**:
  1. Download build artifact
  2. Deploy to Azure Web App using publish profile

### Prerequisites
To use this workflow, you must:
1. Create an Azure Web App named `wallestars-control-center`
2. Download the Publish Profile from Azure Portal
3. Add the publish profile as a GitHub secret: `AZURE_WEBAPP_PUBLISH_PROFILE`

### Security
- Uses GitHub secrets for Azure credentials
- Minimal permissions (read-only for most jobs)
- Separate deployment environment for production control

---

## NPM Scripts

The workflows rely on the following npm scripts defined in `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:ci": "vitest run --coverage",
    "test:watch": "vitest",
    "lint": "echo \"Linting not configured yet\" && exit 0",
    "build": "vite build"
  }
}
```

### Script Descriptions

- **`test`**: Runs all tests using Vitest
- **`test:ci`**: Runs tests with coverage report (used in CI)
- **`test:watch`**: Runs tests in watch mode for development
- **`lint`**: Placeholder for future linting configuration
- **`build`**: Builds the production bundle using Vite

---

## Best Practices

### When Modifying Workflows

1. **Test Locally First**: Use tools like [act](https://github.com/nektos/act) to test workflows locally
2. **Validate YAML**: Ensure YAML syntax is correct before committing
3. **Use npm ci**: Always use `npm ci --legacy-peer-deps` for reproducible builds
4. **Version Pinning**: Keep action versions pinned (e.g., `@v4`) for stability

### Adding New Jobs

1. Consider job dependencies (use `needs:` appropriately)
2. Cache npm packages for faster builds
3. Use descriptive job and step names
4. Set appropriate timeouts for long-running jobs

### Security Considerations

1. Never commit secrets or API keys
2. Use GitHub secrets for sensitive values
3. Set minimal required permissions
4. Enable branch protection rules for `main` branch

---

## Troubleshooting

### Common Issues

#### Tests Fail in CI but Pass Locally
- Ensure dependencies are installed with `npm ci --legacy-peer-deps`
- Check for environment-specific issues
- Verify Node.js version matches CI (20.x or 22.x)

#### Build Artifacts Missing
- Check that `dist/` directory is created during build
- Verify upload path matches build output location
- Ensure build job completed successfully

#### Azure Deployment Fails
- Verify `AZURE_WEBAPP_PUBLISH_PROFILE` secret is set correctly
- Check Azure Web App name matches `AZURE_WEBAPP_NAME` variable
- Ensure Azure Web App is running and accessible

#### Security Audit Fails
- Review `npm audit` output in workflow logs
- Address high-severity vulnerabilities
- Update dependencies if needed

### Viewing Workflow Runs

1. Navigate to the **Actions** tab in GitHub repository
2. Select the workflow you want to inspect
3. Click on a specific run to see detailed logs
4. Download artifacts from successful runs if needed

---

## Future Improvements

Potential enhancements for the workflow configuration:

1. **Add ESLint**: Configure proper linting and update lint script
2. **Add E2E Tests**: Integrate Playwright or Cypress for end-to-end testing
3. **Performance Testing**: Add Lighthouse CI for performance monitoring
4. **Dependency Caching**: Optimize cache strategy for faster builds
5. **Multi-Environment Deployment**: Add staging and production environments
6. **Release Automation**: Add automatic versioning and changelog generation
7. **Notification System**: Add Slack/Discord notifications for build status

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Web Apps Deploy Action](https://github.com/Azure/webapps-deploy)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)

---

**Last Updated**: January 2026  
**Maintained by**: Wallestars Development Team
