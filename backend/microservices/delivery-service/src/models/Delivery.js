const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  orderId: String,
  driverId: String,
  status: {
    type: String,
    enum: ["pending", "accepted", "picked_up", "delivered"],
    default: "pending",
  },
  pickupLocation: String,
  deliveryLocation: String,
  assignedAt: Date,
  tracking: [
    {
      timestamp: Date,
      location: {
        lat: Number,
        lng: Number,
      },
    },
  ],
});

module.exports = mongoose.model("Delivery", deliverySchema);
