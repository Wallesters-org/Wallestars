# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Wallestars Control Center seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisory** (Preferred):
   - Go to the [Security tab](https://github.com/Wallesters-org/Wallestars/security)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**:
   - Send an email to the repository maintainers
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Fix Timeline**: Varies based on severity and complexity

We will:
1. Confirm receipt of your vulnerability report
2. Investigate and validate the issue
3. Develop a fix
4. Release a security advisory and patch
5. Credit you for the discovery (if desired)

## Security Best Practices for Developers

### API Keys and Secrets

❌ **NEVER** commit API keys, passwords, or other secrets to the repository.

✅ **DO:**
- Use `.env` files for local development (already in `.gitignore`)
- Store secrets in environment variables
- Use GitHub Secrets for Actions workflows
- Use deployment platform environment variables (Netlify, Azure)

### Environment Variables

Required environment variables for Wallestars:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude AI API key |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

### CORS Configuration

⚠️ **Production Warning**: The current CORS configuration uses wildcard (`*`).

**For Production:**
```javascript
// Update in server/index.js or netlify.toml
Access-Control-Allow-Origin: "https://yourdomain.com"
```

Never use wildcard CORS in production with authentication or sensitive data.

### Dependency Security

Run security audits regularly:

```bash
# Check for known vulnerabilities
npm audit

# Fix auto-fixable vulnerabilities
npm audit fix

# View detailed report
npm audit --json
```

### System Command Execution

The application executes system commands (xdotool, ADB). Security measures:

1. **Input Validation**: All user inputs are validated before execution
2. **Command Whitelist**: Only predefined safe commands are allowed
3. **Sanitization**: Special characters are escaped
4. **Minimal Permissions**: Run with least privilege necessary

### Code Review Checklist

Before submitting PRs, verify:

- [ ] No API keys or secrets in code or commit history
- [ ] User inputs are validated and sanitized
- [ ] System commands use parameterized execution
- [ ] CORS settings are appropriate for environment
- [ ] Dependencies have no critical vulnerabilities (`npm audit`)
- [ ] Error messages don't expose sensitive information

## Known Security Considerations

### 1. Computer Control API

The Computer Use API (`/api/computer-use/*`) allows system-level control:
- **Risk**: Potentially dangerous if exposed to untrusted users
- **Mitigation**: Should only be accessible on trusted networks
- **Recommendation**: Add authentication for production deployments

### 2. Android ADB Control

ADB commands can modify device state:
- **Risk**: Unintended device modifications
- **Mitigation**: Command validation and user confirmation
- **Recommendation**: Restrict to authorized users

### 3. Claude AI Integration

API keys grant access to paid AI services:
- **Risk**: API key theft leads to unauthorized usage and charges
- **Mitigation**: Keys stored in environment variables only
- **Recommendation**: Monitor API usage in Anthropic dashboard

## Security Updates

We will announce security updates through:
- GitHub Security Advisories
- Release notes for patched versions
- README.md notifications (for critical issues)

## Disclosure Policy

- We follow responsible disclosure principles
- Security researchers will be credited (unless anonymity requested)
- We aim for coordinated disclosure after a fix is available
- Public disclosure occurs after patches are released

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**Last Updated**: January 2026  
**Contact**: GitHub Security Advisory or repository maintainers
