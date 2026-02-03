# 🌐 Инструкции за Достъп до Сайта / Site Access Instructions

[Bulgarian](#-български) | [English](#-english)

---

## 🇧🇬 Български

### Проблем: Грешен URL Адрес

Проблемът възниква, защото сте получили **грешен URL адрес** за достъп до сайта.

#### ❌ Грешен Адрес (DNS Verification Subdomain)
```
github-pages-challenge-didi-ivanov-1.workmail.pro
```
**Това НЕ Е сайтът!** Това е само техническа DNS записа за верификация на GitHub Pages.

---

### ✅ Правилни URL Адреси за Достъп

След настройване на deployment, сайтът ще бъде достъпен на следните адреси:

#### Вариант 1: Custom Domain (Препоръчително)
```
https://workmail.pro
```
или
```
https://www.workmail.pro
```

#### Вариант 2: GitHub Pages Default URL
```
https://wallesters-org.github.io/Wallestars
```

#### Вариант 3: VPS Deployment
```
https://srv1201204.hstgr.cloud
```

---

### 📋 Какво Трябва да Направите

#### Стъпка 1: Конфигурация на DNS Записи

За да работи **workmail.pro** с GitHub Pages, трябва да добавите следните DNS записи във вашия DNS provider:

##### A Records (за основния домейн)
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

##### CNAME Record (за www subdomain)
```
Type: CNAME
Name: www
Value: wallesters-org.github.io
TTL: 3600
```

##### TXT Record (за верификация - вече съществува)
```
Type: TXT
Name: _github-pages-challenge-DIDI-IVANOV-1
Value: cf468fde2c501c7ce2d898f4a2fac7
TTL: 3600
```

#### Стъпка 2: Изчакайте DNS Propagation

⏰ **Важно**: DNS промените отнемат време за разпространение:
- Минимум: 1-2 часа
- Максимум: до 24 часа

#### Стъпка 3: Проверете Deployment Status

След като DNS записите са настроени, GitHub Actions автоматично ще deploy-не сайта.

Проверете статуса на deployment:
1. Отидете на: https://github.com/Wallesters-org/Wallestars/actions
2. Потърсете workflow "Deploy to GitHub Pages"
3. Проверете дали е успешен (зелена отметка ✓)

#### Стъпка 4: Конфигурирайте GitHub Pages Settings

1. Отидете на repository settings: https://github.com/Wallesters-org/Wallestars/settings/pages
2. Проверете че:
   - Source: GitHub Actions
   - Custom domain: workmail.pro
   - Enforce HTTPS: включен (✓)

---

### 🔍 Проверка на DNS Записи

Можете да проверите дали DNS записите са настроени правилно:

#### Използвайки Command Line:
```bash
# Проверка на A records
dig A workmail.pro +short

# Проверка на CNAME record
dig CNAME www.workmail.pro +short

# Проверка на TXT record
dig TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro +short
```

#### Използвайки Online Tools:
- https://dnschecker.org/ (изберете типа на записа)
- https://www.whatsmydns.net/
- https://mxtoolbox.com/SuperTool.aspx

---

### ⚠️ Важни Забележки

1. **DNS Propagation отнема време**: Не се притеснявайте ако сайтът не е достъпен веднага след добавяне на DNS записите. Изчакайте поне 2-4 часа.

2. **HTTPS Certificate**: GitHub Pages автоматично ще генерира SSL сертификат след като DNS верификацията е успешна.

3. **Backend Functions**: Имайте предвид че GitHub Pages хоства само статичния frontend. За пълна функционалност (Claude AI, Computer Use и т.н.), трябва да използвате VPS deployment.

---

### 🎯 Алтернатива: VPS Deployment

Ако искате пълна функционалност с backend, препоръчваме VPS deployment:

**URL**: https://srv1201204.hstgr.cloud

**Предимства**:
- ✅ Пълна функционалност (Claude AI, Computer Use, Android Control)
- ✅ Backend API и WebSocket поддръжка
- ✅ Real-time комуникация
- ✅ По-добър контрол над сървъра

**Инструкции**: Вижте [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) и [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)

---

### 📞 Нуждаете се от Помощ?

Ако имате проблеми:
1. ✅ Проверете дали сте добавили правилните DNS записи
2. ✅ Изчакайте поне 2-4 часа за DNS propagation
3. ✅ Проверете GitHub Actions workflow статус
4. ✅ Проверете GitHub Pages settings в repository
5. ✅ Използвайте online DNS checker tools за проверка

За технически въпроси, отворете issue: https://github.com/Wallesters-org/Wallestars/issues

---

## 🇬🇧 English

### Problem: Wrong URL Address

The issue occurs because you received the **wrong URL address** to access the site.

#### ❌ Wrong Address (DNS Verification Subdomain)
```
github-pages-challenge-didi-ivanov-1.workmail.pro
```
**This is NOT the website!** This is only a technical DNS record for GitHub Pages verification.

---

### ✅ Correct URLs for Access

After deployment setup, the site will be accessible at the following addresses:

#### Option 1: Custom Domain (Recommended)
```
https://workmail.pro
```
or
```
https://www.workmail.pro
```

#### Option 2: GitHub Pages Default URL
```
https://wallesters-org.github.io/Wallestars
```

#### Option 3: VPS Deployment
```
https://srv1201204.hstgr.cloud
```

---

### 📋 What You Need to Do

#### Step 1: Configure DNS Records

For **workmail.pro** to work with GitHub Pages, you need to add the following DNS records in your DNS provider:

##### A Records (for apex domain)
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

##### CNAME Record (for www subdomain)
```
Type: CNAME
Name: www
Value: wallesters-org.github.io
TTL: 3600
```

##### TXT Record (for verification - already exists)
```
Type: TXT
Name: _github-pages-challenge-DIDI-IVANOV-1
Value: cf468fde2c501c7ce2d898f4a2fac7
TTL: 3600
```

#### Step 2: Wait for DNS Propagation

⏰ **Important**: DNS changes take time to propagate:
- Minimum: 1-2 hours
- Maximum: up to 24 hours

#### Step 3: Check Deployment Status

After DNS records are configured, GitHub Actions will automatically deploy the site.

Check deployment status:
1. Go to: https://github.com/Wallesters-org/Wallestars/actions
2. Look for "Deploy to GitHub Pages" workflow
3. Check if it's successful (green checkmark ✓)

#### Step 4: Configure GitHub Pages Settings

1. Go to repository settings: https://github.com/Wallesters-org/Wallestars/settings/pages
2. Verify that:
   - Source: GitHub Actions
   - Custom domain: workmail.pro
   - Enforce HTTPS: enabled (✓)

---

### 🔍 Verify DNS Records

You can verify if DNS records are configured correctly:

#### Using Command Line:
```bash
# Check A records
dig A workmail.pro +short

# Check CNAME record
dig CNAME www.workmail.pro +short

# Check TXT record
dig TXT _github-pages-challenge-DIDI-IVANOV-1.workmail.pro +short
```

#### Using Online Tools:
- https://dnschecker.org/ (select record type)
- https://www.whatsmydns.net/
- https://mxtoolbox.com/SuperTool.aspx

---

### ⚠️ Important Notes

1. **DNS Propagation takes time**: Don't worry if the site isn't accessible immediately after adding DNS records. Wait at least 2-4 hours.

2. **HTTPS Certificate**: GitHub Pages will automatically generate an SSL certificate after DNS verification is successful.

3. **Backend Functions**: Note that GitHub Pages only hosts the static frontend. For full functionality (Claude AI, Computer Use, etc.), you need to use VPS deployment.

---

### 🎯 Alternative: VPS Deployment

If you want full functionality with backend, we recommend VPS deployment:

**URL**: https://srv1201204.hstgr.cloud

**Advantages**:
- ✅ Full functionality (Claude AI, Computer Use, Android Control)
- ✅ Backend API and WebSocket support
- ✅ Real-time communication
- ✅ Better server control

**Instructions**: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) and [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)

---

### 📞 Need Help?

If you have problems:
1. ✅ Check that you've added the correct DNS records
2. ✅ Wait at least 2-4 hours for DNS propagation
3. ✅ Check GitHub Actions workflow status
4. ✅ Check GitHub Pages settings in repository
5. ✅ Use online DNS checker tools for verification

For technical questions, open an issue: https://github.com/Wallesters-org/Wallestars/issues

---

## 📚 Additional Resources

- **DNS Configuration Guide**: [DNS_CONFIGURATION.md](DNS_CONFIGURATION.md)
- **GitHub Pages Setup**: [GITHUB_PAGES_DNS_SETUP.md](GITHUB_PAGES_DNS_SETUP.md)
- **VPS Deployment Guide**: [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

**Status**: ⏳ Waiting for DNS configuration and deployment  
**Estimated Time**: 2-24 hours after DNS configuration  
**Last Updated**: January 11, 2026
