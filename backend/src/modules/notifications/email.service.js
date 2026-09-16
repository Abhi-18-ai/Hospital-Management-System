'use strict';

const nodemailer = require('nodemailer');
const { getTransporter, usingEtherealFallback } = require('../../config/email');
const env = require('../../config/env');
const logger = require('../../config/logger');
const templates = require('./email.templates');

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends a single email with a small retry-with-backoff policy for transient
 * SMTP failures (connection drops, temporary provider throttling, etc).
 *
 * Deliberately never throws: email delivery is important but must never be
 * allowed to roll back or block the business operation that triggered it
 * (booking an appointment must succeed even if the confirmation email
 * temporarily fails to send) -- the same non-blocking contract the in-app
 * notification service follows.
 */
async function sendMail({ to, subject, html, text }) {
  if (!env.EMAIL_ENABLED) {
    logger.info(`Email sending disabled (EMAIL_ENABLED=false); skipped "${subject}" to ${to}.`);
    return { skipped: true };
  }

  if (!to) {
    logger.warn(`Skipped email "${subject}": no recipient address available.`);
    return { skipped: true };
  }

  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html,
        text,
      });

      if (usingEtherealFallback()) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logger.info(`[DEV EMAIL PREVIEW] "${subject}" to ${to} -> ${previewUrl}`);
      } else {
        logger.info(`Email sent: "${subject}" to ${to} (messageId=${info.messageId}).`);
      }

      return { success: true, info };
    } catch (err) {
      lastError = err;
      logger.warn(`Email attempt ${attempt}/${MAX_ATTEMPTS} failed for "${subject}" to ${to}: ${err.message}`);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  logger.error(`Email permanently failed after ${MAX_ATTEMPTS} attempts: "${subject}" to ${to}: ${lastError.message}`);
  return { success: false, error: lastError };
}

/** Renders a named template with `data` and sends it to `to`. Never throws. */
async function sendTemplate(to, templateName, data) {
  const template = templates[templateName];
  if (!template) {
    logger.error(`Unknown email template: ${templateName}`);
    return { skipped: true };
  }
  const { subject, html, text } = template(data);
  return sendMail({ to, subject, html, text });
}

module.exports = { sendMail, sendTemplate };
