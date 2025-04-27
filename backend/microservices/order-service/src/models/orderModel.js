const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  restaurantRating: { type: Number, min: 1, max: 5 },
  deliveryRating: { type: Number, min: 1, max: 5 },
  itemRatings: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      rating: { type: Number, min: 1, max: 5 },
    },
  ],
  feedback: String,
  ratedAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true, min: 0 },
      specialInstructions: { type: String },
    },
  ],

  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Preparing",
      "Prepared",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ],
    default: "Pending",
  },
  deliveryAddress: {
    type: String,
    required: true,
    set: (address) => address.toLowerCase().replace(/\s+/g, " ").trim(),
  },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentMethod: {
    type: String,
    enum: ["Cash on Delivery", "Online Payment"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  estimatedDeliveryTime: { type: Date },
  specialInstructions: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  cancellationReason: { type: String },
  adminNotes: { type: String },
  rating: ratingSchema,
  hasRated: { type: Boolean, default: false },
  normalizedAddress: String,
});

// Add indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ deliveryAgentId: 1 });
orderSchema.index({ status: 1 });
orderSchema.pre("save", function (next) {
  this.normalizedAddress = this.deliveryAddress
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .trim();
  next();
});
orderSchema.index({
  normalizedAddress: "text",
  status: 1,
  deliveryAgentId: 1,
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
