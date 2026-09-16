'use strict';

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 20 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
