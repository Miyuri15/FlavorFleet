import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../Layout';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
  
        const response = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json'
            }
          }
        );
  
        if (!response.data?._id) {
          throw new Error('Invalid order data structure');
        }
  
        setOrder(response.data);
      } catch (error) {
        console.error('Order fetch failed:', error);
        
        if (error.response) {
          if (error.response.status === 401) {
            navigate('/login');
            return;
          }
          if (error.response.status === 403) {
            setError('You are not authorized to view this order');
            return;
          }
          if (error.response.status === 404) {
            setError('Order not found');
            return;
          }
          setError(`Error: ${error.response.data?.error || 'An unexpected error occurred'}`);
        } else {
          setError(error.message || 'Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrder();
  }, [orderId, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto p-4 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-red-800">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Order Confirmed!
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Order ID: {order._id}
          </h2>
          <p className="text-lg mb-2">
            Status: <span className="font-medium">{order.status}</span>
          </p>
          <p className="mb-4">
            Estimated Delivery Time: {new Date(order.estimatedDeliveryTime).toLocaleString()}
          </p>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Delivery Details:</h3>
            <p className="text-gray-700">{order.deliveryAddress}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}