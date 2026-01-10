# Wallestars Test Suite

This directory contains the test infrastructure for Wallestars Control Center.

## Overview

We use **Vitest** as our testing framework along with **React Testing Library** for component testing.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── Header.test.jsx
│       └── Sidebar.test.jsx
├── pages/
│   └── __tests__/
│       └── Dashboard.test.jsx
└── tests/
    └── setup.js          # Test setup and configuration

server/
└── __tests__/
    └── health.test.js    # API tests
```

## Test Coverage

Current test coverage:
- ✅ Header component (3 tests)
- ✅ Sidebar component (2 tests)
- ✅ Dashboard page (3 tests)
- ✅ Health API (2 tests)

**Total: 10 tests passing**

## Writing Tests

### Component Tests

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../MyComponent';

// Mock dependencies
vi.mock('../../context/SocketContext', () => ({
  useSocket: () => ({ connected: true })
}));

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### API Tests

```javascript
import { describe, it, expect } from 'vitest';

describe('API Endpoint', () => {
  it('should validate response structure', () => {
    const mockResponse = {
      status: 'success',
      data: {}
    };
    
    expect(mockResponse).toHaveProperty('status');
    expect(mockResponse).toHaveProperty('data');
  });
});
```

## Best Practices

1. **Test file naming**: `ComponentName.test.jsx`
2. **Test location**: Place tests in `__tests__` directory next to source files
3. **Mock dependencies**: Always mock external dependencies (API calls, WebSocket, etc.)
4. **Descriptive test names**: Use clear, descriptive test names
5. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases

## Configuration

Tests are configured in:
- **`vitest.config.js`**: Main Vitest configuration
- **`src/tests/setup.js`**: Test setup and globals

## Common Issues

### Mock not working
Make sure to call `vi.mock()` at the top level of your test file, not inside a `describe` block.

### Component not rendering
Ensure you wrap components that use routing with `<BrowserRouter>`.

### Async tests
Use `async/await` or return promises for asynchronous tests.

## Next Steps

Areas that need test coverage:
- [ ] ClaudeChat component
- [ ] ComputerControl component
- [ ] AndroidControl component
- [ ] Settings component
- [ ] PromptGenerator component
- [ ] Socket event handlers
- [ ] API route handlers

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
