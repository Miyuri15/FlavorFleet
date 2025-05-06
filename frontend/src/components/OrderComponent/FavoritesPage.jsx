import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import MenuItemDetails from "../../components/OrderComponent/MenuItemDetails"; // Make sure to import this

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const token = localStorage.getItem("token");
  const ORDER_BACKEND_URL = import.meta.env.VITE_ORDER_BACKEND_URL;
  const RESTAURANT_BACKEND_URL = import.meta.env.VITE_RESTAURANT_BACKEND_URL;

  const handleMenuItemClick = async (itemId, e) => {
    // Prevent triggering when clicking on the favorite button
    if (e.target.closest('button')) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${RESTAURANT_BACKEND_URL}/api/restaurant/menu/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedMenuItem(response.data);
    } catch (error) {
      console.error("Error fetching menu item details:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load menu item details",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(
        `${ORDER_BACKEND_URL}/api/favorites/user/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (menuItemId, e) => {
    e.stopPropagation(); // Prevent triggering the grid item click
    try {
      const favorite = favorites.find((f) => f.menuItem._id === menuItemId);
      const method = favorite ? "delete" : "post";
      const endpoint = favorite ? "unfavorite" : "favorite";

      await axios({
        method: method,
        url: `${ORDER_BACKEND_URL}/api/favorites/menu/${menuItemId}/${endpoint}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchFavorites(); // Refresh the list
      Swal.fire({
        title: favorite ? "Removed from Favorites" : "Added to Favorites",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message || "Failed to update favorite status",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  if (!token) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold">
            Please login to view your favorites
          </h2>
          <Link
            to="/login"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </Layout>
    );
  }

  if (loading && !selectedMenuItem) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-8xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Favorite Items</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">
              You haven't favorited any items yet
            </h3>
            <Link
              to="/order"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <div
                key={fav._id}
                className="bg-white p-4 rounded-lg shadow relative cursor-pointer hover:shadow-lg transition"
                onClick={(e) => handleMenuItemClick(fav.menuItem._id, e)}
              >
                <button
                  onClick={(e) => toggleFavorite(fav.menuItem._id, e)}
                  className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition z-10"
                  title={
                    fav.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <FaHeart className="text-red-500" size={20} />
                </button>
                <div className="w-full h-40 rounded-lg mb-4 overflow-hidden bg-gray-100">
                  <img
                    src={fav.menuItem.image || "/img/PepperoniPizza.jpg"}
                    alt={fav.menuItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-bold">{fav.menuItem.name}</h2>
                <p className="text-green-600 font-semibold">
                  LKR {fav.menuItem.price?.toFixed(2)}
                </p>
                <div className="mt-2 text-blue-600 hover:text-blue-800">
                  View Details
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMenuItem && (
          <MenuItemDetails
            item={selectedMenuItem}
            onClose={() => setSelectedMenuItem(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;