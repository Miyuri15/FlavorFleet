// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Signin&Signup/Login";
import Register from "./pages/Signin&Signup/Register";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./ThemeContext";
import UserDashboard from "./components/OrderComponent/UserDashboard";
import CartPage from "./components/OrderComponent/CartPage";
import OrderPage from "./pages/Order/OrderPage";
import PlaceOrderPage from "./components/OrderComponent/PlaceOrderPage";
import OrderConfirmationPage from "./components/OrderComponent/OrderConfirmationPage";
import MyOrders from "./components/OrderComponent/MyOrders";
import OrderDetails from "./components/OrderComponent/[id]/OrderDetails";
import TrackOrder from "./components/OrderComponent/[id]/TrackOrder";
import IncomingOrders from "./components/OrderComponent/IncomingOrders";
import PaymentPage from "./components/OrderComponent/PaymentPage";
// import FindDeliveryPerson from "./components/OrderComponent/FindDeliveryPerson";
import Error from "./pages/Error/Error";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import DeliveryDetailsPage from "./pages/Delivery/DeliveryDetailsPage";
import DeliveryDashboard from "./components/Delivery/DeliveryDashboard";

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
              <Route
                path="/order-confirmation/:orderId"
                element={<OrderConfirmationPage />}
              />
              <Route path="/myorders" element={<MyOrders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/track-order/:id" element={<TrackOrder />} />
              <Route path="/incoming-orders" element={<IncomingOrders />} />
              <Route path="/payment" element={<PaymentPage />} />
              {/* <Route
                path="/FindDeliveryPerson"
                element={<FindDeliveryPerson />}
              /> */}
              <Route path="/deliveryMap" element={<DeliveryDetailsPage />} />

              {/* Protected route with role-based access */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/deliverydashboard"
                element={
                  <ProtectedRoute requiredRole="delivery">
                    <DeliveryDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Dynamic Error Pages (401, 403, 500, etc.) */}
              <Route path="/error/:errorType" element={<Error />} />

              {/* Catch-all route for 404 */}
              <Route path="*" element={<Error errorType="404" />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
