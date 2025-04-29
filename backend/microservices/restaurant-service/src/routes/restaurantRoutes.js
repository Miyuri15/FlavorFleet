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
  deleteRestaurant,
} = require("../controllers/restaurantController");
const {
  addMenuItem,
  getMenuItemsByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
} = require("../controllers/menuItemController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const uploadFiles = require("../middleware/uploadMiddleware");

// Public routes
// In restaurantRoutes.js, update the public GET route:

router.get(
  "/",
  (req, res, next) => {
    // This will now handle both:
    // GET /api/restaurant
    // GET /api/restaurant?status=pending (or approved/rejected)
    next();
  },
  getAllRestaurants
);
router.get("/:id", getRestaurantById);

// Restaurant owner routes
router.post("/", authMiddleware, uploadFiles, createRestaurant);
router.put("/:id", authMiddleware, uploadFiles, updateRestaurant);
router.patch("/:id/availability", authMiddleware, updateRestaurantAvailability);
router.delete("/:id", authMiddleware, deleteRestaurant);

// Order management routes (restaurant owner only)
router.get("/:id/orders", authMiddleware, getRestaurantOrders);
router.patch("/:id/orders/status", authMiddleware, updateOrderStatus);

// Menu item routes
router.post("/:restaurantId/menu", authMiddleware, addMenuItem);
router.get("/:restaurantId/menu", getMenuItemsByRestaurant);
router.put("/menu/:menuItemId", authMiddleware, updateMenuItem);
router.delete("/menu/:menuItemId", authMiddleware, deleteMenuItem);
router.get("/menu/all", getAllMenuItems); // Public route to get all menu items
router.get("/menu/:menuItemId", getMenuItemById);

// Admin-only routes
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateRestaurantStatus
);

module.exports = router;
