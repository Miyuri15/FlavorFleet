// src/pages/Home/page.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className=" flex-1 p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-900">Welcome to FlavorFleet!</h1>
      <p className="mt-2 text-gray-700">Order your favorite food with ease.</p>
      <Link to="/order/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Go to Order Dashboard
      </Link>
    </div>
  );
};

export default Home;