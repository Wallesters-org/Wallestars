# Hostinger API Integration Guide

## 🌟 Overview

Wallestars Control Center now includes full integration with the Hostinger API, enabling you to manage your VPS instances, subscriptions, billing, and payments directly from the application.

## 📚 Table of Contents

1. [Features](#features)
2. [Setup](#setup)
3. [API Endpoints](#api-endpoints)
4. [Usage Guide](#usage-guide)
5. [Automated Deployment](#automated-deployment)
6. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### VPS Management
- 📊 **List all VPS instances** - View all your Hostinger VPS servers
- 🔍 **Get VPS details** - Detailed information about each instance
- 📈 **Monitor metrics** - CPU, RAM, disk usage in real-time
- 🔄 **Restart VPS** - Remote restart capability

### Subscription Management
- 📋 **List subscriptions** - View all active subscriptions
- 📅 **Check renewal dates** - Track upcoming renewals
- 🔄 **Renew subscriptions** - One-click subscription renewal
- ❌ **Cancel subscriptions** - Manage subscription lifecycle

### Billing & Payments
- 💳 **Payment methods** - View and manage payment options
- 🧾 **Invoice history** - Access all invoices
- 📥 **Download invoices** - PDF invoice downloads
- 💰 **Account balance** - Check current balance
- 📊 **Order history** - View all orders

---

## 🚀 Setup

### 1. Get Your Hostinger API Token

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com)
2. Navigate to **Account** → **API**
3. Click **Generate API Token**
4. Copy the generated token (keep it secure!)

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Hostinger API Configuration
HOSTINGER_API_TOKEN=your_api_token_here
HOSTINGER_API_BASE_URL=https://api.hostinger.com
```

### 3. Restart the Server

```bash
npm run dev
```

### 4. Verify Configuration

Check the health endpoint to verify Hostinger API is configured:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "hostinger": true
  }
}
```

---

## 🔌 API Endpoints

### VPS Management

#### List VPS Instances
```http
GET /api/hostinger/vps
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vps-12345",
      "name": "wallestars-prod",
      "ip_address": "72.61.154.188",
      "status": "active",
      "cpu": "4 cores",
      "ram": "8 GB",
      "storage": "160 GB"
    }
  ]
}
```

#### Get VPS Details
```http
GET /api/hostinger/vps/:id
```

#### Get VPS Metrics
```http
GET /api/hostinger/vps/:id/metrics
```

#### Restart VPS
```http
POST /api/hostinger/vps/:id/restart
```

### Subscription Management

#### List Subscriptions
```http
GET /api/hostinger/subscriptions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-12345",
      "product_name": "VPS Plan KVM 4",
      "status": "active",
      "next_billing_date": "2026-02-13",
      "price": "19.99",
      "period": "monthly"
    }
  ]
}
```

#### Get Subscription Details
```http
GET /api/hostinger/subscriptions/:id
```

#### Renew Subscription
```http
POST /api/hostinger/subscriptions/:id/renew
```

**Request Body:**
```json
{
  "period": "monthly"
}
```

#### Cancel Subscription
```http
POST /api/hostinger/subscriptions/:id/cancel
```

### Payment Methods

#### List Payment Methods
```http
GET /api/hostinger/payment-methods
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pm-12345",
      "type": "card",
      "last4": "4242",
      "is_default": true
    }
  ]
}
```

#### Add Payment Method
```http
POST /api/hostinger/payment-methods
```

**Request Body:**
```json
{
  "type": "card",
  "card_number": "4242424242424242",
  "exp_month": "12",
  "exp_year": "2026",
  "cvv": "123"
}
```

#### Remove Payment Method
```http
DELETE /api/hostinger/payment-methods/:id
```

### Billing

#### List Invoices
```http
GET /api/hostinger/invoices
```

**Query Parameters:**
- `limit` - Number of results (default: 10)
- `offset` - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv-12345",
      "number": "INV-2026-001",
      "date": "2026-01-13",
      "amount": "19.99",
      "status": "paid"
    }
  ]
}
```

#### Get Invoice Details
```http
GET /api/hostinger/invoices/:id
```

#### Download Invoice PDF
```http
GET /api/hostinger/invoices/:id/download
```

Returns PDF file as download.

#### List Orders
```http
GET /api/hostinger/orders
```

#### Get Order Details
```http
GET /api/hostinger/orders/:id
```

### Account Information

#### Get Account Balance
```http
GET /api/hostinger/account/balance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amount": "50.00",
    "currency": "USD"
  }
}
```

#### Get Account Info
```http
GET /api/hostinger/account/info
```

---

## 📖 Usage Guide

### Accessing the Dashboard

1. Start the application: `npm run dev`
2. Navigate to [http://localhost:5173](http://localhost:5173)
3. Click **"Hostinger VPS"** in the sidebar

### Dashboard Tabs

#### Overview Tab
- View account balance
- Quick stats (VPS count, subscriptions, status)
- System health indicators

#### VPS Tab
- List all VPS instances
- View instance details (IP, CPU, RAM, storage)
- Restart VPS with one click
- Real-time status monitoring

#### Subscriptions Tab
- View all active subscriptions
- Check renewal dates and pricing
- One-click renewal
- Manage subscription lifecycle

#### Billing Tab
- View payment methods
- Access invoice history
- Download invoices as PDF
- Track order history

### Example: Renewing a Subscription

1. Navigate to **Hostinger VPS** page
2. Click **Subscriptions** tab
3. Find the subscription to renew
4. Click **Renew** button
5. Confirm the renewal
6. ✅ Subscription renewed!

### Example: Restarting a VPS

1. Navigate to **Hostinger VPS** page
2. Click **VPS** tab
3. Find the VPS instance
4. Click **Restart** button
5. Confirm the action
6. ⏳ VPS restart initiated

---

## 🤖 Automated Deployment

### GitHub Actions Workflow

The project includes a GitHub Actions workflow for automated deployment to Hostinger VPS.

**Location:** `.github/workflows/deploy-hostinger-vps.yml`

### Setup GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_SSH_PRIVATE_KEY` | SSH private key for VPS access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `VPS_HOST` | VPS hostname or IP address | `srv1201204.hstgr.cloud` |
| `VPS_USER` | SSH username | `wallestars` |
| `ANTHROPIC_API_KEY` | Claude AI API key | `sk-ant-...` |
| `HOSTINGER_API_TOKEN` | Hostinger API token | `hst_...` |

### Deployment Process

1. **Automatic Deployment** - Triggered on push to `main` branch
2. **Manual Deployment** - Trigger via GitHub Actions UI

#### Deployment Steps:
1. ✅ Build application
2. ✅ Run tests
3. ✅ Create deployment package
4. ✅ Upload to VPS
5. ✅ Update environment variables
6. ✅ Restart PM2 process
7. ✅ Health check verification
8. ✅ Rollback on failure

### Manual Deployment Trigger

```bash
# Via GitHub CLI
gh workflow run deploy-hostinger-vps.yml

# Or use the GitHub Actions UI
```

### Rollback

If deployment fails, the workflow automatically:
1. Detects the failure
2. Restores the latest backup
3. Restarts the application
4. Notifies of rollback status

---

## 🔧 Troubleshooting

### Issue: "Hostinger API not configured"

**Solution:**
1. Check `.env` file has `HOSTINGER_API_TOKEN`
2. Restart the server
3. Verify token is valid in hPanel

### Issue: "Failed to fetch VPS instances"

**Possible causes:**
- Invalid API token
- Network connectivity issues
- Hostinger API rate limiting

**Solution:**
1. Verify API token in hPanel
2. Check server logs: `pm2 logs wallestars`
3. Wait a few minutes if rate limited

### Issue: "Authentication failed"

**Solution:**
1. Regenerate API token in hPanel
2. Update `.env` file
3. Restart server: `pm2 restart wallestars`

### Issue: Deployment workflow fails

**Solution:**
1. Check GitHub Secrets are correctly set
2. Verify SSH key has access to VPS
3. Check VPS user has proper permissions
4. Review workflow logs in GitHub Actions

### Getting Help

1. **Check logs:**
   ```bash
   # Application logs
   pm2 logs wallestars
   
   # Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check service status:**
   ```bash
   pm2 status
   sudo systemctl status nginx
   ```

3. **Test API connection:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.hostinger.com/api/vps/v1/instances
   ```

---

## 📚 Additional Resources

- **Hostinger API Documentation:** [https://developers.hostinger.com/](https://developers.hostinger.com/)
- **VPS Deployment Guide:** [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)
- **Security Checklist:** [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)
- **Deployment Checklist:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🔒 Security Best Practices

1. **Never commit API tokens** to version control
2. **Rotate tokens regularly** (every 90 days)
3. **Use environment variables** for all credentials
4. **Limit API token permissions** to what's needed
5. **Monitor API usage** in Hostinger hPanel
6. **Enable 2FA** on Hostinger account

---

## 📝 License

This integration is part of the Wallestars Control Center project and follows the same MIT License.

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
