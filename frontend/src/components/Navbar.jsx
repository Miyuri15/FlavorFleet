import React, { useEffect, useState } from "react";
import { FiSun, FiMoon, FiX, FiClock, FiSearch } from "react-icons/fi";
import { FaUser, FaBell, FaCheck, FaRegBell } from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../context/AuthContext";

const ORDER_SERVICE_URL =
  import.meta.env.VITE_ORDER_BACKEND_URL || "http://localhost:5000";

// Add JWT decoding function
const decodeJWT = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`p-3 transition-all duration-200 ${
        isHovered ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full flex-shrink-0">
          <FaRegBell className="text-blue-500 dark:text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words">
            {notification.message}
          </p>
          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <FiClock className="mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">
              {new Date(notification.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="mx-1">•</span>
            <span className="whitespace-nowrap">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>
          {notification.relatedEntity && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {notification.relatedEntity.type}
            </span>
          )}
        </div>
        <button
          onClick={() => onMarkAsRead(notification._id)}
          className={`p-1 rounded-full transition-colors flex-shrink-0 ${
            isHovered
              ? "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
              : "text-transparent"
          }`}
          aria-label="Mark as read"
        >
          <FaCheck size={14} />
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { darkMode, setDarkMode } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token") || user?.token;

      if (!token) {
        console.error("No token found");
        setError("Please login to view notifications");
        return;
      }

      const decoded = decodeJWT(token);
      const userId = decoded?.id;

      if (!userId) {
        console.log("No user ID available in token");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${ORDER_SERVICE_URL}/api/notifications/users/${userId}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to fetch notifications (Status: ${res.status})`
          );
        }

        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(error.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(
        `${ORDER_SERVICE_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to mark as read (Status: ${res.status})`);
      }

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token") || user?.token;
    const decoded = decodeJWT(token);
    const userId = decoded?.id;

    if (!userId) return;

    try {
      const res = await fetch(
        `${ORDER_SERVICE_URL}/api/notifications/users/${userId}/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to mark all as read (Status: ${res.status})`);
      }

      setNotifications([]);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Add click outside handler for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        !event.target.closest(".notification-container")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm p-4 m-3 flex items-center justify-between mb-4 sticky top-0 z-50 rounded-xl backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/img/flavorfleetlogo.png"
          alt="FlavorFleet Logo"
          className="h-10 w-auto"
        />
      </div>

      {/* Search Bar */}
      <div className="flex-grow mx-4 max-w-2xl relative">
        <div
          className={`relative transition-all duration-300 ${
            isSearchFocused ? "w-full" : "w-3/4"
          }`}
        >
          <input
            type="text"
            placeholder="Search restaurants, food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Right-side Icons */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <FiSun className="text-yellow-500" size={20} />
          ) : (
            <FiMoon className="text-gray-700" size={20} />
          )}
        </button>

        {/* Notifications */}
        <div className="relative notification-container">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="View notifications"
          >
            <FaBell className="text-gray-700 dark:text-gray-300 text-lg" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay for mobile */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setShowNotifications(false)}
              />

              {/* Notification Panel */}
              <div className="fixed md:absolute right-4 md:right-6 mt-2 w-[calc(100vw-2rem)] md:w-80 lg:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 z-50 md:top-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <div className="flex items-center space-x-3">
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
                        aria-label="Close notifications"
                      >
                        <FiX
                          className="text-gray-500 dark:text-gray-400"
                          size={20}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Loading notifications...
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No new notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onMarkAsRead={markAsRead}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <FaUser className="text-gray-600 dark:text-gray-300" />
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.name || "User"}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
