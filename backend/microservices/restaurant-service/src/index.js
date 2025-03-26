const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const foodRoutes = require("./routes/foodRoutes");

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(
  cors({
    origin: "*", // Allow requests from the frontend service
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/restaurants", require("./routes/restaurantRoutes"));

// Use food routes
app.use("/api", foodRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to FlavorFleet Backend!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
