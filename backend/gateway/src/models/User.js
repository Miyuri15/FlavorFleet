const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    username: { type: String, unique: true }, // Automatically generated
    adminName: { type: String }, // Optional, only for admins
    organization: { type: String }, // Optional, only for admins
    isRestricted: { type: Boolean, default: false }
}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);