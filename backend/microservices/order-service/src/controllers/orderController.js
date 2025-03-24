import Order from '../models/orderModel.js';
import { verifyToken } from '../utils/auth.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, deliveryAddress } = req.body;
    const order = new Order({ userId, items, totalAmount, deliveryAddress });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// Modify an order before confirmation
export const modifyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, totalAmount, deliveryAddress } = req.body;
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'Pending') {
      return res.status(400).json({ message: 'Order cannot be modified' });
    }
    order.items = items || order.items;
    order.totalAmount = totalAmount || order.totalAmount;
    order.deliveryAddress = deliveryAddress || order.deliveryAddress;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error modifying order', error });
  }
};

// Track order status
export const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ status: order.status });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking order', error });
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};