import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000, // 10 second timeout
});

// Request interceptor for authentication
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

// Response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limiting (429 errors)
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 60; // Default to 60 seconds
      
      console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
      
      // Wait for the specified time before retrying
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry the request once
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        return api(originalRequest);
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api; 