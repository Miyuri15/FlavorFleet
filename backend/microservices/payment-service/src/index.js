const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;
const paymentController = require('./controllers/paymentController');

// ✅ 1. Raw body for webhook BEFORE express.json()
app.post(
  '/api/payment/webhook',
  bodyParser.raw({ type: 'application/json' }), // Capture raw body
  require('./controllers/paymentController').handleWebhook
);


// ✅ 2. Then apply JSON/body middleware
app.use(cors({
  origin: ['http://localhost:3000','http://frontend:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS','PATCH']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// ✅ 4. Normal API Routes
app.use('/api/payment', require('./routes/paymentRoutes'));

// ✅ 5. Test Route
app.get('/', (req, res) => {
  res.send('Welcome to FlavorFleet Backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on Port:${PORT}`);
});
