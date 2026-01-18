// Налични workflow файлове: 
const existingWorkflows = {
  implemented: [
    'system-health-monitor. json',      // ✅ Пълен
    'github-automation.json',          // ✅ Пълен
  ],
  documented: [
    'deployment-automation.json',      // 📝 Само документация
    'user-analytics.json',             // 📝 Само документация
    'sub-github-pr-review.json',       // 📝 Само документация
    'sub-alert-notification.json',     // 📝 Само документация
    'sub-service-restart.json',        // 📝 Само документация
    'sub-metrics-collection.json',     // 📝 Само документация
  ]
};

// API endpoints които вече работят:
const workingEndpoints = {
  wallestars: [
    'POST /api/webhooks/n8n/health-report',
    'POST /api/webhooks/n8n/alert',
    'POST /api/webhooks/n8n/github-event',
    'POST /api/webhooks/n8n/agent-activity',
    'GET /api/webhooks/n8n/dashboard',
  ]
};