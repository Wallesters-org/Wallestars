import express from 'express';
import slackNotifier from '../services/slackNotifier.js';

const router = express.Router();

// Store for health reports (in production, use a database)
const healthReports = [];
const githubEvents = [];
const agentActivity = [];
const alerts = [];

// Health Report Endpoint
router.post('/health-report', (req, res) => {
  try {
    const { healthReport } = req.body;

    if (!healthReport) {
      return res.status(400).json({ error: 'Health report data required' });
    }

    // Store health report
    healthReports.push({
      ...healthReport,
      receivedAt: new Date().toISOString()
    });

    // Keep only last 100 reports
    if (healthReports.length > 100) {
      healthReports.shift();
    }

    console.log('📊 Health Report Received:', {
      status: healthReport.overallStatus,
      alerts: healthReport.alerts?.length || 0,
      timestamp: healthReport.timestamp
    });

    // Forward to Slack if enabled
    if (process.env.SLACK_WEBHOOK_URL) {
      slackNotifier.sendHealthReportFromWebhook(healthReport).catch(err => {
        console.error('Failed to forward health report to Slack:', err.message);
      });
    }

    res.json({
      success: true,
      message: 'Health report received',
      reportId: healthReports.length
    });
  } catch (error) {
    console.error('Error processing health report:', error);
    res.status(500).json({ error: 'Failed to process health report' });
  }
});

// Alert Endpoint
router.post('/alert', (req, res) => {
  try {
    const { message, severity, report } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Alert message required' });
    }

    const alert = {
      message,
      severity: severity || 'info',
      report,
      timestamp: new Date().toISOString()
    };

    // Store alert
    alerts.push(alert);

    // Keep only last 50 alerts
    if (alerts.length > 50) {
      alerts.shift();
    }

    console.log(`🚨 Alert [${severity}]:`, message);

    // Forward to Slack if enabled
    if (process.env.SLACK_WEBHOOK_URL) {
      slackNotifier.sendAlert({
        severity: severity || 'info',
        message,
        details: report ? {
          'Overall Status': report.overallStatus || 'unknown',
          'Disk Usage': `${report.resources?.disk?.usage || 'N/A'}%`,
          'Memory Usage': `${report.resources?.memory?.usage || 'N/A'}%`
        } : null
      }).catch(err => {
        console.error('Failed to forward alert to Slack:', err.message);
      });
    }

    // Emit to connected WebSocket clients if io is available
    if (global.io) {
      global.io.emit('n8n:alert', alert);
    }

    res.json({
      success: true,
      message: 'Alert received',
      alertId: alerts.length
    });
  } catch (error) {
    console.error('Error processing alert:', error);
    res.status(500).json({ error: 'Failed to process alert' });
  }
});

// GitHub Event Endpoint
router.post('/github-event', (req, res) => {
  try {
    const { event } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event data required' });
    }

    // Store GitHub event
    githubEvents.push({
      ...event,
      receivedAt: new Date().toISOString()
    });

    // Keep only last 100 events
    if (githubEvents.length > 100) {
      githubEvents.shift();
    }

    console.log(`🐙 GitHub Event [${event.eventType}]:`, {
      action: event.action,
      title: event.title,
      number: event.number
    });

    // Emit to connected WebSocket clients
    if (global.io) {
      global.io.emit('n8n:github-event', event);
    }

    res.json({
      success: true,
      message: 'GitHub event received',
      eventId: githubEvents.length
    });
  } catch (error) {
    console.error('Error processing GitHub event:', error);
    res.status(500).json({ error: 'Failed to process GitHub event' });
  }
});

// Agent Activity Endpoint
router.post('/agent-activity', (req, res) => {
  try {
    const { summary } = req.body;

    if (!summary) {
      return res.status(400).json({ error: 'Activity summary required' });
    }

    // Store agent activity
    agentActivity.push({
      ...summary,
      receivedAt: new Date().toISOString()
    });

    // Keep only last 50 activity summaries
    if (agentActivity.length > 50) {
      agentActivity.shift();
    }

    console.log('🤖 Agent Activity:', {
      issues: summary.agentIssuesCount,
      prs: summary.agentPRsCount,
      timestamp: summary.timestamp
    });

    // Emit to connected WebSocket clients
    if (global.io) {
      global.io.emit('n8n:agent-activity', summary);
    }

    res.json({
      success: true,
      message: 'Agent activity received',
      activityId: agentActivity.length
    });
  } catch (error) {
    console.error('Error processing agent activity:', error);
    res.status(500).json({ error: 'Failed to process agent activity' });
  }
});

// Get Latest Health Report
router.get('/health-report/latest', (req, res) => {
  try {
    const latest = healthReports[healthReports.length - 1];

    if (!latest) {
      return res.status(404).json({ error: 'No health reports available' });
    }

    res.json(latest);
  } catch (error) {
    console.error('Error fetching health report:', error);
    res.status(500).json({ error: 'Failed to fetch health report' });
  }
});

// Get All Health Reports
router.get('/health-report/all', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const reports = healthReports.slice(-limit);

    res.json({
      count: reports.length,
      total: healthReports.length,
      reports
    });
  } catch (error) {
    console.error('Error fetching health reports:', error);
    res.status(500).json({ error: 'Failed to fetch health reports' });
  }
});

// Get Latest Alerts
router.get('/alerts', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const severity = req.query.severity;

    let filteredAlerts = alerts;
    if (severity) {
      filteredAlerts = alerts.filter(a => a.severity === severity);
    }

    const result = filteredAlerts.slice(-limit);

    res.json({
      count: result.length,
      total: filteredAlerts.length,
      alerts: result
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get GitHub Events
router.get('/github-events', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const eventType = req.query.eventType;

    let filteredEvents = githubEvents;
    if (eventType) {
      filteredEvents = githubEvents.filter(e => e.eventType === eventType);
    }

    const result = filteredEvents.slice(-limit);

    res.json({
      count: result.length,
      total: filteredEvents.length,
      events: result
    });
  } catch (error) {
    console.error('Error fetching GitHub events:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub events' });
  }
});

// Get Agent Activity
router.get('/agent-activity', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = agentActivity.slice(-limit);

    res.json({
      count: result.length,
      total: agentActivity.length,
      activity: result
    });
  } catch (error) {
    console.error('Error fetching agent activity:', error);
    res.status(500).json({ error: 'Failed to fetch agent activity' });
  }
});

// Get Dashboard Summary
router.get('/dashboard', (req, res) => {
  try {
    const latestHealth = healthReports[healthReports.length - 1];
    const recentAlerts = alerts.slice(-5);
    const recentGithubEvents = githubEvents.slice(-5);
    const latestAgentActivity = agentActivity[agentActivity.length - 1];

    res.json({
      timestamp: new Date().toISOString(),
      health: latestHealth || null,
      alerts: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        recent: recentAlerts
      },
      github: {
        totalEvents: githubEvents.length,
        recent: recentGithubEvents
      },
      agents: latestAgentActivity || null
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Test Endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'N8N Webhooks API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      healthReport: 'POST /api/webhooks/n8n/health-report',
      alert: 'POST /api/webhooks/n8n/alert',
      githubEvent: 'POST /api/webhooks/n8n/github-event',
      agentActivity: 'POST /api/webhooks/n8n/agent-activity',
      latestHealth: 'GET /api/webhooks/n8n/health-report/latest',
      alerts: 'GET /api/webhooks/n8n/alerts',
      githubEvents: 'GET /api/webhooks/n8n/github-events',
      agentActivity: 'GET /api/webhooks/n8n/agent-activity',
      dashboard: 'GET /api/webhooks/n8n/dashboard'
    }
  });
});

export const n8nWebhooksRouter = router;
