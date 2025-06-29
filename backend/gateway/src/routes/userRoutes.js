const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  restrictUser,
  getCurrentUser,
  changePassword,
  updateResidence,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

// Get all users (Admin Only)
router.get("/all", authMiddleware, getAllUsers);

// Restrict a user (Admin Only)
router.put("/:userId/restrict", authMiddleware, restrictUser);

router.get("/current", authMiddleware, getCurrentUser);

// Change password
router.post("/change-password", authMiddleware, changePassword);

// Update residence
router.put("/update-residence", authMiddleware, updateResidence);

module.exports = router;
