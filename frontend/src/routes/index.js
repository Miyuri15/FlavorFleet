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

// Additional lazy-loaded components
const PlaceOrderPage = lazy(() => import("../components/OrderComponent/PlaceOrderPage"));
const OrderConfirmationPage = lazy(() => import("../components/OrderComponent/OrderConfirmationPage"));
const MyOrders = lazy(() => import("../components/OrderComponent/MyOrders"));
const OrderDetails = lazy(() => import("../components/OrderComponent/[id]/OrderDetails"));
const TrackOrder = lazy(() => import("../components/OrderComponent/[id]/TrackOrder"));
const IncomingOrders = lazy(() => import("../components/OrderComponent/IncomingOrders"));
const PaymentPage = lazy(() => import("../components/OrderComponent/PaymentPage"));
const FavoritesPage = lazy(() => import("../components/OrderComponent/FavoritesPage"));
const RestaurantMenuPage = lazy(() => import("../components/OrderComponent/RestaurantMenuPage"));
const DeliveryDetailsPage = lazy(() => import("../pages/Delivery/DeliveryDetailsPage"));
const AddRestaurant = lazy(() => import("../pages/Restaurant/AddRestaurant"));
const RestaurantDetails = lazy(() => import("../pages/Restaurant/RestaurantDetails"));
const EditRestaurant = lazy(() => import("../pages/Restaurant/EditRestaurant"));
const MenuManagement = lazy(() => import("../pages/MenuItems/MenuManagement"));
const RestaurantMenu = lazy(() => import("../pages/MenuItems/RestaurantMenu"));
const MenuItemForm = lazy(() => import("../pages/MenuItems/MenuItemForm"));
const RestaurantOrdersPage = lazy(() => import("../pages/RestaurantOrders/RestaurantOrdersPage"));
const DeliveryOrdersPage = lazy(() => import("../pages/DeliveryOrders/DeliveryOrdersPage"));
const DeliveryRoutePage = lazy(() => import("../pages/DeliveryOrders/DeliveryRoutePage"));
const Paynow = lazy(() => import("../pages/Payment/Paynow"));
const PaymentCancled = lazy(() => import("../pages/Payment/PaymentCancled"));
const PaymentSuccess = lazy(() => import("../pages/Payment/PaymentSuccess"));

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
  PlaceOrderPage,
  OrderConfirmationPage,
  MyOrders,
  OrderDetails,
  TrackOrder,
  IncomingOrders,
  PaymentPage,
  FavoritesPage,
  RestaurantMenuPage,
  DeliveryDetailsPage,
  AddRestaurant,
  RestaurantDetails,
  EditRestaurant,
  MenuManagement,
  RestaurantMenu,
  MenuItemForm,
  RestaurantOrdersPage,
  DeliveryOrdersPage,
  DeliveryRoutePage,
  Paynow,
  PaymentCancled,
  PaymentSuccess,
};
