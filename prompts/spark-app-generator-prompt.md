# Prompt for Anthropic Console: Spark Visual App Generator

## Meta-Prompt Description

You are tasked with creating a comprehensive prompt that will generate a **Spark Visual Application** for processing and visualizing information from various sources. Use this prompt in Anthropic's Prompt Generator Workbench.

---

## Target Prompt to Generate

Create a prompt that instructs an AI to build a Spark application with the following capabilities:

### Core Functionality

**Input Processing:**
- Accept various types of links as input:
  - AI chat conversation links
  - Markdown (.md) file URLs or paths
  - Agent session links
  - Documentation URLs
  - GitHub issues/PRs
  - Any other relevant resource URLs

**Information Extraction & Analysis:**
- Parse and extract key information from provided links
- Identify main topics, concepts, and decision points
- Recognize patterns and relationships between different pieces of information
- Extract actionable items, questions, and options
- Summarize content in a structured format

**Visual Presentation:**
- Create a beautiful, interactive Spark application interface
- Display extracted information in an organized, visual manner using:
  - Cards for content sections
  - Charts/graphs for data visualization
  - Timeline views for sequential information
  - Mind maps for relationship visualization
  - Progress indicators for multi-step processes

**Interactive Decision Making:**
- Generate contextual buttons and options based on extracted information
- Create multiple-choice questions for user decision points
- Provide clear, actionable choices at each step
- Allow users to select from generated options
- Support both single and multiple selection inputs
- Include text input fields where free-form responses are needed

**Response Recording:**
- Capture all user interactions and selections
- Build a comprehensive decision tree/script as users respond
- Record timestamps for each interaction
- Maintain context across all decisions
- Store metadata about each choice (why it was presented, what it relates to)

**Export Capabilities:**
The application should support exporting the complete session in multiple formats:
- **JSON**: Structured data format with full context
- **Markdown**: Human-readable report with sections and formatting
- **YAML**: Configuration-friendly format
- **PDF**: Print-ready document with visual elements
- **HTML**: Standalone web page with embedded styles
- **Script Format**: Code-like format that can be replayed or analyzed

**QR Code Generation:**
- After session completion and export formatting:
  - Generate a unique identifier for the session
  - Create a QR code that links to the session results
  - Store results in an accessible location (cloud storage, database, or local file)
  - QR code should encode a URL to view/download the complete analysis
  - Include session metadata in the QR code destination

**Dynamic State Management:**
- Track completion status of each section
- Mark required vs. optional fields
- Show visual indicators when all necessary options are selected
- Enable/disable navigation based on completion state
- Provide progress percentage or step counter
- Allow users to review and modify previous answers

---

## Implementation Guidelines

### Best Practices for Spark Apps

1. **User Experience:**
   - Start with a clear welcome screen explaining the purpose
   - Use progressive disclosure (show information gradually)
   - Provide helpful tooltips and descriptions
   - Include a sidebar or navigation for multi-step processes
   - Show clear visual feedback for user actions

2. **Information Architecture:**
   - Organize content into logical sections
   - Use consistent visual hierarchy
   - Group related options together
   - Provide context for each decision point

3. **Interactivity:**
   - Use appropriate input types (buttons, checkboxes, radio buttons, text fields)
   - Validate user input in real-time
   - Provide clear error messages
   - Allow users to go back and change answers
   - Show what's been completed and what remains

4. **Visual Design:**
   - Use a clean, modern design aesthetic
   - Apply consistent color scheme (primary, secondary, accent colors)
   - Ensure good contrast and readability
   - Use icons to supplement text
   - Make the interface responsive and accessible

5. **Data Handling:**
   - Parse URLs and extract content reliably
   - Handle errors gracefully (broken links, invalid formats)
   - Show loading states during processing
   - Cache processed data to avoid re-fetching

6. **Export & Sharing:**
   - Provide clear download buttons for each export format
   - Show preview before final export
   - Include timestamp and session ID in exports
   - Make QR codes easily shareable (download as image)

---

## Example User Flow

1. **Start Screen:**
   - User enters one or multiple links
   - App validates and shows detected link types
   - User clicks "Analyze" to begin

2. **Analysis Phase:**
   - App shows loading indicator
   - Fetches and processes content from all links
   - Extracts key information and decision points
   - Displays visual summary of findings

3. **Interactive Decision Phase:**
   - App presents first decision point with context
   - Shows relevant options as interactive buttons
   - User makes selection
   - App records choice and moves to next decision
   - Repeat until all decisions are made

4. **Review Phase:**
   - Show summary of all decisions made
   - Allow editing of any previous choice
   - Display completeness indicator

5. **Export & QR Generation:**
   - User selects desired export formats
   - App generates files in selected formats
   - Creates QR code linking to results
   - Provides download buttons and QR code image

---

## Technical Requirements

### Input Handling
```javascript
// Support various link formats
const supportedTypes = [
  'https://chat.openai.com/...',
  'https://claude.ai/chat/...',
  '*.md',
  'https://github.com/...',
  'agent-session-id',
  // etc.
];
```

### Data Structure for Decisions
```javascript
const sessionData = {
  id: 'unique-session-id',
  timestamp: '2026-01-03T08:32:38.845Z',
  inputs: [
    { type: 'url', value: 'https://...' }
  ],
  extractedInfo: {
    topics: [],
    decisions: [],
    metadata: {}
  },
  userChoices: [
    {
      questionId: 'q1',
      question: 'Choose your preferred approach',
      options: ['Option A', 'Option B', 'Option C'],
      selected: 'Option B',
      timestamp: '...'
    }
  ],
  exports: [],
  qrCode: 'url-to-qr-code-image'
};
```

### Export Format Examples

**Markdown Export:**
```markdown
# Decision Session Summary
Date: 2026-01-03
Session ID: abc123

## Input Sources
- AI Chat: https://...
- Documentation: https://...

## Extracted Information
[Structured summary]

## Decisions Made
1. Question: Choose your preferred approach
   Answer: Option B
   Timestamp: 08:32:45

## Next Steps
[Generated based on choices]
```

**QR Code Integration:**
- Use a QR code library (e.g., qrcode.js)
- Store results at a unique URL
- Encode URL in QR code
- Provide download as PNG/SVG

---

## Success Criteria

The generated Spark application should:
- ✅ Successfully parse and extract information from various link types
- ✅ Present information in a clear, visual format
- ✅ Generate contextual, relevant options for user interaction
- ✅ Record all user decisions with full context
- ✅ Export to at least 3 different formats
- ✅ Generate a working QR code that links to results
- ✅ Track completion state dynamically
- ✅ Provide an excellent user experience
- ✅ Be fully functional as a standalone Spark app

---

## Additional Features (Optional Enhancements)

- **AI Analysis**: Use AI to suggest best options based on context
- **Collaboration**: Allow multiple users to contribute to decisions
- **Version History**: Track changes to decisions over time
- **Templates**: Save decision patterns as reusable templates
- **Analytics**: Show insights about decision patterns
- **Integration**: Connect with external tools (Notion, Slack, etc.)
- **Offline Mode**: Work without internet connection
- **Dark Mode**: Support different visual themes

---

## Prompt Template Structure

When generating the actual prompt, structure it as follows:

1. **System Context**: Define the AI's role and capabilities
2. **Task Description**: Clearly state what needs to be built
3. **Input Specifications**: Detail what inputs to expect
4. **Processing Logic**: Explain how to analyze and extract information
5. **UI/UX Requirements**: Describe the interface and interactions
6. **Output Specifications**: Define export formats and structure
7. **Examples**: Provide concrete examples of inputs and outputs
8. **Constraints**: Note any limitations or requirements
9. **Success Criteria**: Define what success looks like

---

## Usage Instructions

To use this prompt:

1. Copy this entire document
2. Go to https://console.anthropic.com/workbench/
3. Create a new prompt generation task
4. Paste this content as the input
5. Review and refine the generated prompt
6. Use the final prompt to create your Spark application

---

## Notes

- This is a meta-prompt designed to generate another prompt
- The final generated prompt should be clear, detailed, and actionable
- Focus on creating a practical, user-friendly application
- Prioritize core functionality before optional enhancements
- Test with real-world examples to ensure robustness
