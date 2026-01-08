module.exports = {
  apps: [
    {
      name: 'wallestars-api',
      script: 'server/index.js',
      cwd: '/opt/wallestars',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/opt/wallestars/logs/api-error.log',
      out_file: '/opt/wallestars/logs/api-out.log',
      log_file: '/opt/wallestars/logs/api-combined.log',
      time: true
    },
    {
      name: 'n8n',
      script: 'n8n',
      args: 'start --tunnel',
      cwd: '/opt/wallestars',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        N8N_PORT: 5678,
        N8N_PROTOCOL: 'http',
        N8N_HOST: 'localhost',
        WEBHOOK_URL: 'https://your-domain.com/workflows'
      },
      error_file: '/opt/wallestars/logs/n8n-error.log',
      out_file: '/opt/wallestars/logs/n8n-out.log',
      log_file: '/opt/wallestars/logs/n8n-combined.log',
      time: true
    },
    {
      name: 'eva-core',
      script: 'eva-core/eva-core.js',
      cwd: '/opt/wallestars',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/opt/wallestars/logs/eva-error.log',
      out_file: '/opt/wallestars/logs/eva-out.log',
      log_file: '/opt/wallestars/logs/eva-combined.log',
      time: true
    },
    {
      name: 'vps-manager',
      script: 'platforms/hostinger-vps/hostinger-vps-manager.py',
      interpreter: 'python3',
      cwd: '/opt/wallestars',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        PYTHONUNBUFFERED: '1'
      },
      error_file: '/opt/wallestars/logs/vps-manager-error.log',
      out_file: '/opt/wallestars/logs/vps-manager-out.log',
      log_file: '/opt/wallestars/logs/vps-manager-combined.log',
      time: true
    },
    {
      name: 'email-manager',
      script: 'platforms/33mail-integration/33mail-manager.py',
      interpreter: 'python3',
      cwd: '/opt/wallestars',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        PYTHONUNBUFFERED: '1'
      },
      error_file: '/opt/wallestars/logs/email-manager-error.log',
      out_file: '/opt/wallestars/logs/email-manager-out.log',
      log_file: '/opt/wallestars/logs/email-manager-combined.log',
      time: true
    },
    {
      name: 'health-monitor',
      script: 'deployment/health-check.py',
      interpreter: 'python3',
      cwd: '/opt/wallestars',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '128M',
      env: {
        PYTHONUNBUFFERED: '1'
      },
      error_file: '/opt/wallestars/logs/health-monitor-error.log',
      out_file: '/opt/wallestars/logs/health-monitor-out.log',
      log_file: '/opt/wallestars/logs/health-monitor-combined.log',
      time: true
    }
  ]
};
