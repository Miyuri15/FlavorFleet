import React, { useState, useEffect } from "react";
import {
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
} from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../Layout";

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectAll, setSelectAll] = useState(false);

  // Configure axios
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get("/cart");
        const items = Array.isArray(data) ? data : data.items || [];
        setCart(items.map((item) => ({ ...item, checked: true })));
        setSelectAll(true);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Toggle all items
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCart(cart.map((item) => ({ ...item, checked: newSelectAll })));
  };

  // Toggle single item
  const toggleItemCheck = (id) => {
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, checked: !item.checked } : item
      )
    );
    setSelectAll(
      cart.every((item) => (item._id === id ? !item.checked : item.checked))
    );
  };

  // Calculate totals for checked items only
  const checkedItems = cart.filter((item) => item.checked);
  const subtotal = checkedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = checkedItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = subtotal - discount;

  // Handle quantity changes
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${id}`, { quantity: newQuantity });
      setCart(
        cart.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Remove item
  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      setCart(cart.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await api.delete("/cart/clear");
      setCart([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Apply coupon
  const applyCoupon = () => {
    if (couponCode === "DISCOUNT10") {
      setDiscount(subtotal * 0.1);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your delicious items...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Your Shopping Cart
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
              {totalItems} {totalItems === 1 ? "item" : "items"} selected
            </span>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="px-4 py-2 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-64 h-64 mb-8">
              <img
                src="/img/empty-cart.svg"
                alt="Empty cart"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items yet
            </p>
            <button
              onClick={() => navigate("/order")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                />
                <label className="text-sm font-medium text-gray-700">
                  Select all items ({cart.length})
                </label>
              </div>

              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm mb-4 hover:shadow-md transition-shadow"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItemCheck(item._id)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-4"
                  />

                  <div className="w-full sm:w-32 h-32 flex-shrink-0">
                    <img
                      src={item.image || "/img/food-placeholder.jpg"}
                      alt={item.menuItemName}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/food-placeholder.jpg";
                      }}
                    />
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.menuItemName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.restaurantName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className={`px-3 py-1 ${
                            item.quantity <= 1
                              ? "text-gray-300"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <FaChevronLeft />
                        </button>
                        <span className="px-4 py-1 text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <FaChevronRight />
                        </button>
                      </div>

                      <p className="text-lg font-semibold text-green-600">
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-4">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-medium">
                      LKR {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- LKR {discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>LKR {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate("/placeorder", { state: { checkedItems } })
                  }
                  disabled={totalItems === 0}
                  className={`w-full py-3 rounded-lg transition-colors font-medium mb-4 ${
                    totalItems === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Proceed to Place Order
                </button>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <FiCheckCircle className="mr-2 text-green-500" />
                  <span>Secure SSL Encryption</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
