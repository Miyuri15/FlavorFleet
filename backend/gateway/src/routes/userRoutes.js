const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    password,
    confirmPassword,
    role,
    adminName,
    organization,
  } = req.body;

  console.log("Registration request received:", req.body); // Debugging

  try {
    // Validate input
    if (
      !firstName ||
      !lastName ||
      !email ||
      !contactNumber ||
      !password ||
      !confirmPassword
    ) {
      console.log("Validation failed: Missing fields"); // Debugging
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      console.log("Validation failed: Passwords do not match"); // Debugging
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Additional validation for admin
    if (role === "admin") {
      if (!adminName || !organization) {
        console.log(
          "Validation failed: Admin name and organization are required"
        ); // Debugging
        return res
          .status(400)
          .json({ message: "Admin name and organization are required" });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Validation failed: User already exists"); // Debugging
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate username
    const username = `${firstName}${lastName}`.replace(/\s+/g, ""); // Remove spaces
    console.log("Generated username:", username); // Debugging

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("Password hashed successfully"); // Debugging

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      role: role || "user", // Default to 'user' if role is not provided
      username, // Automatically generated username
      ...(role === "admin" && { adminName, organization }), // Include admin-specific fields only for admins
    });

    await newUser.save();
    console.log("User saved successfully:", newUser); // Debugging

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("JWT Token generated:", token); // Log the token to the terminal

    // Return success response with token
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Registration failed:", error); // Debugging
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login Route
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role, username: user.username },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ message: "Login failed" });
//   }
// });

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check if the user is restricted
    if (user.isRestricted) {
      return res.status(403).json({ message: "User is restricted and cannot log in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Get all users (Admin Only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const users = await User.find({}, 'username email role isRestricted');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});


// Backend Route: /api/users/:userId/restrict
router.put("/:userId/restrict", authMiddleware, async (req, res) => {
  try {
    const { isRestricted } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isRestricted },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error updating user status" });
  }
});


module.exports = router;
