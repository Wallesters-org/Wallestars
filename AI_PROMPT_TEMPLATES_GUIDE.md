# AI Prompt Templates Guide

## Overview

The AI Prompt Templates provide a structured framework for creating effective prompts for AI assistants and agents. These templates complement the existing Spark App Generator prompts and help you define AI behavior precisely.

## What's Included

### 1. Comprehensive AI Prompt Template
- **English:** [`prompts/ai-prompt-template.md`](prompts/ai-prompt-template.md)
- **Bulgarian:** [`prompts/ai-prompt-template-bg.md`](prompts/ai-prompt-template-bg.md)

A complete template with 10 sections covering:
- ✅ **Role** - Define the AI's expertise and persona
- ✅ **Purpose/Goal** - Specify what the AI should accomplish
- ✅ **Context** - Provide environment and constraints
- ✅ **Tools** - List available capabilities and limitations
- ✅ **Guidelines** - Code quality, communication, security practices
- ✅ **Interaction Patterns** - Workflows and error handling
- ✅ **Examples** - Real-world usage scenarios
- ✅ **Customization** - Fill-in-the-blank template
- ✅ **Tips** - Best practices and common pitfalls
- ✅ **Integration** - How to use with Wallestars

### 2. Usage Guide
**File:** [`prompts/README.md`](prompts/README.md)

Comprehensive documentation on:
- How to use each template
- Integration with Wallestars
- Example scenarios
- Best practices
- Troubleshooting

## Quick Start

### Create Your First AI Prompt

1. **Open the template** for your preferred language:
   - English: [`prompts/ai-prompt-template.md`](prompts/ai-prompt-template.md)
   - Bulgarian: [`prompts/ai-prompt-template-bg.md`](prompts/ai-prompt-template-bg.md)

2. **Navigate to Section 8** - "Customization Template"

3. **Fill in the blanks** with your specific requirements:

```markdown
# My Custom AI Prompt

## Role
You are an Expert JavaScript Developer with 10+ years of experience in React and Node.js.

## Purpose
Your goal is to help developers write clean, maintainable React code by:
1. Reviewing code for best practices
2. Suggesting improvements with explanations
3. Writing example implementations
4. Explaining React concepts clearly

## Context
**Environment:** Node.js 20+, React 18, TypeScript
**Project:** E-commerce web application
**Constraints:** Must follow TypeScript strict mode, WCAG 2.1 AA accessibility
**Users:** Mid-level developers learning React

## Tools
Available tools:
- File operations (read, write, create)
- npm package management
- ESLint and Prettier
- Jest testing framework

## Guidelines
When working:
1. Always use TypeScript strict mode
2. Follow React hooks best practices
3. Write comprehensive JSDoc comments
4. Include unit tests for components

Code standards:
- Use functional components with hooks
- Implement error boundaries
- Follow Airbnb React style guide

Security requirements:
- Sanitize user inputs
- Use CSP headers
- Implement CSRF protection

## Success Criteria
Your work will be considered successful when:
- ✅ Code passes all linting and type checks
- ✅ Components are fully tested with >80% coverage
- ✅ Accessibility standards are met
- ✅ Developer understands the implementation
```

4. **Use your prompt** with Claude, GPT, or other AI systems

## Use Cases

### 1. Code Review Assistant
Create an AI that reviews pull requests and suggests improvements.

**Template Section to Focus On:**
- Role: Senior Software Engineer
- Purpose: Provide thorough code reviews
- Tools: GitHub API, static analysis tools
- Guidelines: Security-first mindset

### 2. Documentation Writer
Generate and maintain project documentation automatically.

**Template Section to Focus On:**
- Role: Technical Writer
- Purpose: Create clear documentation
- Tools: Markdown, diagram generators
- Guidelines: Clarity and examples

### 3. DevOps Automation Agent
Automate deployment pipelines and infrastructure management.

**Template Section to Focus On:**
- Role: DevOps Engineer
- Purpose: Automate deployments
- Tools: Docker, Kubernetes, cloud APIs
- Guidelines: Infrastructure as code

### 4. Test Generator
Automatically create test cases for your code.

**Template Section to Focus On:**
- Role: QA Engineer
- Purpose: Generate comprehensive tests
- Tools: Testing frameworks (Jest, Pytest)
- Guidelines: Test coverage and edge cases

### 5. API Design Assistant
Help design RESTful or GraphQL APIs with best practices.

**Template Section to Focus On:**
- Role: API Architect
- Purpose: Design scalable APIs
- Tools: OpenAPI, GraphQL schema tools
- Guidelines: REST/GraphQL best practices

## Integration with Wallestars

### Method 1: Environment Variables

Configure AI behavior through `.env`:

```env
# AI Configuration
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4.5

# Custom AI Prompt Settings
AI_ROLE=Expert Full-Stack Developer
AI_PURPOSE=Help users build web applications
AI_CONTEXT=Node.js, React, TypeScript environment
ENABLE_TOOLS=true
```

### Method 2: MCP Integration

Use with Model Context Protocol in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wallestars-ai-assistant": {
      "command": "node",
      "args": ["/path/to/Wallestars/server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key",
        "AI_ROLE": "Expert Software Engineer",
        "AI_CONTEXT": "Full-stack web development",
        "ENABLE_COMPUTER_USE": "true",
        "ENABLE_TOOLS": "true"
      }
    }
  }
}
```

### Method 3: Direct API Usage

Use in your code:

```javascript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// Load your custom prompt
const promptPath = path.join(__dirname, 'my-custom-prompt.md');
const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

// Initialize Claude client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use with messages API
const response = await client.messages.create({
  model: 'claude-sonnet-4.5',
  max_tokens: 4096,
  system: systemPrompt,
  messages: [
    { 
      role: 'user', 
      content: 'Help me refactor this React component...' 
    }
  ],
});

console.log(response.content[0].text);
```

## Differences from Spark App Prompts

### AI Prompt Templates
**Purpose:** Define AI assistant/agent behavior and capabilities  
**Use When:** Creating custom AI assistants, code reviewers, automation agents  
**Output:** Structured prompt defining role, context, tools, guidelines  
**Integration:** Used as system prompts for AI APIs

### Spark App Generator Prompts
**Purpose:** Generate visual Spark applications  
**Use When:** Creating interactive apps that process and visualize information  
**Output:** Meta-prompt for Anthropic Console to generate app specs  
**Integration:** Used with Anthropic Prompt Generator Workbench

**Both are complementary** - Use AI Prompt Templates to define the AI that will help you build or use Spark apps!

## Examples Gallery

### Example 1: GitHub Issue Triager

```markdown
## Role
You are an experienced Open Source Maintainer and Community Manager.

## Purpose
Automatically triage GitHub issues by:
1. Analyzing issue content and classifying type (bug/feature/question)
2. Assigning appropriate labels
3. Suggesting priority level
4. Checking for duplicates

## Tools
- GitHub API (issues, labels, search)
- Natural language processing

## Success Criteria
- ✅ 95%+ accuracy in issue classification
- ✅ Helpful suggestions for issue reporters
- ✅ Reduces manual triage time by 70%
```

### Example 2: SQL Query Generator

```markdown
## Role
You are a Database Expert specializing in PostgreSQL and MySQL.

## Purpose
Generate optimized SQL queries from natural language requests.

## Context
**Database:** PostgreSQL 15
**Schema:** E-commerce (users, products, orders, reviews)
**Constraints:** Read-only access, query timeout 30s

## Guidelines
- Always use parameterized queries
- Optimize with proper indexes
- Explain query plans
- Warn about N+1 queries
```

### Example 3: Accessibility Auditor

```markdown
## Role
You are a Web Accessibility Expert certified in WCAG 2.1.

## Purpose
Audit web pages and components for accessibility issues.

## Tools
- HTML/CSS analysis
- Screen reader simulation
- Color contrast checker
- Keyboard navigation testing

## Success Criteria
- ✅ Identify all WCAG A and AA violations
- ✅ Provide specific fix recommendations
- ✅ Include code examples for fixes
```

## Tips for Success

### 1. Start Simple
Begin with basic role and purpose, then add complexity.

### 2. Iterate Based on Results
Test your prompt, observe behavior, refine accordingly.

### 3. Be Specific
Vague prompts lead to inconsistent results. Be explicit.

### 4. Provide Examples
Show the AI what good looks like with concrete examples.

### 5. Define Boundaries
Clearly state what the AI should NOT do.

### 6. Test Edge Cases
Validate prompt behavior with unusual inputs.

### 7. Version Your Prompts
Track changes and their impact on performance.

### 8. Get Feedback
Ask users and team members for input on AI behavior.

## Troubleshooting

### Problem: AI responses are too generic
**Solution:** Add more specific context and examples. Include domain-specific terminology.

### Problem: AI doesn't follow guidelines
**Solution:** Make guidelines imperative ("Always do X" not "X is preferred"). Add examples of correct behavior.

### Problem: AI makes mistakes in edge cases
**Solution:** Add specific edge cases to the context section. Provide examples of how to handle them.

### Problem: Inconsistent responses
**Solution:** Provide more structured output templates. Use explicit formatting instructions.

## Learn More

- 📖 [Full AI Prompt Template](prompts/ai-prompt-template.md) - Complete English template
- 📖 [Bulgarian Version](prompts/ai-prompt-template-bg.md) - Complete Bulgarian template
- 📖 [Prompts README](prompts/README.md) - Comprehensive usage guide
- 📖 [Spark App Generator](PROMPT_GENERATOR_DOCS.md) - Spark app prompts
- 🔗 [Anthropic Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering) - Official guide
- 🔗 [MCP Setup Guide](MCP_SETUP.md) - Model Context Protocol integration

## Contributing

Have ideas for improving these templates? We welcome contributions!

1. Fork the repository
2. Create your feature branch
3. Add/improve templates or examples
4. Submit a pull request

## Support

- 💬 Open an issue on GitHub
- 📧 Contact the Wallestars team
- 🌟 Star the project if you find it useful!

---

**Built with ❤️ by Wallestars Team**  
**Part of the Wallestars Control Center 🌟**
