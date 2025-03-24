const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors({
  origin: '*', // Allow requests from the frontend service
  credentials: true,
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Test Route
app.get('/', (req, res) => {
  res.send('Welcome to FlavorFleet Backend!');
});

// New API Endpoint
app.get('/api/order', (req, res) => {
  res.json({ message: 'Hello from the backend order-service!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});