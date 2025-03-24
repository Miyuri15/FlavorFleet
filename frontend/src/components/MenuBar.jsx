import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiClipboard,
  FiCreditCard,
  FiBarChart,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiSettings,
  FiShoppingCart,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const MenuBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Function to check if a route is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#eef3f6] dark:bg-gray-900 text-text-light dark:text-white h-min-screen p-4 shadow-md">
      <ul className="space-y-4">
      <MenuItem
          to={isAdmin ? "/admindashboard" : isDelivery ? "/deliverydashboard" : "/userdashboard"}
          icon={<FiHome />}
          text="Dashboard"
          isActive={isActive(isAdmin ? "/admindashboard" : isDelivery ? "/deliverydashboard" : "/userdashboard")}
        />
        {!isAdmin && !isDelivery && (
          <MenuItem
            to="/orders"
            icon={<FiClipboard />}
            text="My Orders"
            isActive={isActive("/orders")}
          />
        )}
        {!isAdmin && !isDelivery && (
          <>
            <MenuItem
              to="/order"
              icon={<FiClipboard />}
              text="Order Food"
              isActive={isActive("/order")}
            />
            <MenuItem
              to="/cart"
              icon={<FiShoppingCart />}
              text="Cart"
              isActive={isActive("/cart")}
            />
          </>
        )}
        {isDelivery && (
          <MenuItem
            to="/delivery/orders"
            icon={<FiClipboard />}
            text="Delivery Orders"
            isActive={isActive("/delivery/orders")}
          />
        )}

        {isDelivery && (
          <MenuItem
            to="/delivery/orders"
            icon={<FiTruck />}
            text="Delivery Orders"
            isActive={isActive("/delivery/orders")}
          />
        )}      
       

        {/* Logout Button */}
        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg text-lg font-medium transition-all duration-300
                      hover:bg-blue-800 hover:text-white dark:hover:bg-blue-400 w-full text-left"
          >
            <FiLogOut />
            <span>LogOut</span>
          </button>
        </li>
      </ul>
    </aside>
  );
};

const MenuItem = ({ to, icon, text, isActive }) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 p-3 rounded-lg text-lg font-medium transition-all duration-300
                  hover:bg-blue-800 hover:text-white dark:hover:bg-blue-400 ${
                    isActive
                      ? "bg-blue-800 text-white dark:bg-blue-400"
                      : "bg-transparent"
                  }`}
      >
        {icon}
        <span>{text}</span>
      </Link>
    </li>
  );
};

export default MenuBar;