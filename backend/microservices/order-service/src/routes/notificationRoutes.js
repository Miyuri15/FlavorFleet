const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

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

module.exports = router;