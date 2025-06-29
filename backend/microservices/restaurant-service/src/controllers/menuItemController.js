const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// Add menu item (restaurant owner only)
const addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user is owner
    if (restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Only restaurant owner can add menu items" });
    }

    const menuItemData = req.body;
    menuItemData.restaurant = req.params.restaurantId;

    const newMenuItem = new MenuItem(menuItemData);
    await newMenuItem.save();

    // Add menu item to restaurant's menuItems array
    await Restaurant.findByIdAndUpdate(req.params.restaurantId, {
      $push: { menuItems: newMenuItem._id },
    });

    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all menu items for a restaurant
const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isAvailable: true,
    });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update menu item (restaurant owner only)
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.menuItemId);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user is owner
    if (restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Only restaurant owner can update menu items" });
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.menuItemId,
      req.body,
      { new: true }
    );

    res.json(updatedMenuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete menu item (restaurant owner only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.menuItemId);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Check if user is owner
    if (restaurant.owner !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Only restaurant owner can delete menu items" });
    }

    // Remove menu item from restaurant's menuItems array
    await Restaurant.findByIdAndUpdate(menuItem.restaurant, {
      $pull: { menuItems: menuItem._id },
    });

    await MenuItem.findByIdAndDelete(req.params.menuItemId);

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllMenuItems = async (req, res) => {
  try {
    const { category, dietaryTags } = req.query;
    const filter = { isAvailable: true };

    // Check for category and dietary tags filters
    if (category) filter.category = category;
    if (dietaryTags) filter.dietaryTags = { $in: dietaryTags.split(",") };

    // Fetch menu items that belong to approved restaurants
    const menuItems = await MenuItem.find(filter).populate({
      path: "restaurant",
      match: { registrationStatus: "approved" }, // Ensure the restaurant is approved
      select: "name logo", // Only select necessary fields from the restaurant
    });

    // Filter out menu items from non-approved restaurants (restaurant will be null for non-approved)
    const filteredMenuItems = menuItems.filter((item) => item.restaurant);

    res.json(filteredMenuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//fetch a single menuitem by its id
const getMenuItemById = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addMenuItem,
  getMenuItemsByRestaurant,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
};
