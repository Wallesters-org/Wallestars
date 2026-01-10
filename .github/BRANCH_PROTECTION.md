# Branch Protection Rules

This document describes the branch protection rules configured for the Wallestars repository to ensure code quality, security, and stability.

## Main Branch Protection

The `main` branch is the primary production branch and has the following protection rules enforced:

### Required Status Checks

Before any pull request can be merged into `main`, the following status checks must pass:

1. **CI Workflow** (`lint-and-build`)
   - Code build verification
   - Test suite execution
   - Security vulnerability scan

### Protection Rules

#### 1. Require Pull Request Reviews
- **Minimum required approvals**: 1
- **Dismiss stale reviews**: Enabled (when new commits are pushed)
- **Require review from code owners**: Recommended (if CODEOWNERS file exists)

#### 2. Require Status Checks to Pass
- **Require branches to be up to date before merging**: Enabled
- **Required status checks**:
  - `lint-and-build` (CI workflow)

#### 3. Require Conversation Resolution
- All review comments must be resolved before merging

#### 4. Require Signed Commits
- Recommended: Enable to verify commit authenticity

#### 5. Require Linear History
- **Recommended**: Enable to maintain clean git history
- Prevents merge commits, requires rebase or squash merging

#### 6. Force Push Protection
- **Block force pushes**: Enabled
- Prevents rewriting history on the main branch
- Protects against accidental or malicious history changes

#### 7. Deletion Protection
- **Block branch deletion**: Enabled
- Prevents accidental deletion of the main branch

#### 8. Restrict Push Access
- Only allow administrators and specific roles to push directly
- All other contributors must use pull requests

## How to Configure Branch Protection

### Using GitHub Web Interface

1. Navigate to repository **Settings**
2. Click on **Branches** in the left sidebar
3. Under "Branch protection rules", click **Add rule**
4. Set branch name pattern: `main`
5. Configure the following settings:

   ✅ **Require a pull request before merging**
   - Require approvals: 1
   - Dismiss stale pull request approvals when new commits are pushed
   
   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Status checks required: `lint-and-build`
   
   ✅ **Require conversation resolution before merging**
   
   ✅ **Require signed commits** (Recommended)
   
   ✅ **Require linear history** (Recommended)
   
   ✅ **Do not allow bypassing the above settings**
   
   ✅ **Restrict who can push to matching branches**
   - Restrict pushes to administrators only
   
   ✅ **Block force pushes**
   
   ✅ **Prevent deletion**

6. Click **Create** or **Save changes**

### Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Create branch protection rule
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["lint-and-build"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  -f restrictions=null \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f required_conversation_resolution=true
```

### Using GitHub API

```bash
curl -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["lint-and-build"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false,
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "required_linear_history": true,
    "allow_force_pushes": false,
    "allow_deletions": false,
    "required_conversation_resolution": true
  }'
```

## Workflow for Contributors

### Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/my-feature
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to your branch**:
   ```bash
   git push origin feature/my-feature
   ```

4. **Create a Pull Request** on GitHub:
   - Target branch: `main`
   - Provide clear description of changes
   - Link any related issues

5. **Wait for CI checks** to pass:
   - Build must succeed
   - Tests must pass
   - Security scan must complete

6. **Request review** from team members

7. **Address review comments** and push updates

8. **Merge** once approved and all checks pass

### Keeping Branch Up to Date

```bash
# Update your feature branch with latest main
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Or use merge if rebase is not preferred
git merge origin/main

# Push updates (may need --force-with-lease after rebase)
git push origin feature/my-feature --force-with-lease
```

## Emergency Procedures

### Hotfix Process

For critical production issues that need immediate attention:

1. Create hotfix branch from `main`
2. Make minimal, focused changes
3. Create PR with `[HOTFIX]` prefix
4. Get expedited review from admin
5. Ensure CI passes
6. Admin merges with elevated privileges if needed

### Bypassing Protections

Only repository administrators can bypass branch protection rules:

- Should only be done in true emergencies
- Must be documented with justification
- Should be reviewed and reverted if needed
- Consider creating post-incident report

## Monitoring and Auditing

### Regular Reviews

- **Monthly**: Review branch protection settings
- **Quarterly**: Audit bypass events
- **After incidents**: Review and update rules as needed

### GitHub Audit Log

Repository administrators should regularly check:
- Settings → Security → Audit log
- Filter by "protected_branch" events
- Monitor for unauthorized changes

## Related Documentation

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Security considerations
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines (if exists)
- [CI Workflow](.github/workflows/ci.yml) - Automated checks

## Questions?

If you have questions about branch protection rules or need assistance:

1. Check this documentation first
2. Review related GitHub documentation
3. Contact repository administrators
4. Open a discussion in GitHub Discussions

---

**Last Updated**: January 2026  
**Maintained by**: Wallestars Repository Administrators
