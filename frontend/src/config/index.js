// Environment configuration
export const ENV = {
  API: {
    GATEWAY_URL: import.meta.env.VITE_GATEWAY_BACKEND_URL,
    RESTAURANT_URL: import.meta.env.VITE_RESTAURANT_BACKEND_URL,
    ORDER_URL: import.meta.env.VITE_ORDER_BACKEND_URL,
    DELIVERY_URL: import.meta.env.VITE_DELIVERY_BACKEND_URL,
  },
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  APP_NAME: 'FlavorFleet',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  TOAST_DEFAULTS: {
    DURATION: {
      SUCCESS: 3000,
      ERROR: 5000,
      INFO: 4000,
      WARNING: 4000,
    },
  },
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

// Feature flags
export const FEATURES = {
  DARK_MODE: true,
  REAL_TIME_NOTIFICATIONS: true,
  ANALYTICS: process.env.NODE_ENV === 'production',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
};

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CURRENT_USER: '/auth/current',
    REFRESH_TOKEN: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/update',
    UPDATE_RESIDENCE: '/auth/update-residence',
  },
  RESTAURANTS: {
    LIST: '/restaurants',
    DETAILS: (id) => `/restaurants/${id}`,
    CREATE: '/restaurants',
    UPDATE: (id) => `/restaurants/${id}`,
    DELETE: (id) => `/restaurants/${id}`,
    MENU: (id) => `/restaurants/${id}/menu`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAILS: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (id) => `/cart/update/${id}`,
    REMOVE: (id) => `/cart/remove/${id}`,
    CLEAR: '/cart/clear',
  },
  DELIVERY: {
    LIST: '/deliveries',
    DETAILS: (id) => `/deliveries/${id}`,
    UPDATE_STATUS: (id) => `/deliveries/${id}/status`,
    UPDATE_LOCATION: '/delivery/location',
  },
};
