const Order = require('../models/orderModel');
const OrderService = require('../services/orderService');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');

const OrderController = {
  async createOrder(req, res) {
    try {
      const { restaurantId, items, totalAmount, deliveryAddress, paymentMethod } = req.body;
      const userId = req.user.id; // Get from auth token
  
      const newOrder = new Order({
        userId,
        restaurantId,
        items,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        status: "Pending"
      });
  
      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Order creation error:', error); 
      res.status(500).json({ message: error.message });
    }
  },

  async getOrder(req, res) {
    try {
      // Force JSON response
      res.setHeader('Content-Type', 'application/json');
      
      // Validate order ID
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ 
          error: 'Invalid order ID format',
          receivedId: req.params.id
        });
      }
  
      const order = await Order.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('restaurantId', 'name address')
        .lean();
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // Authorization check
      const currentUserId = req.user.id.toString();
      if (req.user.role !== 'admin' && 
          currentUserId !== order.userId._id.toString() && // Correctly access _id of the populated user
          currentUserId !== order.deliveryAgentId?.toString()) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }  
      return res.json(order);
      
    } catch (error) {
      console.error('Order fetch error:', error);
      return res.status(500).json({ 
        error: 'Server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getUserOrders(req, res) {
    try {
      const orders = await OrderService.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getRestaurantOrders(req, res) {
    try {
      // Verify user is restaurant manager/owner
      if (req.user.role !== 'restaurant') {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Assuming restaurantId is stored in the user object
      const orders = await OrderService.getOrdersByRestaurant(req.user.restaurantId);
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getDeliveryAgentOrders(req, res) {
    try {
      // if (req.user.role !== 'delivery') {
      //   return res.status(403).json({ error: 'Unauthorized access' });
      // }

      const orders = await OrderService.getOrdersByDeliveryAgent(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { status, notes } = req.body;
      const order = await OrderService.updateOrderStatus(
        req.params.id, 
        status, 
        req.user.id, 
        req.user.role,
        notes,
      );
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async cancelOrder(req, res) {
    try {
      const order = await OrderService.cancelOrder(
        req.params.id, 
        req.user.id, 
        req.body.reason
      );
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  trackOrder: catchAsync(async (req, res, next) => {
    const order = await OrderService.getOrderForTracking(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { order }
    });
  }),

  getOrderUpdates: catchAsync(async (req, res, next) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const sendUpdate = async () => {
      try {
        const order = await OrderService.getOrderForTracking(req.params.id);
        res.write(`data: ${JSON.stringify({
          status: 'success',
          data: {
            currentStatus: order.currentStatus,
            estimatedDelivery: order.estimatedDelivery
          }
        })}\n\n`);
      } catch (err) {
        res.write(`event: error\ndata: ${JSON.stringify({
          status: 'error',
          message: err.message
        })}\n\n`);
        res.end();
      }
    };

    await sendUpdate();
    const interval = setInterval(sendUpdate, 15000);
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  }),

  async getDeliveryIncoming(req, res) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
  
      const orders = await OrderService.getDeliveryIncomingOrders(req.user.id);
      
      return res.status(orders.length ? 200 : 204).json(orders);
  
    } catch (error) {
      console.error('Controller error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({ 
        error: error.message || 'Internal server error' 
      });
    }
  },

    getUserOrdersCount: catchAsync(async (req, res) => {
      try {
        if (!req.user?.id) {
          return res.status(400).json({
            status: 'error',
            message: 'User ID is required'
          });
        }
  
        const counts = await OrderService.getUserOrdersCount(req.user.id);
        
        res.status(200).json({
          status: 'success',
          data: {
            total: counts.total,
            delivered: counts.delivered,
            canceled: counts.canceled,
            pending: counts.pending
          }
        });
      } catch (error) {
        console.error('Error in OrderController.getUserOrdersCount:', error);
        res.status(500).json({
          status: 'error',
          message: error.message || 'Failed to get order counts'
        });
      }
    })

};


module.exports = OrderController;

