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
import PlaceOrderPage from './components/OrderComponent/PlaceOrderPage';
import OrderConfirmationPage from './components/OrderComponent/OrderConfirmationPage';
import MyOrders from './components/OrderComponent/MyOrders';
import OrderDetails from './components/OrderComponent/[id]/OrderDetails';
import TrackOrder from './components/OrderComponent/[id]/TrackOrder';
import IncomingOrders from './components/OrderComponent/IncomingOrders';

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
          <Route path="/placeorder" element={<PlaceOrderPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path = "/myorders" element={<MyOrders/>}/>
          <Route path = "/orders/:id" element ={<OrderDetails/>} />
          <Route path ="/track-order/:id" element = {<TrackOrder/>}/>
          <Route path ="/incoming-orders" element = {<IncomingOrders/>}/>

        </Routes>
      </div>
    </Router>
    </ThemeProvider>
    </AuthProvider>
  );
}

export default App;