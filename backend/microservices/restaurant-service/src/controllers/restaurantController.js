import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";

// Restaurant Owner: Toggle availability
export const toggleRestaurantAvailability = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    restaurant.isAvailable = !restaurant.isAvailable;
    await restaurant.save();

    res.status(200).json({
      message: `Restaurant is now ${
        restaurant.isAvailable ? "available" : "unavailable"
      }`,
      isAvailable: restaurant.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Admin: Verify restaurant
export const verifyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    restaurant.isVerified = true;
    await restaurant.save();

    res.status(200).json({ message: "Restaurant verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
