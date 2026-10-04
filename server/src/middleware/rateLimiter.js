const rateLimit = require('express-rate-limit');

const base = { standardHeaders: true, legacyHeaders: false };

const generalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { error: 'Too many requests. Please try again later.' },
});

// Only failed attempts count, so normal users are not locked out by logging in a few times.
const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

module.exports = { generalLimiter, authLimiter };
