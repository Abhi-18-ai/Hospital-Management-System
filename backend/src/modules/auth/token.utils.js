'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../../config/env');

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

function signRefreshToken(user) {
  const jti = crypto.randomBytes(32).toString('hex');
  const token = jwt.sign({ sub: user._id.toString(), jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  return { token, jti };
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function signResetToken(user) {
  return jwt.sign({ sub: user._id.toString(), purpose: 'password_reset' }, env.JWT_RESET_SECRET, {
    expiresIn: env.JWT_RESET_EXPIRES_IN,
  });
}

function verifyResetToken(token) {
  return jwt.verify(token, env.JWT_RESET_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Parses a human-readable duration like '15m', '7d', '1h' into milliseconds.
 * Falls back to 15 minutes if the format is not recognized.
 */
function parseDurationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(String(duration).trim());
  if (!match) return 15 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * multipliers[unit];
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signResetToken,
  verifyResetToken,
  hashToken,
  parseDurationToMs,
};
