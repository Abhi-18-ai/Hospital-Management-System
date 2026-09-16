'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../modules/users/user.model');
const { USER_STATUS } = require('../utils/constants');

/**
 * Authentication middleware.
 * Establishes req.user from a valid Bearer access token.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Authentication token missing or malformed.', 'AUTH_TOKEN_MISSING');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired.', 'AUTH_TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid access token.', 'AUTH_TOKEN_INVALID');
  }

  const user = await User.findById(payload.sub).select('+status');
  if (!user) {
    throw ApiError.unauthorized('User associated with this token no longer exists.', 'AUTH_USER_NOT_FOUND');
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('User account is not active.', 'AUTH_USER_INACTIVE');
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    name: user.name,
    status: user.status,
  };

  next();
});

/**
 * Optional authentication: attaches req.user if a valid token is present,
 * otherwise proceeds anonymously. Useful for endpoints with mixed access rules.
 */
const authenticateOptional = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (user && user.status === USER_STATUS.ACTIVE) {
      req.user = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        status: user.status,
      };
    }
  } catch (err) {
    // Silently ignore invalid optional tokens.
  }

  next();
});

module.exports = { authenticate, authenticateOptional };
