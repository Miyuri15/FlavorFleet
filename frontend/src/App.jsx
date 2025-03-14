// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/page'; // Import Home page
import OrderDashboard from './pages/Order/OrderDashboard/page';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order/dashboard" element={<OrderDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;