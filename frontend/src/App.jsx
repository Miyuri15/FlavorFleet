// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Signin&Signup/Login';
import Register from './pages/Signin&Signup/Register';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './ThemeContext';
import UserDashboard from './components/OrderComponent/UserDashboard';
import CartPage from './components/OrderComponent/CartPage';
import OrderPage from './pages/Order/OrderPage';
import PaymentPage from './components/OrderComponent/PaymentPage';
import FindDeliveryPerson from './components/OrderComponent/FindDeliveryPerson';

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
          <Route path="/userdashboard" element={<UserDashboard />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/FindDeliveryPerson" element={<FindDeliveryPerson />} />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
    </AuthProvider>
  );
}

export default App;