const Notification = require('../models/notificationModel');

const NotificationController = {
  async getUserNotifications(req, res) {
    try {
      const notifications = await Notification.find({
        userId: req.params.userId,
        isRead: false
      }).sort({ createdAt: -1 });
      
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  },

  async markAsRead(req, res) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.notificationId,
        { isRead: true },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error marking notification as read' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await Notification.updateMany(
        { userId: req.params.userId, isRead: false },
        { $set: { isRead: true } }
      );
      
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({ message: 'Error marking notifications as read' });
    }
  }
};

module.exports = NotificationController;