import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PaymentHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const currentOrderId = localStorage.getItem("currentOrder");

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/orders/payment-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching payment history:", err);
        setError("Failed to fetch payment history.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const navigateToDetails = (orderId) => {
    navigate(`/payment-history/${orderId}`);
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5005/api/orders/update-payment-status/${orderId}`,
        { paymentStatus: "Completed" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Refresh orders
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, paymentStatus: "Completed" } : order
        )
      );
      alert("Payment status updated successfully!");
    } catch (err) {
      console.error("Failed to update payment status:", err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (orders.length === 0) return <p>No payment history found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`p-4 rounded-lg shadow-sm cursor-pointer ${
              order._id === currentOrderId ? "bg-green-100 border border-green-500" : "bg-gray-100"
            }`}
            onClick={() => navigateToDetails(order._id)}
          >
            <h3 className="text-lg font-medium">Order ID: {order._id}</h3>
            <p><strong>Amount:</strong> Rs. {order.totalAmount / 100}</p>
            <p><strong>Status:</strong> {order.paymentStatus}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p><strong>Paid At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>

            {/* ✅ If this is the current order and not yet marked as paid, show button */}
            {order._id === currentOrderId && order.paymentStatus !== "Completed" && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation
                  handleMarkAsPaid(order._id);
                }}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Mark as Paid
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
