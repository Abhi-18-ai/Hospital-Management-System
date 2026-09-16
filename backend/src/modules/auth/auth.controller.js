'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const authService = require('./auth.service');
const env = require('../../config/env');
const { parseDurationToMs } = require('./token.utils');

function setRefreshCookie(res, refreshToken) {
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: env.IS_PRODUCTION ? 'strict' : 'lax',
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
    path: '/api/v1/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(env.REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
}

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body, req);
  setRefreshCookie(res, refreshToken);
  new ApiResponse(201, { user: user.toSafeJSON(), accessToken }, 'Account registered successfully.').send(res);
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, req);
  setRefreshCookie(res, refreshToken);
  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Login successful.').send(res);
});

const refreshSession = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(incomingToken, req);
  setRefreshCookie(res, refreshToken);
  new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Session refreshed successfully.').send(res);
});

const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  await authService.logout(incomingToken);
  clearRefreshCookie(res);
  new ApiResponse(200, null, 'Logged out successfully.').send(res);
});

const me = asyncHandler(async (req, res) => {
  new ApiResponse(200, req.user, 'Authenticated user retrieved successfully.').send(res);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword === newPassword) {
    throw ApiError.badRequest('New password must be different from the current password.', 'SAME_PASSWORD');
  }
  await authService.changePassword(req.user.id, currentPassword, newPassword, req);
  clearRefreshCookie(res);
  new ApiResponse(200, null, 'Password changed successfully. Please log in again.').send(res);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const isDev = !env.IS_PRODUCTION;
  const resetToken = await authService.forgotPassword(req.body.email, req);
  new ApiResponse(
    200,
    isDev && resetToken ? { resetToken } : null,
    'If an account with this email exists, password reset instructions have been sent.'
  ).send(res);
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword, req);
  new ApiResponse(200, null, 'Password reset successfully. Please log in with your new password.').send(res);
});

module.exports = {
  register,
  login,
  refreshSession,
  logout,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
};
