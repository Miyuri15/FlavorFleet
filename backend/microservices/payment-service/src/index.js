const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000','http://frontend:3000'], // Gateway service URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS','PATCH']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Test Route
app.get('/', (req, res) => {
  res.send('Welcome to FlavorFleet Backend!');
});

app.use('/api/payment', require('./routes/paymentRoutes'));


// New API Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend payment-service!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});