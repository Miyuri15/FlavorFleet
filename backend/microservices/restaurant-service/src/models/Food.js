const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  foodImage: {
    type: String, // URL of the food image
  },
  foodName: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },

  stockAvailability: {
    type: Boolean,
    required: true,
    default: true, // Default to true (in stock)
  },
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;