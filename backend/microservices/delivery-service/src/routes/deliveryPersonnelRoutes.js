const express = require("express");
const {
  getDeliveries,
  acceptDelivery,
  rejectDelivery,
  updateDeliveryStatus,
  trackDelivery,
  updateLocation,
} = require("../controllers/deliveryController");
const { delivery } = require("../middlewares/auth");

const router = express.Router();

// Route to get deliveries assigned to the logged-in delivery personnel
router.get("/", delivery, getDeliveries);

// Route to accept a delivery
router.post("/:id/accept", delivery, acceptDelivery);

// Route to reject a delivery
router.post("/:id/reject", delivery, rejectDelivery);

// Route to update the status of a delivery (picked up/delivered)
router.patch("/:id/status", delivery, updateDeliveryStatus);

// Route to get current delivery location
router.get("/:id/track", delivery, trackDelivery);

// Route to update the current GPS location
router.post("/location/update", delivery, updateLocation);

module.exports = router;
