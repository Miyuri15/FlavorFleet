// const Delivery = require("../models/Delivery");

// class DeliveryService {
//   async createDelivery(data) {
//     const delivery = new Delivery(data);
//     return await delivery.save();
//   }

//   async assignDriver(orderId, driverId) {
//     return await Delivery.findOneAndUpdate(
//       { orderId },
//       { driverId, status: "assigned", assignedAt: new Date() },
//       { new: true }
//     );
//   }

//   async updateLocation(orderId, location) {
//     return await Delivery.findOneAndUpdate(
//       { orderId },
//       { currentLocation: location },
//       { new: true }
//     );
//   }

//   async markInTransit(orderId) {
//     return await Delivery.findOneAndUpdate(
//       { orderId },
//       { status: "in_transit" },
//       { new: true }
//     );
//   }

//   async markDelivered(orderId) {
//     return await Delivery.findOneAndUpdate(
//       { orderId },
//       { status: "delivered", deliveredAt: new Date() },
//       { new: true }
//     );
//   }

//   async getDeliveryStatus(orderId) {
//     return await Delivery.findOne({ orderId });
//   }

//   async getAllDeliveriesByDriver(driverId) {
//     return await Delivery.find({ driverId }).sort({ createdAt: -1 });
//   }
// }

// module.exports = new DeliveryService();

const Delivery = require("../models/Delivery");

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
