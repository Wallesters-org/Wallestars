import axios from 'axios';

/**
 * Slack Notifier Service
 *
 * Sends VPS health reports and alerts to Slack channels
 * using Slack Incoming Webhooks.
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || '#vps-health';

/**
 * Send a message to Slack via webhook
 */
async function sendToSlack(payload) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return null;
  }

  try {
    const response = await axios.post(SLACK_WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
    return null;
  }
}

/**
 * Format and send a VPS health check report to Slack
 */
export async function sendHealthCheck({ disk, memory, cpu, dockerStatus, timestamp }) {
  const allHealthy = disk < 80 && memory < 80 && cpu < 2.0 && dockerStatus === 'active';
  const statusEmoji = allHealthy ? ':white_check_mark:' : ':warning:';
  const statusText = allHealthy ? 'VPS Health Check' : 'VPS Health Warning';

  const payload = {
    text: `${statusEmoji} ${statusText}\n\n:bar_chart: Disk: ${disk}%\n:floppy_disk: Memory: ${memory}%\n:zap: CPU: ${cpu}\n:whale: Docker: ${dockerStatus}\n\n:alarm_clock: ${timestamp || new Date().toISOString()}`
  };

  return sendToSlack(payload);
}

/**
 * Format and send a detailed VPS health report to Slack
 */
export async function sendHealthReport({ disk, memory, cpu, dockerStatus, uptime }) {
  const payload = {
    text: `:desktop_computer: *VPS Health Report*\n\u2022 Disk: ${disk}%\n\u2022 Memory: ${memory}%\n\u2022 CPU Load: ${cpu}\n\u2022 Docker: ${dockerStatus}\n\u2022 ${uptime}`
  };

  return sendToSlack(payload);
}

/**
 * Send a critical alert to Slack with rich formatting
 */
export async function sendAlert({ severity, message, details }) {
  const severityConfig = {
    critical: { emoji: ':rotating_light:', color: '#dc3545' },
    warning: { emoji: ':warning:', color: '#ffc107' },
    info: { emoji: ':information_source:', color: '#17a2b8' }
  };

  const config = severityConfig[severity] || severityConfig.info;

  const payload = {
    attachments: [
      {
        color: config.color,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${config.emoji} VPS Alert: ${severity.toUpperCase()}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          },
          ...(details ? [{
            type: 'section',
            fields: Object.entries(details).map(([key, value]) => ({
              type: 'mrkdwn',
              text: `*${key}:*\n${value}`
            }))
          }] : []),
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `:alarm_clock: ${new Date().toISOString()}`
              }
            ]
          }
        ]
      }
    ]
  };

  return sendToSlack(payload);
}

/**
 * Send a full health report from the n8n webhook data
 */
export async function sendHealthReportFromWebhook(healthReport) {
  if (!healthReport) return null;

  const { overallStatus, services, resources, alerts: reportAlerts } = healthReport;

  const statusEmoji = overallStatus === 'healthy' ? ':white_check_mark:' : ':rotating_light:';
  const diskUsage = resources?.disk?.usage || 'N/A';
  const memUsage = resources?.memory?.usage || 'N/A';
  const walleStatus = services?.wallestars?.status || 'unknown';
  const n8nStatus = services?.n8n?.status || 'unknown';

  const lines = [
    `${statusEmoji} *VPS Health Report*`,
    '',
    `:bar_chart: Disk: ${diskUsage}%`,
    `:floppy_disk: Memory: ${memUsage}%`,
    `:globe_with_meridians: Wallestars: ${walleStatus}`,
    `:gear: N8N: ${n8nStatus}`,
  ];

  if (reportAlerts && reportAlerts.length > 0) {
    lines.push('', '*Alerts:*');
    reportAlerts.forEach(alert => {
      const alertEmoji = alert.severity === 'critical' ? ':rotating_light:' : ':warning:';
      lines.push(`${alertEmoji} ${alert.message}`);
    });
  }

  lines.push('', `:alarm_clock: ${healthReport.timestamp || new Date().toISOString()}`);

  return sendToSlack({ text: lines.join('\n') });
}

export default {
  sendHealthCheck,
  sendHealthReport,
  sendAlert,
  sendHealthReportFromWebhook,
  sendToSlack
};
