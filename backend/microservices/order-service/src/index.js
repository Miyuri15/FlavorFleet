const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration for cart service
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5004'], // Gateway service URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
 // methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const cartRoutes = require('./routes/cartRoutes');

app.use('/api/cart', cartRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Welcome to FlavorFleet Backend!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});