import Order from '../models/orderModel.js';

export const createOrderService = async (orderData) => {
  return await Order.create(orderData);
};

export const modifyOrderService = async (orderId, updateData) => {
  return await Order.findByIdAndUpdate(orderId, updateData, { new: true });
};

export const trackOrderService = async (orderId) => {
  return await Order.findById(orderId);
};

export const getUserOrdersService = async (userId) => {
  return await Order.find({ userId });
};