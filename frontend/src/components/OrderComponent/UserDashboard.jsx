import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout";
import Slider from "react-slick"; // For the carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";

const ORDER_BACKEND_URL = import.meta.env.VITE_ORDER_BACKEND_URL;
const RESTAURANT_BACKEND_URL = import.meta.env.VITE_RESTAURANT_BACKEND_URL;

const UserDashboard = () => {
  const [showOngoingOrders, setShowOngoingOrders] = useState(false);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [restuarants, setRestuarants] = useState([]);
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const [ordersCount, setOrdersCount] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    canceledOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) return;

  // Fetch ongoing orders (not delivered yet)
  useEffect(() => {
    const fetchOngoingOrders = async () => {
      try {
        const response = await axios.get(
          `${ORDER_BACKEND_URL}/api/orders/user/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              status: [
                "Pending",
                "Confirmed",
                "Preparing",
                "Prepared",
                "Out for Delivery",
              ],
            },
          }
        );
        setOngoingOrders(response.data);
      } catch (err) {
        console.error("Error fetching ongoing orders:", err);
      }
    };

    fetchOngoingOrders();
  }, [token]);

  // Fetch orders count by status
  useEffect(() => {
    const fetchOrdersCount = async () => {
      try {
        const response = await axios.get(
          `${ORDER_BACKEND_URL}/api/orders/user/orders/count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "success") {
          const data = response.data.data;
          setOrdersCount({
            totalOrders: data?.total || 0,
            deliveredOrders: data?.delivered || 0,
            canceledOrders: data?.canceled || 0,
            pendingOrders: data?.pending || 0,
          });
        } else {
          console.error("API returned error:", response.data.message);
          // Set default values on error
          setOrdersCount({
            totalOrders: 0,
            deliveredOrders: 0,
            canceledOrders: 0,
            pendingOrders: 0,
          });
        }
      } catch (err) {
        console.error(
          "Error fetching orders count:",
          err.response?.data || err.message
        );
        // Set default values on error
        setOrdersCount({
          totalOrders: 0,
          deliveredOrders: 0,
          canceledOrders: 0,
          pendingOrders: 0,
        });
      }
    };

    if (token) {
      fetchOrdersCount();
    }
  }, [token]);

  // Fetch food data from API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant/menu/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFeaturedFoods(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFoods();
  }, [token]);

  // Fetch restuarant data from API
  useEffect(() => {
    // In the UserDashboard component, modify the fetchRestuarants function:

    const fetchRestuarants = async () => {
      try {
        const response = await axios.get(
          `${RESTAURANT_BACKEND_URL}/api/restaurant?status=approved`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRestuarants(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchRestuarants();
  }, [token]);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`);
  };
  // Dummy data for promotions
  const promotions = [
    {
      id: 1,
      title: "50% Off on Burgers",
      description: "Valid until 31st December",
      foodImage:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 2,
      title: "Free Drink with Pizza",
      description: "Valid until 15th January",
      foodImage:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 3,
      title: "Buy 1 Get 1 Free",
      description: "Valid until 20th January",
      foodImage:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
  ];

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

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Preparing":
        return "bg-purple-100 text-purple-800";
      case "Prepared":
        return "bg-indigo-100 text-indigo-800";
      case "Out for Delivery":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
        );
      case "Confirmed":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "Preparing":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case "Prepared":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "Out for Delivery":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
        );
    }
  };

  let promotionContent;
  if (loading) {
    promotionContent = <p className="text-gray-600">Loading promotions...</p>;
  } else if (error) {
    promotionContent = (
      <p className="text-red-500">Error loading promotions: {error}</p>
    );
  } else if (promotions.length === 0) {
    promotionContent = <p className="text-gray-600">No promotions found.</p>;
  } else {
    promotionContent = (
      <Slider {...carouselSettings}>
        {promotions.map((promotion) => (
          <div key={promotion.id} className="p-2">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center h-full">
              <img
                src={promotion.foodImage}
                alt={promotion.title}
                className="w-full h-40 object-cover mb-2 rounded-lg"
              />
              <p className="font-bold text-gray-800">{promotion.title}</p>
              <p className="text-gray-600">{promotion.description}</p>
              <button className="mt-2 bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 transition-all text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </Slider>
    );
  }

  let restaurantContent;
  if (loading) {
    restaurantContent = <p className="text-gray-600">Loading restaurants...</p>;
  } else if (error) {
    restaurantContent = (
      <p className="text-red-500">Error loading restaurants: {error}</p>
    );
  } else {
    restaurantContent = (
      <Slider {...carouselSettings}>
        {restuarants.map((restuarant) => (
          <div key={restuarant.id} className="p-2">
            <div
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center h-full cursor-pointer"
              onClick={() => handleRestaurantClick(restuarant._id)}
            >
              <img
                src={
                  restuarant.banner ||
                  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                }
                alt={restuarant.name}
                className="w-full h-40 object-cover mb-2 rounded-lg"
              />
              <p className="font-bold text-gray-800">{restuarant.name}</p>
              <p className="text-gray-600 text-sm">{restuarant.email}</p>
            </div>
          </div>
        ))}
      </Slider>
    );
  }

  let foodContent;
  if (loading) {
    foodContent = <p className="text-gray-600">Loading foods...</p>;
  } else if (error) {
    foodContent = <p className="text-red-500">Error loading foods: {error}</p>;
  } else {
    foodContent = (
      <Slider {...carouselSettings}>
        {featuredFoods.map((food) => (
          <div key={food.id} className="p-2">
            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center h-full">
              <img
                src={
                  food.image ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                }
                alt={food.name}
                className="w-full h-40 object-cover mb-2 rounded-lg"
              />
              <p className="font-bold text-gray-800">{food.name}</p>
              {food.restaurant && (
                <p className="text-gray-600 text-sm">{food.restaurant.name}</p>
              )}
              <p className="font-bold text-orange-500 mt-1">${food.price}</p>
            </div>
          </div>
        ))}
      </Slider>
    );
  }

  return (
    <Layout>
      <div className="p-4 max-w-7xl mx-auto min-h-screen rounded-lg">
        <div className="flex flex-grow justify-between items-center">
          <h1 className="text-3xl font-bold mb-6 text-red-800">
            Welcome to FlavorFleet
          </h1>

          <Link
            to="/order"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all mb-6 font-semibold"
          >
            Place New Order
          </Link>
        </div>

        {/* Ongoing Orders Section */}
        <div className="mb-8">
          <div
            className="flex items-center cursor-pointer p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            onClick={() => setShowOngoingOrders(!showOngoingOrders)}
          >
            <h2 className="text-xl font-semibold text-gray-700">
              Ongoing Orders
            </h2>
            <span
              className={`ml-2 transition-transform ${
                showOngoingOrders ? "rotate-90" : ""
              }`}
            >
              →
            </span>
          </div>
          {showOngoingOrders && (
            <div className="mt-4 space-y-4">
              {ongoingOrders.length > 0 ? (
                ongoingOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-orange-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            {order.restaurantId?.name || "Unknown Restaurant"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-medium">
                          Total Amount
                        </p>
                        <p className="font-bold text-gray-800 text-xl">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>

                      {order.estimatedDeliveryTime && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-medium">
                            Estimated Delivery
                          </p>
                          <p className="font-bold text-gray-800 text-xl">
                            {new Date(
                              order.estimatedDeliveryTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}

                      {order.deliveryAgentId ? (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-medium">
                            Delivery Agent
                          </p>
                          <p className="font-bold text-gray-800">
                            {order.deliveryAgentId}
                            {/* <span className="block text-sm text-gray-600">{order.deliveryAgentId.phone}</span> */}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-medium">
                            Delivery Agent
                          </p>
                          <p className="font-bold text-gray-800">
                            Not assigned yet
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order._id}`);
                        }}
                      >
                        View Details
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No ongoing orders
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any active orders right now.
                  </p>
                  <Link
                    to="/order"
                    className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all font-medium"
                  >
                    Place New Order
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Count Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Total Orders</p>
                <p className="text-3xl font-bold">{ordersCount.totalOrders}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Delivered</p>
                <p className="text-3xl font-bold">
                  {ordersCount.deliveredOrders}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Canceled</p>
                <p className="text-3xl font-bold">
                  {ordersCount.canceledOrders}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Pending</p>
                <p className="text-3xl font-bold">
                  {ordersCount.pendingOrders}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
            </div>
          </div>
        </div>

        {/* Promotions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Promotions</h2>
          {promotionContent}
        </div>

        {/* Explore Restaurants Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Explore Restaurants
          </h2>
          {restaurantContent}
        </div>

        {/* Featured Foods Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            All Menu Items
          </h2>
          {foodContent}
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
