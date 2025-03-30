import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import { FaClock, FaCheckCircle, FaTruck, FaBoxOpen, FaTimesCircle, FaHistory } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-500" />;
      case "Confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "Preparing":
        return <FaBoxOpen className="text-orange-500" />;
      case "Out for Delivery":
        return <FaTruck className="text-purple-500" />;
      case "Delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaHistory className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-lg rounded-lg">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Order #{order._id.substring(order._id.length - 6).toUpperCase()}
        </h2>

        {/* Order Status */}
        <div className="flex items-center space-x-3 mb-6">
          {getStatusIcon(order.status)}
          <span className="text-lg font-semibold text-gray-800">{order.status}</span>
        </div>

        {/* Order Info */}
        <div className="border p-4 rounded-lg mb-6">
          <p className="text-gray-600">
            <strong>Placed on:</strong> {formatDate(order.createdAt)}
          </p>
          {order.restaurantId?.name && (
            <p className="text-gray-600">
              <strong>Restaurant:</strong> {order.restaurantId.name}
            </p>
          )}
          <p className="text-gray-600">
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>
        </div>

        {/* Items Table */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ordered Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left">Item</th>
                <th className="py-2 px-4 text-center">Quantity</th>
                <th className="py-2 px-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4 text-center">{item.quantity}</td>
                  <td className="py-2 px-4 text-right">LKR {item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Total */}
        <div className="mt-6 flex justify-between items-center text-lg font-semibold">
          <p>Total Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
          <p className="text-gray-900">Total: LKR {order.totalAmount.toFixed(2)}</p>
        </div>

        {/* Delivery Details */}
        <div className="mt-6 border p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Details</h3>
          <p className="text-gray-600">
            <strong>Address:</strong> {order.deliveryAddress}
          </p>
          {order.deliveryAgentId && (
            <p className="text-gray-600">
              <strong>Delivery Agent:</strong> {order.deliveryAgentId.name} ({order.deliveryAgentId.phone})
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
