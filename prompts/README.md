# AI Prompt Templates - Usage Guide

## Overview

This directory contains comprehensive templates for creating structured AI prompts. These templates help you define clear roles, purposes, contexts, and tools for AI assistants and agents.

## Available Templates

### 1. AI Prompt Template (English)
**File:** `ai-prompt-template.md`

A comprehensive template for creating structured AI prompts with sections for:
- Role definition
- Purpose and goals
- Context and environment
- Tools and capabilities
- Guidelines and best practices
- Interaction patterns
- Example usage scenarios

**Use when:** You need to create a detailed prompt for an AI assistant, agent, or automated system in English.

### 2. AI Prompt Template (Bulgarian)
**File:** `ai-prompt-template-bg.md`

Bulgarian version of the comprehensive AI prompt template with the same structure and content.

**Use when:** You need to create a detailed prompt for an AI assistant, agent, or automated system in Bulgarian.

### 3. Spark App Generator Prompt (English)
**File:** `spark-app-generator-prompt.md`

Meta-prompt for generating Spark visual applications that process and visualize information from various sources.

**Use when:** You want to create a Spark application using Anthropic's Prompt Generator Workbench.

### 4. Spark App Generator Prompt (Bulgarian)
**File:** `spark-app-generator-prompt-bg.md`

Bulgarian version of the Spark app generator meta-prompt.

**Use when:** You want to create a Spark application using Bulgarian language instructions.

## Quick Start

### Using the AI Prompt Template

1. **Choose your language:**
   - English: `ai-prompt-template.md`
   - Bulgarian: `ai-prompt-template-bg.md`

2. **Read the template:**
   - Understand each section's purpose
   - Review the examples provided
   - Note the customization template (Section 8)

3. **Create your prompt:**
   - Copy the customization template (Section 8)
   - Fill in the blanks with your specific requirements
   - Follow the guidelines in Section 9 (Tips for Effective Prompts)

4. **Test and iterate:**
   - Use your prompt with an AI system
   - Observe the results
   - Refine based on performance

### Using the Spark App Generator Prompts

1. **Access through Wallestars UI:**
   - Open Wallestars Control Center
   - Navigate to "Prompt Generator" in the sidebar
   - Choose your language (English or Bulgarian)
   - Click "Copy to Clipboard"

2. **Or use the files directly:**
   - Open `spark-app-generator-prompt.md` or `spark-app-generator-prompt-bg.md`
   - Copy the entire content
   - Paste into [Anthropic Console Workbench](https://console.anthropic.com/workbench/)

3. **Generate your Spark app:**
   - Review the generated prompt
   - Refine as needed
   - Use it to create your Spark visual application

## Template Structure

### AI Prompt Template Sections

```
1. ROLE - Define who/what the AI should be
2. PURPOSE/GOAL - Define what to accomplish
3. CONTEXT - Provide background and constraints
4. TOOLS & CAPABILITIES - Define available tools
5. GUIDELINES & BEST PRACTICES - Code quality, communication, security
6. INTERACTION PATTERNS - Workflow, error handling, feedback
7. EXAMPLE USAGE - Concrete examples for different scenarios
8. CUSTOMIZATION TEMPLATE - Fill-in-the-blank template
9. TIPS FOR EFFECTIVE PROMPTS - Do's, don'ts, best practices
10. INTEGRATION WITH WALLESTARS - Setup and usage
```

### Spark App Generator Sections

```
1. Meta-Prompt Description
2. Core Functionality (Input, Analysis, Visual, Interactive, Recording, Export, QR)
3. Implementation Guidelines
4. Example User Flow
5. Technical Requirements
6. Success Criteria
7. Additional Features
8. Prompt Template Structure
9. Usage Instructions
```

## Examples

### Example 1: Creating a Code Review AI

Using the AI Prompt Template:

```markdown
## Role
You are a Senior Software Engineer with 15+ years of experience specializing in code reviews and best practices across multiple languages (Python, JavaScript, Go, Rust).

## Purpose
Your goal is to provide thorough, constructive code reviews that help developers improve code quality, security, and maintainability.

You will accomplish this by:
1. Analyzing code for bugs, security vulnerabilities, and performance issues
2. Checking adherence to style guides and best practices
3. Suggesting improvements with clear explanations
4. Providing positive feedback for well-written code

## Context
**Environment:** GitHub repository with CI/CD pipelines
**Project:** Web application with React frontend and Node.js backend
**Constraints:** Must follow OWASP security guidelines, accessibility standards
**Users:** Development team with varying experience levels

## Tools
- GitHub API for accessing files and diffs
- Static analysis tools (ESLint, PyLint)
- Security scanners (CodeQL, Snyk)
- Documentation access

## Guidelines
- Be respectful and constructive
- Prioritize security and critical bugs
- Provide code examples for suggestions
- Link to relevant documentation
- Balance thoroughness with practicality
```

### Example 2: Creating a Documentation Bot

```markdown
## Role
You are a Professional Technical Writer with expertise in developer documentation and API references.

## Purpose
Generate and maintain high-quality documentation for software projects automatically.

## Context
**Environment:** Documentation as Code with Markdown
**Project:** Open-source library documentation
**Constraints:** Follow Diátaxis framework, support multiple versions
**Users:** External developers using the library

## Tools
- File system access for reading code
- Markdown generation
- Diagram tools (Mermaid)
- Code analysis for API extraction

## Guidelines
- Use clear, jargon-free language
- Include runnable code examples
- Maintain consistent formatting
- Update docs when code changes
- Support beginner to advanced users
```

## Integration with Wallestars

### Environment Variables

Add to your `.env` file:

```env
# AI Configuration
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4.5
CLAUDE_MAX_TOKENS=4096

# Prompt Configuration
AI_ROLE=Your defined role
AI_CONTEXT=Your context
AI_PURPOSE=Your purpose

# Features
ENABLE_TOOLS=true
ENABLE_COMPUTER_USE=true
```

### MCP Configuration

For Model Context Protocol integration, update your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "custom-ai-agent": {
      "command": "node",
      "args": ["/path/to/Wallestars/server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key",
        "AI_ROLE": "Expert Software Engineer",
        "AI_CONTEXT": "Full-stack web development",
        "ENABLE_TOOLS": "true"
      }
    }
  }
}
```

### Using in Code

```javascript
// Example: Load and use a prompt template
import fs from 'fs';
import path from 'path';

// Load the template
const templatePath = path.join(__dirname, 'prompts', 'ai-prompt-template.md');
const template = fs.readFileSync(templatePath, 'utf-8');

// Parse and customize
function createCustomPrompt(role, purpose, context, tools) {
  return `
# Custom AI Prompt

## Role
${role}

## Purpose
${purpose}

## Context
${context}

## Tools
${tools}
`;
}

// Use with Claude API
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = createCustomPrompt(
  'Expert JavaScript Developer',
  'Help users write clean, maintainable React code',
  'Modern web development with React 18 and TypeScript',
  'File operations, npm, ESLint, Jest'
);

const response = await client.messages.create({
  model: 'claude-sonnet-4.5',
  max_tokens: 4096,
  system: systemPrompt,
  messages: [
    { role: 'user', content: 'Help me refactor this component...' }
  ],
});
```

## Best Practices

### Do's ✅

1. **Be Specific**
   - Define clear roles with specific expertise
   - Set measurable success criteria
   - Provide detailed context

2. **Iterate**
   - Start simple, add complexity as needed
   - Test with real scenarios
   - Refine based on results

3. **Document**
   - Keep track of what works
   - Note what doesn't
   - Share learnings with team

4. **Balance Detail**
   - Provide enough context
   - Avoid overwhelming with information
   - Focus on what's relevant

### Don'ts ❌

1. **Avoid Ambiguity**
   - Don't use vague terms
   - Don't leave requirements implicit
   - Don't assume context

2. **Don't Over-Constrain**
   - Allow flexibility where appropriate
   - Don't micromanage every detail
   - Trust the AI to make reasonable choices

3. **Don't Forget Security**
   - Always define security requirements
   - Specify data handling rules
   - Set clear boundaries

## Tips for Success

1. **Start with the Template**
   - Use Section 8 (Customization Template) as a starting point
   - Fill in each section thoughtfully
   - Don't skip sections even if they seem optional

2. **Provide Examples**
   - Include concrete examples of desired behavior
   - Show both good and bad examples
   - Demonstrate edge cases

3. **Test Thoroughly**
   - Try different types of inputs
   - Test error conditions
   - Validate with real users

4. **Iterate Based on Feedback**
   - Monitor AI performance
   - Collect user feedback
   - Adjust prompt accordingly

5. **Version Control Your Prompts**
   - Track changes over time
   - Document why changes were made
   - Maintain a changelog

## Troubleshooting

### AI responses are too generic
**Solution:** Add more specific context and examples to your prompt.

### AI doesn't follow guidelines
**Solution:** Make guidelines more explicit, use imperative language ("Always do X" instead of "X is preferred").

### AI makes inappropriate suggestions
**Solution:** Add explicit constraints and "Must Avoid" section with clear boundaries.

### Responses are inconsistent
**Solution:** Provide more structured templates and examples. Use explicit output formats.

### AI doesn't use available tools
**Solution:** Include specific instructions on when and how to use each tool. Provide examples of tool usage.

## Additional Resources

### Wallestars Documentation
- [README.md](../README.md) - Project overview
- [MCP_SETUP.md](../MCP_SETUP.md) - MCP configuration guide
- [PROMPT_GENERATOR_DOCS.md](../PROMPT_GENERATOR_DOCS.md) - Spark app generator docs
- [HOW_TO_USE_PROMPT_GENERATOR.md](../HOW_TO_USE_PROMPT_GENERATOR.md) - Quick start guide

### External Resources
- [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering) - Official guide
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering) - Prompt engineering patterns
- [Prompt Engineering Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) - Community resource

### Community
- Open an issue on GitHub for questions
- Join discussions in project issues
- Contribute improvements via pull requests

## Contributing

We welcome contributions to improve these templates!

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Add examples if applicable
5. Update this README if needed
6. Submit a pull request

### What to Contribute

- New example scenarios
- Improvements to existing templates
- Additional language translations
- Bug fixes in templates
- Better explanations or clarifications

## License

MIT License - Same as Wallestars Control Center

---

**Created for Wallestars Control Center 🌟**  
**Built with ❤️ by Wallestars Team**

For support or questions, open an issue on GitHub or contact the Wallestars team.
