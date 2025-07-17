import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const item = sessionStorage.getItem('token');
  if (item) {
    try {
      const { value, expiry } = JSON.parse(item);
      if (Date.now() < expiry) {
        config.headers.Authorization = `Bearer ${value}`;
      } else {
        sessionStorage.removeItem('token');
      }
    } catch {
      sessionStorage.removeItem('token');
    }
  }
  return config;
});

export default api; 