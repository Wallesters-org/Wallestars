# Visual Categorization with ToolBoxPro

## Overview

Visual Categorization is an AI-powered file organization feature that automatically categorizes and organizes your files using Claude AI's advanced vision and reasoning capabilities. With ToolBoxPro integration, you can efficiently manage large collections of files through an intuitive visual interface.

## Features

### 🤖 AI-Powered Categorization
- **Automatic Classification**: Uses Claude Sonnet 4.5 to intelligently categorize files
- **Vision Analysis**: Analyzes image content to provide accurate categorization
- **Smart Suggestions**: Provides AI-generated explanations for categorization decisions
- **Batch Processing**: Categorize multiple files at once

### 📁 Category Management
Built-in categories include:
- **Documents**: PDFs, Word documents, spreadsheets, presentations
- **Images**: Photos, graphics, screenshots, illustrations
- **Data**: CSV files, JSON, XML, structured data
- **Other**: Miscellaneous files that don't fit standard categories

### 🎨 Visual Interface (ToolBoxPro)
- **Grid View**: Visual card-based layout with thumbnails
- **List View**: Compact list view for efficient browsing
- **Search & Filter**: Quick search and category filtering
- **Drag & Drop**: Easy file upload via drag-and-drop
- **Multi-Select**: Select and manage multiple files at once
- **Real-time Preview**: Instant image previews

### 🛠️ Advanced Tools
- **Manual Override**: Manually adjust AI categorization if needed
- **Bulk Operations**: Delete or recategorize multiple items
- **Export Functionality**: Export categorization data as JSON
- **Status Tracking**: Visual indicators for processing status

## Getting Started

### Prerequisites
- Wallestars Control Center installed and configured
- Anthropic API key set in `.env` file
- Node.js 20.x or higher

### Access the Feature

1. Start the Wallestars server:
   ```bash
   npm run dev
   ```

2. Navigate to **Visual Categorization** in the sidebar menu

3. Upload files by:
   - Clicking the "Upload Files" button
   - Dragging and dropping files into the interface

### Basic Workflow

#### 1. Upload Files
- Click **Upload Files** button or drag files into the interface
- Supported formats: Images (JPG, PNG, GIF, etc.), Documents (PDF, DOCX, etc.), Data files (JSON, CSV, etc.)

#### 2. Auto-Categorize
- Click **Auto-Categorize** button to process pending files
- AI analyzes each file and assigns appropriate categories
- View AI suggestions for each categorization decision

#### 3. Review & Adjust
- Review categorized items in grid or list view
- Use the category dropdown to manually adjust if needed
- Check AI suggestions to understand categorization logic

#### 4. Organize
- Filter by category using the sidebar
- Search for specific files
- Use multi-select to perform bulk operations

#### 5. Export
- Click **Export** to download categorization data
- JSON format includes all metadata and AI suggestions

## API Reference

### POST /api/categorization/classify

Classify a single item using AI.

**Request Body:**
```json
{
  "item": {
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 1024000,
    "preview": "base64_image_data" // Optional, for images
  }
}
```

**Response:**
```json
{
  "success": true,
  "category": "documents",
  "suggestion": "Categorized as document based on PDF file type and content analysis"
}
```

### POST /api/categorization/batch-classify

Classify multiple items at once.

**Request Body:**
```json
{
  "items": [
    {
      "id": "item-1",
      "name": "photo.jpg",
      "type": "image/jpeg",
      "size": 2048000
    },
    {
      "id": "item-2",
      "name": "report.pdf",
      "type": "application/pdf",
      "size": 512000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "item-1",
      "category": "images",
      "suggestion": "Categorized as image based on JPEG format"
    },
    {
      "id": "item-2",
      "category": "documents",
      "suggestion": "Categorized as document based on PDF format"
    }
  ]
}
```

## Technical Details

### Architecture

**Frontend Component**: `src/pages/VisualCategorization.jsx`
- React component with state management
- Framer Motion animations
- Grid and list view layouts
- Multi-select functionality

**Backend Route**: `server/routes/categorization.js`
- Express router for API endpoints
- Claude AI integration for intelligent categorization
- Fallback to rule-based categorization
- Image analysis support

**Integration Points**:
- App.jsx: Page routing
- Sidebar.jsx: Navigation menu
- server/index.js: API route registration

### Categorization Logic

1. **AI-Powered (Primary)**:
   - Sends file metadata to Claude API
   - Includes image preview for visual files
   - Receives category and explanation
   - Parses JSON response

2. **Rule-Based (Fallback)**:
   - Analyzes file extension
   - Checks MIME type
   - Applies predefined rules
   - Ensures reliability if AI is unavailable

### File Type Detection

**Images**:
- Extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`, `.webp`
- MIME types: `image/*`

**Documents**:
- Extensions: `.pdf`, `.doc`, `.docx`, `.txt`, `.rtf`, `.odt`, `.ppt`, `.pptx`, `.xls`, `.xlsx`
- MIME types: `application/pdf`, `application/msword`, `text/*`

**Data**:
- Extensions: `.json`, `.xml`, `.csv`, `.sql`, `.db`, `.sqlite`
- MIME types: `application/json`, `application/xml`, `text/csv`

## UI Components

### Main Toolbar
- **Upload Files**: Opens file picker
- **Auto-Categorize**: Processes pending files
- **Export**: Downloads categorization data
- **Delete (N)**: Deletes selected items
- **View Mode Toggle**: Switches between grid/list
- **Search Bar**: Filters items by name

### Category Sidebar
- **All Items**: Shows all files
- **Category Filters**: Filter by specific category
- **Item Counts**: Displays number of items per category

### Item Cards (Grid View)
- **Thumbnail**: Image preview or file icon
- **Checkbox**: Multi-select toggle
- **Status Badge**: Processing status indicator
- **File Name**: Truncated file name
- **File Size**: Human-readable size
- **Category Dropdown**: Manual category selection
- **AI Suggestion**: Shows AI reasoning
- **Delete Button**: Removes item

### Item Rows (List View)
- Compact horizontal layout
- Same functionality as grid cards
- Optimized for large file lists

## Status Indicators

- **Pending** (Yellow): Awaiting categorization
- **Categorized** (Green): Successfully categorized
- **Error** (Red): Categorization failed

## Export Format

```json
{
  "exportDate": "2026-01-13T16:00:00.000Z",
  "categories": [
    {
      "id": "documents",
      "name": "Documents",
      "color": "#3b82f6",
      "count": 5
    }
  ],
  "items": [
    {
      "name": "report.pdf",
      "type": "application/pdf",
      "category": "documents",
      "aiSuggestion": "Categorized as document based on PDF format",
      "timestamp": "2026-01-13T15:30:00.000Z"
    }
  ]
}
```

## Best Practices

### For Optimal Results

1. **Use Descriptive File Names**: Helps AI understand context
2. **Include Image Previews**: Enables visual content analysis
3. **Batch Similar Files**: Process related files together
4. **Review AI Suggestions**: Validate categorization decisions
5. **Export Regularly**: Save categorization data for records

### Performance Tips

1. **Process in Batches**: Avoid processing too many files at once
2. **Use Grid View**: Better for visual files
3. **Use List View**: Better for large file lists
4. **Clear Completed Items**: Remove items after organizing
5. **Monitor API Usage**: Be mindful of Claude API limits

## Troubleshooting

### AI Categorization Not Working

**Symptoms**: Items remain in "pending" status

**Solutions**:
1. Check `ANTHROPIC_API_KEY` is set in `.env`
2. Verify API key has sufficient credits
3. Check console for error messages
4. Fallback categorization should still work

### Image Previews Not Showing

**Symptoms**: File icons instead of thumbnails

**Solutions**:
1. Ensure file is a valid image format
2. Check file size (large files may take time)
3. Verify browser supports image format

### Export Not Working

**Symptoms**: Export button doesn't download file

**Solutions**:
1. Check browser popup blocker settings
2. Allow downloads from the application
3. Check browser console for errors

## Future Enhancements

Planned features for future releases:

- [ ] Custom category creation
- [ ] Advanced filtering options
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Automatic tagging system
- [ ] Duplicate file detection
- [ ] Bulk rename functionality
- [ ] Category color customization
- [ ] Advanced export formats (CSV, Excel)
- [ ] Search within file content
- [ ] Sharing and collaboration features

## Security Considerations

- Files are processed locally and not stored on servers
- Image data sent to Claude API is base64 encoded
- API keys are never exposed to the frontend
- Exported data contains no sensitive API information
- File content remains private and secure

## License

Part of Wallestars Control Center - MIT License

---

**For support or feature requests, please open an issue on GitHub.**

**Documentation Version**: 1.0.0  
**Last Updated**: January 2026
