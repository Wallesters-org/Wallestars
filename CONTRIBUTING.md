# Contributing to Wallestars Control Center

First off, thank you for considering contributing to Wallestars Control Center! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Git
- Linux (for Computer Use features)
- Android SDK Platform Tools (for Android control)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Wallestars.git
   cd Wallestars
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Wallesters-org/Wallestars.git
   ```

3. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check if the issue already exists
- Collect information about the bug
- Use the bug report template

### Suggesting Features

Before suggesting a feature:
- Check if it aligns with project goals
- Check existing issues and PRs
- Use the feature request template

### Code Contributions

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add comments where necessary
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add awesome feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. **Before submitting**
   - Ensure all tests pass
   - Update documentation
   - Add your changes to CHANGELOG.md (if exists)

2. **PR Title Format**
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

3. **PR Description**
   - Describe what changes were made
   - Link related issues
   - Include screenshots for UI changes

4. **Review Process**
   - Wait for automated checks
   - Address review comments
   - Merge when approved

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names

### File Organization

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── context/        # React context providers
├── hooks/          # Custom hooks
├── utils/          # Utility functions
└── styles/         # CSS files

server/
├── routes/         # API routes
├── socket/         # WebSocket handlers
└── utils/          # Server utilities
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.jsx`)
- **Utilities**: camelCase (`myUtility.js`)
- **CSS**: kebab-case (`my-styles.css`)
- **Constants**: UPPER_SNAKE_CASE

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```bash
feat(android): add screenshot capture functionality
fix(chat): resolve message ordering issue
docs: update installation instructions
```

## Questions?

Feel free to open an issue for any questions or reach out to the maintainers.

---

Thank you for contributing! 🚀
