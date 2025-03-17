import React from "react";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

const Layout = ({ children, isAdmin }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-gray-900 text-text-light dark:text-white">
      <MenuBar isAdmin={isAdmin} />
      <div className="flex-grow">
        <Navbar/>
        <div className="py-1 px-8">{children}</div>
      </div>
    </div>
  );
};

export default Layout;