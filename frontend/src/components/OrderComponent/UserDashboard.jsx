import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../Layout";
import Slider from "react-slick"; // For the carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";

const UserDashboard = () => {
  const [showOngoingOrders, setShowOngoingOrders] = useState(false);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch food data from API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://localhost:5003/api/foods');
        setFeaturedFoods(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Dummy data for ongoing orders
  const ongoingOrders = [
    {
      id: 1,
      restaurant: "Burger King",
      total: 25.99,
      status: "Out for Delivery",
      deliveryPerson: "John Doe",
      contactNumber: "123-456-7890",
      estimatedTime: "30 mins",
    },
  ];

  // Dummy data for orders count
  const ordersCount = {
    totalOrders: 10,
    deliveredOrders: 7,
    canceledOrders: 2,
  };

  // Dummy data for promotions
  const promotions = [
    {
      id: 1,
      title: "50% Off on Burgers",
      description: "Valid until 31st December",
    },
    {
      id: 2,
      title: "Free Drink with Pizza",
      description: "Valid until 15th January",
    },
    {
      id: 3,
      title: "Buy 1 Get 1 Free",
      description: "Valid until 20th January",
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

  return (
    <>
      <Layout>
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex flex-grow justify-between items-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Welcome to Your Dashboard
          </h1>

            <Link
            to="/order"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all mb-6 font-semibold"
          >
            Place New Order
          </Link>

            </div>

          {/* Ongoing Orders Section */}
          <div className="mb-8 border border-green-400 rounded-lg">
            {" "}
            {/* Added green border and padding */}
            <div
              className="flex items-center cursor-pointer  p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setShowOngoingOrders(!showOngoingOrders)}
            >
              <h2 className="text-xl font-semibold text-gray-700">
                Ongoing Orders
              </h2>
              <span className="ml-2 text-gray-600">→</span>
            </div>
            {showOngoingOrders && ongoingOrders.length > 0
              ? ongoingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500"
                  >
                    <p className="font-bold text-gray-800">
                      {order.restaurant}
                    </p>
                    <p className="text-gray-600">Total: ${order.total}</p>
                    <p className="text-gray-600">Status: {order.status}</p>
                    <p className="text-gray-600">
                      Delivery Person: {order.deliveryPerson}
                    </p>
                    <p className="text-gray-600">
                      Contact: {order.contactNumber}
                    </p>
                    <p className="text-gray-600">
                      Estimated Time: {order.estimatedTime}
                    </p>
                  </div>
                ))
              : showOngoingOrders && (
                  <p className="text-gray-600">No ongoing orders found.</p>
                )}
          </div>


          {/* Three Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-700">Total Orders</p>
              <p className="text-3xl text-orange-500">
                {ordersCount.totalOrders}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-700">Delivered Orders</p>
              <p className="text-3xl text-green-500">
                {ordersCount.deliveredOrders}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-700">Canceled Orders</p>
              <p className="text-3xl text-red-500">
                {ordersCount.canceledOrders}
              </p>
            </div>
          </div>

          {/* Promotions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Promotions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.length > 0 ? (
                promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="font-bold text-gray-800">{promotion.title}</p>
                    <p className="text-gray-600">{promotion.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No promotions found.</p>
              )}
            </div>
          </div>

          {/* Featured Foods Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Featured Foods
            </h2>
            {loading ? (
              <p className="text-gray-600">Loading foods...</p>
            ) : error ? (
              <p className="text-red-500">Error loading foods: {error}</p>
            ) : (
              <Slider {...carouselSettings}>
                {featuredFoods.map((food) => (
                  <div key={food.id} className="p-2">
                    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                      <img
                        src={food.foodImage}
                        alt={food.foodName}
                        className="w-full h-40 object-cover mb-2 rounded-lg"
                      />
                      <p className="font-bold text-gray-800">{food.foodName}</p>
                      <p className="text-gray-600">{food.restaurantName}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            )}
          </div>

        </div>
      </Layout>
    </>
  );
};

export default UserDashboard;