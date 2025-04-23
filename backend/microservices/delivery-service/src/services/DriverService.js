const Driver = require("../models/Driver");

class DriverService {
  static async updateDriverStatus(driverId, status) {
    if (!["available", "busy", "offline"].includes(status)) {
      throw new Error("Invalid status");
    }
    return await Driver.findOneAndUpdate(
      { driverId },
      { status, lastActive: new Date() },
      { new: true }
    );
  }
}

module.exports = DriverService;
