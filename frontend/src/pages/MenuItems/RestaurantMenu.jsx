// src/pages/Restaurant/RestaurantMenu.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { foodServiceApi } from "../../../apiClients";
import ROUTES from "../../routes";
import Layout from "../../components/Layout";

function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, menuRes] = await Promise.all([
          foodServiceApi.get(`/restaurant/${id}`),
          foodServiceApi.get(`/restaurant/${id}/menu`),
        ]);
        setRestaurant(restaurantRes.data);
        setMenuItems(menuRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async (menuItemId) => {
    try {
      await foodServiceApi.delete(`/restaurant/menu/${menuItemId}`);
      setMenuItems(menuItems.filter((item) => item._id !== menuItemId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete menu item");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {restaurant.name} - Menu Management
          </h1>
          <Link
            to={`${ROUTES.RESTAURANT_DETAILS(id)}/menu/add`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Menu Item
          </Link>
        </div>

        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">No menu items found.</p>
            <Link
              to={`${ROUTES.RESTAURANT_DETAILS(id)}/menu/add`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Your First Menu Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="border rounded-lg overflow-hidden shadow-lg"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <span className="text-lg font-bold">${item.price}</span>
                  </div>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="mb-3">
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                      {item.category}
                    </span>
                    {item.dietaryTags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Link
                      to={`${ROUTES.RESTAURANT_DETAILS(id)}/menu/edit/${
                        item._id
                      }`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
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

export default RestaurantMenu;
