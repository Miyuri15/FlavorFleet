import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import {
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaTimesCircle,
  FaHistory,
  FaMapMarkerAlt,
  FaStore,
  FaCreditCard,
  FaUserTie,
  FaPhone,
  FaMotorcycle,
} from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { GiCardboardBox, GiCookingPot } from "react-icons/gi";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="mt-2">{this.state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 rounded hover:bg-red-200"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_ORDER_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    transformResponse: [
      (data) => {
        try {
          return JSON.parse(data);
        } catch (err) {
          if (data.startsWith("<!DOCTYPE html>")) {
            throw new Error("Server returned HTML instead of JSON");
          }
          throw err;
        }
      },
    ],
  });

  const statusStages = [
    { status: "Pending", icon: <FaClock />, label: "Order Received" },
    { status: "Confirmed", icon: <FaCheckCircle />, label: "Confirmed" },
    { status: "Preparing", icon: <GiCookingPot />, label: "Preparing" },
    { status: "Prepared", icon: <GiCardboardBox />, label: "Prepared" },
    { status: "Out for Delivery", icon: <FaMotorcycle />, label: "On the Way" },
    { status: "Delivered", icon: <FaCheckCircle />, label: "Delivered" },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-500 text-2xl" />;
      case "Confirmed":
        return <FaCheckCircle className="text-blue-500 text-2xl" />;
      case "Preparing":
        return <GiCookingPot className="text-orange-500 text-2xl" />;
      case "Out for Delivery":
        return <FaMotorcycle className="text-purple-500 text-2xl" />;
      case "Delivered":
        return <FaCheckCircle className="text-green-500 text-2xl" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500 text-2xl" />;
      default:
        return <FaHistory className="text-gray-500 text-2xl" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return statusStages.findIndex((stage) => stage.status === order.status);
  };

  const formatAddress = (address) => {
    if (!address) return "Address not available";
    if (typeof address === "string") return address;

    try {
      const parts = [address.street, address.city, address.postalCode].filter(
        Boolean
      );

      if (parts.length) {
        return parts.join(", ");
      }

      // If only coordinates exist, don't show them
      return "Address not available";
    } catch {
      return "Invalid address format";
    }
  };

  const formatDeliveryAgent = (agent) => {
    if (!agent) return "Not assigned";
    if (typeof agent === "string") return agent;
    if (agent.name) return agent.name;
    if (agent.firstName && agent.lastName)
      return `${agent.firstName} ${agent.lastName}`;
    return "Delivery agent";
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/orders/${id}`);

        if (response.data) {
          setOrder(response.data);
        } else {
          throw new Error("Invalid order data received");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch order details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-4xl mx-auto px-4 py-8 text-center"
        >
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center">
              <FaTimesCircle className="text-red-500 text-2xl mr-3" />
              <h3 className="text-lg font-semibold text-red-800">{error}</h3>
            </div>
          </div>
          <motion.button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft className="inline mr-2" />
            Go Back
          </motion.button>
        </motion.div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">No order data available</p>
        </div>
      </Layout>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <ErrorBoundary>
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 md:mb-0 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Back to Orders
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #
                {order._id?.substring(order._id.length - 6).toUpperCase() ||
                  "N/A"}
              </h1>
              <p className="text-gray-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center">
              {getStatusIcon(order.status)}
              <span className="ml-2 text-lg font-semibold text-gray-800 capitalize">
                {order.status?.toLowerCase() || "unknown status"}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order Status
            </h2>

            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200">
                <motion.div
                  className="absolute top-0 left-0 w-0.5 bg-blue-500"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${
                      (currentStatusIndex / (statusStages.length - 1)) * 100
                    }%`,
                  }}
                  transition={{ duration: 1 }}
                />
              </div>

              {/* Status items */}
              <div className="space-y-8">
                {statusStages.map((stage, index) => (
                  <motion.div
                    key={stage.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start"
                  >
                    <div
                      className={`absolute left-4 top-1 h-3 w-3 rounded-full ${
                        index <= currentStatusIndex
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      } z-10`}
                    />
                    <div className="ml-10">
                      <div className="flex items-center">
                        <span
                          className={`text-xl mr-3 ${
                            index <= currentStatusIndex
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        >
                          {stage.icon}
                        </span>
                        <h3
                          className={`text-lg font-medium ${
                            index <= currentStatusIndex
                              ? "text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {stage.label}
                        </h3>
                      </div>
                      {index <= currentStatusIndex && (
                        <p className="text-sm text-gray-500 mt-1 ml-9">
                          {index === currentStatusIndex
                            ? "Current status"
                            : "Completed"}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <motion.div
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Summary
                  </h2>
                </div>
                <div className="divide-y">
                  {order.items?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center mr-4">
                          <span className="text-gray-500 text-sm font-medium">
                            {item.quantity || 1}x
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.name || "Unnamed item"}
                          </h3>
                          {item.notes && (
                            <p className="text-sm text-gray-500">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-medium">
                        LKR {(item.price || 0).toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">
                      LKR {(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Delivery Fee</span>
                    <span className="font-medium">LKR 0.00</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg">
                      LKR {(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Information */}
              <motion.div
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Delivery Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Delivery Address
                      </h3>
                      <p className="text-gray-600 break-words">
                        {formatAddress(order.deliveryAddress)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaUserTie className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Delivery Agent
                      </h3>
                      <p className="text-gray-600">
                        {formatDeliveryAgent(order.deliveryAgentId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaPhone className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Contact Number
                      </h3>
                      <p className="text-gray-600">
                        {order.restaurantId?.phone || "+94 76 123 4567"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Meta */}
            <div className="space-y-6">
              {/* Restaurant Info */}
              <motion.div
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Restaurant
                </h2>
                <div className="flex items-start">
                  <FaStore className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {order.restaurantDetails?.name ||
                        order.restaurantId?.name ||
                        "Unknown Restaurant"}
                    </h3>
                    <p className="text-gray-600">
                      {formatAddress(
                        order.restaurantDetails?.address ||
                          order.restaurantId?.address
                      )}
                    </p>
                    <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      View Restaurant Details
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Payment Info */}
              <motion.div
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="flex items-start">
                  <FaCreditCard className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">
                      {order.paymentMethod || "unknown"}
                    </h3>
                    <p className="text-gray-600">
                      Paid on {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Help Section */}
              <motion.div
                className="bg-blue-50 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Need Help?
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about your order, our customer
                  service team is happy to help.
                </p>
                <button className="w-full bg-white text-blue-600 font-medium py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  Contact Support
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </ErrorBoundary>
  );
};

export default OrderDetails;
