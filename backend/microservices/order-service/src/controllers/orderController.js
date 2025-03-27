const OrderService = require('../services/orderService');

const OrderController = {
  async createOrder(req, res) {
    try {
      const orderData = {
        ...req.body,
        userId: req.user.id
      };

      const order = await OrderService.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getOrder(req, res) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Verify user has access to this order
      if (req.user.role !== 'admin' && 
          req.user.id !== order.userId.toString() && 
          req.user.id !== order.deliveryAgentId?.toString()) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
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
      if (req.user.role !== 'delivery') {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

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
        notes
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
  }
}

module.exports = OrderController;