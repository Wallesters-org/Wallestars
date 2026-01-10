# Contributing to Wallestars Control Center

Thank you for your interest in contributing to Wallestars! 🎉

This document provides guidelines for contributing to the project. We appreciate all contributions, from bug reports to code improvements.

---

## 📑 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Need Help?](#need-help)

---

## Code of Conduct

This project follows the principles of respect, collaboration, and inclusivity. By participating, you agree to:

- Be respectful and welcoming to all contributors
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 20.x or higher
- **npm** package manager
- **Git** for version control
- **Anthropic API Key** ([Get one here](https://console.anthropic.com))
- **(Optional)** Linux with `xdotool` for Computer Use features
- **(Optional)** Android SDK Platform Tools (`adb`) for Android control

### First Time Contributors

If you're new to open source or this project:

1. Read the [README.md](README.md) to understand the project
2. Check out the [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
3. Look for issues labeled `good first issue` or `help wanted`
4. Ask questions in GitHub Discussions or issue comments

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Wallestars.git
cd Wallestars

# Add upstream remote
git remote add upstream https://github.com/Wallesters-org/Wallestars.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Anthropic API key
# ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 4. Start Development Server

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run server    # Backend only (port 3000)
npm run client    # Frontend only (port 5173)
```

### 5. Verify Setup

Open your browser to `http://localhost:5173` and verify:
- ✅ Application loads without errors
- ✅ Dashboard displays properly
- ✅ No console errors in browser DevTools

---

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear title**: Describe the bug concisely
- **Steps to reproduce**: Numbered list of actions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node version, browser
- **Screenshots**: If applicable
- **Error messages**: Console logs or stack traces

**Note**: For security vulnerabilities, please see [SECURITY.md](SECURITY.md) instead.

### Suggesting Features

Feature requests are welcome! Please include:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: What other solutions have you considered?
- **Examples**: Similar features in other projects
- **Implementation ideas**: Technical approach (optional)

### Improving Documentation

Documentation improvements are valuable contributions:

- Fix typos or unclear explanations
- Add missing information
- Create tutorials or guides
- Translate documentation (currently English/Bulgarian)
- Update outdated information

---

## Coding Standards

### General Principles

- **Module System**: Use ES Modules (`import`/`export`)
- **Async Patterns**: Use `async`/`await` over raw promises
- **Error Handling**: Always use try-catch blocks
- **Configuration**: Use environment variables via `.env`

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `ClaudeChat.jsx` |
| Functions/Variables | camelCase | `fetchMessages`, `userData` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Files (React) | PascalCase.jsx | `Dashboard.jsx` |
| Files (Utilities) | camelCase.js | `apiClient.js` |

### React Component Structure

```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ComponentName({ title, onAction }) {
  // 1. State declarations
  const [data, setData] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 4. Render
  return (
    <motion.div className="p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button onClick={handleClick}>Action</button>
    </motion.div>
  );
}
```

### Backend Route Structure

```javascript
import express from 'express';
const router = express.Router();

router.post('/endpoint', async (req, res) => {
  try {
    // 1. Validate input
    const { param } = req.body;
    if (!param) {
      return res.status(400).json({ error: 'Missing parameter' });
    }
    
    // 2. Process request
    const result = await processRequest(param);
    
    // 3. Return response
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Styling Guidelines

Use Tailwind CSS utility classes:

```jsx
// ✅ Good - Utility classes
<div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
  <h2 className="text-xl font-semibold text-sky-500">Title</h2>
</div>

// ❌ Avoid - Custom CSS (unless Tailwind is insufficient)
```

**Theme Colors:**
- Primary: Sky blue (`sky-500`, `#0ea5e9`)
- Background: Dark (`gray-800`, `gray-900`)
- Text: Light (`gray-100`, `gray-200`)

---

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style/formatting (no logic changes)
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks (dependencies, config)
- `perf`: Performance improvements
- `security`: Security fixes

### Examples

```bash
# Good commits
feat: add Android screen capture endpoint
fix: resolve WebSocket connection timeout
docs: update MCP setup instructions
refactor: simplify Claude API error handling

# Bad commits (avoid)
update stuff
fixes
WIP
.
```

### Detailed Commit Message

```
feat: add real-time device monitoring

Implements WebSocket-based device status monitoring with:
- Battery level tracking
- Storage usage visualization
- CPU/Memory metrics

Closes #123
```

### Best Practices

- Write clear, descriptive commit messages
- Keep commits focused on a single change
- Reference issue numbers when applicable
- Use present tense ("add feature" not "added feature")
- Keep subject line under 72 characters

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass locally
- [ ] Documentation is updated (if applicable)
- [ ] No console errors or warnings
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

### Creating a Pull Request

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes:**
   - Write clean, documented code
   - Follow coding standards
   - Test your changes thoroughly

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

### Pull Request Template

Your PR should include:

**Description:**
- What changes does this PR make?
- Why are these changes needed?

**Type of Change:**
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

**Testing:**
- How did you test your changes?
- What edge cases did you consider?

**Screenshots:** (if UI changes)

**Related Issues:** Closes #123

### Review Process

1. **Automated Checks**: Wait for CI/CD to complete
2. **Code Review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: At least one maintainer must approve
5. **Merge**: Maintainers will merge your PR

### After Merge

- Delete your feature branch
- Pull the latest changes from main
- Close any related issues

---

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests should be:
- **Clear**: Easy to understand what's being tested
- **Isolated**: Independent of other tests
- **Reliable**: Consistent results
- **Fast**: Quick to execute

**Example Unit Test:**

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

describe('Dashboard Component', () => {
  it('should render heading', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

**Example API Test:**

```javascript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Health Check API', () => {
  it('should return healthy status', async () => {
    const response = await axios.get('http://localhost:3000/api/health');
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
  });
});
```

### Test Coverage

- Aim for meaningful coverage, not just high percentages
- Focus on critical paths and edge cases
- Test error handling and validation
- Mock external dependencies (API calls, file system)

---

## Development Tips

### Debugging

**Frontend:**
```javascript
// Use React DevTools
// Check browser console
// Verify API calls in Network tab
// Check WebSocket connection
```

**Backend:**
```javascript
// Add detailed logging
console.log('[API] Request:', req.method, req.path);

// Test endpoints with curl
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

### Common Issues

**Port already in use:**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```bash
# Clean build artifacts
rm -rf dist/
npm run build
```

---

## Language Support

This project supports bilingual content (English/Bulgarian):

- **English**: Primary language for code and documentation
- **Bulgarian**: Supported for user-facing content and issues
- **Contributions**: Welcome in either language
- **Communication**: Feel free to use Bulgarian in issues/discussions

**Добре дошли!** Приемаме приноси и на български език. 🇧🇬

---

## Need Help?

### Resources

- **Documentation**: Check README.md and other docs
- **Architecture**: See ARCHITECTURE.md
- **Security**: Read SECURITY.md for security concerns
- **Issues**: Browse existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions or share ideas
- **Pull Requests**: Propose code changes
- **Email**: For security issues (see SECURITY.md)

### Community

We strive to be welcoming and helpful to all contributors. Don't hesitate to:
- Ask questions if something is unclear
- Request clarification on issues
- Suggest improvements to documentation
- Share your ideas and feedback

---

## License

By contributing to Wallestars, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

<div align="center">

**Thank you for contributing to Wallestars! 🌟**

Every contribution, no matter how small, makes this project better.

⭐ Star the repository if you find it useful!

</div>
