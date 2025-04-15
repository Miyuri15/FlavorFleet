import React from "react";

const RestaurantStats = ({ restaurant, orderCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Restaurant Status</h3>
        <p className="mt-1 text-2xl font-semibold">
          {restaurant.isAvailable ? (
            <span className="text-green-600">Open</span>
          ) : (
            <span className="text-red-600">Closed</span>
          )}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
        <p className="mt-1 text-2xl font-semibold">{orderCount}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Rating</h3>
        <p className="mt-1 text-2xl font-semibold">
          {restaurant.rating || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default RestaurantStats;
