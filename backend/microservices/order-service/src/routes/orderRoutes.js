import express from 'express';
import { verifyToken } from '../utils/auth.js';
import {
  createOrder,
  modifyOrder,
  trackOrder,
  getUserOrders,
} from '../controllers/orderController.js';

const router = express.Router();

// Protected routes
router.post('/orders', verifyToken, createOrder);
router.put('/orders/:orderId', verifyToken, modifyOrder);
router.get('/orders/:orderId/track', verifyToken, trackOrder);
router.get('/users/:userId/orders', verifyToken, getUserOrders);

export default router;