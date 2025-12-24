# ActivePieces Workflow Examples

This file contains ready-to-use workflow examples that can be imported into ActivePieces. Each workflow is designed to solve common automation needs for the Wallestars project.

## 📥 How to Import

1. Copy the JSON configuration for the desired workflow
2. Open ActivePieces dashboard
3. Go to "Flows" → "Import"
4. Paste the JSON and click "Import"
5. Configure the required connections (GitHub, Slack, etc.)
6. Test and publish

**Important Notes**:
- These configurations use ActivePieces' JSON-based workflow format, which supports template literals (backticks) for code blocks
- Backslashes in strings are escaped as `\\` per JSON specification
- The configurations are designed to be copy-pasted directly into ActivePieces' import function
- ActivePieces will parse and validate the configuration upon import

## Workflow 1: PR Auto-Labeler

**Purpose**: Automatically add labels to pull requests based on the files changed

**Triggers**: When a pull request is opened or updated

**Benefits**:
- Consistent labeling across all PRs
- Easier filtering and searching
- Better project organization
- Time savings on manual labeling

```json
{
  "name": "PR Auto-Labeler",
  "description": "Automatically label PRs based on file changes",
  "trigger": {
    "type": "PIECE_TRIGGER",
    "settings": {
      "pieceName": "github",
      "pieceVersion": "latest",
      "triggerName": "pull_request",
      "input": {
        "repo": "Wallesters-org/Wallestars",
        "events": ["opened", "synchronize"]
      }
    }
  },
  "actions": [
    {
      "name": "Analyze Files",
      "type": "CODE",
      "settings": {
        "input": {
          "files": "{{trigger.pull_request.changed_files}}"
        },
        "code": `
          const files = inputs.files || [];
          const labels = [];
          
          // Documentation changes
          if (files.some(f => f.filename.endsWith('.md'))) {
            labels.push('documentation');
          }
          
          // Configuration files
          if (files.some(f => f.filename.match(/\\.(yml|yaml|json|toml)$/))) {
            labels.push('configuration');
          }
          
          // Code changes
          if (files.some(f => f.filename.match(/\\.(js|ts|jsx|tsx|py|go|java)$/))) {
            labels.push('code');
          }
          
          // Test files
          if (files.some(f => f.filename.includes('test') || f.filename.includes('spec'))) {
            labels.push('testing');
          }
          
          // CI/CD files
          if (files.some(f => f.filename.includes('.github/workflows'))) {
            labels.push('ci/cd');
          }
          
          return { labels: labels };
        `
      }
    },
    {
      "name": "Add Labels",
      "type": "PIECE",
      "settings": {
        "pieceName": "github",
        "actionName": "add_labels",
        "input": {
          "repo": "Wallesters-org/Wallestars",
          "issue_number": "{{trigger.pull_request.number}}",
          "labels": "{{steps.analyze_files.output.labels}}"
        }
      }
    }
  ]
}
```

## Workflow 2: New Issue Notifier

**Purpose**: Send Slack notification when a new issue is created

**Triggers**: When a GitHub issue is opened

**Benefits**:
- Immediate team awareness
- Faster response times
- Centralized notifications
- Reduced email clutter

```json
{
  "name": "New Issue Notifier",
  "description": "Notify team on Slack when new issues are created",
  "trigger": {
    "type": "PIECE_TRIGGER",
    "settings": {
      "pieceName": "github",
      "pieceVersion": "latest",
      "triggerName": "issue",
      "input": {
        "repo": "Wallesters-org/Wallestars",
        "events": ["opened"]
      }
    }
  },
  "actions": [
    {
      "name": "Format Message",
      "type": "CODE",
      "settings": {
        "input": {
          "issue": "{{trigger.issue}}"
        },
        "code": `
          const issue = inputs.issue;
          const message = {
            text: "🔔 New Issue Created",
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "🔔 New Issue Created"
                }
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: "*Title:*\\n" + issue.title
                  },
                  {
                    type: "mrkdwn",
                    text: "*Number:*\\n#" + issue.number
                  },
                  {
                    type: "mrkdwn",
                    text: "*Author:*\\n" + issue.user.login
                  },
                  {
                    type: "mrkdwn",
                    text: "*Labels:*\\n" + (issue.labels.map(l => l.name).join(', ') || 'None')
                  }
                ]
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*Description:*\\n" + (issue.body || 'No description provided').substring(0, 200)
                }
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: "View Issue"
                    },
                    url: issue.html_url
                  }
                ]
              }
            ]
          };
          return message;
        `
      }
    },
    {
      "name": "Send to Slack",
      "type": "PIECE",
      "settings": {
        "pieceName": "slack",
        "actionName": "send_message",
        "input": {
          "channel": "#wallestars-issues",
          "text": "{{steps.format_message.output.text}}",
          "blocks": "{{steps.format_message.output.blocks}}"
        }
      }
    }
  ]
}
```

## Workflow 3: PR Review Reminder

**Purpose**: Send reminder if PR hasn't been reviewed within 24 hours

**Triggers**: When a PR review is requested

**Benefits**:
- Prevents PRs from going stale
- Improves review turnaround time
- Reduces merge bottlenecks
- Better team accountability

```json
{
  "name": "PR Review Reminder",
  "description": "Remind reviewers about pending PR reviews",
  "trigger": {
    "type": "PIECE_TRIGGER",
    "settings": {
      "pieceName": "github",
      "pieceVersion": "latest",
      "triggerName": "pull_request_review",
      "input": {
        "repo": "Wallesters-org/Wallestars",
        "events": ["review_requested"]
      }
    }
  },
  "actions": [
    {
      "name": "Wait 24 Hours",
      "type": "DELAY",
      "settings": {
        "duration": 86400
      }
    },
    {
      "name": "Check PR Status",
      "type": "PIECE",
      "settings": {
        "pieceName": "github",
        "actionName": "get_pull_request",
        "input": {
          "repo": "Wallesters-org/Wallestars",
          "pull_number": "{{trigger.pull_request.number}}"
        }
      }
    },
    {
      "name": "Check If Still Needs Review",
      "type": "BRANCH",
      "settings": {
        "conditions": [
          {
            "firstValue": "{{steps.check_pr_status.output.review_state}}",
            "operator": "EQUALS",
            "secondValue": "PENDING"
          }
        ]
      },
      "onSuccess": [
        {
          "name": "Send Reminder",
          "type": "PIECE",
          "settings": {
            "pieceName": "slack",
            "actionName": "send_direct_message",
            "input": {
              "user": "{{trigger.requested_reviewer.login}}",
              "text": "⏰ Reminder: PR review pending for '{{trigger.pull_request.title}}'\n{{trigger.pull_request.html_url}}"
            }
          }
        }
      ]
    }
  ]
}
```

## Workflow 4: Build Status Notifier

**Purpose**: Notify team about build success or failure

**Triggers**: When a GitHub Actions workflow completes

**Benefits**:
- Immediate build feedback
- Faster issue resolution
- Better deployment awareness
- Reduced manual checking

```json
{
  "name": "Build Status Notifier",
  "description": "Notify team about build results",
  "trigger": {
    "type": "PIECE_TRIGGER",
    "settings": {
      "pieceName": "github",
      "pieceVersion": "latest",
      "triggerName": "workflow_run",
      "input": {
        "repo": "Wallesters-org/Wallestars",
        "events": ["completed"]
      }
    }
  },
  "actions": [
    {
      "name": "Format Build Message",
      "type": "CODE",
      "settings": {
        "input": {
          "workflow": "{{trigger.workflow_run}}"
        },
        "code": `
          const workflow = inputs.workflow;
          const isSuccess = workflow.conclusion === 'success';
          const emoji = isSuccess ? '✅' : '❌';
          const color = isSuccess ? '#36a64f' : '#ff0000';
          
          return {
            emoji: emoji,
            color: color,
            status: workflow.conclusion.toUpperCase(),
            message: emoji + ' Build ' + workflow.conclusion.toUpperCase() + '\\n' +
                     'Workflow: ' + workflow.name + '\\n' +
                     'Branch: ' + workflow.head_branch + '\\n' +
                     'Commit: ' + workflow.head_sha.substring(0, 7) + '\\n' +
                     workflow.html_url
          };
        `
      }
    },
    {
      "name": "Send Notification",
      "type": "PIECE",
      "settings": {
        "pieceName": "slack",
        "actionName": "send_message",
        "input": {
          "channel": "#builds",
          "text": "{{steps.format_build_message.output.message}}",
          "attachments": [
            {
              "color": "{{steps.format_build_message.output.color}}",
              "title": "Build {{steps.format_build_message.output.status}}",
              "title_link": "{{trigger.workflow_run.html_url}}"
            }
          ]
        }
      }
    }
  ]
}
```

## Workflow 5: Daily Activity Digest

**Purpose**: Send daily summary of repository activity

**Triggers**: Daily at 9 AM (scheduled)

**Benefits**:
- Team stays informed
- No need to manually check GitHub
- Consolidated information
- Historical activity tracking

```json
{
  "name": "Daily Activity Digest",
  "description": "Send daily digest of repository activity",
  "trigger": {
    "type": "SCHEDULE",
    "settings": {
      "cron": "0 9 * * 1-5",
      "timezone": "UTC"
    }
  },
  "actions": [
    {
      "name": "Get Recent Activity",
      "type": "PIECE",
      "settings": {
        "pieceName": "github",
        "actionName": "search_issues",
        "input": {
          "repo": "Wallesters-org/Wallestars",
          "query": "updated:>={{date.now.subtract.days(1)}}"
        }
      }
    },
    {
      "name": "Get Recent PRs",
      "type": "PIECE",
      "settings": {
        "pieceName": "github",
        "actionName": "list_pull_requests",
        "input": {
          "repo": "Wallesters-org/Wallestars",
          "state": "all",
          "sort": "updated",
          "direction": "desc"
        }
      }
    },
    {
      "name": "Generate Digest",
      "type": "CODE",
      "settings": {
        "input": {
          "issues": "{{steps.get_recent_activity.output}}",
          "prs": "{{steps.get_recent_prs.output}}"
        },
        "code": `
          const issues = inputs.issues || [];
          const prs = inputs.prs || [];
          
          const newIssues = issues.filter(i => !i.pull_request);
          const closedIssues = newIssues.filter(i => i.state === 'closed');
          const mergedPRs = prs.filter(p => p.merged_at);
          const openPRs = prs.filter(p => p.state === 'open');
          
          const digest = \`
📊 *Wallestars Daily Digest*

📝 *Issues*
• New: \${newIssues.length}
• Closed: \${closedIssues.length}

🔀 *Pull Requests*
• Merged: \${mergedPRs.length}
• Open: \${openPRs.length}

\${mergedPRs.length > 0 ? '\\n*Recently Merged:*\\n' + mergedPRs.slice(0, 3).map(p => \`• #\${p.number}: \${p.title}\`).join('\\n') : ''}

\${newIssues.length > 0 ? '\\n*New Issues:*\\n' + newIssues.slice(0, 3).map(i => \`• #\${i.number}: \${i.title}\`).join('\\n') : ''}
          \`.trim();
          
          return { digest: digest };
        `
      }
    },
    {
      "name": "Send Digest",
      "type": "PIECE",
      "settings": {
        "pieceName": "slack",
        "actionName": "send_message",
        "input": {
          "channel": "#general",
          "text": "{{steps.generate_digest.output.digest}}"
        }
      }
    }
  ]
}
```

## Workflow 6: Release Announcer

**Purpose**: Announce new releases across multiple channels

**Triggers**: When a GitHub release is published

**Benefits**:
- Automated release communication
- Consistent messaging
- Multi-channel distribution
- Professional presentation

```json
{
  "name": "Release Announcer",
  "description": "Announce new releases to team and stakeholders",
  "trigger": {
    "type": "PIECE_TRIGGER",
    "settings": {
      "pieceName": "github",
      "pieceVersion": "latest",
      "triggerName": "release",
      "input": {
        "repo": "Wallesters-org/Wallestars",
        "events": ["published"]
      }
    }
  },
  "actions": [
    {
      "name": "Format Announcement",
      "type": "CODE",
      "settings": {
        "input": {
          "release": "{{trigger.release}}"
        },
        "code": `
          const release = inputs.release;
          return {
            slackMessage: \`🎉 *New Release: \${release.tag_name}*\\n\\n\${release.name}\\n\\n\${release.body}\\n\\n<\${release.html_url}|View Release>\`,
            emailSubject: \`Wallestars \${release.tag_name} Released\`,
            emailBody: \`
              <h1>🎉 New Release: \${release.tag_name}</h1>
              <h2>\${release.name}</h2>
              <p>\${release.body.replace(/\\n/g, '<br>')}</p>
              <p><a href="\${release.html_url}">View Full Release Notes</a></p>
            \`
          };
        `
      }
    },
    {
      "name": "Notify on Slack",
      "type": "PIECE",
      "settings": {
        "pieceName": "slack",
        "actionName": "send_message",
        "input": {
          "channel": "#announcements",
          "text": "{{steps.format_announcement.output.slackMessage}}"
        }
      }
    },
    {
      "name": "Send Email",
      "type": "PIECE",
      "settings": {
        "pieceName": "gmail",
        "actionName": "send_email",
        "input": {
          "to": "team@wallestars.com",
          "subject": "{{steps.format_announcement.output.emailSubject}}",
          "body": "{{steps.format_announcement.output.emailBody}}",
          "body_type": "html"
        }
      }
    }
  ]
}
```

## Workflow 7: Login Success Tracker

**Purpose**: Track and notify on successful user logins with security monitoring

**Triggers**: Webhook endpoint receives login success event

**Benefits**:
- Real-time login tracking
- Security anomaly detection
- User activity monitoring
- Automated notifications

```json
{
  "name": "Login Success Tracker",
  "description": "Track successful logins and detect suspicious activity",
  "trigger": {
    "type": "WEBHOOK",
    "settings": {
      "method": "POST",
      "path": "/login-success"
    }
  },
  "actions": [
    {
      "name": "Extract Login Data",
      "type": "CODE",
      "settings": {
        "input": {
          "loginData": "{{trigger.body}}"
        },
        "code": `
          const login = inputs.loginData;
          const timestamp = new Date().toISOString();
          
          return {
            userId: login.userId || 'unknown',
            username: login.username || 'unknown',
            timestamp: timestamp,
            ipAddress: login.ipAddress || 'unknown',
            device: login.device || 'unknown',
            location: login.location || 'unknown',
            loginMethod: login.loginMethod || 'password'
          };
        `
      }
    },
    {
      "name": "Analyze Login Pattern",
      "type": "CODE",
      "settings": {
        "input": {
          "loginInfo": "{{steps.extract_login_data.output}}"
        },
        "code": `
          const info = inputs.loginInfo;
          let isSuspicious = false;
          let alerts = [];
          
          // Check login time (suspicious if between 2 AM - 5 AM)
          const hour = new Date().getHours();
          if (hour >= 2 && hour <= 5) {
            isSuspicious = true;
            alerts.push('Login during unusual hours');
          }
          
          // Check for unknown location (placeholder - implement with actual location tracking)
          if (info.location.toLowerCase().includes('unknown')) {
            alerts.push('Unknown location detected');
          }
          
          return {
            isSuspicious: isSuspicious,
            alertLevel: isSuspicious ? 'warning' : 'info',
            alerts: alerts,
            loginInfo: info
          };
        `
      }
    },
    {
      "name": "Send Login Notification",
      "type": "PIECE",
      "settings": {
        "pieceName": "slack",
        "actionName": "send_message",
        "input": {
          "channel": "#user-activity",
          "text": "✅ Login Successful\\n*User:* {{steps.extract_login_data.output.username}}\\n*Time:* {{steps.extract_login_data.output.timestamp}}\\n*IP:* {{steps.extract_login_data.output.ipAddress}}\\n*Device:* {{steps.extract_login_data.output.device}}"
        }
      }
    },
    {
      "name": "Check for Security Alerts",
      "type": "BRANCH",
      "settings": {
        "conditions": [
          {
            "firstValue": "{{steps.analyze_login_pattern.output.isSuspicious}}",
            "operator": "EQUALS",
            "secondValue": true
          }
        ]
      },
      "onSuccess": [
        {
          "name": "Send Security Alert",
          "type": "PIECE",
          "settings": {
            "pieceName": "slack",
            "actionName": "send_message",
            "input": {
              "channel": "#security-alerts",
              "text": "⚠️ SUSPICIOUS LOGIN DETECTED\\n*User:* {{steps.extract_login_data.output.username}}\\n*IP:* {{steps.extract_login_data.output.ipAddress}}\\n*Alerts:* {{steps.analyze_login_pattern.output.alerts}}\\n*Time:* {{steps.extract_login_data.output.timestamp}}"
            }
          }
        }
      ]
    }
  ]
}
```

## Workflow 8: Failed Login Monitor

**Purpose**: Monitor failed login attempts and prevent brute force attacks

**Triggers**: Webhook endpoint receives failed login event

**Benefits**:
- Brute force attack prevention
- Account lockout automation
- Security incident tracking
- Real-time threat detection

```json
{
  "name": "Failed Login Monitor",
  "description": "Monitor and respond to failed login attempts",
  "trigger": {
    "type": "WEBHOOK",
    "settings": {
      "method": "POST",
      "path": "/login-failed"
    }
  },
  "actions": [
    {
      "name": "Process Failed Login",
      "type": "CODE",
      "settings": {
        "input": {
          "failureData": "{{trigger.body}}"
        },
        "code": `
          const failure = inputs.failureData;
          
          return {
            userId: failure.userId || 'unknown',
            username: failure.username || 'unknown',
            timestamp: new Date().toISOString(),
            ipAddress: failure.ipAddress || 'unknown',
            reason: failure.reason || 'Invalid credentials',
            attemptNumber: failure.attemptNumber || 1,
            maxAttempts: 5
          };
        `
      }
    },
    {
      "name": "Evaluate Threat Level",
      "type": "CODE",
      "settings": {
        "input": {
          "failureInfo": "{{steps.process_failed_login.output}}"
        },
        "code": `
          const info = inputs.failureInfo;
          const shouldLock = info.attemptNumber >= info.maxAttempts;
          const attemptsRemaining = Math.max(0, info.maxAttempts - info.attemptNumber);
          
          let threatLevel = 'low';
          if (info.attemptNumber >= 3) threatLevel = 'medium';
          if (info.attemptNumber >= 4) threatLevel = 'high';
          if (shouldLock) threatLevel = 'critical';
          
          return {
            shouldLock: shouldLock,
            attemptsRemaining: attemptsRemaining,
            threatLevel: threatLevel,
            failureInfo: info
          };
        `
      }
    },
    {
      "name": "Log Failed Attempt",
      "type": "PIECE",
      "settings": {
        "pieceName": "slack",
        "actionName": "send_message",
        "input": {
          "channel": "#security-logs",
          "text": "❌ Failed Login Attempt\\n*User:* {{steps.process_failed_login.output.username}}\\n*IP:* {{steps.process_failed_login.output.ipAddress}}\\n*Attempt:* {{steps.process_failed_login.output.attemptNumber}}/{{steps.process_failed_login.output.maxAttempts}}\\n*Threat Level:* {{steps.evaluate_threat_level.output.threatLevel}}"
        }
      }
    },
    {
      "name": "Handle Account Lockout",
      "type": "BRANCH",
      "settings": {
        "conditions": [
          {
            "firstValue": "{{steps.evaluate_threat_level.output.shouldLock}}",
            "operator": "EQUALS",
            "secondValue": true
          }
        ]
      },
      "onSuccess": [
        {
          "name": "Send Critical Alert",
          "type": "PIECE",
          "settings": {
            "pieceName": "slack",
            "actionName": "send_message",
            "input": {
              "channel": "#security-alerts",
              "text": "🔒 ACCOUNT LOCKED\\n*User:* {{steps.process_failed_login.output.username}}\\n*Reason:* Maximum failed login attempts reached\\n*IP:* {{steps.process_failed_login.output.ipAddress}}\\n*Total Attempts:* {{steps.process_failed_login.output.attemptNumber}}\\n*Action Required:* Manual unlock needed"
            }
          }
        },
        {
          "name": "Email User About Lockout",
          "type": "PIECE",
          "settings": {
            "pieceName": "gmail",
            "actionName": "send_email",
            "input": {
              "to": "{{steps.process_failed_login.output.email}}",
              "subject": "Account Locked - Security Alert",
              "body": "Your Wallestars account has been locked due to multiple failed login attempts. Please contact support@wallestars.com to unlock your account and verify your identity.",
              "body_type": "text"
            }
          }
        }
      ]
    }
  ]
}
```

## Workflow 9: Session Activity Monitor

**Purpose**: Monitor active user sessions and detect anomalies

**Triggers**: Schedule (runs every 5 minutes)

**Benefits**:
- Concurrent session detection
- Inactive session cleanup
- Session hijacking prevention
- Resource optimization

```json
{
  "name": "Session Activity Monitor",
  "description": "Monitor and manage active user sessions",
  "trigger": {
    "type": "SCHEDULE",
    "settings": {
      "cron": "*/5 * * * *",
      "timezone": "UTC"
    }
  },
  "actions": [
    {
      "name": "Get Active Sessions",
      "type": "CODE",
      "settings": {
        "code": `
          // In production, fetch from session database
          // This is a mock implementation
          const activeSessions = [
            {
              sessionId: 'sess_001',
              userId: 'user_123',
              username: 'john.doe',
              startTime: new Date(Date.now() - 3600000).toISOString(),
              lastActivity: new Date(Date.now() - 300000).toISOString(),
              ipAddress: '192.168.1.1'
            },
            {
              sessionId: 'sess_002',
              userId: 'user_123',
              username: 'john.doe',
              startTime: new Date(Date.now() - 1800000).toISOString(),
              lastActivity: new Date().toISOString(),
              ipAddress: '10.0.0.1'
            }
          ];
          
          return { sessions: activeSessions };
        `
      }
    },
    {
      "name": "Analyze Sessions",
      "type": "CODE",
      "settings": {
        "input": {
          "sessions": "{{steps.get_active_sessions.output.sessions}}"
        },
        "code": `
          const sessions = inputs.sessions || [];
          const now = Date.now();
          const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
          
          // Find inactive sessions
          const inactiveSessions = sessions.filter(s => {
            const lastActivity = new Date(s.lastActivity).getTime();
            return (now - lastActivity) > inactiveThreshold;
          });
          
          // Find concurrent sessions (same user, different IPs)
          const userSessions = {};
          sessions.forEach(s => {
            if (!userSessions[s.userId]) userSessions[s.userId] = [];
            userSessions[s.userId].push(s);
          });
          
          const concurrentSessions = [];
          Object.entries(userSessions).forEach(([userId, userSessionList]) => {
            if (userSessionList.length > 1) {
              const uniqueIPs = new Set(userSessionList.map(s => s.ipAddress));
              if (uniqueIPs.size > 1) {
                concurrentSessions.push({
                  userId: userId,
                  username: userSessionList[0].username,
                  sessionCount: userSessionList.length,
                  ipAddresses: Array.from(uniqueIPs)
                });
              }
            }
          });
          
          return {
            totalSessions: sessions.length,
            inactiveSessions: inactiveSessions,
            concurrentSessions: concurrentSessions,
            hasAlerts: inactiveSessions.length > 0 || concurrentSessions.length > 0
          };
        `
      }
    },
    {
      "name": "Send Session Report",
      "type": "BRANCH",
      "settings": {
        "conditions": [
          {
            "firstValue": "{{steps.analyze_sessions.output.hasAlerts}}",
            "operator": "EQUALS",
            "secondValue": true
          }
        ]
      },
      "onSuccess": [
        {
          "name": "Alert About Anomalies",
          "type": "PIECE",
          "settings": {
            "pieceName": "slack",
            "actionName": "send_message",
            "input": {
              "channel": "#security-alerts",
              "text": "📊 Session Activity Alert\\n*Total Active Sessions:* {{steps.analyze_sessions.output.totalSessions}}\\n*Inactive Sessions:* {{steps.analyze_sessions.output.inactiveSessions.length}}\\n*Concurrent Sessions Detected:* {{steps.analyze_sessions.output.concurrentSessions.length}}\\n*Action:* Review and terminate suspicious sessions"
            }
          }
        }
      ]
    }
  ]
}
```

## 🔧 Configuration Notes

### Required Connections

Before using these workflows, set up the following connections in ActivePieces:

1. **GitHub**
   - Personal Access Token or GitHub App
   - Permissions: repo, workflow, issues

2. **Slack**
   - OAuth Token
   - Scopes: chat:write, channels:read, users:read

3. **Gmail** (optional, for email workflows)
   - OAuth 2.0 credentials
   - Scopes: send email

### Customization Tips

1. **Replace Repository**: Update "Wallesters-org/Wallestars" with your actual repository
2. **Channel Names**: Update Slack channel names to match your workspace
3. **Timing**: Adjust delay and schedule settings as needed
4. **Labels**: Customize label names to match your project
5. **Messages**: Modify message formats and content

### Testing

Before deploying workflows to production:

1. Create a test flow with same configuration
2. Use a test Slack channel
3. Verify all triggers fire correctly
4. Check that all actions execute as expected
5. Validate message formatting
6. Test error handling

## 📊 Monitoring

Track workflow performance:

- **Success Rate**: Aim for 95%+ success rate
- **Execution Time**: Monitor for performance issues
- **Error Logs**: Review and fix recurring errors
- **Usage Metrics**: Identify most valuable workflows

## 🔄 Maintenance

Regular maintenance tasks:

- Review logs weekly
- Update workflows based on feedback
- Test after GitHub API changes
- Optimize for performance
- Archive unused workflows

---

**Need Help?**
- Documentation: https://www.activepieces.com/docs
- Community: https://discord.gg/activepieces
- Examples: https://cloud.activepieces.com/explore
