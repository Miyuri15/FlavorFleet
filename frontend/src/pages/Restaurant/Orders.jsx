import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { foodServiceApi } from "../../../apiClients";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get restaurant details first
        const restaurantRes = await foodServiceApi.get(
          "/restaurants/my-restaurant"
        );
        setRestaurant(restaurantRes.data);

        // Then get orders for this restaurant
        const ordersRes = await foodServiceApi.get(
          `/restaurants/${restaurantRes.data._id}/orders`
        );
        setOrders(ordersRes.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await foodServiceApi.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
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
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage orders for {restaurant?.name}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {orders.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <li key={order._id} className="px-6 py-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            LKR {order.totalAmount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "preparing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "ready"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Items
                        </h4>
                        <ul className="space-y-2">
                          {order.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>
                                LKR {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end space-x-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusChange(order._id, "preparing")
                            }
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={() =>
                              handleStatusChange(order._id, "ready")
                            }
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Mark as Ready
                          </button>
                        )}
                        {order.status === "ready" && (
                          <span className="text-sm text-gray-500">
                            Waiting for delivery
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
