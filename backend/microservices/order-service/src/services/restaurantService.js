const axios = require("axios");
const AppError = require("../utils/appError");
const fs = require("fs");

const isDockerEnvironment = () => {
  if (process.env.DOCKERIZED === "true") return true;
  try {
    fs.accessSync("/.dockerenv");
    return true;
  } catch (e) {
    return false;
  }
};

// Get dynamic restaurant service URL
const getRestaurantServiceUrl = () => {
  const isDocker = isDockerEnvironment();
  const url = isDocker
    ? "http://restaurant-service:5003/api"
    : "http://localhost:5003/api";
  console.log(`Using Restaurant Service URL: ${url} (Docker: ${isDocker})`);
  return url;
};

const RestaurantService = {
  async getRestaurantById(restaurantId) {
    try {
      const RESTAURANT_SERVICE_URL = getRestaurantServiceUrl();
      const response = await axios.get(
        `${RESTAURANT_SERVICE_URL}/restaurant/${restaurantId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error calling Restaurant Service:",
        error.response?.data || error.message
      );
      throw new AppError(
        "Failed to fetch restaurant from Restaurant Service",
        500
      );
    }
  },
};

module.exports = RestaurantService;
