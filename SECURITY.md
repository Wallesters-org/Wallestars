# Security Policy

## 🔒 Security Overview

Wallestars Control Center takes security seriously. This document outlines our security policies, vulnerability reporting process, and best practices for developers.

---

## 📋 Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

### How to Report

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: **[security contact needed]**
3. Provide detailed information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies by severity (critical issues prioritized)

### What to Expect

- Acknowledgment of your report
- Regular updates on our progress
- Credit in release notes (if desired)
- Notification when the issue is resolved

---

## 🔐 Security Best Practices

### For Developers

#### 1. **API Keys & Credentials**

✅ **DO:**
- Store all secrets in `.env` files (never commit these)
- Use `.env.example` as a template (without real values)
- Use environment variables in code: `process.env.ANTHROPIC_API_KEY`
- Rotate credentials regularly
- Use different API keys for development and production

❌ **DON'T:**
- Commit `.env` files to Git
- Hardcode API keys in source code
- Share API keys in pull requests or issues
- Log sensitive information
- Expose keys in client-side code

#### 2. **Environment Variables**

**Required Environment Variables:**
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here  # Anthropic Claude API key
PORT=3000                                # Server port
NODE_ENV=production                      # Environment
```

**Validation on Startup:**
The server validates required environment variables and exits if any are missing.

#### 3. **Git History**

**Before Committing:**
```bash
# Check for accidentally staged secrets
git diff --cached

# Review your changes
git status

# Use .gitignore properly
cat .gitignore
```

**If You Accidentally Commit Secrets:**
1. **Immediately rotate** the exposed credentials
2. Contact repository administrators
3. Consider using `git-filter-repo` to remove from history (requires coordination)
4. Never rely on just deleting the file - Git history retains it

#### 4. **Input Validation**

**Command Execution:**
```javascript
// ❌ DANGEROUS - Command injection risk
exec(`xdotool ${userInput}`);

// ✅ SAFE - Whitelist approach
const ALLOWED_COMMANDS = ['mousemove', 'click', 'type'];
if (!ALLOWED_COMMANDS.includes(command)) {
  throw new Error('Invalid command');
}
```

**Path Validation:**
```javascript
// ✅ Prevent path traversal
import path from 'path';

function validatePath(userPath) {
  const normalized = path.normalize(userPath);
  if (normalized.includes('..')) {
    throw new Error('Invalid path');
  }
  return normalized;
}
```

#### 5. **Dependency Security**

**Regular Maintenance:**
```bash
# Check for vulnerabilities
npm audit

# Fix auto-fixable issues
npm audit fix

# Update dependencies carefully
npm update

# Check for outdated packages
npm outdated
```

**Before Adding Dependencies:**
- Review package reputation and maintenance status
- Check for known vulnerabilities
- Verify license compatibility
- Keep dependencies minimal

---

## 🛡️ Security Features

### Current Implementation

1. **Environment Variable Protection**
   - `.env` files excluded via `.gitignore`
   - Startup validation ensures required vars are present
   - No secrets hardcoded in source

2. **API Security**
   - CORS configured for specific origins
   - Input validation on all endpoints
   - Error messages don't expose sensitive info

3. **System Access Control**
   - Whitelisted commands for Computer Use
   - Safe path handling for file operations
   - Limited ADB command execution

### Known Limitations

1. **System Commands**: Computer Use features require elevated permissions
2. **ADB Access**: Android control needs device authorization
3. **API Rate Limiting**: Not currently implemented (TODO)
4. **Authentication**: No user authentication (single-user system)

---

## 🔄 Credential Rotation Procedures

### When to Rotate

- **Immediately** if credentials are exposed
- **Regularly** every 90 days as best practice
- **After** team member departure
- **When** access logs show suspicious activity

### How to Rotate

#### 1. Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Generate new API key
3. Update `.env` file:
   ```env
   ANTHROPIC_API_KEY=sk-ant-new-key-here
   ```
4. Restart server: `npm restart`
5. Delete old key from Anthropic Console

#### 2. VPS Credentials

1. SSH into VPS: `ssh user@72.61.154.188`
2. Change password: `passwd`
3. Update SSH keys if needed
4. Update any automation scripts
5. Document changes in secure location

#### 3. Database Credentials (if applicable)

1. Generate new password (use strong password generator)
2. Update in database admin panel
3. Update `.env` file
4. Restart affected services
5. Test connectivity

---

## 📚 Additional Resources

### Documentation
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [MCP_SETUP.md](MCP_SETUP.md) - MCP integration security
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design

### External Resources
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [GitHub Security Advisories](https://github.com/advisories)

---

## 🔍 Security Audit History

### Latest Audit: January 11, 2026

**Scope**: Git history scan, credential exposure check

**Findings**:
- ✅ No hardcoded credentials in current codebase
- ✅ `.gitignore` properly configured for `.env` files
- ✅ `.env.example` contains only template values
- ✅ No API keys found in Git history
- ✅ No VPS credentials exposed in repository

**Actions Taken**:
- Created comprehensive SECURITY.md
- Documented credential rotation procedures
- Updated security best practices
- Added validation procedures

**Recommendations**:
1. Implement API rate limiting
2. Add request authentication for production
3. Set up security monitoring/alerting
4. Regular dependency audits (monthly)
5. Consider secret scanning in CI/CD

---

## 📞 Contact

For security concerns or questions:
- **Security Email**: [To be configured]
- **Repository**: https://github.com/Wallesters-org/Wallestars
- **Issues**: Use GitHub Issues for non-security bugs

---

**Last Updated**: January 11, 2026  
**Next Review**: April 11, 2026

