'use strict';

const env = require('../../config/env');

const BRAND_COLOR = '#0E7C86';
const TEXT_COLOR = '#0F172A';
const MUTED_COLOR = '#64748B';
const BORDER_COLOR = '#E2E8EC';

/**
 * Wraps body content in a table-based HTML layout with inline styles.
 * Table layout + inline CSS is deliberate: it is the one approach that
 * renders consistently across Outlook, Gmail, and every other major email
 * client, none of which reliably support external/embedded stylesheets or
 * modern CSS layout.
 */
function renderLayout({ preheader = '', title, bodyHtml, ctaLabel, ctaUrl }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F1F5F7;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:#F1F5F7;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(
      preheader
    )}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER_COLOR};">
            <tr>
              <td style="background-color:${BRAND_COLOR};padding:20px 28px;">
                <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.01em;">🏥 ${escapeHtml(
                  env.EMAIL_FROM_NAME
                )}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 12px 28px;">
                <h1 style="margin:0 0 16px 0;font-size:20px;line-height:1.3;color:${TEXT_COLOR};">${escapeHtml(
                  title
                )}</h1>
                <div style="font-size:14px;line-height:1.6;color:${TEXT_COLOR};">
                  ${bodyHtml}
                </div>
                ${
                  ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
                        <tr>
                          <td style="border-radius:8px;background-color:${BRAND_COLOR};">
                            <a href="${ctaUrl}" style="display:inline-block;padding:11px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(
                        ctaLabel || 'View details'
                      )}</a>
                          </td>
                        </tr>
                      </table>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px 28px;border-top:1px solid ${BORDER_COLOR};">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED_COLOR};">
                  This is an automated message from ${escapeHtml(env.EMAIL_FROM_NAME)}. Please do not reply
                  directly to this email. If you believe you received this in error, contact the hospital
                  administration.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function toPlainText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function build({ preheader, title, bodyHtml, ctaLabel, ctaUrl, subject }) {
  const html = renderLayout({ preheader, title, bodyHtml, ctaLabel, ctaUrl });
  return { subject, html, text: toPlainText(bodyHtml) + (ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : '') };
}

const templates = {
  welcome: ({ name }) =>
    build({
      subject: 'Welcome to MediCore Hospital',
      preheader: 'Your account has been created successfully.',
      title: `Welcome, ${name}.`,
      bodyHtml: `<p>Your account has been created successfully. You can now sign in to book appointments, view your medical records, and manage your care online.</p>`,
      ctaLabel: 'Sign in to your account',
      ctaUrl: `${env.CLIENT_APP_URL}/login`,
    }),

  passwordReset: ({ name, resetUrl, expiresIn }) =>
    build({
      subject: 'Reset your MediCore password',
      preheader: 'Use this link to reset your password.',
      title: 'Reset your password',
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>We received a request to reset your password. This link will expire in ${escapeHtml(
        expiresIn
      )}. If you didn't request this, you can safely ignore this email -- your password will not be changed.</p>`,
      ctaLabel: 'Reset password',
      ctaUrl: resetUrl,
    }),

  passwordChanged: ({ name }) =>
    build({
      subject: 'Your MediCore password was changed',
      preheader: 'Your password was changed successfully.',
      title: 'Password changed',
      bodyHtml: `<p>Hi ${escapeHtml(
        name
      )},</p><p>Your password was just changed, and you've been signed out of all devices as a security precaution. If this wasn't you, please contact hospital administration immediately.</p>`,
    }),

  appointmentConfirmation: ({ name, doctorName, departmentName, startAt }) =>
    build({
      subject: 'Appointment confirmed',
      preheader: `Your appointment with ${doctorName} is confirmed.`,
      title: 'Your appointment is confirmed',
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>Your appointment has been booked:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;border:1px solid ${BORDER_COLOR};border-radius:8px;">
          <tr><td style="padding:10px 14px;border-bottom:1px solid ${BORDER_COLOR};color:${MUTED_COLOR};">Doctor</td><td style="padding:10px 14px;border-bottom:1px solid ${BORDER_COLOR};text-align:right;font-weight:600;">${escapeHtml(
        doctorName
      )}</td></tr>
          <tr><td style="padding:10px 14px;border-bottom:1px solid ${BORDER_COLOR};color:${MUTED_COLOR};">Department</td><td style="padding:10px 14px;border-bottom:1px solid ${BORDER_COLOR};text-align:right;font-weight:600;">${escapeHtml(
        departmentName
      )}</td></tr>
          <tr><td style="padding:10px 14px;color:${MUTED_COLOR};">Date &amp; time</td><td style="padding:10px 14px;text-align:right;font-weight:600;">${escapeHtml(
        startAt
      )}</td></tr>
        </table>
        <p>Please arrive 10 minutes early for check-in.</p>`,
      ctaLabel: 'View appointment',
      ctaUrl: `${env.CLIENT_APP_URL}/appointments`,
    }),

  appointmentCancelled: ({ name, doctorName, startAt, reason }) =>
    build({
      subject: 'Appointment cancelled',
      preheader: 'Your appointment has been cancelled.',
      title: 'Appointment cancelled',
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>Your appointment with ${escapeHtml(doctorName)} on ${escapeHtml(
        startAt
      )} has been cancelled.${reason ? ` Reason: ${escapeHtml(reason)}.` : ''}</p><p>You can book a new appointment at any time.</p>`,
      ctaLabel: 'Book a new appointment',
      ctaUrl: `${env.CLIENT_APP_URL}/appointments`,
    }),

  appointmentRescheduled: ({ name, doctorName, startAt }) =>
    build({
      subject: 'Appointment rescheduled',
      preheader: 'Your appointment time has changed.',
      title: 'Appointment rescheduled',
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>Your appointment with ${escapeHtml(
        doctorName
      )} has been rescheduled to <strong>${escapeHtml(startAt)}</strong>.</p>`,
      ctaLabel: 'View appointment',
      ctaUrl: `${env.CLIENT_APP_URL}/appointments`,
    }),

  labResultReady: ({ name, testName }) =>
    build({
      subject: 'Your lab result is ready',
      preheader: `Results for ${testName} are now available.`,
      title: 'Lab result available',
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>Your result for <strong>${escapeHtml(
        testName
      )}</strong> has been verified and is now available for you to view.</p>`,
      ctaLabel: 'View result',
      ctaUrl: `${env.CLIENT_APP_URL}/laboratory`,
    }),

  prescriptionReady: ({ name, doctorName }) =>
    build({
      subject: 'New prescription issued',
      preheader: `Dr. ${doctorName} issued a new prescription for you.`,
      title: 'New prescription',
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>Dr. ${escapeHtml(
        doctorName
      )} has issued a new prescription for you. You can view the details and take it to the pharmacy for dispensing.</p>`,
      ctaLabel: 'View prescription',
      ctaUrl: `${env.CLIENT_APP_URL}/patients`,
    }),

  invoiceIssued: ({ name, invoiceNumber, total }) =>
    build({
      subject: `Invoice ${invoiceNumber} issued`,
      preheader: `A new invoice for ${total} has been issued.`,
      title: 'New invoice issued',
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>A new invoice <strong>${escapeHtml(
        invoiceNumber
      )}</strong> for <strong>${escapeHtml(total)}</strong> has been issued to your account.</p>`,
      ctaLabel: 'View invoice',
      ctaUrl: `${env.CLIENT_APP_URL}/billing`,
    }),

  admissionUpdate: ({ name, statusLabel, details }) =>
    build({
      subject: `Admission update: ${statusLabel}`,
      preheader: details,
      title: statusLabel,
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p><p>${escapeHtml(details)}</p>`,
      ctaLabel: 'View details',
      ctaUrl: `${env.CLIENT_APP_URL}/admissions`,
    }),

  accountStatusChanged: ({ name, status }) =>
    build({
      subject: 'Your account status has changed',
      preheader: `Your account is now ${status}.`,
      title: 'Account status updated',
      bodyHtml: `<p>Hi ${escapeHtml(
        name
      )},</p><p>Your account status has been changed to <strong>${escapeHtml(
        status
      )}</strong>. If you have questions about this change, please contact hospital administration.</p>`,
    }),

  lowStockAlert: ({ medicineName, remaining, reorderLevel, unit }) =>
    build({
      subject: `Low stock: ${medicineName}`,
      preheader: `Only ${remaining} ${unit}(s) remaining.`,
      title: 'Low stock alert',
      bodyHtml: `<p><strong>${escapeHtml(medicineName)}</strong> has dropped to ${remaining} ${escapeHtml(
        unit
      )}(s), at or below its reorder level of ${reorderLevel}. Please arrange for restocking.</p>`,
      ctaLabel: 'View pharmacy stock',
      ctaUrl: `${env.CLIENT_APP_URL}/pharmacy`,
    }),
};

module.exports = templates;
