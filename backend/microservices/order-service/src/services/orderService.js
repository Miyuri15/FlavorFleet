const Order = require('../models/orderModel');
const User = require('../../../../gateway/src/models/User');
const Restaurant = require('../../../restaurant-service/src/models/Restaurant');
const notificationService = require('../utils/notificationService');

const OrderService = {
  // Create a new order
  async createOrder(orderData) {
    try {
      const order = new Order(orderData);
      await order.save();
      
      // Notify admin about new order
      await this.notifyAdmin(order);
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  },

  // Get order by ID
  async getOrderById(orderId) {
    try {
      return await Order.findById(orderId)
        .populate('userId', 'name email phone')
        .populate('restaurantId', 'name address phone')
        .populate('deliveryAgentId', 'name phone')
        .populate('items.itemId', 'name');
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  },

  // Get orders by user ID
  async getOrdersByUser(userId) {
    try {
      return await Order.find({ userId })
        .populate('restaurantId', 'name')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  },

  // Get orders by restaurant ID
  async getOrdersByRestaurant(restaurantId) {
    try {
      return await Order.find({ restaurantId })
        .populate('userId', 'name phone')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw new Error('Failed to fetch restaurant orders');
    }
  },

  // Get orders by delivery agent ID
  async getOrdersByDeliveryAgent(deliveryAgentId) {
    try {
      return await Order.find({ deliveryAgentId })
        .populate('userId', 'name phone')
        .populate('restaurantId', 'name address')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching delivery agent orders:', error);
      throw new Error('Failed to fetch delivery agent orders');
    }
  },

  // Update order status
  async updateOrderStatus(orderId, newStatus, userId, userRole, notes = '') {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');

      this.validateStatusTransition(order.status, newStatus, userRole);

      order.status = newStatus;
      order.updatedAt = new Date();

      if (userRole === 'admin' && newStatus === 'Confirmed') {
        order.deliveryAgentId = userId;
      }

      if (notes) {
        if (userRole === 'admin') {
          order.adminNotes = notes;
        } else if (userRole === 'restaurant') {
          order.specialInstructions = notes;
        }
      }

      await order.save();
      await this.sendStatusNotifications(order, newStatus, userRole);

      return order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  },

  // Validate status transitions (keep the same implementation)
  validateStatusTransition(currentStatus, newStatus, userRole) {
    const validTransitions = {
      admin: {
        'Pending': ['Confirmed', 'Cancelled'],
        'Confirmed': ['Cancelled']
      },
      restaurant: {
        'Confirmed': ['Preparing', 'Cancelled'],
        'Preparing': ['Prepared', 'Cancelled'],
        'Prepared': ['Cancelled']
      },
      delivery: {
        'Prepared': ['Out for Delivery'],
        'Out for Delivery': ['Delivered']
      },
      user: {
        'Pending': ['Cancelled']
      }
    };

    if (!validTransitions[userRole] || 
        !validTransitions[userRole][currentStatus] || 
        !validTransitions[userRole][currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus} for role ${userRole}`);
    }
  },

  // Enhanced notification system
  async sendStatusNotifications(order, newStatus, userRole) {
    const notificationConfigs = {
      'Confirmed': {
        message: `Your order #${order._id} has been confirmed and is being processed.`,
        restaurantMessage: `New order #${order._id} has been confirmed (Total: $${order.totalAmount})`,
        type: 'order_confirmed',
        sendEmail: true,
        emailSubject: 'Order Confirmed'
      },
      'Preparing': {
        message: `Restaurant has started preparing your order #${order._id}`,
        type: 'order_preparing',
        sendEmail: true,
        emailSubject: 'Order Being Prepared'
      },
      'Prepared': {
        message: `Order #${order._id} is ready for pickup`,
        type: 'order_ready',
        sendEmail: true,
        emailSubject: 'Order Ready for Pickup'
      },
      'Out for Delivery': {
        message: `Your order #${order._id} is on its way!`,
        type: 'order_out_for_delivery',
        sendEmail: true,
        emailSubject: 'Order On The Way'
      },
      'Delivered': {
        message: `Order #${order._id} has been delivered. Enjoy your meal!`,
        restaurantMessage: `Order #${order._id} has been delivered to customer`,
        type: 'order_delivered',
        sendEmail: true,
        emailSubject: 'Order Delivered'
      },
      'Cancelled': {
        message: `Order #${order._id} has been cancelled${order.cancellationReason ? `: ${order.cancellationReason}` : ''}`,
        type: 'order_cancelled',
        sendEmail: true,
        emailSubject: 'Order Cancelled'
      }
    };

    const config = notificationConfigs[newStatus];
    if (!config) return;

    try {
      // Notify customer
      if (newStatus !== 'Prepared') { // Prepared only goes to delivery agent
        await notificationService.sendNotification(
          order.userId,
          config.message,
          config.type,
          {
            sendEmail: config.sendEmail,
            emailSubject: config.emailSubject,
            relatedEntity: { type: 'Order', id: order._id }
          }
        );
      }

      // Notify restaurant staff (for relevant statuses)
      if (['Confirmed', 'Delivered'].includes(newStatus)) {
        await notificationService.notifyRestaurant(
          order.restaurantId,
          config.restaurantMessage || config.message,
          {
            sendEmail: config.sendEmail,
            emailSubject: config.emailSubject,
            relatedEntity: { type: 'Order', id: order._id }
          }
        );
      }

      // Notify delivery agent (for relevant statuses)
      if (['Prepared', 'Out for Delivery', 'Delivered'].includes(newStatus) && order.deliveryAgentId) {
        await notificationService.sendNotification(
          order.deliveryAgentId,
          config.message,
          config.type,
          {
            sendEmail: config.sendEmail,
            emailSubject: config.emailSubject,
            relatedEntity: { type: 'Order', id: order._id }
          }
        );
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't fail the whole operation if notifications fail
    }
  },

  // Notify admin about new order
  async notifyAdmin(order) {
    try {
      await notificationService.notifyAdmin(
        `New order #${order._id} received from ${order.userId}. Total: $${order.totalAmount}`,
        {
          sendEmail: true,
          emailSubject: 'New Order Requires Attention',
          relatedEntity: { type: 'Order', id: order._id }
        }
      );
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  },

  // Cancel order
  async cancelOrder(orderId, userId, reason) {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');
      
      if (order.userId.toString() !== userId.toString() && order.status !== 'Pending') {
        throw new Error('Only pending orders can be cancelled by non-owners');
      }

      order.status = 'Cancelled';
      order.cancellationReason = reason;
      order.updatedAt = new Date();
      await order.save();

      await this.sendStatusNotifications(order, 'Cancelled');
      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }
};

module.exports = OrderService;