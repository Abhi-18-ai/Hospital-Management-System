'use strict';

const winston = require('winston');
const env = require('./env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${stack || message}${metaString}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.IS_PRODUCTION ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

// Stream adapter so morgan  can pipe into winston.
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
