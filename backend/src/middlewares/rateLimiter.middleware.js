'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Global baseline rate limiter applied to all /api routes.
 */
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: { code: 'RATE_LIMIT_EXCEEDED', details: null },
  },
});

/**
 * Stricter rate limiter for sensitive authentication endpoints
 * (login, register, forgot-password, reset-password) to slow brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    error: { code: 'AUTH_RATE_LIMIT_EXCEEDED', details: null },
  },
});

module.exports = { globalLimiter, authLimiter };
