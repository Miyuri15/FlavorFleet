import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiClipboard, FiShoppingCart, FiTruck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import LogoutDialog from "./LogoutDialog";

const MenuBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";

  // Function to check if a route is active
  const isActive = (path) => location.pathname.startsWith(path);

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (isAdmin) return "/admindashboard";
    if (isDelivery) return "/deliverydashboard";
    return "/userdashboard";
  };

  // Common menu items for all users
  const commonMenuItems = [
    {
      to: getDashboardPath(),
      icon: <FiHome />,
      text: "Dashboard",
      active: isActive(getDashboardPath()),
    },
  ];

  // Regular user menu items
  const userMenuItems = [
    {
      to: "/myorders",
      icon: <FiClipboard />,
      text: "My Orders",
      active: isActive("/orders"),
    },
    {
      to: "/order",
      icon: <FiClipboard />,
      text: "Order Food",
      active: isActive("/order"),
    },
    {
      to: "/cart",
      icon: <FiShoppingCart />,
      text: "Cart",
      active: isActive("/cart"),
    },
  ];

  // Delivery user menu items
  const deliveryMenuItems = [
    {
      to: "/delivery/orders",
      icon: <FiTruck />,
      text: "Delivery Orders",
      active: isActive("/delivery/orders"),
    },
  ];

  // Combine menu items based on user role
  const menuItems = [
    ...commonMenuItems,
    ...(!isAdmin && !isDelivery ? userMenuItems : []),
    ...(isDelivery ? deliveryMenuItems : []),
  ];

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 text-text-light dark:text-white h-screen p-4 shadow-md">
      <ul className="space-y-4">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            to={item.to}
            icon={item.icon}
            text={item.text}
            isActive={item.active}
          />
        ))}
        <LogoutDialog logout={logout} />
      </ul>
    </aside>
  );
};

const MenuItem = ({ to, icon, text, isActive }) => (
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

export default MenuBar;
