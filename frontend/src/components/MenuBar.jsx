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
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const MenuBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
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
          to={isAdmin ? "/admindashboard" : "/userdashboard"}
          icon={<FiHome />}
          text="Dashboard"
          isActive={isActive(isAdmin ? "/admindashboard" : "/userdashboard")}
        />
        {!isAdmin && (
          <MenuItem
            to="/budget"
            icon={<FiClipboard />}
            text="Budget Planning"
            isActive={isActive("/budget")}
          />
        )}
        <MenuItem
          to={isAdmin ? "/adminTransactions" : "/userTransactions"}
          icon={<FiCreditCard />}
          text="Transactions"
          isActive={isActive(isAdmin ? "/adminTransactions" : "/userTransactions")}
        />
        <MenuItem
          to={isAdmin ? "/adminReports" : "/userReports"}
          icon={<FiFileText />}
          text="Reports"
          isActive={isActive(isAdmin ? "/adminReports" : "/userReports")}
        />
        <MenuItem
          to="/analytics"
          icon={<FiBarChart />}
          text="Analytics"
          isActive={isActive("/analytics")}
        />
        {isAdmin && (
          <MenuItem
            to="/allUsers"
            icon={<FiUsers />}
            text="All Users"
            isActive={isActive("/allUsers")}
          />
        )}
        {isAdmin && (
          <MenuItem
            to="/settings"
            icon={<FiSettings />}
            text="Settings"
            isActive={isActive("/settings")}
          />
        )}
        {!isAdmin && (
          <MenuItem
            to="/goal"
            icon={<FiClipboard />}
            text="Goals"
            isActive={isActive("/goal")}
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