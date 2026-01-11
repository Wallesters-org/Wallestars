# DNS Configuration Guide

This document provides DNS configuration details for Wallestars Control Center deployment.

## 📋 Table of Contents

1. [GitHub Pages Custom Domain](#github-pages-custom-domain)
2. [Production VPS Configuration](#production-vps-configuration)
3. [Verification and Testing](#verification-and-testing)

---

## 🌐 GitHub Pages Custom Domain

### Custom Domain: workmail.pro

To enable GitHub Pages with a custom domain, the following DNS records must be configured:

### ⚠️ Important Note

**DO NOT** try to access the verification subdomain directly:
- ❌ `github-pages-challenge-didi-ivanov-1.workmail.pro` - This is NOT the website URL
- ❌ `_github-pages-challenge-DIDI-IVANOV-1.workmail.pro` - This is only for DNS verification

**Correct URLs to access the site:**
- ✅ `https://workmail.pro` - Main custom domain
- ✅ `https://www.workmail.pro` - WWW subdomain
- ✅ `https://wallesters-org.github.io/Wallestars` - Default GitHub Pages URL

### Required DNS Records

#### 1. TXT Record for GitHub Pages Verification

**Hostname**: `_github-pages-challenge-DIDI-IVANOV-1.workmail.pro`  
**Type**: `TXT`  
**Value**: `cf468fde2c501c7ce2d898f4a2fac7`  
**TTL**: `3600` (or default)

#### Configuration Steps:

1. **Access your DNS provider** (where workmail.pro is registered)
2. **Navigate to DNS management** or DNS records section
3. **Add a new TXT record** with the following details:
   - **Name/Host**: `_github-pages-challenge-DIDI-IVANOV-1`
   - **Type**: `TXT`
   - **Value**: `cf468fde2c501c7ce2d898f4a2fac7`
   - **TTL**: `3600` (1 hour) or use default
4. **Save the record** and allow time for propagation

#### DNS Propagation Time

⏰ **Important**: DNS changes can take up to **24 hours** to propagate globally, though they typically complete within 1-2 hours.

#### Verification

After adding the TXT record, you can verify it using:

```bash
# Check TXT record propagation
dig TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro

# Or using nslookup
nslookup -type=TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro

# Or using host command
host -t TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro
```

Expected output should include:
```
_github-pages-challenge-DIDI-IVANOV-1.workmail.pro. 3600 IN TXT "cf468fde2c501c7ce2d898f4a2fac7"
```

### Additional GitHub Pages DNS Records

If you're using an apex domain (e.g., `workmail.pro`), you may also need:

#### A Records (for apex domain)
```
Type: A
Name: @
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @
Value: 185.199.111.153
TTL: 3600
```

#### CNAME Record (for www subdomain)
```
Type: CNAME
Name: www
Value: wallesters-org.github.io (or your-github-username.github.io)
TTL: 3600
```

**Note**: Replace `wallesters-org.github.io` with your actual GitHub username or organization name followed by `.github.io`

---

## 🖥️ Production VPS Configuration

### VPS Details

**IP Address**: `72.61.154.188`  
**Hostname**: `srv1201204.hstgr.cloud`

### DNS Records for VPS Deployment

#### Main Application Domain
```
Type: A
Name: srv1201204.hstgr.cloud
Value: 72.61.154.188
TTL: 3600
```

#### N8N Subdomain
```
Type: A
Name: n8n.srv1201204.hstgr.cloud
Value: 72.61.154.188
TTL: 3600
```

---

## ✅ Verification and Testing

### Test DNS Resolution

#### For GitHub Pages TXT Record
```bash
# Quick test
dig TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro +short

# Detailed test
dig TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro @8.8.8.8
```

#### For VPS A Records
```bash
# Test main domain
dig A srv1201204.hstgr.cloud +short

# Test N8N subdomain
dig A n8n.srv1201204.hstgr.cloud +short
```

#### Using Online Tools

You can also use online DNS checker tools:
- https://dnschecker.org/
- https://www.whatsmydns.net/
- https://mxtoolbox.com/SuperTool.aspx

### Troubleshooting

#### TXT Record Not Found

If the TXT record is not found:

1. **Wait for propagation**: DNS changes can take up to 24 hours
2. **Check DNS provider**: Ensure the record was saved correctly
3. **Verify formatting**: Some DNS providers require quotes around TXT values, others don't
4. **Check TTL**: Lower TTL values propagate faster
5. **Clear DNS cache**: 
   ```bash
   # On Linux
   sudo systemd-resolve --flush-caches
   
   # On macOS
   sudo dscacheutil -flushcache
   
   # On Windows
   ipconfig /flushdns
   ```

#### A Record Issues

If A records are not resolving:

1. **Verify IP address**: Ensure the correct IP is configured
2. **Check propagation**: Use multiple DNS checkers
3. **Test from different locations**: DNS may propagate at different rates globally

---

## 📚 Additional Resources

- [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages DNS Configuration Guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Understanding DNS Records](https://www.cloudflare.com/learning/dns/dns-records/)

---

## 🔄 DNS Record Summary Table

| Record Type | Name/Host | Value | TTL | Purpose |
|------------|-----------|-------|-----|---------|
| TXT | `_github-pages-challenge-DIDI-IVANOV-1` | `cf468fde2c501c7ce2d898f4a2fac7` | 3600 | GitHub Pages verification |
| A | `srv1201204.hstgr.cloud` | `72.61.154.188` | 3600 | Main VPS application |
| A | `n8n.srv1201204.hstgr.cloud` | `72.61.154.188` | 3600 | N8N workflow automation |

---

**Last Updated**: January 11, 2026  
**Maintained by**: Wallestars Development Team

---

## ⚠️ Important Notes

- **Security**: Never commit DNS provider credentials to the repository
- **Verification**: Always verify DNS changes before proceeding with deployment
- **Backup**: Keep a backup of your DNS configuration
- **Documentation**: Update this file when DNS records change
- **Propagation**: Allow sufficient time for DNS propagation before troubleshooting

For deployment procedures, see:
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - VPS deployment steps
- [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) - Netlify deployment guide
- [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) - Detailed VPS setup instructions
