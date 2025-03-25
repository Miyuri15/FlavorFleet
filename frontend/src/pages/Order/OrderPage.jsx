import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import Swal from "sweetalert2";
import { FaShoppingCart } from "react-icons/fa";

const OrderPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);

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

  // Fetch food items and cart count on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodResponse = await axios.get("http://localhost:5003/api/foods",{
          headers: {
            Authorization: `Bearer ${token}`,
          },
  
        });
        if (!foodResponse.data) throw new Error("Failed to fetch food items");

        const transformedData = foodResponse.data.map((item) => ({
          ...item,
          stockAvailability: item.stockAvailability
            ? "In Stock"
            : "Out of Stock",
          imageUrl: item.foodImage
            ? item.foodImage
            : "/img/ChocolateLavaCake.jpeg",
        }));

        setFoodItems(transformedData);
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

  // Add item to cart
  const addToCart = async (item) => {
    const token = localStorage.getItem("token");
    if (item.stockAvailability !== "In Stock") {
      Swal.fire({
        title: "Out of Stock!",
        text: `${item.foodName} is currently out of stock.`,
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const { value: quantity } = await Swal.fire({
      title: "Enter Quantity",
      input: "number",
      inputLabel: `How many ${item.foodName}(s) would you like to add?`,
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
          foodName: item.foodName,
          restaurantName: item.restaurantName,
          location: item.location,
          price: item.price,
          quantity: parseInt(quantity, 10),
          image: item.imageUrl,
          authToken: token
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },        }
      );

      await fetchCartItemCount(); // Refresh cart count after adding

      Swal.fire({
        title: "Added to Cart!",
        text: `${quantity} ${item.foodName}(s) added to your cart.`,
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
          <loading />
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order Food</h1>
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

        {/* Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {foodItems.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="w-full h-40 rounded-lg mb-4 overflow-hidden bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.foodName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/img/PepperoniPizza.jpg";
                  }}
                />
              </div>
              <h2 className="text-xl font-bold">{item.foodName}</h2>
              <p className="text-gray-600">
                {item.restaurantName} - {item.location}
              </p>
              <p className="text-green-600 font-semibold">{item.price} LKR</p>
              <p
                className={`text-sm font-semibold ${
                  item.stockAvailability === "In Stock"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.stockAvailability}
              </p>
              <button
                onClick={() => addToCart(item)}
                disabled={item.stockAvailability !== "In Stock"}
                className={`w-full mt-4 px-4 py-2 rounded-lg ${
                  item.stockAvailability === "In Stock"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-700 cursor-not-allowed"
                }`}
              >
                {item.stockAvailability === "In Stock"
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OrderPage;
