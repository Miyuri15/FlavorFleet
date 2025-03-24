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

module.exports = {
  addFood,
};