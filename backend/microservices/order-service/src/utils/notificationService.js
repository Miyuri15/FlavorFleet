const nodemailer = require('nodemailer');
const Notification = require('../models/notificationModel');
const User = require('../models/User');
const logger = console; // Replace with your logger if needed

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html, orderDetails) => {
  try {
    const emailContent = html || `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #1a365d;">FlavorFleet Order Update</h2>
        <p>${text}</p>
        ${orderDetails ? `
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin-bottom: 10px;">Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderDetails._id}</p>
          <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
          <p><strong>Status:</strong> ${orderDetails.status}</p>
        </div>
        ` : ''}
        <p style="margin-top: 30px; color: #666;">
          Thank you for choosing FlavorFleet!
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: emailContent,
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
      const notification = await Notification.create({
        userId,
        message,
        type,
        relatedEntity: options.relatedEntity,
        isRead: false,
      });

      if (options.sendEmail) {
        const user = await User.findById(userId).select('email');
        if (user?.email) {
          const orderDetails = options.relatedEntity?.id ? 
            await Order.findById(options.relatedEntity.id).select('totalAmount status') : null;
          
          await sendEmail(
            user.email,
            options.emailSubject || 'FlavorFleet Order Update',
            message,
            null,
            orderDetails
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Notification failed:', error.message);
      if (error.name === 'ValidationError') {
        console.error('Validation errors:', error.errors);
      }
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