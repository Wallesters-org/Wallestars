# Visual Categorization Feature - Quick Start Guide

## 🎯 What is Visual Categorization?

Visual Categorization is a powerful AI-driven file organization tool integrated into Wallestars Control Center. It uses Claude AI to automatically categorize and organize your files with an intuitive visual interface powered by ToolBoxPro.

## ✨ Key Features

- **AI-Powered**: Automatic file categorization using Claude Sonnet 4.5
- **Visual Interface**: Beautiful grid and list views
- **Drag & Drop**: Easy file uploads
- **Batch Processing**: Categorize multiple files at once
- **Smart Search**: Find files quickly
- **Export Data**: Save categorization results

## 🚀 Quick Start (3 Steps)

### 1. Access the Feature

```bash
# Start Wallestars
npm run dev

# Navigate to http://localhost:5173
# Click "Visual Categorization" in the sidebar
```

### 2. Upload Files

- Click "Upload Files" button, OR
- Drag and drop files into the interface

Supported file types:
- Images: JPG, PNG, GIF, SVG, WebP
- Documents: PDF, DOC, DOCX, TXT, PPT, XLS
- Data: JSON, CSV, XML, SQL

### 3. Categorize

- Click "Auto-Categorize" button
- AI analyzes and categorizes each file
- Review results in grid or list view

## 📋 Categories

| Category | File Types |
|----------|------------|
| 📄 Documents | PDFs, Word, Excel, PowerPoint, Text |
| 🖼️ Images | Photos, Graphics, Screenshots |
| 📊 Data | JSON, CSV, XML, Databases |
| 📦 Other | Everything else |

## 🎨 Interface Features

### Toolbar
- **Upload Files** - Add new files
- **Auto-Categorize** - AI categorization
- **Export** - Download results
- **Delete (N)** - Remove selected files
- **Grid/List Toggle** - Switch views
- **Search** - Find files

### Category Sidebar
- **All Items** - View everything
- **Filter by Category** - Show specific types
- **Item Counts** - See totals

### View Modes

**Grid View** (Default)
- Visual cards with thumbnails
- Perfect for images
- Easy to browse

**List View**
- Compact rows
- More items visible
- Quick scanning

## 🔧 Configuration

### Environment Setup

```bash
# Required: Add to .env file
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional
NODE_ENV=production
PORT=3000
```

### API Endpoints

```
POST /api/categorization/classify      - Categorize single file
POST /api/categorization/batch-classify - Categorize multiple files
```

## 💡 Tips & Tricks

### Best Practices

1. **Descriptive Names**: Use clear filenames for better AI categorization
2. **Batch Upload**: Upload similar files together
3. **Review AI Suggestions**: Check AI explanations
4. **Use Search**: Find files quickly in large collections
5. **Export Regularly**: Save your organization work

### Keyboard Shortcuts

- `Ctrl+Click` - Multi-select items
- `Shift+Click` - Select range
- `Ctrl+A` - Select all (when in list view)

## 🐛 Troubleshooting

### AI Not Working?

**Problem**: Files stuck in "pending" status

**Solutions**:
1. Check API key in `.env`
2. Verify Claude API credits
3. Check console for errors
4. Fallback categorization still works

### Can't Upload Files?

**Problem**: Upload button doesn't work

**Solutions**:
1. Check file size (max 10MB by default)
2. Verify file type is supported
3. Try different browser
4. Check browser console

### UI Not Loading?

**Problem**: Blank screen or errors

**Solutions**:
1. Clear browser cache
2. Rebuild: `npm run build`
3. Check browser console
4. Verify server is running

## 📚 Documentation

Full documentation available:

- **Feature Guide**: [VISUAL_CATEGORIZATION_DOCS.md](VISUAL_CATEGORIZATION_DOCS.md)
- **Deployment**: [VISUAL_CATEGORIZATION_DEPLOYMENT.md](VISUAL_CATEGORIZATION_DEPLOYMENT.md)
- **Main README**: [README.md](README.md)

## 🎯 Use Cases

### Personal Use
- Organize photo collections
- Manage document library
- Sort downloaded files
- Archive old files

### Business Use
- Classify incoming documents
- Organize project files
- Sort customer uploads
- Manage digital assets

### Development Use
- Organize code samples
- Sort documentation
- Manage screenshots
- Classify logs and data files

## 📊 Example Workflow

### Scenario: Organizing Downloads Folder

1. **Upload** all files from Downloads
2. **Auto-Categorize** to let AI sort them
3. **Review** categorization results
4. **Adjust** any misclassified items
5. **Export** categorization data
6. **Delete** unwanted files
7. Move files to appropriate folders

### Result
- ✅ Documents in one category
- ✅ Images in another
- ✅ Data files organized
- ✅ Everything else sorted

## 🚀 Advanced Features

### Custom Categories (Coming Soon)
- Create your own categories
- Custom colors and icons
- Category templates

### Bulk Actions
- Select multiple items with checkboxes
- Apply category to all selected
- Delete multiple items at once

### Export Formats (Current)
- JSON with full metadata
- Includes AI suggestions
- Timestamp tracking

## 📞 Need Help?

1. Check documentation files
2. Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md) (if exists)
3. Open issue on GitHub
4. Contact support

## 🎓 Learning Resources

### Video Tutorials (Coming Soon)
- Basic usage walkthrough
- Advanced features demo
- Integration examples

### Sample Projects
- Example categorization exports in `/examples`
- Sample workflows
- Best practices guide

## 🔄 Updates

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ AI-powered categorization
- ✅ Grid and list views
- ✅ Multi-select
- ✅ Export functionality

### Planned (v1.1.0)
- [ ] Custom categories
- [ ] Cloud storage integration
- [ ] Advanced filtering
- [ ] Duplicate detection
- [ ] Batch rename
- [ ] Category sharing

## 🌟 Pro Tips

1. **Keep filenames descriptive** - Helps AI understand context
2. **Process in batches** - Don't upload too many at once
3. **Use categories wisely** - Adjust AI suggestions when needed
4. **Export your work** - Save categorization data regularly
5. **Clean up regularly** - Delete files you don't need

## ⚡ Performance

- **Fast AI**: Claude Sonnet 4.5 processes quickly
- **Smooth UI**: Framer Motion animations
- **Responsive**: Works on all screen sizes
- **Real-time**: Instant feedback

## 🔒 Security

- Files processed locally
- API keys never exposed
- No file storage on servers
- Secure AI communication

---

**Quick Start Guide Version**: 1.0.0  
**Last Updated**: January 2026  
**For**: Wallestars Control Center v1.0.0+

---

Ready to organize your files? Start now! 🚀
