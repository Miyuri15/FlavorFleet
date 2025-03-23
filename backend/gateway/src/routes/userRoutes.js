const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  restrictUser,
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

module.exports = router;
