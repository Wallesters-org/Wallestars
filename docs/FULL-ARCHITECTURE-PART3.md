# 🏗️ Wallestars - Infrastructure & GitHub Codespaces Integration

**Part 3 of Full Architecture**  
**Version**: 3.0.0

---

## ☁️ GitHub Codespaces Integration

### Why Codespaces?

**Your devcontainer is ALREADY optimized for Codespaces:**

```json
// .devcontainer/devcontainer.json
{
  "name": "Wallestars Dev Container v2.1",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm",
  
  // ✅ Codespaces features enabled:
  "forwardPorts": [3000, 5678, 8080],
  "portsAttributes": {
    "3000": {
      "label": "Management Dashboard",
      "onAutoForward": "notify"
    },
    "5678": {
      "label": "n8n (local)",
      "onAutoForward": "silent"
    },
    "8080": {
      "label": "Website Builder",
      "onAutoForward": "notify"
    }
  },
  
  // Secrets management in Codespaces
  "secrets": {
    "ANTHROPIC_API_KEY": {
      "description": "Claude API key for Cline",
      "documentationUrl": "https://console.anthropic.com"
    },
    "SUPABASE_URL": {
      "description": "Supabase project URL"
    },
    "SUPABASE_SERVICE_KEY": {
      "description": "Supabase service role key"
    },
    "N8N_API_KEY": {
      "description": "n8n VPS API key"
    },
    "KEEPASS_DB_PATH": {
      "description": "Path to KeePassXC database"
    }
  }
}
```

### Codespaces Workflow

```bash
# 1. Create Codespace from any branch
gh codespace create \
  --repo YOUR_USERNAME/wallestars \
  --branch copilot/implement-dj-workflow-ai-integration-again \
  --machine largeLinux  # 8 cores, 16GB RAM for AI tasks

# 2. Open Codespace
gh codespace code

# 3. Verify setup
keepass-get test-entry
pm2 list
az vm list

# 4. Start development
npm run dev  # Management dashboard on port 3000
```

### Codespaces Advantages

✅ **Pre-built Environments**: Container image cached by GitHub  
✅ **Fast Startup**: ~30 seconds instead of 5+ minutes  
✅ **Portable**: Work from any device (even iPad!)  
✅ **Scalable**: Choose machine size based on task  
✅ **Free Tier**: 120 core-hours/month for Pro users  
✅ **VPS Connection**: Your devcontainer can connect to srv1201204.hstgr.cloud  

---

## 🏗️ Infrastructure Details

### VPS Architecture (srv1201204.hstgr.cloud)

```
┌──────────────────────────────────────────────────────────┐
│            VPS: srv1201204.hstgr.cloud                    │
│            IPv4: 72.61.154.188                            │
│            IPv6: 2a02:4780:41:e7b1::1                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Nginx (Reverse Proxy) - Port 80/443            │    │
│  │  SSL: Let's Encrypt wildcard cert               │    │
│  └─────────────────────────────────────────────────┘    │
│                      │                                    │
│         ┌────────────┼────────────┐                      │
│         │            │            │                       │
│         ▼            ▼            ▼                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │   n8n    │ │   MCP    │ │   API    │                │
│  │  :5678   │ │  :3001   │ │  :3000   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│         │            │            │                       │
│         └────────────┼────────────┘                      │
│                      │                                    │
│                      ▼                                    │
│         ┌────────────────────────┐                       │
│         │   PostgreSQL  :5432    │                       │
│         │   (n8n database)       │                       │
│         └────────────────────────┘                       │
│                      │                                    │
│                      ▼                                    │
│         ┌────────────────────────┐                       │
│         │     Redis  :6379       │                       │
│         │  (cache & queues)      │                       │
│         └────────────────────────┘                       │
│                                                           │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  External Services:       │
        │  • Supabase (database)    │
        │  • Telegram API           │
        │  • Instagram API          │
        │  • Facebook API           │
        │  • WhatsApp Business API  │
        │  • smstome API            │
        │  • fanytel API            │
        └──────────────────────────┘
```

### Deployment Strategy

#### Option 1: Docker Compose (Recommended)

```bash
# On VPS: srv1201204.hstgr.cloud
cd /opt/wallestars
docker-compose up -d

# Verify services
docker-compose ps
docker-compose logs -f n8n
docker-compose logs -f mcp-server
```

#### Option 2: PM2 (Alternative)

```bash
# Install apps
cd /opt/wallestars/api
npm install

cd /opt/wallestars/mcp-server
npm install

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable on boot
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'api',
      script: './api/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'mcp-server',
      script: './mcp-server/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'worker-telegram',
      script: './workers/telegram-worker.js',
      instances: 1
    },
    {
      name: 'worker-instagram',
      script: './workers/instagram-worker.js',
      instances: 1
    }
  ]
};
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/wallestars
server {
    listen 80;
    server_name n8n.srv1201204.hstgr.cloud;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name n8n.srv1201204.hstgr.cloud;
    
    ssl_certificate /etc/letsencrypt/live/n8n.srv1201204.hstgr.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.srv1201204.hstgr.cloud/privkey.pem;
    
    # n8n
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # MCP Server
    location /mcp-server/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Bearer token authentication
        if ($http_authorization != "Bearer YOUR_TOKEN_HERE") {
            return 401;
        }
    }
    
    # Management API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL Certificate Setup

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get wildcard certificate
sudo certbot --nginx \
  -d n8n.srv1201204.hstgr.cloud \
  -d *.srv1201204.hstgr.cloud \
  --email your-email@example.com \
  --agree-tos

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🔒 Security & Privacy

### KeePassXC Integration

**Full Flow:**

```bash
# 1. Mount Tails USB (if using Tails persistent storage)
sudo mount /dev/sdb1 /mnt/tails

# 2. Set environment variables
export KEEPASS_DB_PATH="/mnt/tails/Persistent/secrets/wallestars.kdbx"
export KEEPASS_KEY_FILE="/mnt/tails/Persistent/secrets/wallestars.key"

# 3. Use keepass-get helper
keepass-get anthropic-api-key
# Output: sk-ant-api03-xxxxx...

# 4. Export to environment
eval $(keepass-get anthropic-api-key --export)
echo $ANTHROPIC_API_KEY  # Verify it's set

# 5. Use in application
export ANTHROPIC_API_KEY=$(keepass-get anthropic-api-key)
npm run dev
```

**Security Best Practices:**

1. **Secrets Never in Git**
   ```bash
   # .gitignore
   .env
   .env.local
   *.kdbx
   *.key
   secrets/
   ```

2. **GitHub Codespaces Secrets**
   ```bash
   # Set secrets via GitHub UI or CLI
   gh codespace secret set ANTHROPIC_API_KEY --user
   gh codespace secret set SUPABASE_SERVICE_KEY --user
   gh codespace secret set N8N_API_KEY --user
   ```

3. **VPS Secrets Management**
   ```bash
   # Use Docker secrets or encrypted env files
   docker secret create anthropic_key /path/to/key.txt
   
   # In docker-compose.yml:
   services:
     mcp-server:
       secrets:
         - anthropic_key
   ```

### Data Privacy

**Chat Storage Compliance:**

```javascript
// GDPR Compliance Features
const privacyFeatures = {
  // 1. Data Anonymization
  anonymize_user: async (user_id) => {
    await supabase
      .from('users')
      .update({
        phone_number: 'REDACTED',
        email: 'REDACTED',
        real_name: 'Anonymous User'
      })
      .eq('id', user_id);
  },
  
  // 2. Right to Deletion
  delete_user_data: async (user_id) => {
    // Delete messages
    await supabase.from('messages').delete().eq('user_id', user_id);
    // Delete conversations
    await supabase.from('conversations').delete().eq('user_id', user_id);
    // Delete decisions
    await supabase.from('eva_decisions').delete().eq('user_id', user_id);
    // Delete user
    await supabase.from('users').delete().eq('id', user_id);
  },
  
  // 3. Data Export (Portability)
  export_user_data: async (user_id) => {
    const data = {
      messages: await supabase.from('messages').select('*').eq('user_id', user_id),
      conversations: await supabase.from('conversations').select('*').eq('user_id', user_id),
      analytics: await supabase.from('conversation_analytics').select('*').eq('user_id', user_id)
    };
    
    return JSON.stringify(data, null, 2);
  },
  
  // 4. Consent Management
  check_consent: async (user_id) => {
    const { data } = await supabase
      .from('users')
      .select('consent_chat_storage, consent_ai_analysis')
      .eq('id', user_id)
      .single();
    
    return data;
  }
};
```

**Encryption at Rest:**

```javascript
// Supabase RLS (Row Level Security) Policies
-- Only authenticated users can see their own messages
CREATE POLICY "Users can only see own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

-- Eva Core service account can see all
CREATE POLICY "Eva Core service access"
  ON messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'service');

-- Encrypt sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive(data TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Deployment Checklist

### VPS Setup (srv1201204.hstgr.cloud)

- [ ] **1. Initial Server Configuration**
  ```bash
  # Update system
  sudo apt update && sudo apt upgrade -y
  
  # Install Docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  
  # Install Docker Compose
  sudo apt install docker-compose-plugin
  
  # Create wallestars user
  sudo useradd -m -s /bin/bash wallestars
  sudo usermod -aG docker wallestars
  ```

- [ ] **2. Clone Repository**
  ```bash
  sudo su - wallestars
  cd /opt
  git clone https://github.com/YOUR_USERNAME/wallestars.git
  cd wallestars
  ```

- [ ] **3. Configure Environment**
  ```bash
  cp .env.example .env
  nano .env  # Fill in secrets
  ```

- [ ] **4. Deploy Services**
  ```bash
  docker-compose up -d
  ```

- [ ] **5. Setup SSL**
  ```bash
  sudo certbot --nginx -d n8n.srv1201204.hstgr.cloud
  ```

- [ ] **6. Configure Firewall**
  ```bash
  sudo ufw allow 22/tcp    # SSH
  sudo ufw allow 80/tcp    # HTTP
  sudo ufw allow 443/tcp   # HTTPS
  sudo ufw enable
  ```

- [ ] **7. Setup Monitoring**
  ```bash
  # Install monitoring tools
  docker-compose -f docker-compose.monitoring.yml up -d
  ```

- [ ] **8. Backup Configuration**
  ```bash
  # Automated backups to S3/Backblaze
  sudo crontab -e
  # Add: 0 2 * * * /opt/wallestars/scripts/backup.sh
  ```

### Supabase Configuration

- [ ] **1. Create Project** at https://supabase.com
- [ ] **2. Run Database Migrations**
  ```sql
  -- From docs/FULL-ARCHITECTURE.md (Part 1)
  -- Copy and paste all CREATE TABLE statements
  ```
- [ ] **3. Enable Realtime**
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE eva_decisions;
  ```
- [ ] **4. Configure RLS Policies**
- [ ] **5. Setup Storage Buckets**
  ```bash
  # For media files
  gsutil mb -l europe-west1 gs://wallestars-media
  ```

### n8n Configuration

- [ ] **1. Access n8n** at https://n8n.srv1201204.hstgr.cloud
- [ ] **2. Import Workflows**
  - `workflows/user-contact-automation.json`
  - `workflows/dj-workflow-multichain.json`
- [ ] **3. Configure Credentials**
  - Telegram Bot Token
  - Instagram API credentials
  - Supabase URL + Key
  - Claude API key
- [ ] **4. Test Webhooks**
  ```bash
  curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/test \
    -H "Content-Type: application/json" \
    -d '{"test": "message"}'
  ```

### Management Dashboard Deployment

- [ ] **1. Build Frontend**
  ```bash
  cd management-dashboard
  npm install
  npm run build
  ```
- [ ] **2. Deploy to Netlify**
  ```bash
  netlify deploy --prod --dir=dist
  ```
- [ ] **3. Configure Environment**
  ```bash
  netlify env:set SUPABASE_URL "https://xxx.supabase.co"
  netlify env:set SUPABASE_ANON_KEY "eyJxxx..."
  ```
- [ ] **4. Test Production**
  ```bash
  open https://wallestars-dashboard.netlify.app
  ```

---

## 📊 Monitoring & Observability

### Logging Strategy

```javascript
// shared/utils/logger.js
const winston = require('winston');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console output
    new winston.transports.Console(),
    
    // File output
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Also log to Supabase for analytics
logger.on('data', async (log) => {
  if (log.level === 'error') {
    await supabase.from('error_logs').insert({
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      stack: log.stack,
      metadata: log.metadata
    });
  }
});

module.exports = logger;
```

### Health Checks

```javascript
// api/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    services: {}
  };
  
  // Check Supabase
  try {
    await supabase.from('messages').select('count').single();
    health.services.supabase = 'ok';
  } catch (error) {
    health.services.supabase = 'error';
    health.status = 'degraded';
  }
  
  // Check n8n
  try {
    await axios.get('http://n8n:5678/healthz');
    health.services.n8n = 'ok';
  } catch (error) {
    health.services.n8n = 'error';
    health.status = 'degraded';
  }
  
  // Check Redis
  try {
    await redis.ping();
    health.services.redis = 'ok';
  } catch (error) {
    health.services.redis = 'error';
    health.status = 'degraded';
  }
  
  res.json(health);
});

module.exports = router;
```

### Metrics Dashboard

```bash
# Add Prometheus + Grafana to docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 🎯 Next Steps

### Immediate Actions (Week 1)

1. ✅ **Review Architecture Docs**
   - Read all 3 parts of FULL-ARCHITECTURE
   - Understand database schema
   - Review MCP integration

2. 🔄 **Setup VPS Services**
   - Deploy Docker Compose stack
   - Configure MCP server
   - Test n8n workflows

3. 🔄 **Implement Social Media Integrations**
   - Start with Telegram (already partially done)
   - Add Instagram API
   - Plan Facebook integration

### Short-term Goals (Month 1)

4. 🆕 **Build Management Dashboard**
   - Create React app with Vite
   - Implement real-time monitoring
   - Add workflow visualizer

5. 🆕 **Eva Core Enhancements**
   - Integrate with message storage
   - Improve decision engine
   - Add learning capabilities

6. 🆕 **Platform Expansions**
   - SMS (smstome)
   - Virtual phones (fanytel)
   - Replit integration
   - Netlify deployment

### Long-term Vision (Quarter 1)

7. 📈 **Scale Infrastructure**
   - Multi-region deployment
   - Load balancing
   - CDN for static assets

8. 🤖 **Advanced AI Features**
   - Multi-agent collaboration
   - Automated learning from feedback
   - Personalized responses per user

9. 📊 **Analytics & Insights**
   - Advanced sentiment tracking
   - Conversation success metrics
   - ROI measurement

---

**🎉 Architecture Complete!**

You now have a comprehensive blueprint for:
- ✅ Social media chat storage with AI decision making
- ✅ MCP integration with n8n VPS
- ✅ Management dashboard for visualization
- ✅ Platform integrations (current + planned)
- ✅ Security & privacy compliance
- ✅ Deployment strategy
- ✅ Monitoring & observability

**Ready to build? Start with:**
```bash
# 1. Deploy VPS stack
ssh wallestars@srv1201204.hstgr.cloud
cd /opt/wallestars
docker-compose up -d

# 2. Create dashboard
cd management-dashboard
npm create vite@latest . -- --template react-ts
npm install
npm run dev

# 3. Test MCP integration
curl -X POST https://n8n.srv1201204.hstgr.cloud/mcp-server/http \
  -H "Content-Type: application/json" \
  -d '{"tool": "query_database", "params": {"table": "messages"}}'
```

**Questions? Check:**
- Part 1: [FULL-ARCHITECTURE.md](FULL-ARCHITECTURE.md) - System Overview, Database, Eva Core
- Part 2: [FULL-ARCHITECTURE-PART2.md](FULL-ARCHITECTURE-PART2.md) - Platforms, Management Dashboard
- Part 3: [FULL-ARCHITECTURE-PART3.md](FULL-ARCHITECTURE-PART3.md) - Infrastructure, Security (this file)
