const ROUTES = {
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

  // Protected Routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  DELIVERY_DASHBOARD: "/deliverydashboard",
  RESTAURANT_DASHBOARD: "/restaurant-dashboard",

  // Errors
  ERROR_PAGE: (errorType = ":errorType") => `/error/${errorType}`,
  NOT_FOUND: "*",

  //favourite menu items 
  FAVOURITE_MENUITEMS:"/favourite-menuitems",
};

export default ROUTES;
