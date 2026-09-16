'use strict';

const mongoose = require('mongoose');

/**
 * Server-side refresh session record. Storing a hash (never the raw token)
 * lets the server revoke individual sessions (logout) or all sessions for a
 * user (e.g. on password change) without needing a token blocklist service.
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.methods.isActive = function isActive() {
  return !this.revokedAt && this.expiresAt > new Date();
};

module.exports = mongoose.model('Session', sessionSchema);
