const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true,
    unique: true,
  },
  currentLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
  },
  status: {
    type: String,
    enum: ["available", "busy", "offline"],
    default: "offline",
  },
  lastActive: Date,
});

// Index for geospatial queries
driverSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Driver", driverSchema);
