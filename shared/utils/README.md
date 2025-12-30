# Shared Utilities

Общи utility функции използвани в целия проект.

## Структура

```
shared/utils/
├── logger.js          # Logging functionality
├── validators.js      # Input validation
├── helpers.js         # Helper functions
├── date-utils.js      # Date/time utilities
└── string-utils.js    # String manipulation
```

## Usage

```javascript
// Import utilities
const { logger } = require('../shared/utils/logger');
const { validateEmail } = require('../shared/utils/validators');

// Use in your code
logger.info('Starting process...');
if (validateEmail(email)) {
  // proceed
}
```

## Available Utilities

### Logger
- `logger.info(message)`
- `logger.error(message, error)`
- `logger.warn(message)`
- `logger.debug(message)`

### Validators
- `validateEmail(email)`
- `validatePhone(phone)`
- `validateURL(url)`
- `validateJSON(jsonString)`

### Helpers
- `sleep(ms)` - Promise-based delay
- `retry(fn, attempts, delay)` - Retry mechanism
- `chunk(array, size)` - Split array into chunks
- `sanitize(input)` - Sanitize user input

## Development

When adding new utilities:
1. Add to appropriate file or create new file
2. Export function
3. Add JSDoc comments
4. Add unit tests
5. Update this README
