import Layout from "../Layout";
import DeliveryDetailsForm from "./DeliveryDetailsForm";
import OrderSummary from "./OrderSummary";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function PlaceOrderPage() {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configure axios (same as in CartPage)
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch actual cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get('/cart');
        const items = Array.isArray(data) ? data : (data.items || []);
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 200; // Example shipping calculation
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + shipping + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handlePlaceOrder = async () => {
    try {
      const totals = calculateTotals();
      
      const orderData = {
        user: localStorage.getItem('userId'), // Get from your auth system
        deliveryDetails,
        paymentMethod,
        items: cartItems.map(item => ({
          foodId: item._id,
          foodName: item.foodName,
          quantity: item.quantity,
          price: item.price,
          restaurant: item.restaurantId
        })),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        status: paymentMethod === 'cash' ? 'pending' : 'processing'
      };

      const response = await api.post('/orders', orderData);

      if (paymentMethod === 'card') {
        navigate('/paymentPortal', { state: { orderId: response.data._id } });
      } else {
        navigate(`/order-confirmation/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Your Order</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <DeliveryDetailsForm 
            onDetailsSubmit={setDeliveryDetails} 
            paymentMethod={paymentMethod}
            onPaymentMethodSelect={setPaymentMethod}
          />
          
          <OrderSummary 
            items={cartItems} 
            paymentMethod={paymentMethod}
            deliveryDetails={deliveryDetails}
            onPlaceOrder={handlePlaceOrder}
            totals={calculateTotals()}
          />
        </div>
      </div>
    </Layout>
  );
}