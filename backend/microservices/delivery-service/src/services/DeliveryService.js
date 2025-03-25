const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");

class DeliveryService {
  // Create a new delivery entry
  async createDelivery(data) {
    const delivery = new Delivery(data);
    return await delivery.save();
  }

  // Assign a driver and update status to 'accepted'
  async assignDriver(orderId, driverId) {
    return await Delivery.findOneAndUpdate(
      { orderId },
      { driverId, status: "accepted", assignedAt: new Date() },
      { new: true }
    );
  }

  // Find nearest available driver to a given restaurant
  async assignNearestDriver(orderId, restaurantId, customerAddress) {
    // Step 1: Call restaurant service
    const restaurantResponse = await axios.get(
      `http://restaurant-service:3002/api/restaurants/${restaurantId}`
    );
    const restaurant = restaurantResponse.data;

    if (!restaurant || !restaurant.address?.coordinates) {
      throw new Error("Invalid restaurant data from Restaurant Service");
    }

    const { lat, lng } = restaurant.address.coordinates;

    // Step 2: Find the nearest available driver
    const driver = await Driver.findOne({
      status: "available",
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: restaurant.deliveryRadius * 1000,
        },
      },
    });

    if (!driver) throw new Error("No available drivers nearby");

    // Step 3: Create delivery
    const delivery = await this.createDelivery({
      orderId,
      driverId: driver.driverId,
      pickupLocation: `Restaurant ${restaurant.name}`,
      deliveryLocation: customerAddress,
      assignedAt: new Date(),
    });

    // Step 4: Update driver status
    driver.status = "busy";
    await driver.save();

    return { delivery, driver };
  }

  // Update status (e.g., to picked_up or delivered)
  async updateStatus(orderId, status) {
    return await Delivery.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
  }

  // Add a tracking point (timestamp + location)
  async addTrackingPoint(orderId, lat, lng) {
    const trackingUpdate = {
      timestamp: new Date(),
      location: { lat, lng },
    };

    return await Delivery.findOneAndUpdate(
      { orderId },
      { $push: { tracking: trackingUpdate } },
      { new: true }
    );
  }

  // Get tracking data
  async getTracking(orderId) {
    const delivery = await Delivery.findOne({ orderId });
    return delivery?.tracking || [];
  }

  // Get delivery details by orderId
  async getDeliveryByOrderId(orderId) {
    return await Delivery.findOne({ orderId });
  }

  // Get all deliveries for a driver
  async getDeliveriesByDriver(driverId) {
    return await Delivery.find({ driverId }).sort({ assignedAt: -1 });
  }
}

module.exports = new DeliveryService();
