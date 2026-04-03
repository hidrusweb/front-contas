import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/** Rotas públicas: não enviar JWT (token inválido pode confundir alguns proxies). */
function isPublicAccountPath(url: string | undefined): boolean {
  if (!url) return false;
  const u = url.replace(/^\//, '');
  return (
    u.startsWith('account/login') ||
    u.startsWith('account/register') ||
    u.startsWith('account/create') ||
    u.startsWith('account/exists') ||
    u.startsWith('account/password') ||
    u.startsWith('account/passwordForgot') ||
    u.startsWith('account/passwordReset')
  );
}

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('contas_token');
    const path = config.url ?? '';
    if (token && !isPublicAccountPath(path)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('contas_token');
        const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";
        window.location.href = `${prefix}/login`;
      }
      return Promise.reject(error);
    }
  );
}

export default api;
