/**
 * Mail Service
 * Handles email sending for password reset, notifications, etc.
 */

import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize the mail transporter
   * Supports multiple email services
   */
  async initialize() {
    try {
      const mailService = process.env.MAIL_SERVICE || 'gmail';
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      console.log('📧 Initializing mail service...');
      console.log(`   Service: ${mailService}`);
      console.log(`   Status: ${smtpUser && smtpPass ? 'Configured' : 'NOT SET'}`);

      // Gmail configuration
      if (mailService === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass // App-specific password for Gmail
          }
        });
      }
      // Generic SMTP configuration
      else {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
      }

      // Verify connection
      console.log('🔍 Verifying mail connection...');
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ Mail service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Mail service initialization failed:', error.message);
      console.error('   Details:', error);
      // Don't throw - allow app to run without email in development
      this.initialized = false;
      return false;
    }
  }

  /**
   * Verify email service connection
   * Used for health checks
   */
  async verifyConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Mail transporter not initialized');
      }
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email address
   * @param {string} resetToken - Reset token
   * @param {string} userName - User's name for personalization
   * @returns {Promise<boolean>} - Success status
   */
  async sendPasswordResetEmail(email, resetToken, userName = 'User') {
    // Skip if not initialized and in production
    if (!this.initialized) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Mail service not initialized');
      }
      console.warn('⚠️ Mail service not initialized. Password reset email not sent.');
      return false;
    }

    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: 20px auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 700; }
              .header p { font-size: 14px; opacity: 0.95; }
              .content { background: #ffffff; padding: 30px; }
              .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
              .button:hover { transform: translateY(-2px); }
              .button-center { text-align: center; }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #e9ecef; }
              .warning { color: #dc2626; font-weight: 600; }
              .info-box { background: #f3f4f6; padding: 15px; border-left: 4px solid #a855f7; border-radius: 4px; margin: 15px 0; }
              .code { background: #f3f4f6; padding: 10px; display: block; word-break: break-all; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; }
              ul { margin: 15px 0 15px 20px; }
              li { margin: 8px 0; }
              .divider { height: 1px; background: #e9ecef; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset</h1>
                <p>Secure your account with a new password</p>
              </div>
              <div class="content">
                <p>Hello <strong>${userName}</strong>,</p>
                
                <p style="margin-top: 15px;">We received a request to reset your password. Click the button below to create a new password:</p>
                
                <div class="button-center">
                  <a href="${resetLink}" class="button">Reset Your Password</a>
                </div>
                
                <p>Or copy this link in your browser:</p>
                <code>${resetLink}</code>
                
                <div class="divider"></div>
                
                <div class="info-box">
                  <p><span class="warning">⚠️ Important Security Information:</span></p>
                  <ul>
                    <li>This link expires in <strong>30 minutes</strong></li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                    <li>Use a strong password (8+ characters, mixed case, numbers, symbols)</li>
                  </ul>
                </div>
                
                <p style="margin-top: 20px;">Best regards,<br><strong>The Hazel the Label Security Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>If you have issues resetting your password, <a href="${process.env.FRONTEND_URL}/support" style="color: #a855f7; text-decoration: none;">contact support</a></p>
              </div>
            </div>
          </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Hazel the Label'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request - Hazel the Label',
        html: htmlContent,
        text: `Password Reset Request\n\nHello ${userName},\n\nClick here to reset your password: ${resetLink}\n\nThis link expires in 30 minutes.\n\nIf you didn't request this, please ignore this email.`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error.message);
      // In production, you might want to log this to a error tracking service
      // For now, we'll just log and continue
      return false;
    }
  }

  /**
   * Send welcome email to new user
   * @param {string} email - User email address
   * @param {string} userName - User's name
   * @returns {Promise<boolean>} - Success status
   */
  async sendWelcomeEmail(email, userName = 'User') {
    if (!this.initialized) {
      console.warn('⚠️ Mail service not initialized. Welcome email not sent.');
      return false;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: 20px auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 700; }
              .header p { font-size: 14px; opacity: 0.95; }
              .content { background: #ffffff; padding: 30px; }
              .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; font-size: 16px; }
              .button-center { text-align: center; }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #e9ecef; }
              .feature-box { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #a855f7; }
              .divider { height: 1px; background: #e9ecef; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to Hazel the Label!</h1>
                <p>Premium Fashion & Lifestyle Shopping</p>
              </div>
              <div class="content">
                <p>Hello <strong>${userName}</strong>,</p>
                
                <p style="margin-top: 15px;">Welcome to Hazel the Label! We're thrilled to have you join our community of fashion enthusiasts.</p>
                
                <div class="feature-box">
                  <p><strong>✨ What You Can Enjoy:</strong></p>
                  <ul style="margin: 10px 0 0 20px;">
                    <li>Exclusive collections and new arrivals</li>
                    <li>Special discounts and loyalty rewards</li>
                    <li>Fast and secure checkout</li>
                    <li>Order tracking and customer support</li>
                  </ul>
                </div>
                
                <div class="button-center">
                  <a href="${process.env.FRONTEND_URL}/products" class="button">Start Shopping</a>
                </div>
                
                <p style="margin-top: 20px;">If you have any questions or need assistance, our support team is here to help.</p>
                
                <p style="margin-top: 20px;">Happy shopping!<br><strong>The Hazel the Label Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Hazel the Label'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Hazel the Label!',
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      return false;
    }
  }

  /**
   * Send order confirmation email
   * @param {string} email - User email address
   * @param {object} orderDetails - Order details object
   * @returns {Promise<boolean>} - Success status
   */
  async sendOrderConfirmationEmail(email, orderDetails) {
    if (!this.initialized) {
      console.warn('⚠️ Mail service not initialized. Order confirmation email not sent.');
      return false;
    }

    try {
      const { orderId, orderNumber, items, totalPrice, userName = 'User' } = orderDetails;

      const itemsHtml = items
        .map(
          (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e9ecef; text-align: right;">£${item.price.toFixed(2)}</td>
        </tr>
      `
        )
        .join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: 20px auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%); color: white; padding: 40px 20px; text-align: center; }
              .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 700; }
              .header p { font-size: 14px; opacity: 0.95; }
              .content { background: #ffffff; padding: 30px; }
              .order-id { background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 15px 0; }
              .order-id-label { font-size: 12px; color: #666; }
              .order-id-value { font-size: 18px; font-weight: 700; color: #a855f7; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e9ecef; }
              .total-row { background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%); color: white; font-weight: 700; }
              .total-row td { padding: 12px; }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #e9ecef; }
              .divider { height: 1px; background: #e9ecef; margin: 20px 0; }
              .status-badge { background: #dcfce7; color: #166534; padding: 8px 12px; border-radius: 6px; display: inline-block; font-weight: 600; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Order Confirmed</h1>
                <p>Thank you for your purchase!</p>
              </div>
              <div class="content">
                <p>Hello <strong>${userName}</strong>,</p>
                
                <p style="margin-top: 15px;">Your order has been successfully placed and confirmed. Here are the details:</p>
                
                <div class="order-id">
                  <div class="order-id-label">Order Number</div>
                  <div class="order-id-value">${orderNumber || '#' + orderId.slice(-8)}</div>
                </div>
                
                <div class="status-badge">Processing</div>
                
                <h3 style="margin-top: 25px; margin-bottom: 15px; color: #1f2937;">Order Summary</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Quantity</th>
                      <th style="text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                      <td colspan="2" style="text-align: right;">Total Amount:</td>
                      <td style="text-align: right;">£${totalPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="divider"></div>
                
                <p><strong>📦 What's Next?</strong></p>
                <ul style="margin: 10px 0 0 20px;">
                  <li>We'll prepare your order and send a shipping confirmation</li>
                  <li>You'll receive tracking information via email</li>
                  <li>Standard delivery takes 3-5 business days</li>
                </ul>
                
                <p style="margin-top: 20px;">If you have any questions about your order, please don't hesitate to <a href="${process.env.FRONTEND_URL}/support" style="color: #a855f7; text-decoration: none;">contact us</a>.</p>
                
                <p style="margin-top: 20px;">Thank you for shopping with Hazel the Label!<br><strong>The Hazel the Label Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Hazel the Label'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation - Order #${orderId}`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error.message);
      return false;
    }
  }

  /**
   * Send order status update email
   * @param {string} email - User email address
   * @param {object} updateDetails - Order update details
   * @returns {Promise<boolean>} - Success status
   */
  async sendOrderStatusUpdateEmail(email, updateDetails) {
    if (!this.initialized) {
      console.warn('⚠️ Mail service not initialized. Order status update email not sent.');
      return false;
    }

    try {
      const { orderId, orderNumber, userName = 'User', status, trackingNumber = null, estimatedDelivery = null } = updateDetails;

      // ✅ SECURITY: Don't log sensitive order information
      if (process.env.NODE_ENV === 'development') {
        console.log('📨 Preparing order status email...');
        console.log(`   Status: ${status}`);
      }

      // Status-specific message and color
      const statusMessages = {
        confirmed: { msg: 'Your order has been confirmed and is being prepared.', color: '#a855f7', icon: '✓' },
        processing: { msg: 'Your order is being processed and will ship soon.', color: '#a855f7', icon: '⏳' },
        shipped: { msg: `Your order has shipped! Tracking #: ${trackingNumber || 'N/A'}`, color: '#d946ef', icon: '📦' },
        delivered: { msg: 'Your order has been delivered. Thank you for shopping with us!', color: '#a855f7', icon: '✓' },
        cancelled: { msg: 'Your order has been cancelled. Please contact support for more details.', color: '#ec4899', icon: '✗' }
      };

      const statusInfo = statusMessages[status] || { msg: 'Your order status has been updated.', color: '#a855f7', icon: '•' };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: 20px auto; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%); color: white; padding: 50px 30px; text-align: center; }
              .header h1 { font-size: 32px; margin-bottom: 8px; font-weight: 700; }
              .header p { font-size: 14px; opacity: 0.95; }
              .content { background: #ffffff; padding: 40px 30px; }
              .status-box { background: linear-gradient(135deg, ${statusInfo.color}20 0%, ${statusInfo.color}10 100%); border-left: 4px solid ${statusInfo.color}; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0; }
              .status-box h2 { margin: 10px 0 5px 0; font-size: 28px; color: ${statusInfo.color}; }
              .status-box p { color: #4b5563; font-size: 14px; }
              .detail-row { padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { font-weight: 700; color: #a855f7; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
              .detail-value { color: #1f2937; font-size: 16px; margin-top: 5px; }
              .tracking { background: #f8f9fa; padding: 12px 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 600; color: #1f2937; border: 1px solid #e5e7eb; }
              .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
              .footer { background: #f8f9fa; padding: 25px 30px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer a { color: #a855f7; text-decoration: none; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; font-size: 14px; transition: transform 0.2s; }
              .cta-button:hover { transform: translateY(-2px); }
              .cta-center { text-align: center; }
              .info-section { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
              .info-section h3 { color: #a855f7; font-size: 14px; margin-bottom: 10px; }
              .info-section p { font-size: 13px; color: #4b5563; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 Order Status Update</h1>
                <p>Your order is on its way!</p>
              </div>
              <div class="content">
                <p>Hello <strong>${userName}</strong>,</p>
                
                <div class="status-box">
                  <div>${statusInfo.icon}</div>
                  <h2>${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                  <p>${statusInfo.msg}</p>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">Order Number</div>
                  <div class="detail-value">${orderNumber || '#' + orderId.slice(-8)}</div>
                </div>
                
                ${trackingNumber ? `
                <div class="detail-row">
                  <div class="detail-label">Tracking Number</div>
                  <div class="tracking">${trackingNumber}</div>
                </div>
                ` : ''}
                
                ${estimatedDelivery ? `
                <div class="detail-row">
                  <div class="detail-label">Estimated Delivery</div>
                  <div class="detail-value">${estimatedDelivery}</div>
                </div>
                ` : ''}
                
                <div class="divider"></div>
                
                <div class="info-section">
                  <h3>Track Your Order</h3>
                  <p>Visit our tracking page and enter your order number <strong>${orderNumber || orderId.slice(-8)}</strong> to see the latest status and tracking information.</p>
                </div>
                
                <div class="cta-center">
                  <a href="${process.env.FRONTEND_URL}/track-order" class="cta-button">Track Your Order</a>
                </div>
                
                <p style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
                  Best regards,<br><strong style="color: #a855f7;">The Hazel the Label Team</strong>
                </p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p style="margin-top: 10px;">© ${new Date().getFullYear()} Hazel the Label. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'Hazel the Label'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Update - Order #${orderId.slice(-8)} - ${status.toUpperCase()}`,
        html: htmlContent
      };

      // ✅ SECURITY: Don't log sensitive email information
      if (process.env.NODE_ENV === 'development') {
        console.log('📨 Sending order status email...');
        console.log(`   Status: ${status}`);
        console.log(`   Service Initialized: ${this.initialized}`);
      }

      if (!this.initialized) {
        console.warn('⚠️ Mail service not initialized, attempting to reinitialize...');
        await this.initialize();
      }

      if (!this.transporter) {
        throw new Error('Mail transporter not available');
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order status update email sent successfully');
      if (process.env.NODE_ENV === 'development') {
        console.log(`   Status: ${status}`);
      }
      return true;
    } catch (error) {
      console.error('❌ Error sending order status update email');
      if (process.env.NODE_ENV === 'development') {
        console.error('   Details:', error.message);
      }
      return false;
    }
  }

  /**
   * Send OTP email for order tracking
   */
  async sendOTPEmail(email, otp, orderNumber) {
    if (!this.initialized || !this.transporter) {
      console.warn('⚠️ Mail service not initialized, skipping OTP email');
      return false;
    }

    try {
      const isSignup = orderNumber === 'Account Registration';
      const headerTitle = isSignup ? 'Account Verification' : 'Order Tracking Verification';
      const contentText = isSignup 
        ? 'You requested a verification code to create your account.'
        : `You requested a verification code to track your order <strong>${orderNumber}</strong>.`;
      const subject = isSignup ? `Your Verification Code: ${otp}` : `Your Order Tracking Code: ${otp}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #667eea; }
              .expiry { color: #e74c3c; font-weight: bold; }
              .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${headerTitle}</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>${contentText}</p>
                <p>Use the following code to verify your identity:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p><strong>⏰ Important:</strong> This code is valid for <span class="expiry">10 minutes only</span>.</p>
                <p>If you didn't request this code, you can safely ignore this email.</p>
                
                <div class="footer">
                  <p>© 2026 Hazel the Label. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: htmlContent,
      });

      console.log('✅ OTP email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP email');
      if (process.env.NODE_ENV === 'development') {
        console.error('   Details:', error.message);
      }
      return false;
    }
  }
}

// Create and export a singleton instance
export const mailService = new MailService();

// Initialize on import
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailService.initialize();
} else if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️ SMTP credentials not configured. Email service disabled.');
}
