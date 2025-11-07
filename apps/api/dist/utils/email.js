"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
// Email transporter configuration
const createTransporter = () => {
    // For development, use Ethereal (fake SMTP)
    // For production, use real SMTP service (Gmail, SendGrid, etc.)
    if (process.env.NODE_ENV === 'production') {
        // Production email configuration
        return nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    else {
        // Development: log emails to console instead of sending
        return {
            sendMail: async (mailOptions) => {
                logger_1.logger.info('📧 Email (Dev Mode - Not Actually Sent):');
                logger_1.logger.info(`To: ${mailOptions.to}`);
                logger_1.logger.info(`Subject: ${mailOptions.subject}`);
                logger_1.logger.info(`Content:\n${mailOptions.text || mailOptions.html}`);
                return { messageId: 'dev-mode-' + Date.now() };
            },
        };
    }
};
const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.WEB_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"CosmoStream" <noreply@cosmostream.com>',
        to: email,
        subject: 'Reset Your CosmoStream Password',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f1e; color: #e5e5e5; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="background: linear-gradient(135deg, #6366f1 0%, #d946ef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: bold; margin: 0;">
                CosmoStream
              </h1>
            </div>

            <!-- Main Content -->
            <div style="background-color: #1a1a2e; border: 1px solid #2d2d44; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
              <h2 style="color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 16px;">
                Reset Your Password
              </h2>

              <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Hi ${userName},
              </p>

              <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset your password for your CosmoStream account. Click the button below to create a new password:
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #d946ef 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                Or copy and paste this link into your browser:
              </p>

              <div style="background-color: #0f0f1e; border: 1px solid #2d2d44; border-radius: 8px; padding: 12px; margin-bottom: 24px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #6366f1; text-decoration: none; font-size: 14px;">
                  ${resetUrl}
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
                ⏱️ This link will expire in <strong style="color: #ffffff;">1 hour</strong>.
              </p>

              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #6b7280; font-size: 12px; line-height: 1.6;">
              <p style="margin: 8px 0;">
                This email was sent by CosmoStream
              </p>
              <p style="margin: 8px 0;">
                © ${new Date().getFullYear()} CosmoStream. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
      Reset Your Password

      Hi ${userName},

      We received a request to reset your password for your CosmoStream account.

      Click the link below to create a new password:
      ${resetUrl}

      This link will expire in 1 hour.

      If you didn't request a password reset, you can safely ignore this email.

      © ${new Date().getFullYear()} CosmoStream
    `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Password reset email sent: ${info.messageId}`);
        return true;
    }
    catch (error) {
        logger_1.logger.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWelcomeEmail = async (email, userName) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"CosmoStream" <noreply@cosmostream.com>',
        to: email,
        subject: 'Welcome to CosmoStream! 🚀',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f1e; color: #e5e5e5; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="background: linear-gradient(135deg, #6366f1 0%, #d946ef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 36px; font-weight: bold; margin: 0;">
                CosmoStream
              </h1>
            </div>

            <div style="background-color: #1a1a2e; border: 1px solid #2d2d44; border-radius: 16px; padding: 32px;">
              <h2 style="color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 16px;">
                Welcome to the Cosmic Community! 🌌
              </h2>

              <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Hi ${userName},
              </p>

              <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Thank you for joining CosmoStream! You're now part of a community passionate about space, astronomy, and astrophysics.
              </p>

              <h3 style="color: #ffffff; font-size: 18px; margin-top: 24px; margin-bottom: 12px;">
                What you can do:
              </h3>

              <ul style="color: #9ca3af; font-size: 14px; line-height: 2; margin-bottom: 24px; padding-left: 20px;">
                <li>✨ Explore exclusive space content</li>
                <li>🌌 Access interactive sky maps & visualizations</li>
                <li>📚 Learn from educational courses & tutorials</li>
                <li>💬 Join discussions in our community forums</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.WEB_URL || 'http://localhost:3000'}/discover" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #d946ef 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Start Exploring
                </a>
              </div>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 12px; line-height: 1.6; margin-top: 24px;">
              <p>© ${new Date().getFullYear()} CosmoStream. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info(`Welcome email sent: ${info.messageId}`);
    }
    catch (error) {
        logger_1.logger.error('Error sending welcome email:', error);
        // Don't throw error for welcome email - it's not critical
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
//# sourceMappingURL=email.js.map