const Delivery = require("../models/Delivery");

// Get deliveries assigned to the logged-in delivery personnel
const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ driverId: req.user.id });
    res.status(200).json(deliveries);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Accept a delivery
const acceptDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });

    if (delivery.status !== "pending")
      return res
        .status(400)
        .json({ error: "Delivery already assigned or accepted" });

    delivery.status = "accepted";
    delivery.driverId = req.user.id;
    delivery.assignedAt = new Date();
    await delivery.save();

    res.status(200).json({ message: "Delivery accepted", delivery });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Reject a delivery
const rejectDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });

    if (delivery.driverId !== req.user.id)
      return res
        .status(403)
        .json({ error: "Unauthorized to reject this delivery" });

    delivery.status = "rejected";
    delivery.driverId = null;
    await delivery.save();

    res.status(200).json({ message: "Delivery rejected" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update delivery status (e.g., picked_up, on_the_way, delivered)
const updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });

    if (delivery.driverId !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    delivery.status = status;
    await delivery.save();

    res.status(200).json({ message: "Status updated", delivery });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get current delivery tracking info (status + driver location)
const trackDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });

    res.status(200).json({
      status: delivery.status,
      location: delivery.tracking?.[delivery.tracking.length - 1] || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update live GPS location
const updateLocation = async (req, res) => {
  const { lat, lng } = req.body;

  try {
    const delivery = await Delivery.findOne({
      driverId: req.user.id,
      status: { $in: ["accepted", "picked_up", "on_the_way"] },
    });

    if (!delivery)
      return res.status(404).json({ error: "No active delivery found" });

    const locationEntry = {
      timestamp: new Date(),
      location: { lat, lng },
    };

    delivery.tracking.push(locationEntry);
    await delivery.save();

    res.status(200).json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getDeliveries,
  acceptDelivery,
  rejectDelivery,
  updateDeliveryStatus,
  trackDelivery,
  updateLocation,
};
