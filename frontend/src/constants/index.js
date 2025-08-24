// Application constants
export const APP_NAME = "FlavorFleet";
export const APP_VERSION = "1.0.0";

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  RESTAURANT_OWNER: "restaurant_owner",
  DELIVERY: "delivery",
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Delivery statuses
export const DELIVERY_STATUS = {
  AVAILABLE: "available",
  BUSY: "busy",
  OFFLINE: "offline",
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  DIGITAL_WALLET: "digital_wallet",
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: "/auth",
  RESTAURANTS: "/restaurants",
  ORDERS: "/orders",
  CART: "/cart",
  DELIVERY: "/delivery",
  PAYMENT: "/payment",
};

// Default values
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  CART: "cart",
  FAVORITES: "favorites",
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Resource not found.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
  ORDER_PLACED: "Order placed successfully",
  ITEM_ADDED_TO_CART: "Item added to cart",
  PASSWORD_CHANGED: "Password changed successfully",
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
};

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Map settings
export const MAP_SETTINGS = {
  DEFAULT_CENTER: {
    lat: 6.9271,
    lng: 79.8612, // Colombo, Sri Lanka
  },
  DEFAULT_ZOOM: 12,
};

// File upload settings
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
};
