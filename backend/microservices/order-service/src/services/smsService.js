const twilio = require('twilio');
const logger = require('../utils/logger');
const User = require('../models/User');
const Order = require('../models/orderModel');

// Initialize Twilio client with enhanced configuration
let twilioClient;
try {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    { 
      lazyLoading: true,
      autoRetry: true,
      maxRetryAttempts: 3
    }
  );
  logger.info('Twilio client initialized successfully');
} catch (err) {
  logger.error('Twilio initialization failed:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });
  throw new Error('Failed to initialize Twilio client');
}

// SMS message templates with emoji support
const SMS_TEMPLATES = {
  order_placed: (orderId) => `📦 Your FlavorFleet order #${orderId} has been placed successfully! We'll notify you when it's confirmed.`,
  order_confirmed: (orderId) => `✅ Order #${orderId} has been confirmed and is being processed.`,
  order_preparing: (orderId) => `👨‍🍳 Restaurant has started preparing your order #${orderId}`,
  order_ready: (orderId) => `🛵 Your order #${orderId} is ready for pickup!`,
  order_out_for_delivery: (orderId) => `🚚 Order #${orderId} is on its way! Delivery agent will contact you soon.`,
  order_delivered: (orderId) => `🎉 Order #${orderId} has been delivered. Enjoy your meal! 🍽️`,
  order_cancelled: (orderId, reason) => `❌ Order #${orderId} has been cancelled${reason ? `: ${reason}` : ''}`
};

/**
 * Formats phone number to E.164 standard
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number in E.164 format
 * @throws {Error} If phone number is invalid
 */
const formatPhoneNumber = (phone) => {
  if (!phone) throw new Error('Phone number is required');

  const trimmed = String(phone).trim();

  // If it's already in E.164 format, validate it directly
  if (/^\+[1-9]\d{1,14}$/.test(trimmed)) {
    return trimmed;
  }

  // Otherwise, clean and format Sri Lankan local numbers
  const cleaned = trimmed.replace(/\D/g, '');

  // If it starts with 0 and has 10 digits, assume local Sri Lankan number
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+94${cleaned.substring(1)}`;
  }

  throw new Error(`Invalid phone number format: ${phone}`);
};


/**
 * Validates Twilio is properly configured
 * @throws {Error} If Twilio is not properly configured
 */
const validateTwilioConfig = () => {
  if (!twilioClient) {
    throw new Error('Twilio client not initialized');
  }
  if (!process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('TWILIO_PHONE_NUMBER environment variable not set');
  }
};

const SMSService = {
  /**
   * Sends an order status SMS to a user
   * @param {string} userId - The user ID to send to
   * @param {string} orderId - The order ID reference
   * @param {string} templateKey - Key from SMS_TEMPLATES
   * @param {string} [reason] - Optional cancellation reason
   * @returns {Promise<boolean>} True if SMS was sent successfully
   */
  async sendOrderSMS(userId, orderId, templateKey, reason = null) {
    try {
      validateTwilioConfig();
      
      if (!userId || !orderId || !templateKey) {
        throw new Error('Missing required parameters');
      }
      if (!SMS_TEMPLATES[templateKey]) {
        throw new Error(`Invalid template key: ${templateKey}`);
      }

      logger.info(`Preparing to send ${templateKey} SMS for order ${orderId} to user ${userId}`);
      
      // Get user with contact number
      const user = await User.findById(userId).select('contactNumber');
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      if (!user.contactNumber) {
        throw new Error(`User ${userId} has no contact number`);
      }

      // Format phone number
      const formattedNumber = formatPhoneNumber(user.contactNumber);
      logger.debug(`Formatted phone number: ${formattedNumber}`);

      // Get order details if needed
      const order = await Order.findById(orderId).select('status cancellationReason');
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Generate message
      const message = templateKey === 'order_cancelled' 
        ? SMS_TEMPLATES[templateKey](orderId, order.cancellationReason || reason)
        : SMS_TEMPLATES[templateKey](orderId);

      logger.debug(`Generated SMS message: ${message}`);

      // Send SMS
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });

      logger.info(`SMS sent successfully to ${formattedNumber}`, {
        sid: result.sid,
        status: result.status,
        orderId,
        userId
      });

      return true;
    } catch (error) {
      logger.error(`Failed to send order SMS: ${error.message}`, {
        error: {
          code: error.code,
          stack: error.stack,
          moreInfo: error.moreInfo
        },
        context: {
          userId,
          orderId,
          templateKey
        }
      });
      return false;
    }
  },

  /**
   * Sends a custom SMS message
   * @param {string} to - Recipient phone number
   * @param {string} message - Message content
   * @returns {Promise<boolean>} True if SMS was sent successfully
   */
  async sendSMS(to, message, throwOnFail = false) {
    try {
      validateTwilioConfig();
      if (!to || !message) {
        throw new Error('Both "to" and "message" parameters are required');
      }
  
      const formattedNumber = formatPhoneNumber(to);
  
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });
  
      logger.info(`SMS sent successfully to ${formattedNumber}`, {
        sid: result.sid,
        status: result.status
      });
  
      return true;
    } catch (error) {
      logger.error(`Failed to send SMS: ${error.message}`, {
        error: {
          code: error.code,
          stack: error.stack,
          moreInfo: error.moreInfo
        },
        context: {
          to,
          message
        }
      });
  
      if (throwOnFail) throw error;
      return false;
    }
  },
  
  /**
   * Verifies Twilio configuration
   * @returns {Promise<Object>} Verification results
   */
  async verifyConfiguration() {
    try {
      validateTwilioConfig();
      
      // Test API connectivity
      const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      
      // Test number lookup
      const numbers = await twilioClient.incomingPhoneNumbers.list({limit: 1});
      
      return {
        valid: true,
        account: account.friendlyName,
        phoneNumber: numbers[0]?.phoneNumber || 'None found',
        capabilities: numbers[0]?.capabilities || {}
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        code: error.code,
        moreInfo: error.moreInfo
      };
    }
  }
};

module.exports = SMSService;