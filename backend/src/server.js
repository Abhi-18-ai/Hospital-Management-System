'use strict';

const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');

let server;

async function start() {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      logger.info(`Hospital Management System API listening on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Graceful shutdown: stop accepting new connections, let in-flight requests
 * finish where practical, close the database connection, then exit.
 */
function shutdown(signal) {
  return async () => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 15000);
    forceExitTimer.unref();

    if (server) {
      server.close(async (err) => {
        if (err) {
          logger.error(`Error while closing HTTP server: ${err.message}`);
        } else {
          logger.info('HTTP server closed.');
        }

        try {
          await disconnectDatabase();
          logger.info('Database connection closed.');
        } catch (dbErr) {
          logger.error(`Error while closing database connection: ${dbErr.message}`);
        }

        clearTimeout(forceExitTimer);
        process.exit(err ? 1 : 0);
      });
    } else {
      clearTimeout(forceExitTimer);
      process.exit(0);
    }
  };
}

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
  // An uncaught exception leaves the process in an undefined state;
  process.exit(1);
});

start();
