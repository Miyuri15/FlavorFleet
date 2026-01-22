import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../Layout";
import axios from "axios";
import Slider from "react-slick";
import Swal from "sweetalert2";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CART_BACKEND_URL = "http://localhost:5005";
const RESTAURANT_BACKEND_URL = import.meta.env.VITE_RESTAURANT_BACKEND_URL;

const RestaurantMenuPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  /* =========================
     FETCH RESTAURANT
  ========================= */
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant/${restaurantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRestaurant(res.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRestaurant();
  }, [restaurantId, token]);

  /* =========================
     FETCH MENU ITEMS
  ========================= */
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant/${restaurantId}/menu`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMenuItems(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId, token]);

  /* =========================
     ADD TO CART (WITH POPUP)
  ========================= */
  const handleAddToCart = async (item, e) => {
    e.stopPropagation();

    const { value: quantity } = await Swal.fire({
      title: "Add to Cart",
      input: "number",
      inputLabel: "Quantity",
      inputValue: 1,
      inputAttributes: {
        min: 1,
        step: 1,
      },
      showCancelButton: true,
      confirmButtonText: "Add",
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return "Quantity must be at least 1";
        }
      },
    });

    if (!quantity) return;

    try {
      await axios.post(
        `${CART_BACKEND_URL}/api/cart`,
        {
          menuItemId: item._id,
          menuItemName: item.name,
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          location: restaurant.address
            ? `${restaurant.address.street}, ${restaurant.address.city}`
            : "Location not specified",
          price: item.price,
          quantity: Number(quantity),
          image: item.image,
          checked: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Item successfully added 🛒",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "Failed to add item to cart",
      });
    }
  };

  /* =========================
     CAROUSEL SETTINGS
  ========================= */
  const carouselSettings = {
    dots: menuItems.length > 1,
    infinite: menuItems.length > 1,
    speed: 500,
    slidesToShow: Math.min(3, menuItems.length),
    slidesToScroll: 1,
    autoplay: menuItems.length > 1,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, menuItems.length),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          arrows: false,
        },
      },
    ],
  };

  /* =========================
     STATES
  ========================= */
  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-gray-600">Loading restaurant...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="p-6 text-gray-600">Restaurant not found</div>
      </Layout>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <Layout>
      <div className="p-4 max-w-7xl mx-auto">

        {/* Restaurant Header */}
        <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-56">
            <img
              src={
                restaurant.banner ||
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
              }
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <p>{restaurant.cuisineType}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <h2 className="text-2xl font-bold mb-4">Menu</h2>

        {menuItems.length === 0 ? (
          <p className="text-gray-500">No menu items available.</p>
        ) : (
          <Slider {...carouselSettings}>
            {menuItems.map((item) => (
              <div key={item._id} className="px-1 flex justify-center">
                <div
                  className="bg-white rounded-lg shadow-md w-[260px] cursor-pointer"
                  onClick={() => navigate(`/menu/${item._id}`)}
                >
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                    }
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-3 text-center">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-orange-500 font-bold mt-1">
                      ${item.price}
                    </p>
                    <button
                      className="mt-2 bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600"
                      onClick={(e) => handleAddToCart(item, e)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default RestaurantMenuPage;
