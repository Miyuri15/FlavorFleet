const CartItem = require("../models/cartModel");
const cartService = require("../services/cartService");

const cartController = {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cartItems = await cartService.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const cartItem = await cartService.addToCart(userId, req.body);
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

  async placeOrder(req, res) {
    try {
      const userId = req.user.id;
      await cartService.removeCheckedItems(userId);
      res.json({ message: 'Order placed successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
// Get cart item count for a user
async getCartItemCount(req, res) {  try {
    const userId = req.user._id;
    
    const cartItems = await CartItem.find({ user: userId });
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
};

module.exports = cartController;