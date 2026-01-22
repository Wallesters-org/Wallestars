# Workflow Validation Checklist

Use this checklist to validate that the GitHub Actions workflows are properly configured.

## Pre-Commit Validation

### Package.json Scripts
- [x] `test` script exists and works
- [x] `test:ci` script exists and works with coverage
- [x] `test:watch` script exists for development
- [x] `lint` script exists (placeholder is acceptable)
- [x] `build` script exists and produces output

### Workflow Files Syntax
- [x] `ci.yml` has valid YAML syntax
- [x] `azure-webapps-node.yml` has valid YAML syntax
- [x] `azure-webapps-node.yml` has a proper name field

### Script References
- [x] CI workflow references existing scripts only
- [x] Azure workflow references existing scripts only
- [x] No references to non-existent npm scripts

### Consistency
- [x] Both workflows use `npm ci --legacy-peer-deps`
- [x] Node.js versions are consistent (20.x primary)
- [x] Action versions are pinned (@v4)
- [x] Step names are descriptive

## Testing Commands

Run these commands to verify everything works locally:

```bash
# Install dependencies
npm ci --legacy-peer-deps

# Run tests
npm test

# Run tests with coverage (CI mode)
npm run test:ci

# Run linting
npm run lint

# Build the application
npm run build

# Validate YAML syntax (requires Python 3 with PyYAML)
# Install PyYAML if needed: pip install PyYAML
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/azure-webapps-node.yml'))"

# Alternative: Use online YAML validators
# - https://www.yamllint.com/
# - https://jsonformatter.org/yaml-validator
```

## Expected Results

### Test Output
```
✓ src/tests/App.test.jsx (4 tests) 5ms
Test Files  1 passed (1)
Tests  4 passed (4)
```

### Build Output
```
dist/index.html
dist/assets/index-[hash].css
dist/assets/index-[hash].js
✓ built in ~3s
```

## CI Workflow Structure

```
jobs:
  test (Node 20.x, 22.x)
    ├── checkout
    ├── setup-node
    ├── install (npm ci)
    ├── lint
    └── test
  
  security
    ├── checkout
    ├── setup-node
    ├── install (npm ci)
    └── audit
  
  build (needs: test)
    ├── checkout
    ├── setup-node
    ├── install (npm ci)
    ├── build
    └── upload-artifact
```

## Azure Workflow Structure

```
jobs:
  build
    ├── checkout
    ├── setup-node
    ├── install (npm ci)
    ├── test
    ├── build
    └── upload-artifact
  
  deploy (needs: build)
    ├── download-artifact
    └── deploy-to-azure
```

## Common Issues Checklist

- [ ] Missing npm scripts → Add to package.json
- [ ] YAML syntax errors → Validate with Python or online validator
- [ ] Node version mismatch → Ensure 20.x+ is installed
- [ ] Missing dependencies → Run npm ci --legacy-peer-deps
- [ ] Build artifacts not created → Check build script and dist/ folder
- [ ] Test failures → Check test setup and environment
- [ ] Azure deployment issues → Verify secrets and app name

## Deployment Prerequisites

For Azure deployment to work, ensure:

- [ ] Azure Web App created with name: `wallestars-control-center`
- [ ] Publish Profile downloaded from Azure Portal
- [ ] GitHub secret `AZURE_WEBAPP_PUBLISH_PROFILE` is set
- [ ] Workflow has appropriate permissions

## Security Checks

- [x] No secrets in workflow files
- [x] Using GitHub secrets for sensitive data
- [x] Minimal permissions set for jobs
- [x] Dependencies installed via npm ci (reproducible)
- [x] Security audit runs in CI

## Documentation

- [x] WORKFLOW_DOCUMENTATION.md created
- [x] README.md references workflow setup (if applicable)
- [x] Comments in workflow files are clear
- [x] Environment variables documented

---

**Status**: All checks passed ✓  
**Last Validated**: January 12, 2026
