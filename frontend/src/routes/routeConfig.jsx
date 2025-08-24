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
} from "./index";

// Public routes that don't require authentication
export const publicRoutes = [
  <Route key="home" path={ROUTES.HOME} element={<Login />} />,
  <Route key="login" path={ROUTES.LOGIN} element={<Login />} />,
  <Route key="register" path={ROUTES.REGISTER} element={<Register />} />,
];

// User routes - basic authenticated routes
export const userRoutes = [
  <Route key="user-dashboard" path={ROUTES.USER_DASHBOARD} element={<UserDashboard />} />,
  <Route key="order" path={ROUTES.ORDER} element={<OrderPage />} />,
  <Route key="cart" path={ROUTES.CART} element={<CartPage />} />,
  <Route key="profile" path={ROUTES.PROFILE} element={<ProfilePage />} />,
  <Route key="place-order" path={ROUTES.PLACE_ORDER} element={<PlaceOrderPage />} />,
  <Route key="order-confirmation" path={ROUTES.ORDER_CONFIRMATION()} element={<OrderConfirmationPage />} />,
  <Route key="my-orders" path={ROUTES.MY_ORDERS} element={<MyOrders />} />,
  <Route key="order-details" path={ROUTES.ORDER_DETAILS()} element={<OrderDetails />} />,
  <Route key="track-order" path={ROUTES.TRACK_ORDER()} element={<TrackOrder />} />,
  <Route key="incoming-orders" path={ROUTES.INCOMING_ORDERS} element={<IncomingOrders />} />,
  <Route key="payment" path={ROUTES.PAYMENT} element={<PaymentPage />} />,
  <Route key="restaurant-menu-page" path={ROUTES.RESTAURANT_MENU_PAGE} element={<RestaurantMenuPage />} />,
  <Route key="favorites" path={ROUTES.FAVOURITE_MENUITEMS} element={<FavoritesPage />} />,
  <Route key="delivery-map" path={ROUTES.DELIVERY_MAP} element={<DeliveryDetailsPage />} />,
  <Route key="paynow" path="/paynow" element={<Paynow />} />,
  <Route key="payment-cancelled" path="/paymentcancled" element={<PaymentCancled />} />,
  <Route key="payment-success" path="/paymentsuccess" element={<PaymentSuccess />} />,
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
  <Route
    key="delivery-orders"
    path={ROUTES.DELIVERY_ORDERS}
    element={
      <ProtectedRoute requiredRole="delivery">
        <DeliveryOrdersPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="delivery-route"
    path={ROUTES.ORDER_DELIVERY_ROUTE}
    element={
      <ProtectedRoute requiredRole="delivery">
        <DeliveryRoutePage />
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
  <Route
    key="add-restaurant"
    path={ROUTES.ADD_RESTAURANT}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <AddRestaurant />
      </ProtectedRoute>
    }
  />,
  <Route
    key="restaurant-details"
    path={ROUTES.RESTAURANT_DETAILS()}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <RestaurantDetails />
      </ProtectedRoute>
    }
  />,
  <Route
    key="edit-restaurant"
    path={ROUTES.RESTAURANT_EDIT()}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <EditRestaurant />
      </ProtectedRoute>
    }
  />,
  <Route
    key="restaurant-menu"
    path={ROUTES.RESTAURANT_MENU}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <MenuManagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="restaurant-menu-manage"
    path={ROUTES.RESTAURANT_MENU_MANAGE()}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <RestaurantMenu />
      </ProtectedRoute>
    }
  />,
  <Route
    key="restaurant-menu-add"
    path={ROUTES.RESTAURANT_MENU_ADD()}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <MenuItemForm />
      </ProtectedRoute>
    }
  />,
  <Route
    key="restaurant-menu-edit"
    path={ROUTES.RESTAURANT_MENU_EDIT()}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <MenuItemForm />
      </ProtectedRoute>
    }
  />,
  <Route
    key="restaurant-orders"
    path={ROUTES.RESTAURANT_ORDERS}
    element={
      <ProtectedRoute requiredRole="restaurant_owner">
        <RestaurantOrdersPage />
      </ProtectedRoute>
    }
  />,
];

// Error routes
export const errorRoutes = [
  <Route key="error" path={ROUTES.ERROR_PAGE()} element={<Error />} />,
  <Route key="404" path={ROUTES.NOT_FOUND} element={<Error errorType="404" />} />,
];
