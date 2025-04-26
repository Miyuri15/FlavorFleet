const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
// CORS configuration for cart service
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

// Routes
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');


app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications',notificationRoutes);
app.use('/api/favorites', favoriteRoutes);


// Test Route
app.get('/', (req, res) => {
  res.send('Welcome to FlavorFleet Backend!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});