const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Dev Frontend
      "http://localhost:8000", // Gateway (if you're accessing directly from browser)
    ],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/auth", require("./routes/userRoutes"));

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to FlavorFleet user-service!");
});

// New API Endpoint
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend user-service!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
