
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