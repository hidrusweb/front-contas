import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api',
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('contas_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('contas_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}

export default api;
