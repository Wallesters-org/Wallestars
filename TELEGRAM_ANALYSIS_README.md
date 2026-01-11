# 📱 Telegram Message Analysis System

## Quick Start Guide

### 1. Access the Feature
Navigate to **Telegram Analysis** from the sidebar menu in Wallestars Control Center.

### 2. Upload Your Messages

#### Option A: Upload File
1. Click the **Upload** tab
2. Click **Choose File**
3. Select your file (JSON, CSV, or TXT format)
4. Messages will be automatically parsed and loaded

#### Option B: Manual Entry
1. Click **Add Message Manually**
2. Enter message content in the prompt
3. Message will be added to the list

### 3. Review Messages
1. Click the **Messages** tab
2. Review all loaded messages
3. Verify content and metadata

### 4. Analyze with AI
1. Click the **Analyze** tab
2. Review the 10 available categories
3. Click **Analyze with Claude AI**
4. Wait for processing (progress shown in real-time)

### 5. View Results
1. Click the **Results** tab
2. View comprehensive statistics:
   - Total messages processed
   - Category distribution
   - Priority breakdown
   - GitHub references found
   - Action items extracted
3. Explore visualizations and charts

### 6. Download Report
1. Click the **Report** tab
2. Review the generated markdown report
3. Export in your preferred format:
   - **JSON**: For programmatic access
   - **CSV**: For spreadsheet analysis
   - **Markdown**: For human-readable reports

## Sample Data

A sample file is included: `sample-telegram-messages.json`

This contains 15 example messages covering all category types:
- GitHub content
- Project updates
- URLs and links
- Technical resources
- Notes and TODOs
- Contact information
- Forwarded messages
- And more!

### Try It Out
1. Start the application: `npm run dev`
2. Navigate to Telegram Analysis
3. Upload `sample-telegram-messages.json`
4. Click "Analyze with Claude AI"
5. Explore the results!

## Message Format

### JSON Format
```json
[
  {
    "id": 1,
    "content": "Your message content here",
    "timestamp": "2024-01-03T12:00:00.000Z",
    "sender": "username"
  }
]
```

### CSV Format
```csv
content,timestamp,sender
"Message 1","2024-01-03T12:00:00.000Z","user1"
"Message 2","2024-01-03T13:00:00.000Z","user2"
```

### Plain Text
Any plain text file will be treated as a single message.

## Categories

The system classifies messages into 10 categories:

1. **🔗 GitHub Content** - Repository links, PRs, issues, commits
2. **📊 Project Updates** - Wallestars project news, milestones, features
3. **🌐 URLs and Links** - External URLs, documentation, resources
4. **📁 Folders Structure** - File organization, directory listings
5. **➡️ Forwarded Messages** - Cross-forwarded content, channels
6. **👤 Contacts Info** - Phone numbers, emails, social profiles
7. **🛠️ Technical Resources** - Code snippets, configs, API docs
8. **✅ Notes and TODOs** - Reminders, action items, tasks
9. **📦 Archived Content** - Old/obsolete information
10. **🔲 Other** - Uncategorized messages

## Priority Levels

Each message is assigned a priority:

- 🔴 **CRITICAL** - Requires immediate action
- 🟡 **HIGH** - Important, process this week
- 🟢 **MEDIUM** - Normal priority
- 🔵 **LOW** - Can be archived

## Extracted Data

The system automatically extracts:

- **GitHub References**: `Wallesters-org/Wallestars#95`
- **Action Items**: TODO tasks and reminders
- **URLs**: All links in messages
- **Contacts**: Email addresses and phone numbers

## Export Formats

### JSON Export
Complete structured data with all analysis results.

### CSV Export
Spreadsheet-compatible format with columns:
- Message ID
- Timestamp
- Sender
- Category
- Priority
- Confidence
- Tags
- Summary

### Markdown Export
Human-readable report with:
- Statistical summary
- Category distribution
- Priority breakdown
- GitHub references
- Action items
- URLs collected

## Tips & Best Practices

### Data Preparation
1. **Clean your data**: Remove sensitive information before upload
2. **Format correctly**: Use valid JSON or CSV format
3. **Include metadata**: Timestamps and senders help with analysis

### Processing Large Datasets
1. **Be patient**: Processing 938 messages takes 10-15 minutes
2. **Monitor progress**: Real-time progress bar shows status
3. **Process in batches**: Consider splitting very large datasets

### Privacy & Security
1. **Review before upload**: Check for sensitive data
2. **Use secure connection**: Always use HTTPS in production
3. **Delete after use**: Remove processed data when done
4. **GDPR compliance**: Process only with appropriate consent

## Troubleshooting

### "No messages loaded"
- Verify file format (JSON/CSV/TXT)
- Check file content is valid
- Try manual input to test

### "Analysis failed"
- Ensure `ANTHROPIC_API_KEY` is set in `.env`
- Check API key is valid and has credit
- Verify internet connection

### "Export failed"
- Ensure analysis is complete
- Check browser allows downloads
- Try different export format

### Slow processing
- Normal for large datasets
- Claude AI takes 2-5 seconds per message
- Consider processing during off-peak hours

## API Usage

### Direct API Calls

Analyze a single message:
```bash
curl -X POST http://localhost:3000/api/telegram/analyze-message \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check issue #95 on GitHub",
    "timestamp": "2024-01-03T12:00:00.000Z",
    "sender": "user1"
  }'
```

Generate report:
```bash
curl -X POST http://localhost:3000/api/telegram/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [...],
    "analysis_results": [...]
  }'
```

Export data:
```bash
curl -X POST http://localhost:3000/api/telegram/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "data": {...}
  }' \
  -o export.json
```

## Integration

### With Claude Desktop
The Telegram analysis feature is available through the MCP protocol when using Claude Desktop integration.

### With Other Systems
Use the REST API endpoints to integrate with:
- Automation scripts
- CI/CD pipelines
- Other analysis tools
- Dashboard systems

## Performance

### Expected Processing Times
- **15 messages**: ~1-2 minutes
- **100 messages**: ~5-10 minutes
- **938 messages**: ~15-30 minutes

### Resource Usage
- **Memory**: ~100MB for 1000 messages
- **CPU**: Low (mostly waiting for API)
- **Network**: ~50KB per message (API calls)

## Support & Feedback

### Documentation
- **Full Docs**: See `TELEGRAM_ANALYSIS_DOCS.md`
- **Architecture**: See `ARCHITECTURE.md`
- **API Guide**: See documentation above

### Getting Help
1. Check documentation first
2. Review sample data and examples
3. Check GitHub issues
4. Contact development team

### Reporting Issues
When reporting issues, include:
- Error message
- Sample data (without sensitive info)
- Steps to reproduce
- Expected vs actual behavior

## Future Enhancements

### Planned Features
- Real-time Telegram API integration
- Custom category definitions
- Advanced filtering options
- Scheduled automated reports
- Multi-user collaboration
- Machine learning improvements

### Suggestions Welcome
Have ideas for improvements? Open an issue on GitHub!

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintained by**: Wallestars Development Team
