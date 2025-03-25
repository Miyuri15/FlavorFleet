const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  updateRestaurantAvailability,
  updateRestaurantStatus,
  getRestaurantOrders,
  updateOrderStatus,
} = require("../controllers/restaurantController");
const {
  addMenuItem,
  getMenuItemsByRestaurant,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuItemController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

// Restaurant owner routes
router.post("/", authMiddleware, createRestaurant);
router.put("/:id", authMiddleware, updateRestaurant);
router.patch("/:id/availability", authMiddleware, updateRestaurantAvailability);

// Order management routes (restaurant owner only)
router.get("/:id/orders", authMiddleware, getRestaurantOrders);
router.patch("/:id/orders/status", authMiddleware, updateOrderStatus);

// Menu item routes
router.post("/:restaurantId/menu", authMiddleware, addMenuItem);
router.get("/:restaurantId/menu", getMenuItemsByRestaurant);
router.put("/menu/:menuItemId", authMiddleware, updateMenuItem);
router.delete("/menu/:menuItemId", authMiddleware, deleteMenuItem);

// Admin-only routes
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateRestaurantStatus
);

module.exports = router;
