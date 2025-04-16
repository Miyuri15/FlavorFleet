const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    isAvailable: { type: Boolean, default: true },
    owner: {
      type: String, // Changed from ObjectId to String since user is in another service
      required: true,
    },
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rating: { type: Number, default: 0 },
    cuisineType: { type: String, required: true },
    deliveryRadius: { type: Number, default: 5 },
    logo: { type: String },
    banner: { type: String },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
