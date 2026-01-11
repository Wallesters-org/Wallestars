# Prompt Generator Tool - Documentation

## Overview

The Prompt Generator is a new feature in Wallestars Control Center that helps users create detailed prompts for building Spark Visual Applications. This tool generates meta-prompts that can be used with Anthropic's Prompt Generator Workbench to create sophisticated AI-powered applications.

## Purpose

The Prompt Generator addresses the need for creating a Spark visual application that:

1. **Accepts Multiple Input Types**: Links to AI chats, markdown files, agent sessions, GitHub issues, and more
2. **Extracts and Analyzes Information**: Parses content from various sources and identifies key decision points
3. **Provides Visual Presentation**: Creates beautiful, interactive interfaces with cards, charts, timelines, and mind maps
4. **Enables Interactive Decision Making**: Generates contextual buttons and options for users to make choices
5. **Records User Responses**: Captures all interactions and builds a comprehensive decision tree
6. **Exports to Multiple Formats**: Supports JSON, Markdown, YAML, PDF, HTML, and custom script formats
7. **Generates QR Codes**: Creates QR codes for easy access to analysis results
8. **Manages State Dynamically**: Tracks completion status and guides users through the process

## Features

### Bilingual Support
- **English** and **Bulgarian** language options
- Easy language switching via toggle buttons
- Culturally appropriate translations

### Copy to Clipboard
- One-click copying of the entire prompt
- Visual feedback with success animation
- Separate copy states for each language

### Download as Markdown
- Download prompts as `.md` files
- Automatically named based on selected language
- Preserves formatting and structure

### Interactive UI
- Modern glassmorphism design matching Wallestars theme
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Custom scrollbar for prompt preview

### Quick Access Links
- Direct link to Anthropic Console Workbench
- Link to Claude documentation
- Opens in new tabs for convenience

### Info Box
- Clear instructions on how to use the tool
- Step-by-step guide
- Helpful tooltips and descriptions

## How to Use

### For Users

1. **Navigate to Prompt Generator**
   - Open Wallestars Control Center
   - Click on "Prompt Generator" in the sidebar (Sparkles icon)

2. **Choose Language**
   - Click "English" or "Български" button to select your preferred language

3. **Copy the Prompt**
   - Click "Copy to Clipboard" button
   - The button will show "Copied!" when successful

4. **Go to Anthropic Console**
   - Click the "Anthropic Console" quick link
   - Or manually navigate to: https://console.anthropic.com/workbench/

5. **Generate Your Prompt**
   - Paste the copied content into the Prompt Generator
   - Review and refine the generated prompt
   - Use the final prompt to create your Spark application

### Optional: Download for Later
- Click "Download" button to save the prompt as a markdown file
- Use the file for reference or sharing

## Technical Details

### File Structure

```
Wallestars/
├── prompts/
│   ├── spark-app-generator-prompt.md       # English version
│   └── spark-app-generator-prompt-bg.md    # Bulgarian version
├── src/
│   ├── pages/
│   │   └── PromptGenerator.jsx             # Main component
│   ├── components/
│   │   └── Sidebar.jsx                     # Updated with new menu item
│   ├── App.jsx                             # Updated with new route
│   └── index.css                           # Added custom scrollbar styles
```

### Component Architecture

**PromptGenerator.jsx**
- React functional component
- Uses Framer Motion for animations
- Implements state management with `useState`
- Provides clipboard API integration
- Handles file downloads with Blob API

**Key Features:**
- Language toggle state (`language`)
- Copy confirmation states (`copied`, `copiedBg`)
- Embedded prompt content (avoids external file reads)
- Responsive grid layout
- Custom scrollable preview area

### Styling

- Uses Tailwind CSS utility classes
- Custom glassmorphism effects via `.glass-effect` class
- Gradient backgrounds for primary actions
- Custom scrollbar styling for preview area
- Hover and active states for interactive elements

## Prompt Content Structure

Both English and Bulgarian versions include:

### 1. Meta-Prompt Description
Explains the purpose and how to use the prompt generator.

### 2. Core Functionality Specifications
- Input processing requirements
- Information extraction logic
- Visual presentation guidelines
- Interactive decision-making features
- Response recording mechanisms
- Export format specifications
- QR code generation details
- Dynamic state management requirements

### 3. Implementation Guidelines
- Best practices for Spark apps
- User experience considerations
- Information architecture principles
- Interactivity guidelines
- Visual design standards
- Data handling approaches
- Export and sharing methods

### 4. User Flow
Step-by-step walkthrough of the intended user journey:
1. Start Screen
2. Analysis Phase
3. Interactive Decision Phase
4. Review Phase
5. Export & QR Generation

### 5. Technical Requirements
- Technology stack suggestions
- Error handling requirements
- Loading states
- Responsive design
- Accessibility compliance
- Caching strategies

### 6. Success Criteria
Clear checklist of what the generated Spark app should accomplish.

### 7. Optional Enhancements
Additional features that can be implemented:
- AI analysis for recommendations
- Collaboration features
- Version history
- Template system
- Analytics
- External integrations
- Offline support
- Dark mode

### 8. Expected Results
Description of what the Anthropic Prompt Generator will produce.

## Integration with Wallestars

The Prompt Generator seamlessly integrates with the existing Wallestars Control Center:

1. **Navigation**: Added to sidebar with Sparkles icon
2. **Routing**: Integrated into App.jsx page routing system
3. **Design**: Matches existing glassmorphism and gradient theme
4. **Animations**: Uses same Framer Motion patterns as other pages
5. **Context**: Works within existing SocketProvider context

## Future Enhancements

Potential improvements for future versions:

1. **Template Library**: Pre-built prompt templates for common use cases
2. **Custom Prompt Builder**: Interactive form to build custom prompts
3. **History**: Save and revisit previously generated prompts
4. **Sharing**: Share prompts with team members
5. **API Integration**: Direct integration with Anthropic API
6. **Preview Mode**: Live preview of what the Spark app might look like
7. **Version Control**: Track changes to prompt templates
8. **Analytics**: Track usage and effectiveness of generated prompts

## Troubleshooting

### Copy to Clipboard Not Working
- Ensure your browser supports the Clipboard API
- Check browser permissions for clipboard access
- Try using HTTPS (clipboard API requires secure context)

### Download Not Working
- Check browser download settings
- Ensure pop-ups are not blocked
- Verify sufficient disk space

### Styling Issues
- Clear browser cache
- Rebuild the application: `npm run build`
- Check for CSS conflicts in browser DevTools

## Contributing

To contribute improvements to the Prompt Generator:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the Wallestars team
- Check Claude documentation for prompt engineering tips

## License

MIT License - Same as Wallestars Control Center

---

**Built with ❤️ by Wallestars Team**
