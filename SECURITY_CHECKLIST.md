# Security Audit Checklist

## 🔐 Pre-Deployment Security Checklist

Use this checklist before deploying to production or when conducting security audits.

---

## 📋 Credential Management

- [ ] **No credentials in Git history**
  - Run: `git log --all -S "password" -S "api_key" -S "secret"`
  - Verify no actual credential values found
  
- [ ] **`.env` file not committed**
  - Check `.gitignore` includes `.env` and variants
  - Run: `git ls-files | grep "\.env$"` (should return nothing)
  
- [ ] **`.env.example` uses placeholders only**
  - No real API keys or passwords
  - Clear placeholder text like `your_api_key_here`
  
- [ ] **Environment variables validated on startup**
  - Run: `npm run validate-env`
  - All required vars properly configured
  
- [ ] **API keys rotated if exposed**
  - Document rotation in SECURITY.md
  - Update all dependent systems

---

## 🔍 Code Security

- [ ] **No hardcoded credentials in source code**
  - Search: `grep -r "sk-ant-" --include="*.js" --include="*.jsx"`
  - Search: `grep -r "password.*=.*['\"]" --include="*.js"`
  
- [ ] **Input validation on all endpoints**
  - API routes validate request parameters
  - User input sanitized before use
  
- [ ] **Command injection prevention**
  - No direct `exec()` with user input
  - Whitelist approach for system commands
  
- [ ] **Path traversal prevention**
  - Path normalization applied
  - No `../` in file paths
  
- [ ] **SQL injection prevention** (if applicable)
  - Parameterized queries only
  - No string concatenation in SQL

---

## 🌐 API Security

- [ ] **CORS properly configured**
  - Specific origins, not `*`
  - Review `server/index.js` CORS settings
  
- [ ] **Rate limiting implemented** (TODO)
  - Prevent API abuse
  - Consider `express-rate-limit`
  
- [ ] **Error messages don't expose internals**
  - Generic error responses
  - Detailed errors only in logs
  
- [ ] **HTTPS enforced in production**
  - SSL certificates valid
  - HTTP redirects to HTTPS
  
- [ ] **Security headers configured**
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Check Nginx configuration

---

## 📦 Dependency Security

- [ ] **No known vulnerabilities**
  - Run: `npm audit`
  - Fix: `npm audit fix`
  
- [ ] **Dependencies up to date**
  - Run: `npm outdated`
  - Update carefully with testing
  
- [ ] **No unnecessary dependencies**
  - Review `package.json`
  - Remove unused packages
  
- [ ] **License compliance checked**
  - No GPL violations
  - Document licenses used

---

## 🖥️ Server Security

- [ ] **Firewall configured**
  - Only necessary ports open (80, 443, 22)
  - UFW or iptables rules set
  
- [ ] **SSH key authentication only**
  - Password auth disabled
  - Strong SSH keys used
  
- [ ] **Regular system updates**
  - Unattended upgrades enabled
  - Weekly security patches
  
- [ ] **Fail2Ban configured**
  - Protection against brute force
  - Nginx rules active
  
- [ ] **Minimal services running**
  - Disable unnecessary services
  - Review: `systemctl list-units --type=service`
  
- [ ] **File permissions correct**
  - `.env` is 600
  - Web files owned by correct user
  - No world-writable files

---

## 🔐 SSL/TLS

- [ ] **Valid SSL certificate**
  - Let's Encrypt certificate active
  - Not expired
  
- [ ] **Auto-renewal configured**
  - Certbot timer enabled
  - Test: `sudo certbot renew --dry-run`
  
- [ ] **Strong SSL configuration**
  - TLS 1.2+ only
  - Strong cipher suites
  - Test: https://www.ssllabs.com/ssltest/
  
- [ ] **HSTS header enabled**
  - Strict-Transport-Security header
  - Consider HSTS preload

---

## 📊 Monitoring & Logging

- [ ] **Application logs configured**
  - PM2 logs to files
  - Log rotation enabled
  
- [ ] **Nginx logs reviewed**
  - Access logs monitored
  - Error logs checked daily
  
- [ ] **Health checks implemented**
  - `/api/health` endpoint working
  - Automated health monitoring
  
- [ ] **Security events logged**
  - Failed authentication attempts
  - Suspicious activity patterns
  
- [ ] **Log retention policy**
  - Logs kept for 30+ days
  - Old logs archived/deleted

---

## 🔄 Backup & Recovery

- [ ] **Regular backups scheduled**
  - Database backups (if applicable)
  - Configuration files backed up
  
- [ ] **Backup restoration tested**
  - Verify backups are valid
  - Practice restore procedure
  
- [ ] **Disaster recovery plan**
  - Document recovery steps
  - RTO/RPO defined

---

## 👥 Access Control

- [ ] **Principle of least privilege**
  - Users have minimum necessary access
  - Service accounts restricted
  
- [ ] **SSH access limited**
  - Only authorized users
  - Key-based authentication
  
- [ ] **API authentication** (if applicable)
  - Authentication required for sensitive endpoints
  - JWT or similar token system
  
- [ ] **Audit trail maintained**
  - Who accessed what, when
  - Login history reviewed

---

## 🧪 Testing

- [ ] **Security tests passed**
  - No SQL injection vulnerabilities
  - No XSS vulnerabilities
  - No CSRF vulnerabilities
  
- [ ] **Penetration testing completed** (if applicable)
  - Third-party security audit
  - Findings addressed
  
- [ ] **Vulnerability scanning**
  - Automated scans configured
  - Results reviewed regularly

---

## 📚 Documentation

- [ ] **SECURITY.md created**
  - Vulnerability reporting process
  - Security best practices
  - Credential rotation procedures
  
- [ ] **Deployment documentation**
  - VPS_DEPLOYMENT.md complete
  - Configuration documented
  - Update procedures documented
  
- [ ] **Security incidents documented**
  - Past incidents recorded
  - Lessons learned documented
  
- [ ] **Team trained on security**
  - Security awareness training
  - Incident response procedures

---

## 🚀 Deployment Specific

- [ ] **Production environment isolated**
  - Separate from development
  - Different credentials
  
- [ ] **Environment variables secured**
  - Not exposed in process list
  - Not logged
  
- [ ] **Secrets management**
  - Consider using vault (e.g., HashiCorp Vault)
  - Encrypted at rest
  
- [ ] **CI/CD security**
  - GitHub secrets used correctly
  - No credentials in workflow files
  - Branch protection enabled

---

## 🎯 Quick Verification Commands

Run these commands to quickly verify security status:

```bash
# 1. Check for exposed credentials in Git
cd /home/runner/work/Wallestars/Wallestars
git log --all --full-history -S "password" -S "api_key" --pretty=format:"%H %s"

# 2. Validate environment
npm run validate-env

# 3. Check dependencies
npm audit

# 4. Search for hardcoded secrets (returns nothing if clean)
grep -r "sk-ant-api" --include="*.js" --include="*.jsx" .
grep -r "password.*=.*['\"][a-zA-Z0-9]" --include="*.js" .

# 5. Verify .gitignore
cat .gitignore | grep -E "\.env|secret|password|token"

# 6. Check file permissions (production)
ls -la .env  # Should be 600 or 400

# 7. Test SSL (production)
curl -I https://srv1201204.hstgr.cloud

# 8. Check firewall (production)
sudo ufw status

# 9. Review PM2 processes (production)
pm2 list

# 10. Check Nginx logs for errors (production)
sudo tail -100 /var/log/nginx/error.log
```

---

## ✅ Sign-off

**Security Audit Completed By**: _________________  
**Date**: _________________  
**Next Review Date**: _________________

**Critical Issues Found**: _________________  
**Issues Resolved**: _________________  
**Outstanding Issues**: _________________

---

## 📞 Emergency Contacts

**Security Incident Response**:
- Primary: [Contact needed]
- Secondary: [Contact needed]

**Infrastructure Team**:
- DevOps: [Contact needed]
- System Admin: [Contact needed]

---

**Version**: 1.0  
**Last Updated**: January 11, 2026  
**Next Review**: April 11, 2026
