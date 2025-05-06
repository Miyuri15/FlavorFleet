const DriverService = require("../services/DriverService");
const Driver = require("../models/Driver");

async function updateDriverStatus(req, res) {
  try {
    const { driverId, status } = req.body;
    if (!driverId || !status) {
      return res
        .status(400)
        .json({ error: "driverId and status are required" });
    }

    const updatedDriver = await DriverService.updateDriverStatus(
      driverId,
      status
    );
    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.status(200).json(updatedDriver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addDriver(req, res) {
  try {
    const { driverId, currentLocation } = req.body;
    if (!driverId) {
      return res.status(400).json({ error: "driverId is required" });
    }

    const existingDriver = await Driver.findOne({ driverId });
    if (existingDriver) {
      return res.status(400).json({ error: "Driver already exists" });
    }

    const location = currentLocation || {
      type: "Point",
      coordinates: [0, 0], // Default coordinates
    };

    const newDriver = new Driver({
      driverId,
      currentLocation: location,
      status: "offline",
      lastActive: new Date(),
    });

    await newDriver.save();

    res
      .status(201)
      .json({ message: "Driver added successfully", driver: newDriver });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCurrentDriver(req, res) {
  try {
    const driverId = req.user.id;
    const driver = await Driver.findOne({ driverId });

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function findNearbyDrivers(req, res) {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and Longitude are required" });
    }

    const drivers = await Driver.find({
      status: "available",
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius),
        },
      },
    });

    res.status(200).json({ data: drivers });
  } catch (error) {
    console.error("Error finding nearby drivers:", error);
    res.status(500).json({ error: error.message });
  }
}

async function updateDriverLocation(req, res) {
  try {
    const { driverId, lat, lng } = req.body;

    if (!driverId || lat == null || lng == null) {
      return res
        .status(400)
        .json({ error: "driverId, lat, and lng are required" });
    }

    const driver = await Driver.findOne({ driverId });

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    driver.currentLocation = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };
    driver.lastActive = new Date();

    await driver.save();

    res.status(200).json({ message: "Location updated successfully", driver });
  } catch (error) {
    console.error("Error updating driver location:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getDriverById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    const driver = await Driver.findOne({ driverId: id });

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    return res.status(200).json(driver);
  } catch (error) {
    console.error("Error fetching driver:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  updateDriverStatus,
  addDriver,
  getCurrentDriver,
  findNearbyDrivers,
  updateDriverLocation,
  getDriverById,
};
