const express = require('express');
const foodController = require('../controllers/foodController');
const router = express.Router();

// POST route to add a new food item
router.post('/foods', foodController.addFood);

module.exports = router;