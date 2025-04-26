import React, { useState, useEffect } from "react";
import { 
  FaClock, 
  FaFire, 
  FaLeaf, 
  FaPepperHot,
  FaStar,
  FaRegStar,
  FaUtensils,
  FaWeight,
  FaHeart
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { GiHotSpices } from "react-icons/gi";
import Swal from "sweetalert2";
import axios from "axios";

// Use a direct URL or environment variable
const ORDER_BACKEND_URL = import.meta.env?.VITE_ORDER_BACKEND_URL || "https://your-backend-api.com";

const MenuItemDetails = ({ item, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    if (item) {
      checkFavoriteStatus();
    }
  }, [item]);

  const token = localStorage.getItem('token');

  const checkFavoriteStatus = async () => {
    if (!item || !token) return;
    
    setLoadingFavorite(true);
    try {
      const response = await axios.get(
        `${ORDER_BACKEND_URL}/api/favorites/menu/${item._id}/is-favorite`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    } finally {
      setLoadingFavorite(false);
    }
  };
  
  const toggleFavorite = async () => {
    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add items to favorites",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
  
    setLoadingFavorite(true);
    try {
      const method = isFavorite ? 'delete' : 'post';
      const endpoint = isFavorite ? 'unfavorite' : 'favorite'; // Correct endpoint
      const url = `${ORDER_BACKEND_URL}/api/favorites/menu/${item._id}/${endpoint}`;
  
      // Proper Axios configuration for all methods
      const response = await axios({
        method: method,
        url: url,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data.success) {
        setIsFavorite(!isFavorite);
        Swal.fire({
          title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to update favorite status",
        icon: "error",
      });
    } finally {
      setLoadingFavorite(false);
    }
  };

  // Mock rating for demonstration
  const rating = 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header with image and close button */}
        <div className="relative h-80">
          <img
            src={item.image || "/img/PepperoniPizza.jpg"}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/img/PepperoniPizza.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={toggleFavorite}
              disabled={loadingFavorite}
              className={`p-2 bg-white/90 rounded-full hover:bg-white transition ${loadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaHeart 
                className={isFavorite ? "text-red-500" : "text-gray-400"} 
                size={20} 
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/90 rounded-full hover:bg-white transition"
            >
              <IoMdClose size={20} className="text-gray-700" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full">
              {[...Array(fullStars)].map((_, i) => (
                <FaStar key={`full-${i}`} className="text-yellow-400" />
              ))}
              {hasHalfStar && <FaStar className="text-yellow-400" />}
              {[...Array(emptyStars)].map((_, i) => (
                <FaRegStar key={`empty-${i}`} className="text-yellow-400" />
              ))}
              <span className="ml-1 text-sm font-medium">{rating}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Title and Price Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
              {/* <p className="text-gray-500 mt-1">
              {item.restaurant.name}
                  {item.restaurant?.address?.street &&
                    ` - ${item.restaurant.address.street}`}
              </p> */}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-green-600">
                LKR {item.price?.toFixed(2)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item.isAvailable ? "Available" : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  About this dish
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description || "A delicious dish prepared with care using fresh ingredients."}
                </p>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Ingredients
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {item.ingredients?.map((ingredient, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-gray-600">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

           
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Facts */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Quick Facts</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-blue-500" />
                    <span className="text-gray-600">
                      Prep Time: {item.preparationTime || 20} mins
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUtensils className="text-blue-500" />
                    <span className="text-gray-600">
                      Category: {item.category || "Main Course"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaWeight className="text-blue-500" />
                    <span className="text-gray-600">Serves: 1 person</span>
                  </div>
                </div>
              </div>

              {/* Dietary Tags */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Dietary Info</h4>
                <div className="flex flex-wrap gap-2">
                  {item.dietaryTags?.includes("spicy") && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      <GiHotSpices /> Spicy
                    </span>
                  )}
                  {item.dietaryTags?.includes("high-protein") && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      <FaFire /> High Protein
                    </span>
                  )}
                  {item.dietaryTags?.includes("vegetarian") && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <FaLeaf /> Vegetarian
                    </span>
                  )}
                  {!item.dietaryTags && (
                    <span className="text-gray-500 text-sm">No dietary tags specified</span>
                  )}
                </div>
              </div>

              {/* Add to Cart
              <div className="sticky bottom-0 bg-white pt-4 pb-2">
                <button
                  onClick={() => {
                    addToCart(item);
                    onClose();
                  }}
                  disabled={!item.isAvailable}
                  className={`w-full py-3 rounded-lg transition-all font-bold text-lg ${
                    item.isAvailable
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md"
                      : "bg-gray-300 text-gray-700 cursor-not-allowed"
                  }`}
                >
                  {item.isAvailable ? "Add to Cart" : "Currently Unavailable"}
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetails;