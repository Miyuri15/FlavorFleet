import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { ROUTES } from "./index";
import {
  Login,
  Register,
  UserDashboard,
  CartPage,
  OrderPage,
  ProfilePage,
  AdminDashboard,
  DeliveryDashboard,
  RestaurantDashboard,
  Error,
} from "./index";

// Public routes that don't require authentication
export const publicRoutes = [
  <Route key="home" path={ROUTES.HOME} element={<Login />} />,
  <Route key="login" path={ROUTES.LOGIN} element={<Login />} />,
  <Route key="register" path={ROUTES.REGISTER} element={<Register />} />,
];

// User routes - basic authenticated routes
export const userRoutes = [
  <Route
    key="user-dashboard"
    path={ROUTES.USER_DASHBOARD}
    element={<UserDashboard />}
  />,
  <Route key="order" path={ROUTES.ORDER} element={<OrderPage />} />,
  <Route key="cart" path={ROUTES.CART} element={<CartPage />} />,
  <Route key="profile" path={ROUTES.PROFILE} element={<ProfilePage />} />,
  // Add more user routes...
];

// Admin protected routes
export const adminRoutes = [
  <Route
    key="admin-dashboard"
    path={ROUTES.ADMIN_DASHBOARD}
    element={
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    }
  />,
];

// Delivery protected routes
export const deliveryRoutes = [
  <Route
    key="delivery-dashboard"
    path={ROUTES.DELIVERY_DASHBOARD}
    element={
      <ProtectedRoute requiredRole="delivery">
        <DeliveryDashboard />
      </ProtectedRoute>
    }
  />,
];

// Restaurant protected routes
export const restaurantRoutes = [
  <Route
    key="restaurant-dashboard"
    path={ROUTES.RESTAURANT_DASHBOARD}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <RestaurantDashboard />
      </ProtectedRoute>
    }
  />,
];

// Error routes
export const errorRoutes = [
  <Route key="error" path={ROUTES.ERROR_PAGE()} element={<Error />} />,
  <Route
    key="404"
    path={ROUTES.NOT_FOUND}
    element={<Error errorType="404" />}
  />,
];
