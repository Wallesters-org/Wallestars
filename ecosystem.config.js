/**
 * PM2 Ecosystem Configuration
 * 
 * This file defines the PM2 process management configuration for Wallestars
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      // Wallestars Control Center
      name: 'wallestars',
      script: 'server/index.js',
      cwd: '/var/www/wallestars',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Environment variables (production)
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        WS_PORT: 3001
      },
      
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      
      // Advanced options
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Restart behavior
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Process monitoring
      instance_var: 'INSTANCE_ID',
      
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
    },
    
    // N8N Configuration (if N8N is managed by PM2)
    {
      name: 'n8n',
      script: 'n8n',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'production',
        N8N_PORT: 5678,
        N8N_HOST: 'localhost',
        N8N_PROTOCOL: 'http',
        WEBHOOK_URL: 'https://n8n.srv1201204.hstgr.cloud/',
        GENERIC_TIMEZONE: 'UTC'
      },

      // Logging
      error_file: './logs/n8n-err.log',
      out_file: './logs/n8n-out.log',
      log_file: './logs/n8n-combined.log',
      time: true,

      // Restart behavior
      min_uptime: '30s',
      max_restarts: 10,
      restart_delay: 4000,
    },

    // Worker Orchestrator (Standalone mode - optional)
    // Use this if you want workers running independently from main server
    {
      name: 'wallestars-workers',
      script: 'server/workers/index.js',
      cwd: '/var/www/wallestars',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',

      env: {
        NODE_ENV: 'production',
        // CPU Workload targets
        CPU_MIN_TARGET: 50,
        CPU_MAX_TARGET: 85,
        // Slack integration
        SLACK_BOT_TOKEN: '',
        SLACK_WEBHOOK_URL: '',
        // GitHub integration
        GITHUB_TOKEN: ''
      },

      // Logging
      error_file: './logs/workers-err.log',
      out_file: './logs/workers-out.log',
      log_file: './logs/workers-combined.log',
      time: true,

      // Restart behavior
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Disabled by default (workers run with main server)
      // Enable this and disable AUTO_START_WORKERS in main server for standalone
      // pm2 start ecosystem.config.js --only wallestars-workers
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'wallestars',
      host: '72.61.154.188',
      ref: 'origin/main',
      repo: 'https://github.com/Wallesters-org/Wallestars.git',
      path: '/var/www/wallestars',
      
      // Pre-deployment
      'pre-deploy-local': 'echo "Deploying to production..."',
      
      // Post-deployment
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // Post-setup
      'post-setup': 'npm install && npm run build',
      
      // Environment
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
