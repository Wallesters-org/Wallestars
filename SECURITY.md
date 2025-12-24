# SECURITY NOTICE

## ⚠️ IMPORTANT: API Key Security

This repository is set up to help you connect Claude Code to your Hostinger VPS. However, **YOU MUST NEVER COMMIT YOUR ACTUAL API KEY** to this or any repository.

## What We've Done to Protect You

1. **`.gitignore` Configuration**: We've configured `.gitignore` to automatically exclude files that might contain your API key:
   - `.claude-code.json` (your actual configuration file)
   - `.env` and related environment files
   - Any files matching `**/api-keys.json` or `**/secrets.json`

2. **Template File**: The `.claude-code.template.json` file contains only a placeholder (`YOUR_HOSTINGER_API_KEY_HERE`) and is safe to commit.

3. **Documentation**: The `HOSTINGER_SETUP.md` file provides detailed instructions on how to safely configure your connection.

## If You Accidentally Committed an API Key

If you've accidentally committed an API key to this repository:

1. **Immediately revoke the API key** through your Hostinger account
2. Generate a new API key
3. Remove the commit containing the key from your git history:
   ```bash
   # If it's the most recent commit
   git reset --hard HEAD~1
   git push --force
   
   # For older commits, use git rebase or git filter-branch
   # Consider using tools like BFG Repo-Cleaner for complex cases
   ```
4. Update your local configuration with the new API key

## Best Practices

- ✅ Use environment variables instead of hardcoding keys
- ✅ Keep your `.claude-code.json` file local only (it's in `.gitignore`)
- ✅ Rotate your API keys regularly
- ✅ Use different API keys for different environments
- ✅ Review what you're committing before pushing
- ❌ Never share API keys in chat, screenshots, or public forums
- ❌ Never commit files containing real credentials

## Questions?

Refer to the [HOSTINGER_SETUP.md](HOSTINGER_SETUP.md) for complete setup instructions and security guidelines.
