import axios from "axios";

// Environment variables
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_BACKEND_URL;
const RESTAURANT_URL = import.meta.env.VITE_RESTAURANT_BACKEND_URL;
const ORDER_URL = import.meta.env.VITE_ORDER_BACKEND_URL;
const DELIVERY_URL = import.meta.env.VITE_DELIVERY_BACKEND_URL;

// Base API client factory
const createApiClient = (baseURL, options = {}) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Handle FormData for file uploads
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// API clients
export const gatewayApi = createApiClient(`${GATEWAY_URL}/api`);
export const restaurantApi = createApiClient(`${RESTAURANT_URL}/api`);
export const orderApi = createApiClient(`${ORDER_URL}/api`);
export const deliveryApi = createApiClient(`${DELIVERY_URL}/api`);

// Default export for backward compatibility
export default gatewayApi;

// Service-specific API methods
export const authService = {
  login: (credentials) => gatewayApi.post("/auth/login", credentials),
  register: (userData) => gatewayApi.post("/auth/register", userData),
  getCurrentUser: () => gatewayApi.get("/auth/current"),
  updateProfile: (data) => gatewayApi.put("/auth/update", data),
  changePassword: (data) => gatewayApi.post("/auth/change-password", data),
  updateResidence: (data) => gatewayApi.put("/auth/update-residence", data),
};

export const restaurantService = {
  getRestaurants: () => restaurantApi.get("/restaurants"),
  getRestaurant: (id) => restaurantApi.get(`/restaurants/${id}`),
  createRestaurant: (data) => restaurantApi.post("/restaurants", data),
  updateRestaurant: (id, data) => restaurantApi.put(`/restaurants/${id}`, data),
  deleteRestaurant: (id) => restaurantApi.delete(`/restaurants/${id}`),
  getMenu: (id) => restaurantApi.get(`/restaurants/${id}/menu`),
  addMenuItem: (id, data) =>
    restaurantApi.post(`/restaurants/${id}/menu`, data),
  updateMenuItem: (restaurantId, itemId, data) =>
    restaurantApi.put(`/restaurants/${restaurantId}/menu/${itemId}`, data),
  deleteMenuItem: (restaurantId, itemId) =>
    restaurantApi.delete(`/restaurants/${restaurantId}/menu/${itemId}`),
};

export const orderService = {
  getCart: () => orderApi.get("/cart"),
  addToCart: (data) => orderApi.post("/cart/add", data),
  removeFromCart: (itemId) => orderApi.delete(`/cart/remove/${itemId}`),
  updateCartItem: (itemId, data) =>
    orderApi.put(`/cart/update/${itemId}`, data),
  clearCart: () => orderApi.delete("/cart/clear"),
  createOrder: (data) => orderApi.post("/orders", data),
  getOrders: () => orderApi.get("/orders"),
  getOrder: (id) => orderApi.get(`/orders/${id}`),
  updateOrderStatus: (id, status) =>
    orderApi.put(`/orders/${id}/status`, { status }),
};

export const deliveryService = {
  getDeliveries: () => deliveryApi.get("/deliveries"),
  getDelivery: (id) => deliveryApi.get(`/deliveries/${id}`),
  updateDeliveryStatus: (id, status) =>
    deliveryApi.put(`/deliveries/${id}/status`, { status }),
  updateLocation: (data) => deliveryApi.put("/delivery/location", data),
};

// Utility functions
export const handleApiError = (error, defaultMessage = "An error occurred") => {
  const message =
    error.response?.data?.message || error.message || defaultMessage;
  console.error("API Error:", error);
  return message;
};
