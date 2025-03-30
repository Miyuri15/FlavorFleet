const CartItem = require("../models/cartModel");
const axios = require('axios');

// More reliable Docker environment detection
const isDockerEnvironment = () => {
  if (process.env.DOCKERIZED === 'true') return true;
  try {
    require('fs').accessSync('/.dockerenv');
    return true;
  } catch (e) {
    return false;
  }
};

// Get service URL with better debugging
const getRestaurantServiceUrl = () => {
  const isDocker = isDockerEnvironment();
  const url = isDocker
    ? 'http://restaurant-service:5003'
    : 'http://localhost:5003';

  console.log(`Using restaurant service URL: ${url} (Docker: ${isDocker})`);
  return url;
};

const cartService = {
  async getCartItems(userId, authToken) {
    const cartItems = await CartItem.find({ userId });
    console.log(`Fetching cart items for user ${userId}`);

    try {
      const enrichedItems = await Promise.all(
        cartItems.map(async item => {
          try {
            const menuItemData = await this.getMenuItem(item.menuItemId.toString(), authToken);
            return {
              ...item.toObject(),
              currentPrice: menuItemData?.price || item.price,
              currentStock: menuItemData?.stockAvailability || false
            };
          } catch (error) {
            console.error(`Error fetching menu item ${item.menuItemId}:`, error);
            return item.toObject();
          }
        })
      );
      return enrichedItems;
    } catch (error) {
      console.error('Error enriching cart items:', error);
      return cartItems;
    }
  },

  async getMenuItem(menuItemId, authToken) {
    try {
      const response = await axios.get(
        `${getRestaurantServiceUrl()}/api/restaurant/menu/${menuItemId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error.message);
      throw new Error('Failed to fetch menu item details');
    }
  },

  async addToCart(userId, item, authToken) {
    try {
      const existingCartItem = await CartItem.findOne({
        userId,
        menuItemId: item.menuItemId
      });

      if (existingCartItem) {
        existingCartItem.quantity += item.quantity;
        return await existingCartItem.save();
      } else {
        const newCartItem = new CartItem({
          userId,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          location: item.location,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          checked: true
        });
        return await newCartItem.save();
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  },

  async updateCartItem(userId, itemId, updates) {
    return await CartItem.findOneAndUpdate(
      { _id: itemId, userId },
      updates,
      { new: true }
    );
  },

  async removeCartItem(userId, itemId) {
    return await CartItem.findOneAndDelete({ _id: itemId, userId });
  },

  async removeCheckedItems(userId) {
    return await CartItem.deleteMany({ userId, checked: true });
  },

  async getCartItemCount(userId) {
    const cartItems = await CartItem.find({ userId });
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }
};

module.exports = cartService;
