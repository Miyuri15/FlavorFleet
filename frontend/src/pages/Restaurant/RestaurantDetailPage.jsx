import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import MenuList from "../../components/Menu/MenuList";
import { foodServiceApi } from "../../../apiClients";
import { useAuth } from "../../context/AuthContext";
import RestaurantStats from "../../components/Restaurant/RestaurantStats";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, menuRes] = await Promise.all([
          foodServiceApi.get(`/restaurants/${id}`),
          foodServiceApi.get(`/restaurants/${id}/menu`),
        ]);
        setRestaurant(restaurantRes.data);
        setMenuItems(menuRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Layout>Loading restaurant details...</Layout>;
  if (error) return <Layout className="text-red-500">Error: {error}</Layout>;

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {restaurant.name}
            </h1>
            {user?.id === restaurant.owner && (
              <div className="space-x-2">
                <Link
                  to={`/restaurants/${id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
                >
                  Edit Restaurant
                </Link>
                <Link
                  to={`/restaurants/${id}/menu`}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
                >
                  Manage Menu
                </Link>
              </div>
            )}
          </div>

          <RestaurantStats restaurant={restaurant} />

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Menu</h2>
            <MenuList items={menuItems} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RestaurantDetailPage;
