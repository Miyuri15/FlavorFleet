import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../Layout';
import { 
  FaCheckCircle, 
  FaTruck, 
  FaBoxOpen, 
  FaMapMarkerAlt,
  FaClock,
  FaTimesCircle,
  FaArrowLeft,
  FaInfoCircle
} from 'react-icons/fa';
import { GiCookingPot } from 'react-icons/gi';

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  const statusStages = [
    { status: 'Confirmed', icon: <FaCheckCircle />, label: 'Order Confirmed' },
    { status: 'Preparing', icon: <GiCookingPot />, label: 'Preparing Your Order' },
    { status: 'Out for Delivery', icon: <FaTruck />, label: 'Out for Delivery' },
    { status: 'Delivered', icon: <FaBoxOpen />, label: 'Delivered' },
  ];

  const api = axios.create({
    baseURL: 'http://localhost:5000',
    // headers: {
    //   Authorization: `Bearer ${localStorage.getItem('token')}`
    // },
    validateStatus: (status) => status < 500
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('Invalid tracking number');
        }

        const response = await api.get(`/api/orders/${id}/track`);

        if (response.status === 401) {
          navigate('/login', { state: { from: `/track-order/${id}` } });
          return;
        }

        if (response.status === 403) {
          throw new Error('You are not authorized to track this order');
        }

        if (response.status === 404) {
          throw new Error('Order not found');
        }

        if (!response.data) {
          throw new Error('Invalid order data received');
        }

        setOrder(response.data);
        
        // Calculate estimated delivery time if not provided
        if (!response.data.estimatedDelivery) {
          const deliveryTime = new Date(response.data.createdAt);
          deliveryTime.setMinutes(deliveryTime.getMinutes() + 45); // Default 45 min estimate
          setEstimatedTime(deliveryTime);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return statusStages.findIndex(stage => stage.status === order.status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Calculating...';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
   // Add a safe way to display order ID
   const displayOrderId = () => {
    if (!order?._id) return 'Loading...';
    try {
      return order._id.substring(18).toUpperCase();
    } catch (e) {
      console.error('Error formatting order ID:', e);
      return order._id || 'N/A';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Tracking your order...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <FaTimesCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Tracking Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/myorders')}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Orders
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tracking Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
           Tracking Order #{displayOrderId()}
          </h1>
          <p className="text-gray-600">
            Last updated: {formatDate(order.updatedAt)}
          </p>
        </div>

        {/* Progress Timeline */}
        <div className="relative mb-8">
          <div className="hidden md:block absolute top-4 left-1/2 w-full h-1 bg-gray-200 transform -translate-x-1/2"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusStages.map((stage, index) => {
              const isCompleted = index <= getCurrentStatusIndex();
              const isCurrent = index === getCurrentStatusIndex();

              return (
                <div 
                  key={stage.status}
                  className={`p-4 rounded-lg ${isCompleted ? 'bg-blue-50' : 'bg-gray-50'} 
                    ${isCurrent ? 'border-2 border-blue-500' : ''}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className={`text-2xl mb-2 ${isCompleted ? 'text-blue-500' : 'text-gray-400'}`}>
                      {stage.icon}
                    </span>
                    <h3 className={`font-medium ${isCompleted ? 'text-blue-800' : 'text-gray-500'}`}>
                      {stage.label}
                    </h3>
                    {isCurrent && (
                      <p className="text-sm text-blue-600 mt-1">
                        Current Status
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Map & Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 h-64">
            {/* Map Integration Placeholder */}
            <div className="flex items-center justify-center h-full text-gray-400">
              <FaMapMarkerAlt className="text-4xl mr-2" />
              <span>Delivery Map</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <FaInfoCircle className="text-blue-500 mr-2" />
                Delivery Details
              </h3>
              <p className="text-sm text-gray-600">
                {order.deliveryAddress?.street || 'Address not specified'}, {order.deliveryAddress?.city || ''}
              </p>
              <p className="text-sm text-gray-600">
                Estimated delivery: {formatDate(order.estimatedDelivery || estimatedTime)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <GiCookingPot className="text-orange-500 mr-2" />
                Restaurant Info
              </h3>
              <p className="text-sm text-gray-600">
                {order.restaurantId?.name || 'Restaurant information not available'}
              </p>
              <p className="text-sm text-gray-600">
                {order.restaurantId?.address || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Total</p>
              <p className="font-medium">LKR {order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">{order.paymentMethod || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Full Order Details
          </button>
          <button
            onClick={() => navigate('/myorders')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;