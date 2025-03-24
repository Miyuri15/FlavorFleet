const Food = require('../models/Food');

// Add a new food item
const addFood = async (foodData) => {
  try {
    const newFood = new Food(foodData);
    await newFood.save();
    return newFood;
  } catch (error) {
    throw new Error(`Error adding food item: ${error.message}`);
  }
};

module.exports = {
  addFood,
};