const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const SMSService = require('../services/smsService');

// Get all unread notifications for a user
router.get('/users/:userId/notifications', 
  authMiddleware, 
  NotificationController.getUserNotifications
);

// Mark single notification as read
router.put('/:notificationId/read', 
  authMiddleware, 
  NotificationController.markAsRead
);

// Mark all notifications as read
router.put('/users/:userId/read-all', 
  authMiddleware, 
  NotificationController.markAllAsRead
);

const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Sri Lankan numbers (add +94 if starts with 0)
  if (cleaned.startsWith('0')) {
    return `+94${cleaned.substring(1)}`;
  }
  
  // Add + if missing but has country code
  if (cleaned.length >= 9 && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
};

router.get('/test-sms', authMiddleware, async (req, res) => {
  const testNumber = '0702226799'; // Test number - replace with actual test number
  
  try {
    // 1. First verify Twilio configuration
    const configCheck = await SMSService.verifyConfiguration();
    if (!configCheck.valid) {
      return res.status(500).json({
        success: false,
        error: 'Twilio configuration invalid',
        details: configCheck
      });
    }

    // 2. Format the phone number
    const formattedNumber = formatPhoneNumber(testNumber);
    if (!formattedNumber) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        original: testNumber
      });
    }

    // 3. Send test SMS
    const result = await SMSService.sendSMS(
      formattedNumber,
      '🔔 FlavorFleet SMS Test: This is a test message from the notification system',
      true // Will throw on failure
    );
    
    if (!result) {
      throw new Error('SMS service returned false without error');
    }

    // 4. Return success response
    res.json({
      success: true,
      number: {
        original: testNumber,
        formatted: formattedNumber,
        country: 'Sri Lanka (+94)'
      },
      twilioConfig: {
        account: configCheck.account,
        phoneNumber: configCheck.phoneNumber,
        capabilities: configCheck.capabilities
      },
      message: 'Test SMS should arrive shortly'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        originalNumber: testNumber,
        twilioErrorCode: error.code,
        moreInfo: error.moreInfo
      } : undefined
    });
  }
});

module.exports = router;