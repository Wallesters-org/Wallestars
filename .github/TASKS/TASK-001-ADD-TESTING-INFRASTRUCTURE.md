# Task 001: Add Testing Infrastructure

**Priority**: P1 (High)  
**Estimated Effort**: 2-4 hours  
**Assignee**: Claude Code / Cursor Agent  
**Language Preference**: 🇧🇬 Bulgarian (за по-добро разбиране и инструкции)

---

## Описание на задачата (Task Description)

Проектът Wallestars в момента няма тестова инфраструктура. Необходимо е да се добави testing framework и да се създадат базови тестове за ключови компоненти.

**Current Status**: ❌ No test files, placeholder test script in package.json

---

## Цели (Objectives)

1. ✅ Инсталиране на Vitest и React Testing Library
2. ✅ Конфигуриране на тестова среда
3. ✅ Създаване на примерни unit tests за компоненти
4. ✅ Създаване на примерни integration tests за API endpoints
5. ✅ Обновяване на npm scripts в package.json
6. ✅ Добавяне на GitHub Actions workflow за автоматично изпълнение на тестове

---

## Стъпки за изпълнение (Implementation Steps)

### Стъпка 1: Инсталиране на зависимости

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom
```

### Стъпка 2: Създаване на Vitest конфигурация

Създайте файл `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '*.config.js'
      ]
    }
  }
});
```

### Стъпка 3: Създаване на test setup файл

Създайте `src/tests/setup.js`:

```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup след всеки тест
afterEach(() => {
  cleanup();
});
```

### Стъпка 4: Създаване на примерни тестове

#### Пример за компонентен тест - `src/components/__tests__/Dashboard.test.jsx`:

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

describe('Dashboard Component', () => {
  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
```

#### Пример за API тест - `server/__tests__/health.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import axios from 'axios';

describe('Health Check API', () => {
  it('should return healthy status', async () => {
    // Note: This requires the server to be running
    // Consider using supertest for better API testing
    const response = await axios.get('http://localhost:3000/api/health');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'healthy');
  });
});
```

### Стъпка 5: Обновяване на package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Стъпка 6: Създаване на GitHub Actions workflow

Създайте `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov (optional)
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Критерии за приемане (Acceptance Criteria)

- [ ] Vitest и testing libraries са инсталирани
- [ ] Vitest конфигурацията е създадена и работи
- [ ] Минимум 3 unit tests за React компоненти
- [ ] Минимум 2 integration tests за API endpoints
- [ ] `npm test` изпълнява тестовете успешно
- [ ] GitHub Actions workflow за тестове е създаден и работи
- [ ] Test coverage report се генерира

---

## Ресурси (Resources)

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest with React Guide](https://vitest.dev/guide/ui.html)

---

## Бележки (Notes)

- Започнете с прости тестове и постепенно увеличавайте coverage
- Фокусирайте се върху критичните компоненти първо (Dashboard, Claude Chat, Computer Use)
- Уверете се, че тестовете минават локално преди да commit-нете
- За API тестове, може да се наложи да използвате mocking или test server

---

## Related Issues

- Resolves: Missing testing infrastructure (from PR_REVIEW_FINDINGS.md)
- Related to: CI/CD pipeline improvements
