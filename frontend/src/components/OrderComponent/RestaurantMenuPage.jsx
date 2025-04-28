import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../Layout";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const RESTAURANT_BACKEND_URL = import.meta.env.VITE_RESTAURANT_BACKEND_URL;

const RestaurantMenuPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) return;

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRestaurant(response.data);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, token]);

  // Fetch menu items for the restaurant
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant/${restaurantId}/menu`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMenuItems(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId, token]);

  // Settings for the carousel
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 max-w-7xl mx-auto min-h-screen rounded-lg">
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 max-w-7xl mx-auto min-h-screen rounded-lg">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="p-4 max-w-7xl mx-auto min-h-screen rounded-lg">
          <p className="text-gray-600">Restaurant not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 max-w-7xl mx-auto min-h-screen rounded-lg">
        {/* Restaurant Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48 md:h-64">
              <img
                src={
                  restaurant.banner ||
                  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                }
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl font-bold text-white">
                  {restaurant.name}
                </h1>
                <p className="text-gray-200">{restaurant.cuisineType}</p>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white ml-1">
                    {restaurant.rating || "New"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700">Address</h3>
                  <p className="text-gray-600">
                    {restaurant.address.street}, {restaurant.address.city},{" "}
                    {restaurant.address.postalCode}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Contact</h3>
                  <p className="text-gray-600">{restaurant.contactNumber}</p>
                  <p className="text-gray-600">{restaurant.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-600">
                    {restaurant.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Menu</h2>

          {menuItems.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                No menu items available
              </h3>
              <p className="text-gray-500 mb-4">
                This restaurant hasn't added any items to their menu yet.
              </p>
            </div>
          ) : (
            <Slider {...carouselSettings}>
              {menuItems.map((item) => (
                <div key={item._id} className="p-2">
                  <div
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center h-full cursor-pointer"
                    onClick={() => navigate(`/menu/${item._id}`)}
                  >
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                      }
                      alt={item.name}
                      className="w-full h-40 object-cover mb-2 rounded-lg"
                    />
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-gray-600 text-sm">{item.category}</p>
                    <p className="font-bold text-orange-500 mt-1">
                      ${item.price}
                    </p>
                    <button
                      className="mt-2 bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 transition-all text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic here
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
          >
            ← Back to Restaurants
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default RestaurantMenuPage;
