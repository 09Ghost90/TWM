import axios from 'axios';

const AUTH_STORAGE_KEY = 'hotelaria_auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const auth = raw ? JSON.parse(raw) : null;
    if (auth?.token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  } catch {
    // Ignora falhas de leitura de sessão local.
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`Erro API [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('Sem resposta do servidor. Verifique se o backend está ativo.');
    } else {
      console.error('Erro na requisição:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
