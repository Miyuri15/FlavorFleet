const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    image: { type: String },
    ingredients: [{ type: String }],
    dietaryTags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
