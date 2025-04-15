import React from "react";
import { Link } from "react-router-dom";

const RestaurantCard = ({ restaurant, isOwner = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {restaurant.name}
            </h3>
            <p className="text-sm text-gray-600">{restaurant.cuisineType}</p>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              restaurant.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {restaurant.isAvailable ? "Open" : "Closed"}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {restaurant.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {restaurant.address.city}, {restaurant.address.street}
          </span>
          {isOwner ? (
            <Link
              to={`/restaurant/${restaurant._id}/edit`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Manage
            </Link>
          ) : (
            <Link
              to={`/restaurants/${restaurant._id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View Menu
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
