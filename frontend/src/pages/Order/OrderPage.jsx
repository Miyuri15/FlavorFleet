import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import Swal from "sweetalert2";
import {
  FaShoppingCart,
  FaFilter,
  FaTimes,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import RestaurantList from "../../components/OrderComponent/RestaurantList";
import MenuItemDetails from "../../components/OrderComponent/MenuItemDetails";
import { useNavigate } from "react-router-dom";
import RatingStars from "../../components/OrderComponent/RatingStars";

const ORDER_BACKEND_URL = import.meta.env.VITE_ORDER_BACKEND_URL;
const RESTAURANT_BACKEND_URL = import.meta.env.VITE_RESTAURANT_BACKEND_URL;

const OrderPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  if (!token) return;

  // Fetch cart item count from DB
  const fetchCartItemCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get(`${ORDER_BACKEND_URL}/api/cart/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItemCount(data.count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Extract unique categories from food items
  const extractFilterData = (foodItems) => {
    const uniqueCategories = [
      ...new Set(foodItems.map((item) => item.category)),
    ].filter(Boolean);
    setCategories(uniqueCategories);
  };

  // Fetch food items and cart count on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurants
        const restaurantsResponse = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const foodResponse = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant/menu/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!foodResponse.data) throw new Error("Failed to fetch food items");

        // Combine restaurants with their menu items
        const restaurantsWithMenuItems = restaurantsResponse.data.map(
          (restaurant) => ({
            ...restaurant,
            menuItems: foodResponse.data.filter(
              (item) => item.restaurant?._id === restaurant._id
            ),
          })
        );

        const transformedData = foodResponse.data.map((item) => ({
          ...item,
          isAvailable: item.isAvailable, // Keep original boolean value
          imageUrl: item.image || "/img/ChocolateLavaCake.jpeg",
          restaurant: {
            ...item.restaurant,
            address: item.restaurant?.address,
          },
        }));
        setRestaurantsData(restaurantsWithMenuItems);
        setFoodItems(transformedData);
        extractFilterData(transformedData);
        await fetchCartItemCount();
      } catch (err) {
        setError(err.message);
        Swal.fire({
          title: "Error!",
          text: "Failed to load data. Please try again later.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle restaurant selection
  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(
      restaurantId === selectedRestaurantId ? null : restaurantId
    );
  };

  // Filter food items based on selected categories and restaurant
  const filteredFoodItems = foodItems.filter((item) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);
    const restaurantMatch =
      !selectedRestaurantId || item.restaurant?._id === selectedRestaurantId;
    return categoryMatch && restaurantMatch;
  });

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
  };
  const handleMenuItemClick = async (itemId) => {
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

  // Add item to cart
  const addToCart = async (item) => {
    const token = localStorage.getItem("token");
    if (!item.isAvailable) {
      Swal.fire({
        title: "Out of Stock!",
        text: `${item.name} is currently out of stock.`,
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      // Fetch current cart items
      const cartResponse = await axios.get(`${ORDER_BACKEND_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cartItems = cartResponse.data;

      if (cartItems.length > 0) {
        const currentRestaurantId = cartItems[0].restaurantId;

        if (currentRestaurantId !== item.restaurant?._id) {
          // Clear cart if the restaurant is different
          await axios.delete(`${ORDER_BACKEND_URL}/api/cart/clear`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          Swal.fire({
            title: "Cart Cleared",
            text: "Your cart has been cleared because you selected a new restaurant.",
            icon: "warning",
            confirmButtonText: "OK",
          });
        }
      }

      const { value: quantity } = await Swal.fire({
        title: "Enter Quantity",
        input: "number",
        inputLabel: `How many ${item.name}(s) would you like to add?`,
        inputPlaceholder: "Enter quantity...",
        inputAttributes: {
          min: 1,
          step: 1,
        },
        showCancelButton: true,
        confirmButtonText: "Add to Cart",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value || value < 1) return "Please enter a valid quantity!";
        },
      });

      if (!quantity) return;

      // Add the new item to the cart
      await axios.post(
        `${ORDER_BACKEND_URL}/api/cart`,
        {
          menuItemId: item._id,
          menuItemName: item.name,
          restaurantId: item.restaurant?._id,
          restaurantName: item.restaurant?.name,
          location:
            item.restaurant?.address?.street || "Location not specified",
          price: item.price,
          quantity: parseInt(quantity, 10),
          image: item.imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCartItemCount(); // Refresh cart count after adding

      Swal.fire({
        title: "Added to Cart!",
        text: `${quantity} ${item.name}(s) added to your cart.`,
        icon: "success",
        timer: 3500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Cart error:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add to cart",
        icon: "error",
        timer: 3500,
        showConfirmButton: false,
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-xl font-semibold text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto min-h-screen">
        {/* Header Section - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-4">
          <h1 className="text-2xl font-bold">Order Food</h1>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              <span className="hidden sm:inline">
                {showFilters ? "Hide Filters" : "Show Filters"}
              </span>
            </button>
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Shopping Cart"
            >
              <FaShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => navigate("/favourite-menuitems")}
              className="p-2 text-gray-700 hover:text-red-500 transition-colors"
              title="View Favorites"
              aria-label="Favorites"
            >
              <FaHeart className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter Section - Responsive */}
        {showFilters && (
          <div className="mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Categories Filter */}
              <div>
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${
                        selectedCategories.includes(category)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Indicator - Responsive */}
        {selectedCategories.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedCategories.map((category) => (
              <span
                key={`cat-${category}`}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"
              >
                {category}
                <button
                  onClick={() => toggleCategory(category)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  aria-label={`Remove ${category} filter`}
                >
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Order by Restaurant Section */}
        <RestaurantList
          restaurants={restaurantsData}
          onSelectRestaurant={handleSelectRestaurant}
          selectedRestaurantId={selectedRestaurantId}
        />

        {selectedRestaurantId && (
          <div className="mb-4 flex items-center">
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base"
            >
              <FaTimes className="mr-1" />
              Clear restaurant selection
            </button>
          </div>
        )}

        {/* Food Grid - Responsive */}
        {filteredFoodItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-8">
            {filteredFoodItems.map((item) => (
              <div
                key={item._id}
                className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => handleMenuItemClick(item._id)}
              >
                <div className="w-full aspect-square rounded-lg mb-3 sm:mb-4 overflow-hidden bg-gray-100 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/img/PepperoniPizza.jpg";
                    }}
                  />
                  {item.averageRating > 0 && (
                    <div className="absolute bottom-2 left-2">
                      <RatingStars rating={item.averageRating} />
                    </div>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold line-clamp-1">{item.name}</h2>
                <p className="text-gray-600 text-sm sm:text-base line-clamp-1">
                  {item.restaurant?.name}
                  {item.restaurant?.address?.street &&
                    ` - ${item.restaurant.address.street}`}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-green-600 font-semibold text-sm sm:text-base">
                    LKR {item.price.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs sm:text-sm font-semibold ${
                      item.isAvailable ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.isAvailable ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
                {selectedRestaurantId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    disabled={!item.isAvailable}
                    className={`w-full mt-3 sm:mt-4 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${
                      item.isAvailable
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-700 cursor-not-allowed"
                    }`}
                  >
                    {item.isAvailable ? "Add to Cart" : "Out of Stock"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <h3 className="text-lg sm:text-xl font-medium text-gray-600">
              No food items match your filters
            </h3>
            <button
              onClick={clearFilters}
              className="mt-3 sm:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Clear Filters
            </button>
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

export default OrderPage;