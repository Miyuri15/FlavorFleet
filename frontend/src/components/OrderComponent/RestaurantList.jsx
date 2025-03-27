import React from "react";
import { FaStore, FaUtensils } from "react-icons/fa";

const RestaurantList = ({ 
  restaurants, 
  onSelectRestaurant,
  selectedRestaurantId 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaStore /> Browse Restaurants
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant._id}
            onClick={() => onSelectRestaurant(restaurant._id)}
            className={`p-4 rounded-lg shadow-md cursor-pointer transition-all ${
              selectedRestaurantId === restaurant._id
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-white hover:shadow-lg"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-2 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/img/default-restaurant.png";
                  }}
                />
              </div>
              <h3 className="font-semibold">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">{restaurant.cuisineType}</p>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <FaUtensils className="mr-1" />
                <span>{restaurant.menuItems?.length || 0} items</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;