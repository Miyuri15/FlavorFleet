// IncomingOrders.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Layout";
import {
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaHistory,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../Loading/Loading";

export default function IncomingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
        setLoading(true);
      const { data } = await api.get("/api/orders/delivery/incoming");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Fetch error:", err);
      toast.error(err.response?.data?.error || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-amber-500" />;
      case "Confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "Out for Delivery":
        return <FaTruck className="text-purple-500" />;
      case "Delivered":
        return <FaBoxOpen className="text-green-500" />;
      case "Cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaHistory className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Delivery Dashboard
          </h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
  
        {loading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.paymentMethod}
                      </span>
                    </div>
  
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-500" />
                        <span>{order.deliveryAddress}</span>
                      </div>
  
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMoneyBillWave className="w-4 h-4 mr-2 text-green-500" />
                        <span>LKR {order.totalAmount.toFixed(2)}</span>
                      </div>
  
                      {order.restaurantId?.name && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Restaurant:</span>{" "}
                          {order.restaurantId.name}
                        </div>
                      )}
                    </div>
  
                    <div className="mt-6 flex flex-wrap gap-2">
                      {order.status === "Pending" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(order._id, "Confirmed")
                          }
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Accept Order
                        </button>
                      )}
  
                      {(order.status === "Confirmed" ||
                        order.status === "Out for Delivery") && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(order._id, "Cancelled")
                            }
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                order._id,
                                order.status === "Confirmed"
                                  ? "Out for Delivery"
                                  : "Delivered"
                              )
                            }
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            {order.status === "Confirmed"
                              ? "Start Delivery"
                              : "Mark Delivered"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">No orders available</div>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
