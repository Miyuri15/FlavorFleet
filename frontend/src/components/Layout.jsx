import React from "react";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

const Layout = ({ children, isAdmin }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background-light dark:bg-gray-900 text-text-light dark:text-white">
      <MenuBar isAdmin={isAdmin} />
      <div className="flex-grow overflow-y-auto h-screen">
        <Navbar />
        <div className="p-2 md:p-3 m-2 md:m-3 bg-gray-100 rounded-xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
