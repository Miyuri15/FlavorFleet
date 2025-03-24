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

// Get all food items
const getAllFoods = async () => {
  try {
    const foods = await Food.find();
    return foods;
  } catch (error) {
    throw new Error(`Error fetching food items: ${error.message}`);
  }
};

// Get a specific food item by ID
const getFoodById = async (id) => {
  try {
    const food = await Food.findById(id);
    if (!food) {
      throw new Error('Food item not found');
    }
    return food;
  } catch (error) {
    throw new Error(`Error fetching food item: ${error.message}`);
  }
};

module.exports = {
  addFood,
  getAllFoods,
  getFoodById,
};