const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5003;

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
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
  res.send("Welcome to FlavorFleet Backend!");
});

// New API Endpoint
// app.get("/api/restaurant", (req, res) => {
//   res.json({ message: "Hello from the backend restaurant-service!" });
// });

app.use("/api/restaurant", require("./routes/restaurantRoutes"));

// Use food routes
app.use("/api", require("./routes/foodRoutes"));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
