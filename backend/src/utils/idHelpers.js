'use strict';

const mongoose = require('mongoose');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Generates a sequential-looking, human-readable identifier.
 */
function generateCode(prefix) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${timestamp}-${random}`;
}

module.exports = { isValidObjectId, generateCode };
