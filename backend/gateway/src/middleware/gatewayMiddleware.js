const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('./authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Proxy requests to cart service
router.all('/api/cart*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `http://localhost:5000${req.originalUrl}`,
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      },
      data: req.body
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;