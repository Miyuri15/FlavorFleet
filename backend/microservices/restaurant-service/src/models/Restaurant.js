const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },

      // ✅ UI INPUT ONLY (optional)
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },

      // ✅ SINGLE SOURCE OF TRUTH (GeoJSON)
      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: false,
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
          index: "2dsphere",
        },
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
      type: String, // user-service owns users
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

    logo: {
      type: String,
      get: (value) =>
        value
          ? `${process.env.BASE_URL || "http://localhost:5003"}${value}`
          : null,
    },

    banner: {
      type: String,
      get: (value) =>
        value
          ? `${process.env.BASE_URL || "http://localhost:5003"}${value}`
          : null,
    },

    menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
