import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  description: {
    type: String,
    maxlength: [200, "Description too long"],
  },
  category: {
    type: String,
    enum: ["Appetizer", "Main Course", "Dessert", "Beverage"],
    default: "Main Course",
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: [true, "Restaurant reference is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("MenuItem", menuItemSchema);
