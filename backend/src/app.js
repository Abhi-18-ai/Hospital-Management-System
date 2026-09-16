'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const logger = require('./config/logger');
const requestContext = require('./middlewares/requestContext.middleware');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const notFound = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const healthRoutes = require('./modules/health/health.routes');
const apiRoutes = require('./routes/index');

const app = express();

// Express is behind a reverse proxy/load balancer in production 
// trust the first proxy hop so req.ip and secure cookies behave correctly.
app.set('trust proxy', 1);

// Security headers 
app.use(helmet());

//  CORS: only the configured client origin, credentials only when required
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

//  Body / cookie parsers with small JSON body limits 
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

//  Sanitize request data against NoSQL injection operators 
app.use(mongoSanitize());

//  Request correlation id (used in logs and audit entries)
app.use(requestContext);

// HTTP request logging piped through the application logger 
app.use(
  morgan(env.IS_PRODUCTION ? 'combined' : 'dev', {
    stream: logger.stream,
    skip: (req) => req.path === '/health', // avoid flooding logs with liveness checks
  })
);

//  Rate limiting baseline for all API traffic 
app.use('/api', globalLimiter);

// Health / readiness endpoints (unversioned, used by orchestrators/load balancers)
app.use('/', healthRoutes);

//  Versioned API
app.use('/api/v1', apiRoutes);

//  404 for anything unmatched 
app.use(notFound);

//  Centralized error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
