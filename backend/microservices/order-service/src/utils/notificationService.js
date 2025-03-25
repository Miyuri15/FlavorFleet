const nodemailer = require('nodemailer');
const Notification = require('../models/notificationModel');
const User = require('../../../../gateway/src/models/User');
const logger = console; // Replace with your logger if needed

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const NotificationService = {
  async sendNotification(userId, message, type = 'order_update', options = {}) {
    try {
      // 1. Store in-app notification
      await Notification.create({
        userId,
        message,
        type,
        relatedEntity: options.relatedEntity,
        isRead: false,
      });

      // 2. Send email if requested
      if (options.sendEmail) {
        const user = await User.findById(userId).select('email');
        if (user && user.email) {
          await sendEmail(
            user.email,
            options.emailSubject || 'FlavorFleet Order Update',
            message,
            options.emailHtml
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Notification failed:', error);
      return false;
    }
  },

  async notifyAdmin(message, options = {}) {
    try {
      const admins = await User.find({ role: 'admin' }).select('_id email');
      
      // Send to all admins
      await Promise.all(admins.map(async admin => {
        // In-app notification
        await Notification.create({
          userId: admin._id,
          message,
          type: 'system',
          relatedEntity: options.relatedEntity,
          isRead: false,
        });

        // Email if requested
        if (options.sendEmail && admin.email) {
          await sendEmail(
            admin.email,
            options.emailSubject || 'Admin Notification',
            message,
            options.emailHtml
          );
        }
      }));

      return true;
    } catch (error) {
      console.error('Admin notification failed:', error);
      return false;
    }
  },

  async notifyRestaurant(restaurantId, message, options = {}) {
    try {
      const staff = await User.find({ 
        restaurantId, 
        role: { $in: ['owner', 'manager'] } 
      }).select('_id email');

      await Promise.all(staff.map(async user => {
        // In-app notification
        await Notification.create({
          userId: user._id,
          message,
          type: 'order_update',
          relatedEntity: options.relatedEntity,
          isRead: false,
        });

        // Email if requested
        if (options.sendEmail && user.email) {
          await sendEmail(
            user.email,
            options.emailSubject || 'Restaurant Order Update',
            message,
            options.emailHtml
          );
        }
      }));

      return true;
    } catch (error) {
      console.error('Restaurant notification failed:', error);
      return false;
    }
  }
};

module.exports = NotificationService;