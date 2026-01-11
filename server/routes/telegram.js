import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Message categories as per specification
const MESSAGE_CATEGORIES = {
  GITHUB_CONTENT: {
    id: 'GITHUB_CONTENT',
    name: 'GitHub Content',
    icon: '🔗',
    description: 'GitHub repository links, PRs, issues, commits, discussions',
    keywords: ['github.com', 'pull request', 'issue', 'commit', 'repository']
  },
  PROJECT_UPDATES: {
    id: 'PROJECT_UPDATES',
    name: 'Project Updates',
    icon: '📊',
    description: 'Wallestars project news, milestones, features, bug fixes',
    keywords: ['wallestars', 'project', 'update', 'milestone', 'feature', 'bug']
  },
  URLS_AND_LINKS: {
    id: 'URLS_AND_LINKS',
    name: 'URLs and Links',
    icon: '🌐',
    description: 'External URLs, documentation, resources, tools',
    keywords: ['http', 'https', 'www', 'documentation', 'resource']
  },
  FOLDERS_STRUCTURE: {
    id: 'FOLDERS_STRUCTURE',
    name: 'Folders Structure',
    icon: '📁',
    description: 'Folder organization, file structure, directory listings',
    keywords: ['folder', 'directory', 'file', 'structure', 'path']
  },
  FORWARDED_MESSAGES: {
    id: 'FORWARDED_MESSAGES',
    name: 'Forwarded Messages',
    icon: '➡️',
    description: 'Cross-forwarded content, channel references, message chains',
    keywords: ['forwarded', 'from', 'channel', 'shared']
  },
  CONTACTS_INFO: {
    id: 'CONTACTS_INFO',
    name: 'Contacts Info',
    icon: '👤',
    description: 'Phone numbers, emails, social profiles, team members',
    keywords: ['phone', 'email', '@', 'contact', 'tel:', 'mailto:']
  },
  TECHNICAL_RESOURCES: {
    id: 'TECHNICAL_RESOURCES',
    name: 'Technical Resources',
    icon: '🛠️',
    description: 'Code snippets, configs, setup guides, API docs',
    keywords: ['code', 'config', 'api', 'setup', 'install', 'command']
  },
  NOTES_AND_TODOS: {
    id: 'NOTES_AND_TODOS',
    name: 'Notes and TODOs',
    icon: '✅',
    description: 'Reminders, action items, checkpoints, decisions',
    keywords: ['todo', 'reminder', 'note', 'action', 'task', 'decision']
  },
  ARCHIVED_CONTENT: {
    id: 'ARCHIVED_CONTENT',
    name: 'Archived Content',
    icon: '📦',
    description: 'Old/obsolete information, historical references, deprecated links',
    keywords: ['old', 'archived', 'deprecated', 'obsolete', 'historical']
  },
  OTHER: {
    id: 'OTHER',
    name: 'Other',
    icon: '🔲',
    description: 'Uncategorized messages, mixed content',
    keywords: []
  }
};

// Priority levels
const PRIORITY_LEVELS = {
  CRITICAL: { level: 'CRITICAL', color: '🔴', description: 'Requires immediate action' },
  HIGH: { level: 'HIGH', color: '🟡', description: 'Important, process this week' },
  MEDIUM: { level: 'MEDIUM', color: '🟢', description: 'Normal priority' },
  LOW: { level: 'LOW', color: '🔵', description: 'Can be archived' }
};

// GET categories endpoint
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: Object.values(MESSAGE_CATEGORIES),
    priorities: Object.values(PRIORITY_LEVELS)
  });
});

// Helper function to analyze a single message (extracted for reuse)
async function analyzeSingleMessage(message, content, timestamp, sender) {
  if (!content) {
    throw new Error('Message content is required');
  }

  // Use Claude AI to classify the message
  const classificationPrompt = `You are a message classification expert. Analyze the following Telegram message and classify it into one of these categories:

${Object.entries(MESSAGE_CATEGORIES).map(([key, cat]) => 
  `- ${key}: ${cat.description}`
).join('\n')}

Also determine:
1. Priority level: CRITICAL, HIGH, MEDIUM, or LOW
2. Extract any GitHub references (repository names, issue numbers, PR numbers)
3. Extract any action items or TODO items
4. Extract any URLs or links
5. Extract any contact information (emails, phones)

Message to analyze:
---
${content}
---

Respond in JSON format with this exact structure:
{
  "category": "CATEGORY_NAME",
  "priority": "PRIORITY_LEVEL",
  "confidence": 0.95,
  "tags": ["tag1", "tag2"],
  "github_references": [],
  "action_items": [],
  "urls": [],
  "contacts": [],
  "summary": "Brief summary of the message"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: classificationPrompt
    }]
  });

  // Parse Claude's response
  const analysisText = response.content[0].text;
  let analysis;
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      analysis = JSON.parse(analysisText);
    }
  } catch (parseError) {
    // Fallback to basic classification
    analysis = {
      category: 'OTHER',
      priority: 'MEDIUM',
      confidence: 0.5,
      tags: [],
      github_references: [],
      action_items: [],
      urls: [],
      contacts: [],
      summary: 'Could not parse AI response',
      raw_response: analysisText
    };
  }

  return {
    success: true,
    message_id: message?.id || null,
    timestamp: timestamp || new Date().toISOString(),
    sender: sender || 'unknown',
    analysis
  };
}

// POST analyze message endpoint - classify a single message using Claude AI
router.post('/analyze-message', async (req, res) => {
  try {
    const { message, content, timestamp, sender } = req.body;
    const result = await analyzeSingleMessage(message, content, timestamp, sender);
    res.json(result);

  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({
      error: 'Failed to analyze message',
      details: error.message
    });
  }
});

// POST batch analyze endpoint - analyze multiple messages
router.post('/analyze-batch', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const results = [];
    const batchSize = 5; // Process 5 messages at a time

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      // Process batch in parallel by calling the analyze function directly
      const batchPromises = batch.map(msg => 
        analyzeSingleMessage(
          { id: msg.id },
          msg.content,
          msg.timestamp,
          msg.sender
        ).catch(error => ({
          success: false,
          message_id: msg.id,
          error: error.message
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    res.json({
      success: true,
      total: messages.length,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Error in batch analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze messages batch',
      details: error.message
    });
  }
});

// POST generate report endpoint
router.post('/generate-report', async (req, res) => {
  try {
    const { messages, analysis_results } = req.body;

    if (!analysis_results || !Array.isArray(analysis_results)) {
      return res.status(400).json({ error: 'Analysis results are required' });
    }

    // Calculate statistics
    const stats = {
      total_messages: analysis_results.length,
      categories: {},
      priorities: {},
      github_references: [],
      action_items: [],
      urls: [],
      contacts: []
    };

    // Aggregate data
    analysis_results.forEach(result => {
      if (result.analysis) {
        const { category, priority, github_references, action_items, urls, contacts } = result.analysis;
        
        // Count categories
        stats.categories[category] = (stats.categories[category] || 0) + 1;
        
        // Count priorities
        stats.priorities[priority] = (stats.priorities[priority] || 0) + 1;
        
        // Collect unique items
        if (github_references) stats.github_references.push(...github_references);
        if (action_items) stats.action_items.push(...action_items);
        if (urls) stats.urls.push(...urls);
        if (contacts) stats.contacts.push(...contacts);
      }
    });

    // Remove duplicates
    stats.github_references = [...new Set(stats.github_references)];
    stats.action_items = [...new Set(stats.action_items)];
    stats.urls = [...new Set(stats.urls)];
    stats.contacts = [...new Set(stats.contacts)];

    // Generate markdown report
    const report = generateMarkdownReport(stats, analysis_results);

    res.json({
      success: true,
      statistics: stats,
      report_markdown: report,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      details: error.message
    });
  }
});

// Helper function to generate markdown report
function generateMarkdownReport(stats, results) {
  let report = '# Telegram Saved Messages Analysis Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `**Total Messages Analyzed:** ${stats.total_messages}\n\n`;
  
  report += '## 📊 Statistical Summary\n\n';
  
  // Category distribution
  report += '### Categories Distribution\n\n';
  Object.entries(stats.categories).forEach(([cat, count]) => {
    const percentage = ((count / stats.total_messages) * 100).toFixed(1);
    const categoryInfo = MESSAGE_CATEGORIES[cat];
    report += `- ${categoryInfo?.icon || '📄'} **${cat}**: ${count} messages (${percentage}%)\n`;
  });
  report += '\n';
  
  // Priority distribution
  report += '### Priority Distribution\n\n';
  Object.entries(stats.priorities).forEach(([priority, count]) => {
    const percentage = ((count / stats.total_messages) * 100).toFixed(1);
    const priorityInfo = PRIORITY_LEVELS[priority];
    report += `- ${priorityInfo?.color || '⚪'} **${priority}**: ${count} messages (${percentage}%)\n`;
  });
  report += '\n';
  
  // GitHub references
  if (stats.github_references.length > 0) {
    report += '### 🔗 GitHub References Found\n\n';
    stats.github_references.slice(0, 20).forEach(ref => {
      report += `- ${ref}\n`;
    });
    if (stats.github_references.length > 20) {
      report += `\n*...and ${stats.github_references.length - 20} more*\n`;
    }
    report += '\n';
  }
  
  // Action items
  if (stats.action_items.length > 0) {
    report += '### ✅ Action Items Extracted\n\n';
    stats.action_items.slice(0, 20).forEach(item => {
      report += `- [ ] ${item}\n`;
    });
    if (stats.action_items.length > 20) {
      report += `\n*...and ${stats.action_items.length - 20} more*\n`;
    }
    report += '\n';
  }
  
  // URLs
  if (stats.urls.length > 0) {
    report += '### 🌐 URLs Collected\n\n';
    report += `**Total unique URLs:** ${stats.urls.length}\n\n`;
    stats.urls.slice(0, 10).forEach(url => {
      report += `- ${url}\n`;
    });
    if (stats.urls.length > 10) {
      report += `\n*...and ${stats.urls.length - 10} more*\n`;
    }
    report += '\n';
  }
  
  // Contacts
  if (stats.contacts.length > 0) {
    report += '### 👤 Contact Information\n\n';
    report += `**Total contacts found:** ${stats.contacts.length}\n\n`;
    report += '*Contact details omitted for privacy*\n\n';
  }
  
  report += '---\n\n';
  report += '*This report was automatically generated by Wallestars Telegram Analysis System*\n';
  
  return report;
}

// POST export endpoint - export in different formats
router.post('/export', async (req, res) => {
  try {
    const { format, data } = req.body;

    if (!format || !data) {
      return res.status(400).json({ error: 'Format and data are required' });
    }

    let exportData;
    let contentType;
    let filename;

    switch (format.toLowerCase()) {
      case 'json':
        exportData = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        filename = `telegram_export_${Date.now()}.json`;
        break;

      case 'csv':
        exportData = convertToCSV(data);
        contentType = 'text/csv';
        filename = `telegram_export_${Date.now()}.csv`;
        break;

      case 'markdown':
        exportData = data.report_markdown || generateMarkdownReport(data.statistics || {}, data.results || []);
        contentType = 'text/markdown';
        filename = `telegram_report_${Date.now()}.md`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid format. Use: json, csv, or markdown' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      error: 'Failed to export data',
      details: error.message
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.results || !Array.isArray(data.results)) {
    return 'No data available';
  }

  const headers = ['Message ID', 'Timestamp', 'Sender', 'Category', 'Priority', 'Confidence', 'Tags', 'Summary'];
  const rows = [headers];

  data.results.forEach(result => {
    if (result.analysis) {
      const row = [
        result.message_id || '',
        result.timestamp || '',
        result.sender || '',
        result.analysis.category || '',
        result.analysis.priority || '',
        result.analysis.confidence || '',
        (result.analysis.tags || []).join('; '),
        result.analysis.summary || ''
      ];
      rows.push(row);
    }
  });

  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

export default router;
