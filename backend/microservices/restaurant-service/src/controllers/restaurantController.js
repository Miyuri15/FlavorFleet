const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const axios = require("axios");

// Create a new restaurant (for restaurant owners)
const createRestaurant = async (req, res) => {
  try {
    // Check if user is a restaurant owner
    if (req.user.role !== "restaurant_owner") {
      return res
        .status(403)
        .json({ error: "Only restaurant owners can create restaurants" });
    }

    const restaurantData = req.body;
    restaurantData.owner = req.user.id; // Store user ID as string

    const newRestaurant = new Restaurant(restaurantData);
    await newRestaurant.save();

    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all restaurants (for customers and admin)
const getAllRestaurants = async (req, res) => {
  try {
    const { cuisineType, isAvailable } = req.query;
    const filter = {};

    if (cuisineType) filter.cuisineType = cuisineType;
    if (isAvailable) filter.isAvailable = isAvailable === "true";

    const restaurants = await Restaurant.find(filter);

    // If you need user details, you would need to call the User Service here
    // For now, we'll just return the restaurants without user details
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
    if (req.user.role !== "admin" && restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this restaurant" });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  updateRestaurantAvailability,
  updateRestaurantStatus,
  getRestaurantOrders,
  updateOrderStatus,
};
