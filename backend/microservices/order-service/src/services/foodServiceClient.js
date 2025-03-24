// services/foodServiceClient.js
const axios = require('axios');

const foodService = axios.create({
  baseURL: 'http://localhost:5003/api',
  timeout: 5000
});

module.exports = {
  getFoodItem: async (foodId) => {
    try {
      const response = await foodService.get(`/foods/${foodId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food item:', error.message);
      return null;
    }
  }
};