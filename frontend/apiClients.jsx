import axios from "axios";

const BASE_DELIVERY_URL = import.meta.env.VITE_DELIVERY_BACKEND_URL;

const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const foodServiceApi = createApiClient(
  `${import.meta.env.VITE_RESTAURANT_BACKEND_URL}/api`
);
export const cartServiceApi = createApiClient(
  `${import.meta.env.VITE_ORDER_BACKEND_URL}/api`
);
export const deliveryServiceApi = createApiClient(
  `${BASE_DELIVERY_URL}/api/deliveries`
);
// Add more services as needed
