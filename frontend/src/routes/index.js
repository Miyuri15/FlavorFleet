// Route configuration with lazy loading
import { lazy } from "react";

// Lazy load components for better performance
const Login = lazy(() => import("../pages/Signin&Signup/Login"));
const Register = lazy(() => import("../pages/Signin&Signup/Register"));
const UserDashboard = lazy(() =>
  import("../components/OrderComponent/UserDashboard")
);
const CartPage = lazy(() => import("../components/OrderComponent/CartPage"));
const OrderPage = lazy(() => import("../pages/Order/OrderPage"));
const ProfilePage = lazy(() => import("../pages/Profile/ProfilePage"));
const AdminDashboard = lazy(() => import("../components/AdminDashboard"));
const DeliveryDashboard = lazy(() =>
  import("../components/Delivery/DeliveryDashboard")
);
const RestaurantDashboard = lazy(() =>
  import("../pages/Restaurant/RestaurantDashboard")
);
const Error = lazy(() => import("../pages/Error/Error"));

// Route constants (keeping your existing structure)
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  USER_DASHBOARD: "/user-dashboard",
  ORDER: "/order",
  CART: "/cart",
  PROFILE: "/profile",
  PLACE_ORDER: "/placeorder",
  ORDER_CONFIRMATION: (orderId = ":orderId") =>
    `/order-confirmation/${orderId}`,
  MY_ORDERS: "/myorders",
  ORDER_DETAILS: (id = ":id") => `/orders/${id}`,
  TRACK_ORDER: (id = ":id") => `/track-order/${id}`,
  INCOMING_ORDERS: "/incoming-orders",
  PAYMENT: "/payment",
  DELIVERY_MAP: "/deliveryMap",
  RESTAURANT_MENU_PAGE: "/restaurants/:restaurantId",
  ADMIN_DASHBOARD: "/admin/dashboard",
  DELIVERY_DASHBOARD: "/delivery-dashboard",
  RESTAURANT_DASHBOARD: "/restaurant-dashboard",
  RESTAURANT_MENU: "/restaurant/menu",
  RESTAURANT_ORDERS: "/orders",
  ADD_RESTAURANT: "/add-restaurant",
  RESTAURANT_DETAILS: (id = ":id") => `/restaurant/${id}`,
  RESTAURANT_EDIT: (id = ":id") => `/restaurant/${id}/edit`,
  RESTAURANT_MENU_MANAGE: (id = ":id") => `/restaurant/${id}/menu`,
  RESTAURANT_MENU_ADD: (id = ":id") => `/restaurant/${id}/menu/add`,
  RESTAURANT_MENU_EDIT: (id = ":id", menuItemId = ":menuItemId") =>
    `/restaurant/${id}/menu/edit/${menuItemId}`,
  DELIVERY_ORDERS: "/delivery/orders",
  DELIVERY_ORDER_DETAILS: (id = ":id") => `/delivery/orders/${id}`,
  ORDER_DELIVERY_ROUTE: "/delivery/route",
  ERROR_PAGE: (errorType = ":errorType") => `/error/${errorType}`,
  NOT_FOUND: "*",
  FAVOURITE_MENUITEMS: "/favourite-menuitems",
};

export {
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
};
