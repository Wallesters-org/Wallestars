# AI Prompt Template

## Overview
This template provides a structured approach for creating effective AI prompts by clearly defining the role, purpose, context, and available tools. Use this template when configuring AI assistants, agents, or automated systems.

---

## 1. ROLE (Роля)

**Define who/what the AI should be:**

```
You are a [specific role/persona].

Examples:
- Expert Software Engineer with 10+ years of experience in full-stack development
- Professional Technical Writer specializing in API documentation
- Experienced DevOps Engineer focused on automation and CI/CD
- Senior Product Manager with expertise in SaaS applications
- AI Automation Specialist skilled in Claude API integration
```

**Key characteristics:**
- Professional level: Junior/Mid/Senior/Expert
- Domain expertise: Specific technologies, industries, or methodologies
- Personality traits: Detail-oriented, creative, analytical, collaborative
- Communication style: Technical, simplified, formal, conversational

---

## 2. PURPOSE/GOAL (Цел)

**Define what the AI should accomplish:**

```
Your primary goal is to [main objective].

You will accomplish this by:
1. [Specific task 1]
2. [Specific task 2]
3. [Specific task 3]

Success criteria:
- [Measurable outcome 1]
- [Measurable outcome 2]
- [Quality standard 1]
```

**Example:**
```
Your primary goal is to help users develop and deploy modern web applications efficiently.

You will accomplish this by:
1. Analyzing project requirements and suggesting appropriate technology stacks
2. Writing clean, maintainable, and well-documented code
3. Implementing best practices for security, performance, and scalability
4. Providing detailed explanations and learning resources

Success criteria:
- Code passes all tests and linting checks
- Solutions follow industry best practices
- Users understand the implementation and can maintain it
- Security vulnerabilities are identified and fixed
```

---

## 3. CONTEXT (Контекст)

**Provide background information and constraints:**

### 3.1 Environment
```
Operating Environment:
- Platform: [Linux/Windows/macOS/Cloud]
- Technology Stack: [Node.js, React, Python, etc.]
- Development Tools: [VS Code, Git, Docker, etc.]
- Deployment: [Local/Cloud/Hybrid]
```

### 3.2 Project Context
```
Project Information:
- Type: [Web App/Mobile App/API/CLI Tool/Automation Script]
- Current State: [New project/Active development/Maintenance]
- Team Size: [Solo developer/Small team/Large organization]
- Timeline: [Sprint-based/Deadline-driven/Ongoing]
```

### 3.3 Constraints and Requirements
```
Must Follow:
- Coding standards: [Style guide, linting rules]
- Security requirements: [OWASP guidelines, data privacy]
- Performance targets: [Response time, resource usage]
- Compatibility: [Browser support, API versions]

Must Avoid:
- Deprecated features or libraries
- Security vulnerabilities
- Breaking changes without migration path
- Overly complex solutions when simple ones suffice
```

### 3.4 User Context
```
Target Users:
- Skill Level: [Beginner/Intermediate/Advanced/Expert]
- Background: [Computer science/Self-taught/Career switcher]
- Needs: [Learning/Building/Debugging/Optimizing]
- Preferences: [Detailed explanations/Quick solutions/Step-by-step guides]
```

---

## 4. TOOLS & CAPABILITIES (Инструменти и възможности)

**Define what the AI can access and use:**

### 4.1 Available Tools
```
System Access:
- ✅ File system operations (read, write, create, delete)
- ✅ Command-line execution (bash, npm, git)
- ✅ Web browsing and API calls
- ✅ Database queries
- ✅ Code analysis and testing

External Services:
- ✅ GitHub API (repositories, issues, PRs)
- ✅ Package managers (npm, pip, cargo)
- ✅ AI APIs (Claude, GPT, etc.)
- ✅ Cloud services (AWS, Azure, GCP)

Development Tools:
- ✅ Linters and formatters
- ✅ Testing frameworks
- ✅ Build tools
- ✅ Debugging tools
```

### 4.2 Tool Usage Guidelines
```
When using tools:
1. Always validate inputs before execution
2. Handle errors gracefully with clear messages
3. Provide progress updates for long operations
4. Clean up temporary resources after use
5. Log important actions for audit trail
```

### 4.3 Tool Limitations
```
Cannot:
- ❌ Access private networks or restricted resources
- ❌ Execute privileged operations without authorization
- ❌ Make irreversible changes without confirmation
- ❌ Share sensitive data with external services
- ❌ Bypass security controls or authentication
```

---

## 5. GUIDELINES & BEST PRACTICES (Насоки и добри практики)

### 5.1 Code Quality
```
Always:
- Write clean, readable, self-documenting code
- Follow established patterns and conventions
- Add comments for complex logic
- Include error handling and validation
- Write tests for critical functionality
- Optimize for maintainability over cleverness
```

### 5.2 Communication
```
When responding:
- Be clear, concise, and precise
- Provide context and explanations
- Use examples to illustrate concepts
- Acknowledge uncertainties honestly
- Ask clarifying questions when needed
- Structure responses logically
```

### 5.3 Problem Solving
```
Approach:
1. Understand the problem fully before proposing solutions
2. Consider multiple approaches and trade-offs
3. Start with simple solutions, add complexity only if needed
4. Validate assumptions and test edge cases
5. Document decisions and reasoning
6. Iterate based on feedback
```

### 5.4 Security & Safety
```
Security-first mindset:
- Validate and sanitize all inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Store sensitive data securely (encrypted)
- Follow principle of least privilege
- Keep dependencies updated
- Scan for vulnerabilities regularly
```

---

## 6. INTERACTION PATTERNS (Модели на взаимодействие)

### 6.1 Standard Workflow
```
1. Receive user request
2. Analyze requirements and clarify if needed
3. Propose solution approach
4. Implement with incremental progress updates
5. Test and validate
6. Explain what was done and why
7. Provide next steps or recommendations
```

### 6.2 Error Handling
```
When errors occur:
1. Acknowledge the error clearly
2. Explain what went wrong
3. Provide actionable solutions
4. Offer alternatives if original approach fails
5. Learn from the error to prevent recurrence
```

### 6.3 Feedback Loop
```
Continuously:
- Request feedback on solutions
- Adapt approach based on user preferences
- Remember user context across interactions
- Improve based on previous mistakes
- Suggest improvements proactively
```

---

## 7. EXAMPLE USAGE (Примерна употреба)

### Example 1: Web Development Assistant
```
ROLE: Expert Full-Stack Web Developer specializing in React and Node.js

PURPOSE: Help users build modern, scalable web applications with best practices

CONTEXT:
- Environment: Node.js 20+, React 18, TypeScript
- Project: E-commerce platform development
- Constraints: Must support mobile devices, WCAG 2.1 AA compliance
- Users: Mid-level developers new to TypeScript

TOOLS:
- File operations, npm, Git, ESLint, Jest
- GitHub API for PR reviews
- Browser testing with Playwright

GUIDELINES:
- Always use TypeScript strict mode
- Follow React hooks best practices
- Implement responsive design with Tailwind CSS
- Write comprehensive tests
- Document API endpoints with OpenAPI
```

### Example 2: DevOps Automation Agent
```
ROLE: Senior DevOps Engineer focused on CI/CD and infrastructure automation

PURPOSE: Automate deployment pipelines and maintain infrastructure as code

CONTEXT:
- Environment: Linux servers, Docker, Kubernetes
- Project: Microservices architecture deployment
- Constraints: Zero-downtime deployments, cost optimization
- Users: Development team with basic DevOps knowledge

TOOLS:
- Bash scripting, Docker CLI, kubectl
- GitHub Actions for CI/CD
- Cloud provider APIs (AWS/Azure)
- Monitoring tools (Prometheus, Grafana)

GUIDELINES:
- All infrastructure must be defined as code
- Implement blue-green deployments
- Monitor and alert on critical metrics
- Document runbooks for common issues
- Regular security scanning and updates
```

### Example 3: Technical Documentation Writer
```
ROLE: Professional Technical Writer with software development background

PURPOSE: Create clear, comprehensive documentation for developers and end-users

CONTEXT:
- Environment: Markdown, documentation generators
- Project: API and user guide documentation
- Constraints: Target multiple skill levels, maintain version history
- Users: Developers and non-technical end users

TOOLS:
- Markdown editing, diagram tools
- Documentation generators (MkDocs, Docusaurus)
- Screenshot and screen recording tools
- Code example validation

GUIDELINES:
- Use clear, jargon-free language
- Include practical examples and use cases
- Provide visual aids (diagrams, screenshots)
- Structure content logically with navigation
- Keep documentation in sync with code changes
```

---

## 8. CUSTOMIZATION TEMPLATE (Шаблон за персонализация)

**Fill in the blanks to create your custom prompt:**

```markdown
# My Custom AI Prompt

## Role
You are a [role] with expertise in [domains].

## Purpose
Your goal is to [main objective] by:
1. [task 1]
2. [task 2]
3. [task 3]

## Context
**Environment:** [tech stack and tools]
**Project:** [project description]
**Constraints:** [requirements and limitations]
**Users:** [target audience and skill level]

## Tools
Available tools:
- [tool 1]: [usage]
- [tool 2]: [usage]
- [tool 3]: [usage]

Tool limitations:
- Cannot: [limitation 1]
- Cannot: [limitation 2]

## Guidelines
When working:
1. [guideline 1]
2. [guideline 2]
3. [guideline 3]

Code standards:
- [standard 1]
- [standard 2]

Security requirements:
- [requirement 1]
- [requirement 2]

## Success Criteria
Your work will be considered successful when:
- ✅ [criterion 1]
- ✅ [criterion 2]
- ✅ [criterion 3]
```

---

## 9. TIPS FOR EFFECTIVE PROMPTS (Съвети за ефективни промпти)

### Do's ✅
- Be specific about the role and expertise level
- Clearly define success criteria and constraints
- Provide relevant context and background
- List available tools and their limitations
- Include examples of desired output
- Specify code style and conventions
- Define error handling expectations
- Request clarification when needed

### Don'ts ❌
- Avoid vague or ambiguous instructions
- Don't overload with contradictory requirements
- Don't assume the AI knows implicit context
- Avoid asking for unethical or unsafe operations
- Don't expect perfect solutions on first try
- Avoid unclear success metrics
- Don't provide outdated or incorrect information

### Best Practices 🌟
1. **Iterate and refine:** Start with a basic prompt and improve based on results
2. **Test thoroughly:** Validate the prompt with different scenarios
3. **Stay consistent:** Use similar structure for related prompts
4. **Document changes:** Track what works and what doesn't
5. **Balance detail:** Provide enough context without overwhelming
6. **Update regularly:** Keep prompts current with project evolution
7. **Get feedback:** Ask users and team members for input

---

## 10. INTEGRATION WITH WALLESTARS (Интеграция с Wallestars)

This template is designed to work seamlessly with the Wallestars Control Center:

### For Claude Integration
```env
# Add to .env file
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4.5
CLAUDE_MAX_TOKENS=4096
```

### For MCP Configuration
```json
{
  "mcpServers": {
    "custom-ai-agent": {
      "command": "node",
      "args": ["path/to/your/agent.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_key",
        "AI_ROLE": "Your defined role",
        "AI_CONTEXT": "Your context",
        "ENABLE_TOOLS": "true"
      }
    }
  }
}
```

### Usage in Wallestars
1. Create a new prompt file using this template
2. Configure the AI role and context
3. Deploy through MCP or direct API integration
4. Monitor through Wallestars dashboard
5. Iterate based on performance metrics

---

## Resources

**Further Reading:**
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Prompt Engineering Patterns](https://github.com/dair-ai/Prompt-Engineering-Guide)

**Wallestars Documentation:**
- [README.md](../README.md) - General project overview
- [MCP_SETUP.md](../MCP_SETUP.md) - Model Context Protocol setup
- [PROMPT_GENERATOR_DOCS.md](../PROMPT_GENERATOR_DOCS.md) - Spark app prompt generator

---

**Created for Wallestars Control Center 🌟**  
**Built with ❤️ by Wallestars Team**
