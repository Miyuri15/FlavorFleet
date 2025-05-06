const express = require("express");
const {
  updateDriverStatus,
  addDriver,
  getCurrentDriver,
  findNearbyDrivers,
  updateDriverLocation,
  getDriverById,
} = require("../controllers/driverController");
const { delivery } = require("../middlewares/auth");

const router = express.Router();

// Route to update the status of a driver
router.patch("/update-status", delivery, updateDriverStatus);

// Route to add a new driver
router.post("/add", delivery, addDriver);

// Route to get the current driver's details
router.get("/me", delivery, getCurrentDriver);

// Route to find nearby drivers
router.get("/nearby", findNearbyDrivers);

// Route to update the driver's location
router.patch("/update-location", delivery, updateDriverLocation);

// Route to get driver by ID
router.get("/:id", getDriverById);

module.exports = router;
