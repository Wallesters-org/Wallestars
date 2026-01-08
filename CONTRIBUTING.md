# Contributing to Wallestars Control Center

Thank you for your interest in contributing to Wallestars Control Center! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Copy environment variables**: `cp .env.example .env`
4. **Add your API key** to `.env`
5. **Start development server**: `npm run dev`

## Development Workflow

### Running the Application

```bash
# Start both server and client
npm run dev

# Start server only
npm run server

# Start client only  
npm run client

# Build for production
npm run build

# Start production server
npm start
```

### Code Style

- Use ES6+ JavaScript features
- Follow React best practices and hooks conventions
- Use meaningful variable and function names
- Keep components focused and single-purpose
- Add comments for complex logic

### Testing

Before submitting a pull request:

1. **Build the application**: `npm run build`
2. **Test all features** you've modified
3. **Check for console errors** in the browser
4. **Test on different screen sizes** if UI changes are made

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-capability`
- `fix/resolve-bug-description`
- `docs/update-readme`
- `refactor/improve-component`

### Commit Messages

Write clear, concise commit messages:
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor" not "Moves cursor")
- Keep first line under 50 characters
- Add detailed description if needed after a blank line

Examples:
```
Add Android device selection dropdown

Add feature to select between multiple connected Android devices
using ADB. Updates UI to show device list and allows switching
between devices for control operations.
```

### Pull Requests

1. **Update documentation** if you're changing functionality
2. **Keep changes focused** - one feature/fix per PR
3. **Describe your changes** clearly in the PR description
4. **Reference related issues** using #issue-number

### What to Contribute

We welcome contributions in these areas:

- 🐛 **Bug fixes** - Help us identify and fix issues
- ✨ **New features** - Add capabilities that fit the project vision
- 📝 **Documentation** - Improve README, guides, and code comments
- 🎨 **UI/UX improvements** - Enhance the user interface
- 🔒 **Security** - Identify and fix security issues
- ⚡ **Performance** - Optimize code and improve efficiency
- 🧪 **Tests** - Add test coverage (coming soon)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing opinions and approaches

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed information for bug reports
- Include steps to reproduce issues

## License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

Thank you for contributing to Wallestars Control Center! 🌟
