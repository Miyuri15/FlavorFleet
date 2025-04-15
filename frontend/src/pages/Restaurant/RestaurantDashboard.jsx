import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import RestaurantStats from "../../components/Restaurant/RestaurantStats";
import { foodServiceApi } from "../../../apiClients";
import { Link } from "react-router-dom";

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  Link;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get restaurant details
        const restaurantRes = await foodServiceApi.get("/restaurant/");
        setRestaurant(restaurantRes.data);

        // Get recent orders - make sure this returns an array
        // const ordersRes = await foodServiceApi.get("/orders/recent");

        // Ensure we have an array, even if empty
        // setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch (err) {
        setError(err.message);
        setOrders([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <div className="p-4 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Restaurant Dashboard
          </h1>
        </div>
        {/* <div className="mb-4 flex justify-end">
          <Link
            to="#"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
          >
            + Add Restaurant
          </Link>
        </div> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {restaurant && (
            <RestaurantStats
              restaurant={restaurant}
              orderCount={orders.length}
            />
          )}

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Recent Orders
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {orders.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  No recent orders
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <li key={order._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            Order #{order.orderNumber || order._id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length || 0} items •{" "}
                            {order.status || "unknown"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            LKR {order.totalAmount?.toFixed(2) || "0.00"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RestaurantDashboard;
