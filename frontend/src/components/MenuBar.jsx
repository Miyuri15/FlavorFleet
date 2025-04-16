import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiClipboard,
  FiShoppingCart,
  FiTruck,
  FiMap,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import LogoutDialog from "./LogoutDialog";
import ROUTES from "../routes";

const MenuBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";

  // Function to check if a route is active
  const isActive = (...paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (isAdmin) return ROUTES.ADMIN_DASHBOARD;
    if (isDelivery) return ROUTES.DELIVERY_DASHBOARD;
    return ROUTES.USER_DASHBOARD;
  };

  // Common menu items for all users
  const commonMenuItems = [
    {
      to: getDashboardPath(),
      icon: <FiHome />,
      text: "Dashboard",
      active: isActive(getDashboardPath()),
    },
    {
      to: ROUTES.DELIVERY_MAP,
      icon: <FiMap />,
      text: "Delivery Map",
      active: isActive(ROUTES.DELIVERY_MAP),
    },
    {
      to: ROUTES.PROFILE,
      icon: <FiUser />,
      text: "Profile",
      active: isActive(ROUTES.PROFILE),
    },
  ];

  // Regular user menu items
  const userMenuItems = [
    {
      to: ROUTES.MY_ORDERS,
      icon: <FiClipboard />,
      text: "My Orders",
      active: isActive(ROUTES.MY_ORDERS),
    },
    {
      to: ROUTES.ORDER,
      icon: <FiClipboard />,
      text: "Order Food",
      active: isActive(ROUTES.ORDER),
    },
    {
      to: ROUTES.CART,
      icon: <FiShoppingCart />,
      text: "Cart",
      active: isActive(ROUTES.CART),
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
