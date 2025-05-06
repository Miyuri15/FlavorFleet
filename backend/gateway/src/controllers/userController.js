const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Register a new user
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      contactNumber,
      password,
      confirmPassword,
      role,
      adminName,
      organization,
      preferredRoute,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !address ||
      !contactNumber ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Additional validation for admin
    if (role === "admin") {
      if (!adminName || !organization) {
        return res
          .status(400)
          .json({ message: "Admin name and organization are required" });
      }
    }

    // Additional validation for delivery person
    if (role === "delivery") {
      if (!preferredRoute) {
        return res.status(400).json({
          message: "Preferred route is required for delivery persons",
        });
      }
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate username
    const username = `${firstName}${lastName}`.replace(/\s+/g, "");

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      address,
      contactNumber,
      password: hashedPassword,
      role: role || "user", // Default role is "user"
      username,
      ...(role === "admin" && { adminName, organization }),
      ...(role === "delivery" && { preferredRoute }),
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
      console.error("Error registering user:", error);
  }
};

// Login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the user is restricted
    if (user.isRestricted) {
      return res
        .status(403)
        .json({ message: "User is restricted and cannot log in" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get all users (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    // Fetch all users (only selected fields)
    const users = await User.find({}, "username email role isRestricted");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

// Restrict a user (Admin Only)
const restrictUser = async (req, res) => {
  try {
    const { isRestricted } = req.body;

    // Update the user's isRestricted field
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isRestricted },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error updating user status" });
  }
};

// Add to userController
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id; // From the authenticated token

    // Check if all fields are provided
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
  }
};

// Update residence
const updateResidence = async (req, res) => {
  try {
    const { residence, address } = req.body;

    // Validate the residence object
    if (!residence || !residence.type || !residence.coordinates) {
      return res.status(400).json({ message: "Invalid residence data" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { residence, address },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating residence", error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  restrictUser,
  getCurrentUser,
  changePassword,
  updateResidence,
};
