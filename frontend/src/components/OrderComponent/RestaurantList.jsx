import React from "react";
import {
  FaStore,
  FaUtensils,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

// Reusable RatingStars component
const RatingStars = ({ rating, size = 12 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} size={size} />
        ))}
        {hasHalfStar && <FaStarHalfAlt size={size} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} size={size} />
        ))}
      </div>
      <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

const RestaurantList = ({
  restaurants,
  onSelectRestaurant,
  selectedRestaurantId,
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
              <div className="relative w-16 h-16 mb-2 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={restaurant.logo || "/img/default-restaurant.png"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/img/default-restaurant.png";
                  }}
                />
                {/* Rating badge
                {restaurant.averageRating > 0 && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-sm">
                    <RatingStars rating={restaurant.averageRating} size={10} />
                  </div>
                )} */}
              </div>
              <h3 className="font-semibold">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">{restaurant.cuisineType}</p>
              <div className="flex items-center justify-between w-full mt-1 text-xs text-gray-500">
                <div className="flex items-center">
                  <FaUtensils className="mr-1" />
                  <span>{restaurant.menuItems?.length || 0} items</span>
                </div>
                {/* Alternative rating display option */}
                {restaurant.averageRating > 0 && (
                  <div className="hidden sm:flex items-center">
                    <RatingStars rating={restaurant.averageRating} size={10} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;
