// src/pages/Restaurant/MenuManagement.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { foodServiceApi } from "../../../apiClients";
import { Link } from "react-router-dom";
import ROUTES from "../../routes";
import {
  FiPlusCircle,
  FiEdit,
  FiCoffee,
  FiHome,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import Loading from "../../components/Loading/Loading";
import Swal from "sweetalert2";

function MenuManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await foodServiceApi.get("/restaurant");
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch restaurants");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Function to determine if restaurant is currently open based on opening hours
  const isRestaurantOpenNow = (restaurant) => {
    if (!restaurant.isAvailable) return false;

    const now = new Date();
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][now.getDay()];
    const hours = restaurant.openingHours?.[dayOfWeek];

    if (!hours || !hours.open || !hours.close) return false;

    const [openHour, openMinute] = hours.open.split(":").map(Number);
    const [closeHour, closeMinute] = hours.close.split(":").map(Number);

    const openTime = new Date();
    openTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    // Handle overnight hours (e.g., open until 1am next day)
    if (closeTime < openTime) {
      if (now >= openTime || now <= closeTime) {
        return true;
      }
    } else {
      if (now >= openTime && now <= closeTime) {
        return true;
      }
    }

    return false;
  };

  const toggleAvailability = async (restaurantId, currentStatus) => {
    setUpdatingId(restaurantId);
    try {
      const response = await foodServiceApi.patch(
        `/restaurant/${restaurantId}/availability`,
        {
          isAvailable: !currentStatus,
        }
      );

      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId
            ? { ...restaurant, isAvailable: !currentStatus }
            : restaurant
        )
      );

      Swal.fire({
        title: "Success!",
        text: `Restaurant ${
          !currentStatus ? "activated" : "deactivated"
        } successfully`,
        icon: "success",
        confirmButtonText: "OK",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.error || "Failed to update availability",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error updating availability:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loading />;

  if (error)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-2xl mx-auto"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 font-sans">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Your Restaurants
            </h1>
            <p className="text-gray-600 mt-2">
              Manage menus for your establishments
            </p>
          </div>
          {/* {restaurants.length > 0 && (
            <Link
              to={ROUTES.ADD_RESTAURANT}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FiPlusCircle className="mr-2" />
              Add Restaurant
            </Link>
          )} */}
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
            <FiHome className="mx-auto text-5xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Restaurants Yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't added any restaurants yet. Get started by adding your
              first establishment.
            </p>
            <Link
              to={ROUTES.ADD_RESTAURANT}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors"
            >
              <FiPlusCircle className="mr-2" />
              Add Your First Restaurant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const isOpen = isRestaurantOpenNow(restaurant);
              const isAvailable = restaurant.isAvailable;

              return (
                <div
                  key={restaurant._id}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                    {restaurant.imageUrl ? (
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiCoffee className="text-4xl text-gray-400" />
                    )}
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      {isAvailable ? (
                        isOpen ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
                            <FiCheckCircle className="mr-1" /> Open
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center">
                            <FiClock className="mr-1" /> Closed
                          </span>
                        )
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex items-center">
                          <FiXCircle className="mr-1" /> Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold text-gray-800">
                        {restaurant.name}
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {restaurant.registrationStatus || "pending"}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {restaurant.description || "No description provided"}
                    </p>
                    <div className="text-sm text-gray-500 mb-4">
                      <p className="flex items-center">
                        <span className="font-medium mr-2">Cuisine:</span>
                        {restaurant.cuisineType || "Not specified"}
                      </p>
                      <p className="flex items-center">
                        <span className="font-medium mr-2">Status:</span>
                        {isAvailable ? (
                          isOpen ? (
                            <span className="text-green-600 flex items-center">
                              <FiCheckCircle className="mr-1" /> Open now
                            </span>
                          ) : (
                            <span className="text-yellow-600 flex items-center">
                              <FiClock className="mr-1" /> Closed now
                            </span>
                          )
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <FiXCircle className="mr-1" /> Currently unavailable
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <Link
                        to={`${ROUTES.RESTAURANT_DETAILS(restaurant._id)}/menu`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                      >
                        <FiEdit className="mr-2" />
                        Manage Menu
                      </Link>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {restaurant.menuItems?.length || 0} items
                        </span>
                        <button
                          onClick={() =>
                            toggleAvailability(
                              restaurant._id,
                              restaurant.isAvailable
                            )
                          }
                          disabled={updatingId === restaurant._id}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                            restaurant.isAvailable
                              ? "bg-emerald-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <span className="sr-only">Toggle availability</span>
                          <span
                            className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white ${
                              restaurant.isAvailable
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                          {updatingId === restaurant._id ? (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            </span>
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                              {restaurant.isAvailable ? (
                                <FiToggleRight className="w-3 h-3" />
                              ) : (
                                <FiToggleLeft className="w-3 h-3 text-gray-500" />
                              )}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MenuManagement;
