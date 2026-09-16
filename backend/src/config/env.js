'use strict';

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function warnIfMissing(name) {
  if (!process.env[name]) {
    console.warn(`[env] Warning: environment variable ${name} is not set. Using insecure/default fallback.`);
  }
}

['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_RESET_SECRET'].forEach(warnIfMissing);

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management_system',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || 'dev_reset_secret_change_me',
  JWT_RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN || '15m',

  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || 'hms_refresh_token',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  EMAIL_ENABLED: process.env.EMAIL_ENABLED !== 'false',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'MediCore Hospital',
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'no-reply@medicore.local',
  CLIENT_APP_URL: (process.env.CLIENT_APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
};

env.IS_PRODUCTION = env.NODE_ENV === 'production';

module.exports = env;
