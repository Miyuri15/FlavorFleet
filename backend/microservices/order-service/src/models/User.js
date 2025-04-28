const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    address:{type:String},
    contactNumber: { type: String, required: true, validate: {
      validator: function(v) {
        // Accepts either local format (070...) or E.164 (+94...)
        return /^(\+94|0)[1-9][0-9]{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Sri Lankan phone number!`
    }},
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "delivery", "restaurant_owner"], // Added "restaurant_owner"
      default: "user",
    },
    username: { type: String, unique: true }, // Automatically generated
    preferredRoute: { type: String ,set: routes => routes.map(route => route.trim().toLowerCase()) },
    preferredRoutes: { 
      type: [String], 
      default: [] 
    },  
      deliveryRating: { type: Number, default: 0 },
  deliveryRatingCount: { type: Number, default: 0 },
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

UserSchema.index({
  preferredRoutes: 1
});

module.exports = mongoose.model("User", UserSchema);
