'use strict';

const User = require('../users/user.model');
const Patient = require('../patients/patient.model');
const Session = require('./session.model');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const notificationService = require('../notifications/notification.service');
const emailService = require('../notifications/email.service');
const env = require('../../config/env');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signResetToken,
  verifyResetToken,
  hashToken,
  parseDurationToMs,
} = require('./token.utils');
const { AUDIT_ACTIONS, NOTIFICATION_TYPE, USER_STATUS } = require('../../utils/constants');

async function register({ name, email, phone, password, role }, req) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.', 'EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, phone, passwordHash, role });

  if (user.role === 'patient') {
    const nameParts = user.name.trim().split(/\s+/);
    const firstName = nameParts.shift() || user.name;
    const lastName = nameParts.join(' ') || firstName;
    await Patient.create({
      userId: user._id,
      firstName,
      lastName,
      gender: 'other',
      contact: { phone: user.phone || 'Not provided', email: user.email },
    });
  }

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.USER_REGISTER,
    resourceType: 'User',
    resourceId: user._id,
    metadata: { role: user.role },
  });

  // Fire-and-forget: emailService never throws, so registration always
  // succeeds for the caller even if mail delivery is slow or fails.
  emailService.sendTemplate(user.email, 'welcome', { name: user.name });

  const tokens = await issueSession(user, req);
  return { user, ...tokens };
}

async function login({ email, password }, req) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    await auditService.record({
      req,
      action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
      resourceType: 'User',
      metadata: { email },
    });
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('This account is not active. Contact an administrator.', 'ACCOUNT_NOT_ACTIVE');
  }

  user.lastLoginAt = new Date();
  await user.save();

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.USER_LOGIN,
    resourceType: 'User',
    resourceId: user._id,
  });

  const tokens = await issueSession(user, req);
  return { user, ...tokens };
}

async function issueSession(user, req) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, jti } = signRefreshToken(user);

  await Session.create({
    userId: user._id,
    refreshTokenHash: hashToken(jti),
    userAgent: req?.headers?.['user-agent'] || null,
    ip: req?.ip || null,
    expiresAt: new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN)),
  });

  return { accessToken, refreshToken };
}

async function refresh(refreshToken, req) {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token missing.', 'REFRESH_TOKEN_MISSING');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token.', 'REFRESH_TOKEN_INVALID');
  }

  const tokenHash = hashToken(payload.jti);
  const session = await Session.findOne({ userId: payload.sub, refreshTokenHash: tokenHash });

  if (!session || !session.isActive()) {
    throw ApiError.unauthorized('Session is no longer valid. Please log in again.', 'SESSION_INVALID');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.unauthorized('User account is not available.', 'AUTH_USER_NOT_FOUND');
  }

  // Rotate refresh token: revoke the old session and issue a new one.
  session.revokedAt = new Date();
  await session.save();

  const tokens = await issueSession(user, req);
  return { user, ...tokens };
}

async function logout(refreshToken) {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(payload.jti);
    await Session.findOneAndUpdate(
      { userId: payload.sub, refreshTokenHash: tokenHash, revokedAt: null },
      { revokedAt: new Date() }
    );
  } catch (err) {
    // Token already invalid/expired: logout is idempotent, so we simply proceed.
  }
}

async function changePassword(userId, currentPassword, newPassword, req) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found.', 'USER_NOT_FOUND');

  const matches = await user.comparePassword(currentPassword);
  if (!matches) {
    throw ApiError.unauthorized('Current password is incorrect.', 'INVALID_CURRENT_PASSWORD');
  }

  user.passwordHash = await User.hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  // Revoke all existing sessions so other devices must re-authenticate.
  await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.USER_PASSWORD_CHANGE,
    resourceType: 'User',
    resourceId: user._id,
  });

  await notificationService.notify({
    userId: user._id,
    type: NOTIFICATION_TYPE.SECURITY_ALERT,
    title: 'Password changed',
    message: 'Your password was changed successfully. If this was not you, contact an administrator immediately.',
  });

  emailService.sendTemplate(user.email, 'passwordChanged', { name: user.name });

  return user;
}

async function forgotPassword(email, req) {
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond as if the request succeeded to avoid leaking account existence.
  if (!user) return;

  const resetToken = signResetToken(user);
  const resetUrl = `${env.CLIENT_APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.USER_PASSWORD_RESET_REQUEST,
    resourceType: 'User',
    resourceId: user._id,
  });

  await notificationService.notify({
    userId: user._id,
    type: NOTIFICATION_TYPE.SECURITY_ALERT,
    title: 'Password reset requested',
    message: 'A password reset was requested for your account.',
    metadata: { resetTokenIssued: true },
  });

  // The actual delivery mechanism: a real email containing the reset link.
  // The API response never includes the token in production (see
  // auth.controller.js) -- this email is the only production-facing channel.
  emailService.sendTemplate(user.email, 'passwordReset', {
    name: user.name,
    resetUrl,
    expiresIn: env.JWT_RESET_EXPIRES_IN,
  });

  return resetToken;
}

async function resetPassword(token, newPassword, req) {
  let payload;
  try {
    payload = verifyResetToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired reset token.', 'RESET_TOKEN_INVALID');
  }

  if (payload.purpose !== 'password_reset') {
    throw ApiError.unauthorized('Invalid reset token.', 'RESET_TOKEN_INVALID');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.notFound('User not found.', 'USER_NOT_FOUND');

  user.passwordHash = await User.hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

  await auditService.record({
    req,
    action: AUDIT_ACTIONS.USER_PASSWORD_RESET_COMPLETE,
    resourceType: 'User',
    resourceId: user._id,
  });

  await notificationService.notify({
    userId: user._id,
    type: NOTIFICATION_TYPE.SECURITY_ALERT,
    title: 'Password reset completed',
    message: 'Your password was reset successfully. If this was not you, contact an administrator immediately.',
  });

  emailService.sendTemplate(user.email, 'passwordChanged', { name: user.name });

  return user;
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
