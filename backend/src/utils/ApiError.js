'use strict';

class ApiError extends Error {

  constructor(statusCode, message, code = 'ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', code = 'BAD_REQUEST', details = null) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED', details = null) {
    return new ApiError(401, message, code, details);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN', details = null) {
    return new ApiError(403, message, code, details);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND', details = null) {
    return new ApiError(404, message, code, details);
  }

  static conflict(message = 'Conflict', code = 'CONFLICT', details = null) {
    return new ApiError(409, message, code, details);
  }

  static unprocessable(message = 'Unprocessable entity', code = 'UNPROCESSABLE_ENTITY', details = null) {
    return new ApiError(422, message, code, details);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_SERVER_ERROR', details = null) {
    return new ApiError(500, message, code, details);
  }
}

module.exports = ApiError;
