'use strict';

/**
 * One-time script: creates the initial Super Admin account so the
 * system can be administered immediately after deployment.
 * Usage: npm run seed
 */
const { connectDatabase, disconnectDatabase } = require('../config/database');
const logger = require('../config/logger');
const User = require('../modules/users/user.model');
const { ROLES, USER_STATUS } = require('./constants');

const SEED_ADMIN = {
  name: process.env.SEED_ADMIN_NAME || 'System Administrator',
  email: process.env.SEED_ADMIN_EMAIL || 'aky818123@gmail.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
};

async function seed() {
  await connectDatabase();

  const existing = await User.findOne({ email: SEED_ADMIN.email.toLowerCase() });
  if (existing) {
    logger.info(`Seed skipped: a user with email ${SEED_ADMIN.email} already exists.`);
    await disconnectDatabase();
    return;
  }

  const passwordHash = await User.hashPassword(SEED_ADMIN.password);
  const admin = await User.create({
    name: SEED_ADMIN.name,
    email: SEED_ADMIN.email,
    passwordHash,
    role: ROLES.SUPER_ADMIN,
    status: USER_STATUS.ACTIVE,
  });

  logger.info(`Super admin created: ${admin.email}. Please log in and change the password immediately.`);
  await disconnectDatabase();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`Seed failed: ${err.message}`);
    process.exit(1);
  });
