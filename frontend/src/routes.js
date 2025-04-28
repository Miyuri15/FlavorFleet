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
  DELIVERY_DASHBOARD: "/delivery-dashboard",
  RESTAURANT_DASHBOARD: "/restaurant-dashboard",

  //Restaurant routes
  RESTAURANT_MENU: "/restaurant/menu",
  RESTAURANT_ORDERS: "/restaurant/orders",
  ADD_RESTAURANT: "/add-restaurant",
  RESTAURANT_DETAILS: (id = ":id") => `/restaurant/${id}`,
  RESTAURANT_EDIT: (id = ":id") => `/restaurant/${id}/edit`,
  RESTAURANT_MENU_MANAGE: (id = ":id") => `/restaurant/${id}/menu`,
  RESTAURANT_MENU_ADD: (id = ":id") => `/restaurant/${id}/menu/add`,
  RESTAURANT_MENU_EDIT: (id = ":id", menuItemId = ":menuItemId") =>
    `/restaurant/${id}/menu/edit/${menuItemId}`,

  //Delivery Routes
  DELIVERY_ORDERS: "/delivery/orders",
  DELIVERY_ORDER_DETAILS: (id = ":id") => `/delivery/orders/${id}`,

  // Errors
  ERROR_PAGE: (errorType = ":errorType") => `/error/${errorType}`,
  NOT_FOUND: "*",

  //favourite menu items
  FAVOURITE_MENUITEMS: "/favourite-menuitems",
};

export default ROUTES;
