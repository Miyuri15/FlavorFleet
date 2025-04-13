
const CartItem = require("../models/cartModel");
const cartService = require("../services/cartService");

const cartController = {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const token = req.headers.authorization?.split(' ')[1]; // Optional chaining
      const cartItems = await cartService.getCartItems(userId, token);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const token = req.headers.authorization?.split(' ')[1]; // Optional chaining
      const cartItem = await cartService.addToCart(userId, req.body, token);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updatedItem = await cartService.updateCartItem(userId, id, req.body);
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async removeCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await cartService.removeCartItem(userId, id);
      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

async clearCart(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    console.log("Clearing cart for user:", userId); // Debugging log

    const result = await CartItem.deleteMany({ userId });
    console.log("Deleted items count:", result.deletedCount); // Debugging log

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: error.message });
  }
},

async removeCheckedItems(req, res) {
  try {
    const userId = req.user.id;
    const { itemIds } = req.body;

    console.log("Received User ID:", userId);
    console.log("Received Item IDs for deletion:", itemIds); // Debugging log

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "No items provided for deletion" });
    }

    const result = await CartItem.deleteMany({ userId, _id: { $in: itemIds } });

    console.log("Delete result:", result); // Debugging log

    if (result.deletedCount > 0) {
      res.json({ message: "Checked items cleared from cart" });
    } else {
      res.status(404).json({ message: "No matching items found in cart" });
    }
  } catch (error) {
    console.error("Error removing checked items:", error);
    res.status(500).json({ message: "Failed to remove checked items" });
  }
},


  async placeOrder(req, res) {
    try {
      const userId = req.user.id;
      await cartService.removeCheckedItems(userId);
      res.json({ message: 'Order placed successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  async getCartItemCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await cartService.getCartItemCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error getting cart count:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = cartController;