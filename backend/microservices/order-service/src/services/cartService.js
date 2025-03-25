const CartItem = require("../models/cartModel");
const axios = require('axios');

const cartService = {
  async getCartItems(userId, authToken) { // Add authToken parameter
    const cartItems = await CartItem.find({ userId });
    
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
            console.error(`Error fetching food item ${item.foodId}:`, error.message);
            return item.toObject(); // Return basic item if food service fails
          }
        })
      );
      return enrichedItems;
    } catch (error) {
      console.error('Error enriching cart items:', error);
      return cartItems; // Fallback to unenriched items
    }
  },

  async getFoodItem(foodId, authToken) {
    try {
      const response = await axios.get(`http://localhost:5003/api/foods/${foodId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching food item:', error.message);
      throw new Error('Failed to fetch food item details');
    }
  },

  async addToCart(userId, item, authToken) { // Add authToken parameter
    if (!authToken) {
      throw new Error('Authentication token is required');
    }

    try {
      const foodData = await this.getFoodItem(item.foodId, authToken);
      
      if (!foodData) {
        throw new Error('Food item not found');
      }

      if (!foodData.stockAvailability) {
        throw new Error('This item is out of stock');
      }

      const existingItem = await CartItem.findOne({ 
        userId, 
        foodId: item.foodId 
      });

      if (existingItem) {
        existingItem.quantity += item.quantity;
        return await existingItem.save();
      }

      const newCartItem = new CartItem({
        userId,
        foodId: item.foodId,
        foodName: foodData.foodName,
        restaurantName: foodData.restaurantName,
        location: foodData.location,
        price: foodData.price,
        quantity: item.quantity,
        image: foodData.foodImage,
        checked: true // Default to checked
      });

      return await newCartItem.save();
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error; // Re-throw for controller to handle
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
    const cartItems = await CartItem.find({ userId }); // Changed from Cart to CartItem
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }
};

module.exports = cartService;