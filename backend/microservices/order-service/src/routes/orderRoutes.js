const express = require('express');
const OrderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// Create a new order
router.post('/', OrderController.createOrder);

// Get order by ID
router.get('/:id', OrderController.getOrder);

// Get user's orders
router.get('/user/orders', OrderController.getUserOrders);

// Get restaurant's orders (for restaurant owners/managers)
router.get('/restaurant/orders', OrderController.getRestaurantOrders);

// Get delivery agent's orders
router.get('/delivery/orders', OrderController.getDeliveryAgentOrders);

// Update order status
router.patch('/:id/status', OrderController.updateOrderStatus);

// Cancel order
router.post('/:id/cancel', OrderController.cancelOrder);

module.exports = router;