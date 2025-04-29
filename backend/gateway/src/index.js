
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const gatewayMiddleware = require('./middleware/gatewayMiddleware');

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5004','http://localhost:5000'], // Your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS']
}));

app.options('*', cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const authRoutes = require("./routes/userRoutes");
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Use the gateway middleware
app.use('/', gatewayMiddleware);

  // Test Route
app.get('/', (req, res) => {
  res.send('Welcome to FlavorFleet Backend!');

});

// New API Endpoint
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});