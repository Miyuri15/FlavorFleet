import MenuItem from "../models/MenuItem.js";

// Restaurant Owner: Create menu item
export const createMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(403).json({ error: "Not authorized" });

    const newItem = new MenuItem({
      ...req.body,
      restaurant: restaurant._id,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Restaurant Owner: Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Verify ownership
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || !restaurant._id.equals(item.restaurant)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    Object.assign(item, req.body);
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Restaurant Owner: Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Verify ownership
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || !restaurant._id.equals(item.restaurant)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await item.deleteOne();
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
