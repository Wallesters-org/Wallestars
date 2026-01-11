import helmet from 'helmet';
import createDOMPurify from 'isomorphic-dompurify';

const DOMPurify = createDOMPurify();

// Security middleware configuration
export const securityMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Tailwind
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"], // Allow data URLs for images
      connectSrc: ["'self'", "http://localhost:3001", "ws://localhost:3001"], // Allow API connections
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // X-DNS-Prefetch-Control
  dnsPrefetchControl: {
    allow: false,
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
  
  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // X-XSS-Protection
  xssFilter: true,
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize strings using DOMPurify
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Use DOMPurify to clean HTML and remove dangerous content
      // RETURN_DOM_FRAGMENT: false to return a string
      // ALLOWED_TAGS: [] to strip all HTML tags
      return DOMPurify.sanitize(obj, { 
        ALLOWED_TAGS: [], 
        ALLOWED_ATTR: [],
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false
      });
    }
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      Object.keys(obj).forEach(key => {
        sanitized[key] = sanitize(obj[key]);
      });
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout. The operation took too long to complete.'
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Error handling middleware with retry suggestions
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Don't send error if response already sent
  if (res.headersSent) {
    return next(err);
  }

  // Default error response
  const errorResponse = {
    success: false,
    error: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  // Add retry suggestion for certain errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    errorResponse.retry = true;
    errorResponse.suggestion = 'Please check your internet connection and try again.';
  }

  // Anthropic API specific errors
  if (err.message?.includes('API key')) {
    errorResponse.suggestion = 'Please check your API key configuration.';
  }

  // Rate limit errors
  if (err.status === 429) {
    errorResponse.retry = true;
    errorResponse.retryAfter = 60; // seconds
    errorResponse.suggestion = 'Too many requests. Please wait a moment before trying again.';
  }

  // Send appropriate status code
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json(errorResponse);
};
