'use strict';

const nodemailer = require('nodemailer');
const env = require('./env');
const logger = require('./logger');

let transporterPromise = null;
let isUsingEtherealFallback = false;

function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
      });

      try {
        await transporter.verify();
        logger.info(`Email transporter ready via SMTP host ${env.SMTP_HOST}.`);
      } catch (err) {
        logger.error(`SMTP verification failed for ${env.SMTP_HOST}: ${err.message}`);
      }

      return transporter;
    }

    
    isUsingEtherealFallback = true;
    const testAccount = await nodemailer.createTestAccount();
    logger.warn(
      'SMTP_HOST not configured -- using an Ethereal test inbox for email. ' +
        'No real email will be delivered. Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD to send real mail.'
    );

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  })();

  return transporterPromise;
}

function usingEtherealFallback() {
  return isUsingEtherealFallback;
}

module.exports = { getTransporter, usingEtherealFallback };
