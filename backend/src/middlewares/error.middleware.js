'use strict';

const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  let apiError = err;

  if (!(err instanceof ApiError)) {
    apiError = normalizeError(err);
  }

  const logPayload = {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    userId: req.user ? req.user.id : undefined,
    statusCode: apiError.statusCode,
    code: apiError.code,
  };

  if (apiError.statusCode >= 500) {
    logger.error(`${apiError.message}`, { ...logPayload, stack: err.stack });
  } else {
    logger.warn(`${apiError.message}`, logPayload);
  }

  const responseBody = {
    success: false,
    message: apiError.message,
    error: {
      code: apiError.code,
      details: apiError.details || null,
      requestId: req.requestId,
    },
  };

  if (!env.IS_PRODUCTION && apiError.statusCode >= 500) {
    responseBody.error.stack = err.stack;
  }

  res.status(apiError.statusCode || 500).json(responseBody);
}

function normalizeError(err) {
  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.badRequest('Validation failed.', 'VALIDATION_ERROR', details);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for field '${field}'.`, 'DUPLICATE_KEY', { field });
  }

  // Mongoose invalid ObjectId cast
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for field '${err.path}'.`, 'INVALID_ID', { field: err.path });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid authentication token.', 'AUTH_TOKEN_INVALID');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Authentication token has expired.', 'AUTH_TOKEN_EXPIRED');
  }

  // Body parser JSON error
  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON in request body.', 'MALFORMED_JSON');
  }

  // Fallback: unexpected error
  return ApiError.internal(
    env.IS_PRODUCTION ? 'An unexpected error occurred.' : err.message || 'Internal server error',
    'INTERNAL_SERVER_ERROR'
  );
}

module.exports = errorMiddleware;
