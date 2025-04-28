// src/pages/Restaurant/MenuManagement.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { foodServiceApi } from "../../../apiClients";
import { Link } from "react-router-dom";
import ROUTES from "../../routes";
import { FiPlusCircle, FiEdit, FiCoffee, FiHome } from "react-icons/fi";
import Loading from "../../components/Loading/Loading";

function MenuManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          {restaurants.length > 0 && (
            <Link
              to={ROUTES.ADD_RESTAURANT}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FiPlusCircle className="mr-2" />
              Add Restaurant
            </Link>
          )}
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
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white"
              >
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  {restaurant.imageUrl ? (
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiCoffee className="text-4xl text-gray-400" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800">
                      {restaurant.name}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {restaurant.status || "Active"}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {restaurant.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center mt-6">
                    <Link
                      to={`${ROUTES.RESTAURANT_DETAILS(restaurant._id)}/menu`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
                    >
                      <FiEdit className="mr-2" />
                      Manage Menu
                    </Link>
                    <span className="text-sm text-gray-500">
                      {restaurant.menuItems?.length || 0} items
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MenuManagement;
