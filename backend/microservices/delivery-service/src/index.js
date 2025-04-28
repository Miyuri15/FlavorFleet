const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const deliveryRoutes = require("./routes/deliveryRoutes");
const driverRoutes = require("./routes/driverRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to FlavorFleet delivery-service!");
});

// Delivery API Routes
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/drivers", driverRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
