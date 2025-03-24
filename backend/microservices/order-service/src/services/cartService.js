const CartItem = require("../models/cartModel");

const { getFoodItem } = require("./foodServiceClient");

const cartService = {
  async getCartItems(userId) {
    const cartItems = await CartItem.find({ userId });
    
    // Optionally enrich with latest food data
    const enrichedItems = await Promise.all(
      cartItems.map(async item => {
        const foodData = await getFoodItem(item.foodId.toString());
        return {
          ...item.toObject(),
          currentPrice: foodData?.price || item.price,
          currentStock: foodData?.stockAvailability || false
        };
      })
    );
    
    return enrichedItems;
  },

  async addToCart(userId, item) {
    // First verify the food exists and get current details
    const foodData = await getFoodItem(item.foodId);
    if (!foodData) {
      throw new Error('Food item not found');
    }

    // Check stock availability
    if (!foodData.stockAvailability) {
      throw new Error('This item is out of stock');
    }

    // Rest of your existing logic
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
      foodName: foodData.foodName, // Use data from food service
      restaurantName: foodData.restaurantName,
      location: foodData.location,
      price: foodData.price, // Current price
      quantity: item.quantity,
      image: foodData.foodImage
    });

    return await newCartItem.save();
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

  // Get cart item count for a user
  async getCartItemCount(userId) {
    const cartItems = await Cart.find({ user: userId });
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

};

module.exports = cartService;