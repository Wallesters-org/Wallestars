# GitHub Login Automation - Usage Examples

## Basic Usage Examples

### Example 1: Quick Login with Environment Variables

```bash
# Linux/macOS
export GITHUB_USERNAME=myusername
export GITHUB_PASSWORD=mypassword
npm run login

# Windows PowerShell
$env:GITHUB_USERNAME="myusername"
$env:GITHUB_PASSWORD="mypassword"
npm run login

# Windows Command Prompt
set GITHUB_USERNAME=myusername
set GITHUB_PASSWORD=mypassword
npm run login
```

### Example 2: One-Line Command

```bash
GITHUB_USERNAME=myuser GITHUB_PASSWORD=mypass node github-login-playwright.js
```

### Example 3: Configure Timeouts

```bash
# Customize how long the browser stays open
# SUCCESS_TIMEOUT: milliseconds to keep browser open after successful login (default: 30000)
# FAILURE_TIMEOUT: milliseconds to keep browser open if login fails/needs 2FA (default: 60000)
# SLOW_MO: milliseconds to slow down browser actions for visibility (default: 100)

GITHUB_USERNAME=myuser GITHUB_PASSWORD=mypass SUCCESS_TIMEOUT=60000 FAILURE_TIMEOUT=120000 SLOW_MO=200 node github-login-playwright.js
```

### Example 4: Using a .env File

Create a `.env` file (don't commit this!):

```
GITHUB_USERNAME=your_username
GITHUB_PASSWORD=your_password
```

Install dotenv:

```bash
npm install dotenv
```

Then modify the script to load from .env:

```javascript
require('dotenv').config();
// Now process.env.GITHUB_USERNAME and process.env.GITHUB_PASSWORD are available
```

## Advanced Scenarios

### Scenario 1: Headless Mode (No Browser Window)

Edit `github-login-playwright.js` and change:

```javascript
const browser = await chromium.launch({
    headless: true, // Change to true
    slowMo: 100
});
```

### Scenario 2: Different Browser

```javascript
// Use Firefox instead of Chromium
const { firefox } = require('playwright');
const browser = await firefox.launch({
    headless: false
});
```

### Scenario 3: Save Browser Session

```javascript
// Save authentication state
await context.storageState({ path: 'auth.json' });

// Reuse authentication state later
const context = await browser.newContext({
    storageState: 'auth.json'
});
```

### Scenario 4: Handle Two-Factor Authentication

```javascript
// After login, wait for 2FA input
console.log('Waiting for 2FA...');
await page.waitForTimeout(30000); // Wait 30 seconds for manual 2FA input

// Or automate with TOTP if you have the secret
const totp = require('totp-generator');
const token = totp('YOUR_2FA_SECRET');
await page.fill('input[name="otp"]', token);
```

### Scenario 5: Take Screenshots During Login

```javascript
// Take screenshot at different stages
await page.goto('https://github.com/login');
await page.screenshot({ path: 'step1-login-page.png' });

await page.fill('input[name="login"]', username);
await page.fill('input[name="password"]', password);
await page.screenshot({ path: 'step2-filled-form.png' });

await page.click('input[type="submit"]');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: 'step3-logged-in.png' });
```

### Scenario 6: Navigate After Login

```javascript
// After successful login, navigate to different pages
await page.goto('https://github.com/settings/profile');
console.log('Viewing profile settings');

await page.goto('https://github.com/settings/repositories');
console.log('Viewing repositories');

await page.goto('https://github.com/notifications');
console.log('Checking notifications');
```

## Error Handling Examples

### Handle Network Errors

```javascript
try {
    await page.goto('https://github.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });
} catch (error) {
    if (error.message.includes('timeout')) {
        console.error('Network timeout - check your connection');
    } else {
        console.error('Failed to load page:', error.message);
    }
}
```

### Handle Login Failures

```javascript
// Check for error messages
const errorElement = await page.$('.flash-error');
if (errorElement) {
    const errorText = await errorElement.textContent();
    console.error('Login failed:', errorText);
}
```

### Verify Successful Login

```javascript
// Wait for a specific element that only appears when logged in
try {
    await page.waitForSelector('[data-test-selector="nav-avatar"]', {
        timeout: 5000
    });
    console.log('✓ Successfully logged in!');
} catch {
    console.error('✗ Login failed - avatar not found');
}
```

## Testing Examples

### Dry Run (No Actual Login)

```javascript
// Just test navigation without credentials
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://github.com/login');
console.log('Login page loaded successfully');
await browser.close();
```

### Validate Credentials Format

```javascript
function validateCredentials(username, password) {
    if (!username || username.length < 1) {
        throw new Error('Username is required');
    }
    if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }
    return true;
}
```

## Security Best Practices

1. **Never hardcode credentials** in your scripts
2. **Use environment variables** or secure vaults
3. **Don't commit** `.env` files or credential files
4. **Use GitHub tokens** instead of passwords when possible
5. **Enable 2FA** on your GitHub account
6. **Clear browser data** after automation sessions
7. **Use separate accounts** for automation testing

## Troubleshooting

### Issue: "Executable doesn't exist"

**Solution**: Install Playwright browsers

```bash
npx playwright install chromium
```

### Issue: "net::ERR_CERT_AUTHORITY_INVALID"

**Solution**: Add `ignoreHTTPSErrors` option

```javascript
const context = await browser.newContext({
    ignoreHTTPSErrors: true
});
```

### Issue: Login form not found

**Solution**: Update selectors to match current GitHub HTML

```bash
# Inspect the page and find current selectors
```

### Issue: "Session expired" error

**Solution**: Implement session refresh logic

```javascript
// Check if session is still valid
const isLoggedIn = await page.$('[data-test-selector="nav-avatar"]');
if (!isLoggedIn) {
    // Re-authenticate
    await loginToGitHub();
}
```
