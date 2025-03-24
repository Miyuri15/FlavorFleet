const express = require('express');
const foodController = require('../controllers/foodController');
const router = express.Router();

// POST route to add a new food item
router.post('/foods', foodController.addFood);

// GET route to fetch all food items
router.get('/foods', foodController.getAllFoods);

// GET route to fetch a specific food item by ID
router.get('/foods/:id', foodController.getFoodById);

module.exports = router;