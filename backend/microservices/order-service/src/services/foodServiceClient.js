const axios = require('axios');

const getFoodItem = async (foodId, token) => {
  try {
    const response = await axios.get(`http://localhost:5003/api/foods/${foodId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food item:', error.message);
    throw error;
  }
};

module.exports = { getFoodItem };