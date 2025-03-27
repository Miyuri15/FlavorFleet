import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import Swal from "sweetalert2";
import { FaShoppingCart, FaFilter, FaTimes } from "react-icons/fa";
import RestaurantList from "../../components/OrderComponent/RestaurantList";

const OrderPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [restaurantsData, setRestaurantsData] = useState([]);

  const token = localStorage.getItem("token");
  if (!token) return;

  // Fetch cart item count from DB
  const fetchCartItemCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await axios.get("http://localhost:5000/api/cart/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItemCount(data.count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Extract unique categories and restaurants from food items
  const extractFilterData = (foodItems) => {
    const uniqueCategories = [
      ...new Set(foodItems.map((item) => item.category)),
    ].filter(Boolean);
    const uniqueRestaurants = [
      ...new Set(foodItems.map((item) => item.restaurant?.name)),
    ].filter(Boolean);

    setCategories(uniqueCategories);
    setRestaurants(uniqueRestaurants);
  };

  // Fetch food items and cart count on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurants
        const restaurantsResponse = await axios.get(
          "http://localhost:5003/api/restaurant/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const foodResponse = await axios.get(
          "http://localhost:5003/api/restaurant/menu/all",
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

  //  function to handle restaurant selection
  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(
      restaurantId === selectedRestaurantId ? null : restaurantId
    );
  };

  // Filter food items based on selected categories and restaurants
  const filteredFoodItems = foodItems.filter((item) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);
    const restaurantMatch =
      selectedRestaurants.length === 0 ||
      selectedRestaurants.includes(item.restaurant?.name);
    const selectedRestaurantMatch =
      !selectedRestaurantId || item.restaurant?._id === selectedRestaurantId;
    return categoryMatch && restaurantMatch && selectedRestaurantMatch;
  });

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle restaurant selection
  const toggleRestaurant = (restaurant) => {
    setSelectedRestaurants((prev) =>
      prev.includes(restaurant)
        ? prev.filter((r) => r !== restaurant)
        : [...prev, restaurant]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedRestaurants([]);
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

    try {
      await axios.post(
        "http://localhost:5000/api/cart",
        {
          foodId: item._id,
          foodName: item.name,
          restaurantName: item.restaurant?.name,
          location:
            item.restaurant?.address?.street || "Location not specified",
          price: item.price,
          quantity: parseInt(quantity, 10),
          image: item.imageUrl,
          authToken: token,
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
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Cart error:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add to cart",
        icon: "error",
        timer: 1500,
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
      <div className="p-6 max-w-8xl mx-auto min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order Food</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {showFilters ? <FaTimes /> : <FaFilter />}
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FaShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories Filter */}
              <div>
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm ${
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

              {/* Restaurants Filter */}
              <div>
                <h3 className="font-medium mb-2">Restaurants</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurants.map((restaurant) => (
                    <button
                      key={restaurant}
                      onClick={() => toggleRestaurant(restaurant)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedRestaurants.includes(restaurant)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {restaurant}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Indicator */}
        {(selectedCategories.length > 0 || selectedRestaurants.length > 0) && (
          <div className="mb-4 flex items-center gap-2">
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
                >
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
            {selectedRestaurants.map((restaurant) => (
              <span
                key={`res-${restaurant}`}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"
              >
                {restaurant}
                <button
                  onClick={() => toggleRestaurant(restaurant)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Order by Restaurant selecting */}
        <RestaurantList
          restaurants={restaurantsData}
          onSelectRestaurant={handleSelectRestaurant}
          selectedRestaurantId={selectedRestaurantId}
        />

        {selectedRestaurantId && (
          <div className="mb-4 flex items-center">
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaTimes className="mr-1" />
              Clear restaurant selection
            </button>
          </div>
        )}

        {/* Food Grid */}
        {filteredFoodItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFoodItems.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="w-full h-40 rounded-lg mb-4 overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/img/PepperoniPizza.jpg";
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold">{item.name}</h2>
                <p className="text-gray-600">
                  {item.restaurant?.name}
                  {item.restaurant?.address?.street &&
                    ` - ${item.restaurant.address.street}`}
                </p>
                <p className="text-green-600 font-semibold">
                  LKR {item.price.toFixed(2)}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    item.isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.isAvailable ? "In Stock" : "Out of Stock"}
                </p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={!item.isAvailable}
                  className={`w-full mt-4 px-4 py-2 rounded-lg ${
                    item.isAvailable
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-700 cursor-not-allowed"
                  }`}
                >
                  {item.isAvailable ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600">
              No food items match your filters
            </h3>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderPage;
