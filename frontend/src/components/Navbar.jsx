import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../ThemeContext';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { darkMode, setDarkMode } = useTheme();
  const { user } = useAuth(); // Get the user from AuthContext

  return (
    <nav className="bg-background-light dark:bg-background-dark shadow-sm p-4 flex items-center justify-between mb-4 relative">
      <div className="text-2xl font-bold text-blue-600 dark:text-white">
        <img
          src="/img/flavorfleetlogo.png"
          alt="logo"
          width={100}
          height={50}
          
        />
      </div>

      <div className="flex-grow mx-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-blue-900 "
        />
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? <FiSun className="text-yellow-500" /> : <FiMoon className="text-gray-900" />}
        </button>

        <div className="flex items-center space-x-2">
          <FaUser className="text-gray-700 dark:text-gray-300" />
          <span className="text-lg text-gray-700 dark:text-gray-300 font-bold">
            {user ? user.username : "Guest"} {/* Display the username from AuthContext */}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;