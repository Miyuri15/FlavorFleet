import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiClipboard,
  FiShoppingCart,
  FiTruck,
  FiMap,
  FiUser,
  FiMenu,
  FiChevronLeft,
} from "react-icons/fi";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import LogoutDialog from "./LogoutDialog";
import ROUTES from "../routes";

const MenuBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isAdmin = user?.role === "admin";
  const isDelivery = user?.role === "delivery";
  const isRestaurantOwner = user?.role === "restaurant_owner";

  const currentPath = location.pathname;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Always show sidebar on desktop
      } else {
        setIsOpen(false); // Hide by default on mobile
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isActive = (...paths) => {
    return paths.some((path) => {
      const resolvedPath =
        typeof path === "function" ? path().replace(/\/:.*$/, "") : path;
      const segmentsCurrent = currentPath.split("/").filter(Boolean);
      const segmentsTarget = resolvedPath.split("/").filter(Boolean);

      if (segmentsTarget.length > segmentsCurrent.length) return false;

      return segmentsTarget.every((seg, idx) => seg === segmentsCurrent[idx]);
    });
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (isAdmin) return ROUTES.ADMIN_DASHBOARD;
    if (isDelivery) return ROUTES.DELIVERY_DASHBOARD;
    if (isRestaurantOwner) return ROUTES.RESTAURANT_DASHBOARD;
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
  ];

  // Regular user menu items
  const userMenuItems = [
    {
      to: ROUTES.MY_ORDERS,
      icon: <FiClipboard />,
      text: "My Orders",
      active: isActive(
        ROUTES.MY_ORDERS,
        ROUTES.ORDER_CONFIRMATION,
        ROUTES.ORDER_DETAILS,
        ROUTES.TRACK_ORDER
      ),
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
      active: isActive(ROUTES.CART, ROUTES.PLACE_ORDER),
    },
    {
      to: ROUTES.PROFILE,
      icon: <FiUser />,
      text: "Profile",
      active: isActive(ROUTES.PROFILE),
    },
  ];

  // Delivery user menu items
  const deliveryMenuItems = [
    {
      to: ROUTES.DELIVERY_ORDERS,
      icon: <FiTruck />,
      text: "My Deliveries",
      active: isActive(ROUTES.DELIVERY_ORDERS),
    },
    {
      to: ROUTES.ORDER_DELIVERY_ROUTE,
      icon: <FiMap />,
      text: "Current Route",
      active: isActive(ROUTES.ORDER_DELIVERY_ROUTE),
    },
    {
      to: ROUTES.PROFILE,
      icon: <FiUser />,
      text: "Profile",
      active: isActive(ROUTES.PROFILE),
    },
  ];

  // Restaurant owner menu items
  const restaurantMenuItems = [
    {
      to: ROUTES.RESTAURANT_MENU,
      icon: <FiMenu />,
      text: "Menu",
      active: isActive(
        ROUTES.RESTAURANT_MENU,
        ROUTES.RESTAURANT_MENU_MANAGE,
        ROUTES.RESTAURANT_MENU_ADD,
        ROUTES.RESTAURANT_MENU_EDIT
      ),
    },
    {
      to: ROUTES.RESTAURANT_ORDERS,
      icon: <FiClipboard />,
      text: "Orders",
      active: isActive(ROUTES.RESTAURANT_ORDERS),
    },
    {
      to: ROUTES.PROFILE,
      icon: <FiUser />,
      text: "Profile",
      active: isActive(ROUTES.PROFILE),
    },
  ];

  const adminMenuItems = [
    {
      to: ROUTES.PROFILE,
      icon: <FiUser />,
      text: "Profile",
      active: isActive(ROUTES.PROFILE),
    },
  ];

  // Combine menu items based on user role
  const menuItems = [
    ...commonMenuItems,
    ...(!isAdmin && !isDelivery && !isRestaurantOwner ? userMenuItems : []),
    ...(isDelivery ? deliveryMenuItems : []),
    ...(isRestaurantOwner ? restaurantMenuItems : []),
    ...(isAdmin ? adminMenuItems : []),
  ];

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-3xl bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-md"
        >
          {isOpen ? <IoMdClose /> : <IoMdMenu />}
        </button>
      </div>
      <aside
        className={`
          fixed md:static z-40
          w-64 bg-gray-100 dark:bg-gray-900
          text-text-light dark:text-white
          h-screen p-4 shadow-md
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 -z-20"
        >
          <FiChevronLeft size={20} />
        </button>

        <ul className="space-y-4 mt-14 md:mt-0">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              to={item.to}
              icon={item.icon}
              text={item.text}
              isActive={item.active}
              closeMenu={() => setIsOpen(false)}
            />
          ))}
          <LogoutDialog logout={logout} />
        </ul>
      </aside>

      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const MenuItem = ({ to, icon, text, isActive, closeMenu }) => (
  <li>
    <Link
      to={to}
      onClick={closeMenu}
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
