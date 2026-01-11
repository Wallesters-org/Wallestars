# GitHub Pages DNS Setup - Quick Guide

# GitHub Pages DNS Setup - Quick Guide

## ⚠️ Important: About the Verification Subdomain

**DO NOT try to access the verification subdomain directly!**

❌ **This is NOT the website URL:**
- `github-pages-challenge-didi-ivanov-1.workmail.pro`
- `_github-pages-challenge-DIDI-IVANOV-1.workmail.pro`

These are **only DNS verification records** for GitHub Pages setup. They are not accessible websites.

✅ **After setup, your site will be accessible at:**
- `https://workmail.pro` (main domain)
- `https://www.workmail.pro` (www subdomain)
- `https://wallesters-org.github.io/Wallestars` (GitHub Pages default URL)

📖 **For complete instructions**, see [SITE_ACCESS_INSTRUCTIONS.md](SITE_ACCESS_INSTRUCTIONS.md) (Available in Bulgarian and English)

---

## 🎯 Quick Action Required

To complete GitHub Pages setup for the custom domain **workmail.pro**, you need to add a DNS TXT record for verification.

---

## 📝 DNS Record Details

| Field | Value |
|-------|-------|
| **Record Type** | `TXT` |
| **Hostname/Name** | `_github-pages-challenge-DIDI-IVANOV-1.workmail.pro` |
| **Value/Content** | `cf468fde2c501c7ce2d898f4a2fac7` |
| **TTL** | `3600` (or use default) |

---

## 🚀 Setup Steps

### 1. Access Your DNS Provider
Log in to your DNS provider's control panel where **workmail.pro** is registered.

### 2. Navigate to DNS Management
Look for sections labeled:
- DNS Management
- DNS Records
- DNS Zone Editor
- Domain Settings

### 3. Add New TXT Record
Create a new DNS record with these settings:

**Name/Host field options** (try one of these formats):
- `_github-pages-challenge-DIDI-IVANOV-1.workmail.pro`
- `_github-pages-challenge-DIDI-IVANOV-1`
- `_github-pages-challenge-DIDI-IVANOV-1.` (with trailing dot)

**Type**: Select `TXT` from the record type dropdown

**Value/Content**: 
```
cf468fde2c501c7ce2d898f4a2fac7
```

**TTL**: `3600` (1 hour) or use the default/auto setting

### 4. Save the Record
Click Save/Add/Submit to save the new DNS record.

---

## ⏰ Wait for Propagation

DNS changes require time to propagate across the internet:
- **Typical time**: 1-2 hours
- **Maximum time**: Up to 24 hours
- **Minimum TTL**: 1 hour (3600 seconds)

---

## ✅ Verify the Record

After adding the record, verify it has propagated:

### Using Command Line

**Option 1 - dig command:**
```bash
dig TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro +short
```

**Option 2 - nslookup:**
```bash
nslookup -type=TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro
```

**Option 3 - host command:**
```bash
host -t TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro
```

### Expected Output
```
"cf468fde2c501c7ce2d898f4a2fac7"
```

### Using Online Tools

Check propagation status globally:
- https://dnschecker.org/ (select TXT record type)
- https://www.whatsmydns.net/ (select TXT record type)
- https://mxtoolbox.com/SuperTool.aspx

---

## 🔧 Common DNS Provider Formats

### Cloudflare
- **Type**: TXT
- **Name**: `_github-pages-challenge-DIDI-IVANOV-1`
- **Content**: `cf468fde2c501c7ce2d898f4a2fac7`
- **TTL**: Auto

### GoDaddy
- **Type**: TXT
- **Host**: `_github-pages-challenge-DIDI-IVANOV-1`
- **TXT Value**: `cf468fde2c501c7ce2d898f4a2fac7`
- **TTL**: 1 Hour

### Namecheap
- **Type**: TXT Record
- **Host**: `_github-pages-challenge-DIDI-IVANOV-1`
- **Value**: `cf468fde2c501c7ce2d898f4a2fac7`
- **TTL**: Automatic

### AWS Route 53
- **Type**: TXT
- **Name**: `_github-pages-challenge-DIDI-IVANOV-1.workmail.pro`
- **Value**: `"cf468fde2c501c7ce2d898f4a2fac7"` (with quotes)
- **TTL**: 3600

### Google Domains
- **Type**: TXT
- **Host name**: `_github-pages-challenge-DIDI-IVANOV-1`
- **Data**: `cf468fde2c501c7ce2d898f4a2fac7`
- **TTL**: 1h

---

## ❓ Troubleshooting

### Record Not Found After 24 Hours

1. **Check the hostname format**: Some providers need just `_github-pages-challenge-DIDI-IVANOV-1`, others need the full domain
2. **Remove quotes**: Some DNS providers automatically add quotes, don't add them manually
3. **Check for typos**: Verify the exact value: `cf468fde2c501c7ce2d898f4a2fac7`
4. **Contact DNS provider support**: They can verify the record is configured correctly

### Multiple TXT Records

If you have multiple TXT records for the same hostname:
- Most DNS providers support multiple TXT records
- Each should be on a separate line
- GitHub will read all TXT records for the verification

### TTL Too High

If you set a very high TTL (like 86400 = 24 hours):
- Changes will take longer to propagate
- Lower it to 3600 (1 hour) or less for faster updates

---

## 📚 Additional Resources

- **Complete DNS Guide**: [DNS_CONFIGURATION.md](DNS_CONFIGURATION.md)
- **GitHub Pages Docs**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **DNS Verification**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages

---

## 📞 Need Help?

If you encounter issues:
1. Check the full [DNS_CONFIGURATION.md](DNS_CONFIGURATION.md) guide
2. Verify with online DNS checker tools
3. Contact your DNS provider's support team
4. Check GitHub Pages settings in your repository

---

**Status**: ⏳ Waiting for DNS configuration  
**Next Step**: Add the TXT record at your DNS provider  
**Time Required**: 5 minutes to add, 1-24 hours to propagate
