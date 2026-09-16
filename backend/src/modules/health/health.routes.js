'use strict';

const express = require('express');
const mongoose = require('mongoose');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { isDatabaseConnected } = require('../../config/database');

const router = express.Router();

/**
 * GET /health - Liveness probe. Confirms the process is up and responding.
 * Should stay lightweight and must not depend on external services.
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    new ApiResponse(200, { status: 'ok', uptimeSeconds: process.uptime() }, 'Service is alive.').send(res);
  })
);

/**
 * GET /health/ready - Readiness probe. Verifies dependencies (MongoDB)
 * are actually reachable before declaring the service ready for traffic.
 */
router.get(
  '/health/ready',
  asyncHandler(async (req, res) => {
    const dbConnected = isDatabaseConnected();
    const dbState = mongoose.connection.readyState; // 1 = connected

    const ready = dbConnected && dbState === 1;

    const payload = {
      status: ready ? 'ready' : 'not_ready',
      dependencies: { mongodb: dbConnected ? 'connected' : 'disconnected' },
    };

    new ApiResponse(ready ? 200 : 503, payload, ready ? 'Service is ready.' : 'Service is not ready.').send(res);
  })
);

module.exports = router;
