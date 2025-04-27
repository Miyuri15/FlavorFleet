// src/pages/Restaurant/MenuManagement.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { foodServiceApi } from "../../../apiClients";
import { Link } from "react-router-dom";
import ROUTES from "../../routes";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Restaurants</h1>

        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">You don't have any restaurants yet.</p>
            <Link
              to={ROUTES.ADD_RESTAURANT}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Restaurant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="border rounded-lg overflow-hidden shadow-lg"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">
                    {restaurant.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>
                  <div className="flex justify-between items-center">
                    <Link
                      to={`${ROUTES.RESTAURANT_DETAILS(restaurant._id)}/menu`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Manage Menu
                    </Link>
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
