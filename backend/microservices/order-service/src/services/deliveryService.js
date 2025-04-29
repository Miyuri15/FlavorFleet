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

const getDeliveryServiceUrl = () => {
  const isDocker = isDockerEnvironment();
  return isDocker
    ? "http://delivery-service:5001/api"
    : "http://localhost:5001/api";
};

const DeliveryService = {
  async findNearbyDeliveryAgents(lat, lng) {
    try {
      const DELIVERY_SERVICE_URL = getDeliveryServiceUrl();
      const response = await axios.get(
        `${DELIVERY_SERVICE_URL}/drivers/nearby`,
        {
          params: { lat, lng },
        }
      );
      console.log(response.data);
      return response.data.data; // assuming { data: [agents] }
    } catch (error) {
      console.error(
        "Error calling Delivery Service:",
        error.response?.data || error.message
      );
      throw new AppError("Failed to fetch nearby delivery agents", 500);
    }
  },

  async getDriverById(driverId) {
    try {
      const DELIVERY_SERVICE_URL = getDeliveryServiceUrl();
      const response = await axios.get(
        `${DELIVERY_SERVICE_URL}/drivers/${driverId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error calling Delivery Service:",
        error.response?.data || error.message
      );
      throw new AppError("Failed to fetch driver details", 500);
    }
  },
};

module.exports = DeliveryService;
