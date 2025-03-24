// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/page'; // Import Home page
import OrderDashboard from './pages/Order/OrderDashboard/page';
import Login from './pages/Signin&Signup/Login';
import Register from './pages/Signin&Signup/Register';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/order/dashboard" element={<OrderDashboard />} />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
    </AuthProvider>
  );
}

export default App;