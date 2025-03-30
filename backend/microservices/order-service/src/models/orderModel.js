const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true, min: 0 },
      specialInstructions: { type: String }
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Preparing', 'Prepared', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  deliveryAddress: { type: String, required: true },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'Online Payment'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  estimatedDeliveryTime: { type: Date },
  specialInstructions: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  cancellationReason: { type: String },
  adminNotes: { type: String }
});

// Add indexes for better performance
orderSchema.index({ userId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ deliveryAgentId: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;