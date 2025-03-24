// apiClients.js
import axios from 'axios';

const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  });

  // Add response interceptor
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const foodServiceApi = createApiClient('http://localhost:5003/api');
export const cartServiceApi = createApiClient('http://localhost:5000/api');
// Add more services as needed