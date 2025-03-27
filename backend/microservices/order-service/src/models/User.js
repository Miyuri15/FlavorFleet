const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    address:{type:String},
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "delivery", "restaurant_owner"], // Added "restaurant_owner"
      default: "user",
    },
    username: { type: String, unique: true }, // Automatically generated
    preferredRoute: { type: String }, // For delivery personnel
    isRestricted: { type: Boolean, default: false }, // To restrict users
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ], // List of restaurants owned by the user (for restaurant_owner role)
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
