const CartItem = require("../models/cartModel");
const axios = require('axios');

// More reliable Docker environment detection
const isDockerEnvironment = () => {
  // Explicit Docker environment variable (set in docker-compose)
  if (process.env.DOCKERIZED === 'true') return true;
  
  // Filesystem check (Docker containers often have this file)
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
            const foodData = await this.getFoodItem(item.foodId.toString(), authToken);
            return {
              ...item.toObject(),
              currentPrice: foodData?.price || item.price,
              currentStock: foodData?.stockAvailability || false
            };
          } catch (error) {
            console.error(`Error fetching food item ${item.foodId}:`, error);
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

  async getFoodItem(foodId, authToken) {
    try {
      const response = await axios.get(
        `${getRestaurantServiceUrl()}/api/menu/${foodId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching food item:', error.message);
      throw new Error('Failed to fetch food item details');
    }
  },

  async addToCart(userId, item, authToken) {
    try {
      // Get basic item info without calling restaurant service
      const newCartItem = new CartItem({
        userId,
        foodId: item.foodId,
        foodName: item.foodName,
        restaurantName: item.restaurantName,
        location: item.location,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        checked: true
      });
      return await newCartItem.save();
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  },

  
  // async addToCart(userId, item, authToken) {
  //   if (!authToken) {
  //     throw new Error('Authentication token is required');
  //   }

  //   try {
  //     const foodData = await this.getFoodItem(item.foodId, authToken);
      
  //     if (!foodData) {
  //       throw new Error('Food item not found');
  //     }

  //     if (!foodData.stockAvailability) {
  //       throw new Error('This item is out of stock');
  //     }

  //     const existingItem = await CartItem.findOne({ 
  //       userId, 
  //       foodId: item.foodId 
  //     });

  //     if (existingItem) {
  //       existingItem.quantity += item.quantity;
  //       return await existingItem.save();
  //     }

  //     const newCartItem = new CartItem({
  //       userId,
  //       foodId: item.foodId,
  //       foodName: foodData.foodName,
  //       restaurantName: foodData.restaurantName,
  //       location: foodData.location,
  //       price: foodData.price,
  //       quantity: item.quantity,
  //       image: foodData.foodImage,
  //       checked: true
  //     });

  //     return await newCartItem.save();
  //   } catch (error) {
  //     console.error('Error in addToCart:', error);
  //     throw error;
  //   }
  // },

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