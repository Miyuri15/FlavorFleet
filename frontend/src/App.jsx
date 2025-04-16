// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ROUTES from "./routes";

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
import ProfilePage from "./pages/Profile/ProfilePage";
import FavoritesPage from "./components/OrderComponent/FavoritesPage";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path={ROUTES.HOME} element={<Login />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.USER_DASHBOARD} element={<UserDashboard />} />
              <Route path={ROUTES.ORDER} element={<OrderPage />} />
              <Route path={ROUTES.CART} element={<CartPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.PLACE_ORDER} element={<PlaceOrderPage />} />
              <Route
                path={ROUTES.ORDER_CONFIRMATION()}
                element={<OrderConfirmationPage />}
              />
              <Route path={ROUTES.MY_ORDERS} element={<MyOrders />} />
              <Route path={ROUTES.ORDER_DETAILS()} element={<OrderDetails />} />
              <Route path={ROUTES.TRACK_ORDER()} element={<TrackOrder />} />
              <Route
                path={ROUTES.INCOMING_ORDERS}
                element={<IncomingOrders />}
              />
              <Route path={ROUTES.PAYMENT} element={<PaymentPage />} />
              {/* <Route
                path="/FindDeliveryPerson"
                element={<FindDeliveryPerson />}
              /> */}
              <Route
                path={ROUTES.DELIVERY_MAP}
                element={<DeliveryDetailsPage />}
              />

              {/* Protected route with role-based access */}
              <Route
                path={ROUTES.ADMIN_DASHBOARD}
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path={ROUTES.DELIVERY_DASHBOARD}
                element={
                  <ProtectedRoute requiredRole="delivery">
                    <DeliveryDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Dynamic Error Pages (401, 403, 500, etc.) */}
              <Route path={ROUTES.ERROR_PAGE()} element={<Error />} />

              {/* Catch-all route for 404 */}
              <Route
                path={ROUTES.NOT_FOUND}
                element={<Error errorType="404" />}
              />
                          <Route
              path={ROUTES.FAVOURITE_MENUITEMS}
              element={<FavoritesPage/>}
            />

            </Routes>

          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
