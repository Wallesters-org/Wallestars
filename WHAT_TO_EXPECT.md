# ⚠️ Какво Да Очаквате / What to Expect

[Български](#-български) | [English](#-english)

---

## 🇧🇬 Български

### Важно! Този PR НЕ Deploy-ва Нищо Още

Този Pull Request **само подготвя инфраструктурата** за deployment. Той **не deploy-ва** сайта автоматично.

### ❌ Какво НЯМА да видите сега:

- ❌ Работещ сайт на `workmail.pro`
- ❌ Работещ сайт на `wallesters-org.github.io/Wallestars`
- ❌ Работещ сайт на `srv1201204.hstgr.cloud`
- ❌ Автоматичен deployment

### ✅ Какво СЕ ДОБАВЯ с този PR:

- ✅ GitHub Actions workflow файл (`.github/workflows/deploy-github-pages.yml`)
- ✅ CNAME файл за custom domain (`public/CNAME`)
- ✅ Конфигурация на Vite за GitHub Pages (`vite.config.js`)
- ✅ Пълна документация на български и английски

### 🔄 Какво Трябва да Направите След Merge:

#### Стъпка 1: Merge на този PR
```
Merge този PR в `main` branch
```

#### Стъпка 2: Включете GitHub Pages
1. Отидете на: `Settings` → `Pages` в GitHub repository
2. **Source**: Изберете `GitHub Actions`
3. **Custom domain**: Въведете `workmail.pro`
4. **Save**

#### Стъпка 3: Конфигурирайте DNS
Добавете следните DNS записи при вашия DNS provider (например Hostinger):

**A Records (4 записа):**
```
Type: A, Name: @, Value: 185.199.108.153
Type: A, Name: @, Value: 185.199.109.153
Type: A, Name: @, Value: 185.199.110.153
Type: A, Name: @, Value: 185.199.111.153
```

**CNAME Record:**
```
Type: CNAME, Name: www, Value: wallesters-org.github.io
```

#### Стъпка 4: Изчакайте
- ⏰ DNS промените отнемат **2-24 часа** за разпространение
- 🔄 GitHub Actions автоматично ще deploy-не сайта след merge

#### Стъпка 5: Проверете
След 2-24 часа проверете:
```
https://workmail.pro
https://www.workmail.pro
https://wallesters-org.github.io/Wallestars
```

### 🖥️ За VPS Deployment (srv1201204.hstgr.cloud)

GitHub Pages deploy-ва **само frontend-а** (статични файлове). За пълна функционалност (Claude AI, Computer Use, Android Control) трябва да deploy-нете на VPS:

1. SSH в VPS сървъра:
   ```bash
   ssh user@72.61.154.188
   ```

2. Clone repository:
   ```bash
   git clone https://github.com/Wallesters-org/Wallestars.git
   cd Wallestars
   ```

3. Инсталирайте dependencies:
   ```bash
   npm install
   ```

4. Създайте `.env` файл:
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

5. Build frontend:
   ```bash
   npm run build
   ```

6. Стартирайте сървъра:
   ```bash
   npm start
   # Or with PM2: pm2 start ecosystem.config.js
   ```

7. Конфигурирайте Nginx (вижте `VPS_DEPLOYMENT.md`)

### 📊 Какво Да Очаквате След Merge:

| Локация | Статус След Merge | Какво Ще Видите |
|---------|-------------------|------------------|
| `workmail.pro` | ✅ Ще работи след DNS config | Само frontend (след 2-24 часа) |
| `wallesters-org.github.io/Wallestars` | ✅ Ще работи веднага | Само frontend |
| `srv1201204.hstgr.cloud` | ❌ Няма да работи | Трябва ръчен deployment |

---

## 🇬🇧 English

### Important! This PR Does NOT Deploy Anything Yet

This Pull Request **only prepares the deployment infrastructure**. It does **not deploy** the site automatically.

### ❌ What You WILL NOT See Now:

- ❌ Working site at `workmail.pro`
- ❌ Working site at `wallesters-org.github.io/Wallestars`
- ❌ Working site at `srv1201204.hstgr.cloud`
- ❌ Automatic deployment

### ✅ What IS ADDED with this PR:

- ✅ GitHub Actions workflow file (`.github/workflows/deploy-github-pages.yml`)
- ✅ CNAME file for custom domain (`public/CNAME`)
- ✅ Vite configuration for GitHub Pages (`vite.config.js`)
- ✅ Complete documentation in Bulgarian and English

### 🔄 What You Need to Do After Merge:

#### Step 1: Merge this PR
```
Merge this PR into `main` branch
```

#### Step 2: Enable GitHub Pages
1. Go to: `Settings` → `Pages` in GitHub repository
2. **Source**: Select `GitHub Actions`
3. **Custom domain**: Enter `workmail.pro`
4. **Save**

#### Step 3: Configure DNS
Add the following DNS records at your DNS provider (e.g., Hostinger):

**A Records (4 records):**
```
Type: A, Name: @, Value: 185.199.108.153
Type: A, Name: @, Value: 185.199.109.153
Type: A, Name: @, Value: 185.199.110.153
Type: A, Name: @, Value: 185.199.111.153
```

**CNAME Record:**
```
Type: CNAME, Name: www, Value: wallesters-org.github.io
```

#### Step 4: Wait
- ⏰ DNS changes take **2-24 hours** to propagate
- 🔄 GitHub Actions will automatically deploy the site after merge

#### Step 5: Verify
After 2-24 hours, check:
```
https://workmail.pro
https://www.workmail.pro
https://wallesters-org.github.io/Wallestars
```

### 🖥️ For VPS Deployment (srv1201204.hstgr.cloud)

GitHub Pages deploys **only the frontend** (static files). For full functionality (Claude AI, Computer Use, Android Control), you need to deploy to VPS:

1. SSH into VPS server:
   ```bash
   ssh user@72.61.154.188
   ```

2. Clone repository:
   ```bash
   git clone https://github.com/Wallesters-org/Wallestars.git
   cd Wallestars
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

5. Build frontend:
   ```bash
   npm run build
   ```

6. Start server:
   ```bash
   npm start
   # Or with PM2: pm2 start ecosystem.config.js
   ```

7. Configure Nginx (see `VPS_DEPLOYMENT.md`)

### 📊 What to Expect After Merge:

| Location | Status After Merge | What You'll See |
|----------|-------------------|-----------------|
| `workmail.pro` | ✅ Will work after DNS config | Frontend only (after 2-24 hours) |
| `wallesters-org.github.io/Wallestars` | ✅ Will work immediately | Frontend only |
| `srv1201204.hstgr.cloud` | ❌ Won't work | Requires manual deployment |

---

## 🔍 How to Check Progress

### Check GitHub Actions Status
1. Go to the `Actions` tab in GitHub repository
2. Look for "Deploy to GitHub Pages" workflow
3. Click on the latest run to see details

### Check DNS Propagation
```bash
# Check A records
dig workmail.pro

# Check CNAME record
dig www.workmail.pro

# Or use online tool
https://www.whatsmydns.net/#A/workmail.pro
```

### Check GitHub Pages Status
1. Go to `Settings` → `Pages`
2. Look for "Your site is live at https://workmail.pro"
3. Click "Visit site" to test

---

## ❓ FAQ

### Q: Why is srv1201204.hstgr.cloud showing 404?
**A:** Nothing is deployed there yet. You need to manually deploy to VPS following the instructions above.

### Q: Why can't I access workmail.pro yet?
**A:** You need to:
1. Merge this PR to `main`
2. Enable GitHub Pages in settings
3. Configure DNS records
4. Wait 2-24 hours for DNS propagation

### Q: When will the deployment be automatic?
**A:** After you:
1. Merge this PR to `main`
2. Enable GitHub Pages in settings

Then every future push to `main` will automatically deploy.

### Q: What's the difference between GitHub Pages and VPS deployment?

**GitHub Pages:**
- ✅ Automatic deployment
- ✅ Free hosting
- ✅ HTTPS included
- ❌ Static files only (no backend)
- ❌ No Claude AI features
- ❌ No Computer Use
- ❌ No Android Control

**VPS Deployment:**
- ✅ Full functionality
- ✅ All backend features work
- ✅ Claude AI integration
- ✅ Computer Use API
- ✅ Android Control
- ❌ Manual deployment required
- ❌ VPS hosting costs

---

## 📞 Need Help?

If you have questions or issues:
1. Read the full documentation: [SITE_ACCESS_INSTRUCTIONS.md](SITE_ACCESS_INSTRUCTIONS.md)
2. Check VPS deployment guide: [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)
3. Open an issue: https://github.com/Wallesters-org/Wallestars/issues
