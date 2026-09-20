import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://keystone-fsm-platform-c3jy.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('keystone_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('keystone_token');
        localStorage.removeItem('keystone_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
