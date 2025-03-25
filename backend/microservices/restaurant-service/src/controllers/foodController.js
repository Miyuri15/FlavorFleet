const Food = require('../models/Food');
const foodService = require('../services/foodService');

// Add a new food item
const addFood = async (req, res) => {
  try {
    const foodData = req.body;
    const newFood = await foodService.addFood(foodData);
    res.status(201).json({ message: 'Food item added successfully', food: newFood });
  } catch (error) {
    res.status(500).json({ message: 'Error adding food item', error: error.message });
  }
};

// Get all food items
const getAllFoods = async (req, res) => {
  try {
    const foods = await foodService.getAllFoods();
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific food item by ID
const getFoodById = async (req, res) => {
  try {
    const food = await foodService.getFoodById(req.params.id);
    res.status(200).json(food);
  } catch (error) {
    if (error.message === 'Food item not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = {
  addFood,
  getAllFoods,
  getFoodById,
};