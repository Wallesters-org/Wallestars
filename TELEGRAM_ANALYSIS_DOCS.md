# Telegram Message Analysis System - Documentation

## Overview

This system provides comprehensive analysis and classification of Telegram Saved Messages using Claude AI. It processes messages, categorizes them into predefined categories, extracts actionable insights, and generates detailed reports.

## Features

### 1. Message Collection & Import
- **Upload Formats**: JSON, CSV, plain text
- **Manual Input**: Add individual messages
- **Batch Processing**: Handle large message sets efficiently

### 2. AI-Powered Classification
- **Claude Sonnet 4.5**: Advanced AI model for accurate classification
- **10 Categories**:
  - 🔗 GitHub Content
  - 📊 Project Updates
  - 🌐 URLs and Links
  - 📁 Folders Structure
  - ➡️ Forwarded Messages
  - 👤 Contacts Info
  - 🛠️ Technical Resources
  - ✅ Notes and TODOs
  - 📦 Archived Content
  - 🔲 Other

### 3. Priority Classification
- 🔴 **CRITICAL**: Requires immediate action
- 🟡 **HIGH**: Important, process this week
- 🟢 **MEDIUM**: Normal priority
- 🔵 **LOW**: Can be archived

### 4. Data Extraction
- **GitHub References**: Repositories, PRs, issues, commits
- **Action Items**: TODOs, reminders, tasks
- **URLs**: External links, documentation
- **Contacts**: Emails, phone numbers, social profiles

### 5. Report Generation
- **Statistical Summary**: Category distribution, priority breakdown
- **Key Findings**: Most common message types, critical links
- **Action Items**: Extracted TODO list
- **GitHub Integration**: Repository activity tracking

### 6. Export Capabilities
- **JSON**: Structured data export
- **CSV**: Spreadsheet-compatible format
- **Markdown**: Human-readable reports

## API Endpoints

### GET /api/telegram/categories
Retrieve available categories and priority levels.

**Response:**
```json
{
  "success": true,
  "categories": [...],
  "priorities": [...]
}
```

### POST /api/telegram/analyze-message
Analyze a single message using Claude AI.

**Request:**
```json
{
  "message": { "id": 1 },
  "content": "Message text here",
  "timestamp": "2024-01-03T12:00:00.000Z",
  "sender": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message_id": 1,
  "timestamp": "2024-01-03T12:00:00.000Z",
  "sender": "user",
  "analysis": {
    "category": "GITHUB_CONTENT",
    "priority": "HIGH",
    "confidence": 0.95,
    "tags": ["github", "issue"],
    "github_references": ["Wallesters-org/Wallestars#95"],
    "action_items": ["Review PR"],
    "urls": ["https://github.com/..."],
    "contacts": [],
    "summary": "GitHub issue reference"
  }
}
```

### POST /api/telegram/analyze-batch
Analyze multiple messages in batch.

**Request:**
```json
{
  "messages": [
    {
      "id": 1,
      "content": "Message 1",
      "timestamp": "2024-01-03T12:00:00.000Z",
      "sender": "user1"
    },
    {
      "id": 2,
      "content": "Message 2",
      "timestamp": "2024-01-03T13:00:00.000Z",
      "sender": "user2"
    }
  ]
}
```

### POST /api/telegram/generate-report
Generate comprehensive analysis report.

**Request:**
```json
{
  "messages": [...],
  "analysis_results": [...]
}
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_messages": 938,
    "categories": {
      "GITHUB_CONTENT": 150,
      "PROJECT_UPDATES": 200,
      ...
    },
    "priorities": {
      "CRITICAL": 50,
      "HIGH": 200,
      ...
    },
    "github_references": [...],
    "action_items": [...],
    "urls": [...],
    "contacts": [...]
  },
  "report_markdown": "# Report content...",
  "generated_at": "2024-01-03T12:00:00.000Z"
}
```

### POST /api/telegram/export
Export data in various formats.

**Request:**
```json
{
  "format": "json|csv|markdown",
  "data": {
    "statistics": {...},
    "results": [...],
    "report_markdown": "..."
  }
}
```

**Response:** File download

## Usage Guide

### Step 1: Upload Messages
1. Navigate to "Telegram Analysis" page
2. Click "Upload" tab
3. Choose a file (JSON/CSV/TXT) or add messages manually
4. Verify messages loaded correctly

### Step 2: Review Messages
1. Click "Messages" tab
2. Review imported messages
3. Check formatting and content

### Step 3: Analyze with AI
1. Click "Analyze" tab
2. Review available categories
3. Click "Analyze with Claude AI"
4. Wait for processing (progress shown)

### Step 4: View Results
1. Click "Results" tab
2. View statistics and distributions
3. Explore category breakdown
4. Check priority classification

### Step 5: Generate Report
1. Click "Report" tab
2. Review markdown report
3. Export in desired format (JSON/CSV/Markdown)

### Step 6: Export Data
1. Choose export format
2. Click download button
3. Save file to local system

## Data Format Examples

### JSON Input Format
```json
[
  {
    "id": 1,
    "content": "Check out this GitHub repo: https://github.com/Wallesters-org/Wallestars",
    "timestamp": "2024-01-03T12:00:00.000Z",
    "sender": "user1"
  },
  {
    "id": 2,
    "content": "TODO: Review PR #95",
    "timestamp": "2024-01-03T13:00:00.000Z",
    "sender": "user2"
  }
]
```

### CSV Input Format
```csv
content,timestamp,sender
"Message content here","2024-01-03T12:00:00.000Z","user1"
"Another message","2024-01-03T13:00:00.000Z","user2"
```

## Security & Privacy

### Data Handling
- Messages are processed temporarily in memory
- No persistent storage of message content
- API key stored securely in environment variables

### Privacy Considerations
- Contact information is extracted but can be filtered
- Sensitive data should be redacted before upload
- GDPR compliance: process only with user consent

### Best Practices
1. **Review before upload**: Check for sensitive information
2. **Use secure connection**: HTTPS for API calls
3. **Limit access**: Restrict who can upload/analyze
4. **Regular cleanup**: Delete processed data when done

## Integration with Existing System

This feature integrates seamlessly with:
- **Claude AI**: Uses same API key and configuration
- **Real-time Updates**: Socket.io for progress tracking
- **UI Components**: Consistent with existing design
- **Export System**: Follows established patterns

## Performance Considerations

### Processing Speed
- Single message: ~2-5 seconds (Claude API latency)
- Batch processing: 5 messages at a time
- 938 messages: ~10-15 minutes estimated

### Optimization Tips
1. Process in batches during off-peak hours
2. Cache category definitions
3. Use parallel processing where possible
4. Implement rate limiting for API calls

## Troubleshooting

### Common Issues

**Issue: API Key Error**
- Solution: Verify `ANTHROPIC_API_KEY` in `.env` file

**Issue: Slow Processing**
- Solution: Reduce batch size or increase timeout

**Issue: Parse Error**
- Solution: Validate JSON/CSV format before upload

**Issue: Out of Memory**
- Solution: Process smaller batches or increase Node.js memory

### Error Messages

- `"Message content is required"`: Missing content field
- `"Messages array is required"`: Invalid batch format
- `"Failed to analyze message"`: Claude API error
- `"Invalid format"`: Unsupported export format

## Future Enhancements

### Planned Features
1. **Real-time Telegram Integration**: Direct API connection
2. **Advanced Filtering**: Date ranges, sender filters
3. **Custom Categories**: User-defined categories
4. **Machine Learning**: Pattern recognition improvements
5. **Collaboration**: Multi-user analysis sessions
6. **Scheduled Reports**: Automated daily/weekly reports

### Integration Possibilities
- Slack notifications for critical findings
- GitHub issue creation from action items
- Email digest of analysis results
- Calendar events from TODO items

## Support

For issues or questions:
1. Check this documentation
2. Review GitHub issues: [Wallesters-org/Wallestars](https://github.com/Wallesters-org/Wallestars)
3. Contact: Development Team

## License

This feature is part of Wallestars Control Center.
Licensed under MIT License.

---

**Last Updated**: January 2026
**Version**: 1.0.0
