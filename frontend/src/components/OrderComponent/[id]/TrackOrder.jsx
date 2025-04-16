import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import {
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaClock,
  FaTimesCircle,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";
import { GiCookingPot } from "react-icons/gi";
import { motion } from "framer-motion";

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusStages = [
    { status: "Pending", icon: <FaClock />, label: "Order Received" },
    { status: "Confirmed", icon: <FaCheckCircle />, label: "Order Confirmed" },
    {
      status: "Preparing",
      icon: <GiCookingPot />,
      label: "Preparing Your Order",
    },
    { status: "Prepared", icon: <FaBoxOpen />, label: "Ready for Pickup" },
    {
      status: "Out for Delivery",
      icon: <FaTruck />,
      label: "Out for Delivery",
    },
    { status: "Delivered", icon: <FaCheckCircle />, label: "Delivered" },
  ];

  const api = axios.create({
    baseURL: import.meta.env.VITE_ORDER_BACKEND_URL,
    validateStatus: (status) => status < 500,
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error("Invalid tracking number");
        }

        const response = await api.get(`/api/orders/${id}/track`);

        if (response.status === 401) {
          navigate("/login", { state: { from: `/track-order/${id}` } });
          return;
        }

        if (response.status === 404) {
          throw new Error("Order not found");
        }

        if (!response.data?.data?.order) {
          throw new Error("Invalid order data received");
        }

        setOrder(response.data.data.order);
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
    return statusStages.findIndex(
      (stage) => stage.status === order.currentStatus
    );
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) return "Calculating...";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const displayOrderId = () => {
    if (!order?._id) return "Loading...";
    return order._id.substring(order._id.length - 6).toUpperCase();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <p className="text-gray-600">Tracking your order...</p>
          <p className="text-sm text-gray-500 mt-2">Order ID: {id}</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <motion.div
          className="max-w-2xl mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <FaTimesCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">
                  Tracking Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/myorders")}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Orders
          </button>
        </motion.div>
      </Layout>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <Layout>
      <motion.div
        className="max-w-4xl mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Tracking Order #{displayOrderId()}
        </h1>
        <p className="text-gray-600">
          Last updated: {formatDate(order.updatedAt)}
        </p>

        {/* Progress Bar */}
        <motion.div
          className="relative mt-6 bg-gray-200 h-2 rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${(currentStatusIndex / (statusStages.length - 1)) * 100}%`,
          }}
          transition={{ duration: 1 }}
          style={{ height: "6px" }}
        />

        {/* Status Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
          {statusStages.map((stage, index) => (
            <motion.div
              key={stage.status}
              className={`p-2 rounded-lg text-center ${
                index <= currentStatusIndex
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="text-2xl">{stage.icon}</div>
              <h3 className="text-sm">{stage.label}</h3>
            </motion.div>
          ))}
        </div>

        {/* Estimated time */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FaClock className="text-blue-500 text-xl" />
            <div>
              <h3 className="font-medium text-gray-900">
                Estimated Delivery Time
              </h3>
              <p className="text-gray-600">
                {order.status === "Delivered"
                  ? `Delivered at ${formatDate(order.updatedAt)}`
                  : formatDate(order.estimatedDeliveryTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <motion.button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:scale-105 transition"
            whileHover={{ scale: 1.05 }}
          >
            View Full Order Details
          </motion.button>
          <motion.button
            onClick={() => navigate("/myorders")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            whileHover={{ scale: 1.05 }}
          >
            Back to My Orders
          </motion.button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default TrackOrder;
