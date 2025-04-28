const express = require("express");
const OrderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Public routes
router.get("/:id/track", OrderController.trackOrder);
router.get("/:id/updates", OrderController.getOrderUpdates);

// Apply authMiddleware to all routes below
router.use(authMiddleware);

// Routes for authenticated users
router.get("/nearby", OrderController.getNearbyOrders);

// Create a new order
router.post("/", OrderController.createOrder);

// Get user's orders
router.get("/user/orders", OrderController.getUserOrders);
router.get("/user/orders/count", OrderController.getUserOrdersCount);

// Get restaurant's orders
router.get("/restaurant/orders", OrderController.getRestaurantOrders);

// Get delivery agent's orders
router.get("/delivery/orders", OrderController.getDeliveryAgentOrders);

// Incoming orders for delivery person
router.get("/delivery/incoming", OrderController.getDeliveryIncoming);

// Update order status
router.patch("/:id/status", OrderController.updateOrderStatus);

// Notify nearby delivery agents
router.post(
  "/:id/notify-delivery-agents",
  OrderController.notifyNearbyDeliveryAgents
);

// Cancel order
router.post("/:id/cancel", OrderController.cancelOrder);

// Rating routes
router.post("/:orderId/ratings", OrderController.submitRating);
router.get("/:orderId/ratings", OrderController.getOrderRatings);

router.get("/:id", OrderController.getOrder);

module.exports = router;
