const Order = require('../models/orderModel');
const notificationService = require('../utils/notificationService');
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const AppError = require('../utils/appError');
const User = require('../models/User');


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
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID format');
      }
  
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

      if ((userRole === 'admin' || userRole === 'delivery') && newStatus === 'Confirmed') {
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
        'Pending': ['Confirmed', 'Cancelled'],
        'Confirmed': ['Out for Delivery', 'Cancelled'],
        'Out for Delivery': ['Delivered', 'Cancelled']
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
  },
  //tracking related services

  async getOrderForTracking(orderId) {
    // Validate order ID format
    if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new AppError('Invalid order ID format', 400);
    }

    const order = await Order.findById(orderId)
      .populate('restaurantId', 'name address phone')
      .populate('deliveryAgentId', 'name phone vehicleType')
      .lean();

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Calculate estimated delivery if not set
    if (!order.estimatedDeliveryTime) {
      const statusTimestamp = order.status === 'Pending' ? 
        order.createdAt : 
        order.updatedAt;
      
      order.estimatedDeliveryTime = this.calculateEstimatedDelivery(
        statusTimestamp,
        order.status
      );
    }

    // Format response data
    return {
      ...order,
      currentStatus: order.status,
      statusHistory: this.generateStatusHistory(order)
    };
  },

  calculateEstimatedDelivery(timestamp, status) {
    // Define expected durations for each stage (in minutes)
    const statusDurations = {
      'Pending': 15,      // Time until confirmation
      'Confirmed': 15,    // Restaurant confirmation
      'Preparing': 30,    // Food preparation
      'Prepared': 15,     // Driver pickup
      'Out for Delivery': 30 // Actual delivery
    };

    // Status progression order
    const statusFlow = ['Pending', 'Confirmed', 'Preparing', 'Prepared', 'Out for Delivery'];
    
    // Calculate total remaining time
    let totalMinutes = 0;
    const currentIndex = statusFlow.indexOf(status);
    
    if (currentIndex !== -1) {
      for (let i = currentIndex; i < statusFlow.length; i++) {
        totalMinutes += statusDurations[statusFlow[i]] || 0;
      }
    } else {
      // Default fallback
      totalMinutes = 60;
    }

    // Calculate delivery time
    const deliveryTime = new Date(timestamp);
    deliveryTime.setMinutes(deliveryTime.getMinutes() + totalMinutes);
    return deliveryTime;
  },

  generateStatusHistory(order) {
    const statusFlow = [
      'Pending', 
      'Confirmed', 
      'Preparing', 
      'Prepared', 
      'Out for Delivery', 
      'Delivered'
    ];
    const currentIndex = statusFlow.indexOf(order.status);
    
    return statusFlow.map((status, index) => ({
      status,
      completed: index < currentIndex,
      current: index === currentIndex,
      timestamp: index === 0 ? order.createdAt : 
                index <= currentIndex ? order.updatedAt : null
    }));
  },

  async getDeliveryIncomingOrders(deliveryAgentId) {
    try {
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(deliveryAgentId)) {
        throw new Error('Invalid delivery agent ID');
      }
  
      // Find delivery agent
      const agent = await User.findById(deliveryAgentId).lean();
      if (!agent || agent.role !== 'delivery') {
        throw new Error('Delivery agent not found');
      }
  
      // Get preferred routes (support both singular and plural field names)
      const routes = agent.preferredRoutes || 
                   (agent.preferredRoute ? [agent.preferredRoute] : []);
  
      // Create search pattern
      const searchPattern = routes.length > 0
        ? new RegExp(routes.join('|'), 'i')
        : /.*/;
  
      // Build query
      const query = {
        $or: [
          {
            status: 'Pending',
            deliveryAddress: searchPattern,
            deliveryAgentId: null
          },
          {
            deliveryAgentId: new mongoose.Types.ObjectId(deliveryAgentId),
            status: { $in: ['Confirmed', 'Out for Delivery'] }
          }
        ]
      };
  
      // Execute query
      return await Order.find(query)
        .populate('restaurantId', 'name address')
        .populate('userId', 'name phone')
        .populate('deliveryAgentId', 'firstName lastName contactNumber')
        .sort({ createdAt: -1 });
  
    } catch (error) {
      console.error('Error in getDeliveryIncomingOrders:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  },

  getUserOrdersCount: async (userId) => {
    try {
      // Fix: Use new mongoose.Types.ObjectId()
      const counts = await Order.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { 
          $group: {
            _id: null,
            total: { $sum: 1 },
            delivered: { 
              $sum: { 
                $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] 
              } 
            },
            canceled: { 
              $sum: { 
                $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] 
              } 
            },
            pending: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["Pending", "Confirmed", "Preparing", "Prepared", "Out for Delivery"]] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return counts.length > 0 ? counts[0] : {
        total: 0,
        delivered: 0,
        canceled: 0,
        pending: 0
      };
    } catch (error) {
      console.error('Error in orderService.getUserOrdersCount:', error);
      throw error;
    }
  }

};

  

module.exports = OrderService;