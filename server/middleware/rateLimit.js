import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Claude API rate limiter (more restrictive due to API costs)
export const claudeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: {
    success: false,
    error: 'Too many AI requests. Please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Vision API rate limiter (even more restrictive for image processing)
export const visionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 vision requests per minute
  message: {
    success: false,
    error: 'Too many image analysis requests. Please wait before uploading more images.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Computer Use rate limiter (very restrictive for safety)
export const computerUseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 computer control actions per minute
  message: {
    success: false,
    error: 'Computer control rate limit exceeded. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
