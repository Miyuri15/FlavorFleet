import React, { useEffect, useState } from "react";
import { FiSun, FiMoon, FiX, FiClock } from "react-icons/fi";
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
      className={`p-3 rounded-lg transition-all duration-200 ${
        isHovered ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
          <FaRegBell className="text-blue-500 dark:text-blue-300" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {notification.message}
          </p>
          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <FiClock className="mr-1" />
            <span>
              {new Date(notification.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="mx-1">•</span>
            <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
          </div>
          {notification.relatedEntity && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {notification.relatedEntity.type}
            </span>
          )}
        </div>
        <button
          onClick={() => onMarkAsRead(notification._id)}
          className={`p-1 rounded-full transition-colors ${
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

  return (
    <nav className="dark:bg-background-dark shadow-sm p-4 m-3 flex items-center justify-between mb-4 relative sticky top-0 z-50">
      {/* Background Image with Opacity */}
      <div
        className="absolute inset-0 -z-10 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://i.ibb.co/BKQtYkPr/navbarbanner.jpg')",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Logo */}
      <div className="text-2xl font-bold text-blue-600 dark:text-white">
        <img
          src="/img/flavorfleetlogo.png"
          alt="logo"
          width={100}
          height={50}
          className="z-10"
        />
      </div>

      {/* Search Bar */}
      <div className="flex-grow mx-4 z-10">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 text-blue-900 backdrop-blur-sm dark:bg-gray-700/80 dark:text-white"
        />
      </div>

      {/* Right-side Icons */}
      <div className="flex items-center space-x-4 z-10">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? (
            <FiSun className="text-yellow-500" size={18} />
          ) : (
            <FiMoon className="text-gray-900" size={18} />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <div
            className="cursor-pointer relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell className="text-gray-700 dark:text-gray-300 text-lg" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Notifications
                  </h3>
                  <div className="flex items-center space-x-3">
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm flex items-center text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                      >
                        <FaCheck className="mr-1" size={12} /> Mark all
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {" "}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading notifications...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center p-6">
                    <div className="text-red-500 mb-3">{error}</div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Try again
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FaBell className="text-gray-400 mb-3" size={24} />
                    <p className="text-gray-500 dark:text-gray-400">
                      No new notifications
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      We'll notify you when something arrives
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
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
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <FaUser size={14} />
          </div>
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
            {user ? user.username : "Guest"}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
