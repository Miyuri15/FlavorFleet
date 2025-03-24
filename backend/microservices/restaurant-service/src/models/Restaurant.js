import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Restaurant name is required"],
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Owner is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  isAvailable: {
    type: Boolean,
    default: true, // Allows restaurant to accept/reject orders
  },
  isVerified: {
    type: Boolean,
    default: false, // Admin must verify the restaurant
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Restaurant", restaurantSchema);
