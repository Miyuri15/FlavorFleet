import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RestaurantCard from "../../components/Restaurant/RestaurantCard";
import { foodServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";

const RestaurantListPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await foodServiceApi.get("/restaurants");
        setRestaurants(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) return <Layout>Loading restaurants...</Layout>;
  if (error) return <Layout className="text-red-500">Error: {error}</Layout>;

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Restaurants
            </h1>
            {user?.role === "restaurant_owner" && (
              <Link
                to="/restaurants/new"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
              >
                Add Restaurant
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {restaurants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No restaurants found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                    isOwner={user?.id === restaurant.owner}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RestaurantListPage;
