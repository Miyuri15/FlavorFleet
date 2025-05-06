const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Helper function to handle file upload
const handleFileUpload = (file, folder) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, `../public/uploads/${folder}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = `${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadDir, filename);

  // Handle both express-fileupload and multer
  if (file.buffer) {
    fs.writeFileSync(filePath, file.buffer); // For express-fileupload
  } else if (file.path) {
    fs.renameSync(file.path, filePath); // For multer
  } else {
    throw new Error("Invalid file upload: no buffer or path found");
  }

  return `/uploads/${folder}/${filename}`;
};

// Create a new restaurant
const createRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "restaurant_owner") {
      return res
        .status(403)
        .json({ error: "Only restaurant owners can create restaurants" });
    }

    let restaurantData = req.body;

    // Convert lat/lng to numbers
    if (restaurantData.coordinates) {
      restaurantData.coordinates.lat = parseFloat(
        restaurantData.coordinates.lat
      );
      restaurantData.coordinates.lng = parseFloat(
        restaurantData.coordinates.lng
      );
    }

    // Handle file uploads
    if (req.files?.logo) {
      restaurantData.logo = handleFileUpload(req.files.logo[0], "logos");
    }
    if (req.files?.banner) {
      restaurantData.banner = handleFileUpload(req.files.banner[0], "banners");
    }

    restaurantData.owner = req.user.id;

    const newRestaurant = new Restaurant(restaurantData);
    await newRestaurant.save();

    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: error.errors,
    });
  }
};

// Get all restaurants (for customers and admin)
const getAllRestaurants = async (req, res) => {
  try {
    let query = {};

    // Add status filter if provided
    if (req.query.status) {
      query.registrationStatus = req.query.status;
    }

    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "menuItems"
    );

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update restaurant (owner or admin only)
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user is owner or admin
    if (
      req.user.role !== "admin" &&
      restaurant.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        error: "Not authorized to update this restaurant",
      });
    }

    let updateData;

    // Handle both JSON and FormData
    if (req.body.data) {
      // Parse the JSON string from FormData
      updateData = JSON.parse(req.body.data);
    } else {
      updateData = req.body;
    }

    // Handle file uploads consistently
    if (req.files?.logo) {
      updateData.logo = handleFileUpload(req.files.logo[0], "logos");
    }
    if (req.files?.banner) {
      updateData.banner = handleFileUpload(req.files.banner[0], "banners");
    }

    // Clean up opening hours - convert empty strings to null
    if (updateData.openingHours) {
      Object.keys(updateData.openingHours).forEach((day) => {
        if (updateData.openingHours[day].open === "") {
          updateData.openingHours[day].open = null;
        }
        if (updateData.openingHours[day].close === "") {
          updateData.openingHours[day].close = null;
        }
      });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        omitUndefined: true,
      }
    );

    res.json(updatedRestaurant);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      error: error.message,
      details: error.errors,
    });
  }
};

// Update restaurant availability (owner only)
const updateRestaurantAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user is owner
    if (restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Only restaurant owner can update availability" });
    }

    restaurant.isAvailable = isAvailable;
    await restaurant.save();

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve/reject restaurant registration (admin only)
const updateRestaurantStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admin can update registration status" });
    }

    const { registrationStatus } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { registrationStatus },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get orders for a restaurant (restaurant owner only)
const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user is owner
    if (restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Only restaurant owner can view orders" });
    }

    // Call Order Service to get orders
    try {
      const response = await axios.get(
        `http://localhost:5000/orders/restaurant/${req.params.id}`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error("Error calling Order Service:", error.message);
      res.status(502).json({ error: "Error communicating with Order Service" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status (restaurant owner only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user is owner
    if (restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Only restaurant owner can update orders" });
    }

    // Call Order Service to update status
    try {
      const response = await axios.patch(
        `http://localhost:5000/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: req.headers.authorization } }
      );
      res.json(response.data);
    } catch (error) {
      console.error("Error calling Order Service:", error.message);
      res.status(502).json({ error: "Error communicating with Order Service" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    if (req.user.role !== "admin" && restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this restaurant" });
    }

    await MenuItem.deleteMany({ restaurant: restaurant._id });

    await restaurant.deleteOne();

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRestaurantsByOwner = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user.id });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  updateRestaurantAvailability,
  updateRestaurantStatus,
  getRestaurantOrders,
  updateOrderStatus,
  deleteRestaurant,
  getRestaurantsByOwner,
};
