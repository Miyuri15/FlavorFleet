import Layout from "../Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaTimesCircle,
  FaHistory,
  FaMoneyBillWave,
  FaCreditCard,
  FaReceipt,
  FaStar,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import RatingModal from "./RatingModal";
import CancelOrderModal from "./CancelOrderModal";

const statusTabs = [
  { id: "all", label: "All Orders" },
  { id: "Pending", label: "Pending" },
  { id: "Confirmed", label: "Confirmed" },
  { id: "Preparing", label: "Preparing" },
  { id: "Out for Delivery", label: "Out for Delivery" },
  { id: "Delivered", label: "Delivered" },
  { id: "Cancelled", label: "Cancelled" },
];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: import.meta.env.VITE_ORDER_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/api/orders/user/orders");
        const sortedOrders = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => order.status === activeTab);
      setFilteredOrders(filtered);
    }
  }, [activeTab, orders]);

  const handleRateOrder = (order) => {
    setSelectedOrder(order);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (ratings) => {
    try {
      // Corrected endpoint - added the order ID and fixed the typo
      await api.post(`/api/orders/${selectedOrder._id}/ratings`, {
        ...ratings,
        orderId: selectedOrder._id,
      });

      // Update the order to show it's been rated
      setOrders(
        orders.map((order) =>
          order._id === selectedOrder._id ? { ...order, hasRated: true } : order
        )
      );
      setShowRatingModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit rating");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/cancel`);
      
      // Update local state with proper status case
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: "Cancelled" } : order
      ));
      
      // Update filtered orders if needed
      setFilteredOrders(filteredOrders.map(order => 
        order._id === orderId ? { ...order, status: "Cancelled" } : order
      ));
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel order");
      console.error("Cancellation error:", err.response?.data);
    }
  };
  
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Preparing":
        return "bg-orange-100 text-orange-800";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "Cash on Delivery":
        return <FaMoneyBillWave className="text-green-600" />;
      case "Online Payment":
        return <FaCreditCard className="text-blue-600" />;
      default:
        return <FaReceipt className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and track all your recent orders
          </p>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.id !== "all" && (
                    <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {orders.filter((order) => order.status === tab.id).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <FaBoxOpen className="w-full h-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {activeTab === "all" ? "" : activeTab} orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "all"
                ? "You haven't placed any orders yet. Start by browsing our menu."
                : `You don't have any ${activeTab.toLowerCase()} orders at the moment.`}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/order")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <li key={order._id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div className="mb-4 sm:mb-0">
                        <div className="flex items-center">
                          <span className="mr-3">
                            {getStatusIcon(order.status)}
                          </span>
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Order #
                            {order._id
                              .substring(order._id.length - 6)
                              .toUpperCase()}
                          </h3>
                          <span
                            className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                        {order.restaurantId?.name && (
                          <p className="mt-1 text-sm text-gray-500">
                            From {order.restaurantId.name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                        {order.status === "Delivered" && !order.hasRated && (
                          <button
                            onClick={() => handleRateOrder(order)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            <FaStar className="mr-2" />
                            Rate Order
                          </button>
                        )}
                        {order.status === "Pending" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md"
                          >
                            <FaTimesCircle className="mr-2" />
                            Cancel Order
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/track-order/${order._id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaTruck className="mr-2" />
                          Track Order
                        </button>
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiExternalLink className="mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {getPaymentMethodIcon(order.paymentMethod)}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4">
                      <div className="flex overflow-x-auto">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex-shrink-0 mr-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {item.quantity}x
                              </span>
                              <span className="text-sm text-gray-500">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        items
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        LKR {order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          order={selectedOrder}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleSubmitRating}
        />
      )}

      {showCancelModal && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelOrder}
          isLoading={isCancelling}
        />
      )}
    </Layout>
  );
}
