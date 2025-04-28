const express = require("express");
const OrderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/orderModel");
const router = express.Router();
router.get("/:id/track", OrderController.trackOrder);
router.get("/:id/updates", OrderController.getOrderUpdates);
// Apply authMiddleware to all routes
router.use(authMiddleware);

// Create a new order
router.post("/", OrderController.createOrder);

// Get order by ID
router.get("/:id", OrderController.getOrder);

// Get user's orders
router.get("/user/orders", OrderController.getUserOrders);

// Get restaurant's orders (for restaurant owners/managers)
router.get("/restaurant/orders", OrderController.getRestaurantOrders);

// Get delivery agent's orders
router.get("/delivery/orders", OrderController.getDeliveryAgentOrders);

// Update order status
router.patch("/:id/status", OrderController.updateOrderStatus);

//Notify nearby delivery agents
router.post(
  "/:id/notify-delivery-agents",
  OrderController.notifyNearbyDeliveryAgents
);

// Cancel order
router.post("/:id/cancel", OrderController.cancelOrder);

//incoming orders of delivery person
router.get(
  "/delivery/incoming",
  authMiddleware,
  OrderController.getDeliveryIncoming
);
//adding for estimated time
router.patch("/:id/status", authMiddleware, OrderController.updateOrderStatus);

//count orders
router.get("/user/orders/count", OrderController.getUserOrdersCount);

// Rating routes
router.post("/:orderId/ratings", authMiddleware, OrderController.submitRating);
router.get(
  "/:orderId/ratings",
  authMiddleware,
  OrderController.getOrderRatings
);

module.exports = router;
