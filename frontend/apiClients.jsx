import axios from "axios";

const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
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
// Add more services as needed
