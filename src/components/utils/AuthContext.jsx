import { createContext, useContext, useMemo, useState } from 'react';
import api from '../../services/api';

const AUTH_STORAGE_KEY = 'hotelaria_auth';

const AuthContext = createContext(null);

function loadAuthFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuthFromStorage());

  const isAuthenticated = Boolean(auth?.token && auth?.usuario);
  const papel = auth?.usuario?.papel || null;
  const isAdmin = papel === 'admin';
  const isCliente = papel === 'cliente';

  const login = async (email, senha, tipo = 'admin') => {
    const endpoint = tipo === 'cliente' ? '/auth/cliente/login' : '/auth/login';
    const response = await api.post(endpoint, { email, senha });
    const nextAuth = {
      token: response.data.token,
      usuario: response.data.usuario,
      tipo,
    };

    setAuth(nextAuth);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    return nextAuth;
  };

  const logout = async () => {
    try {
      if (auth?.token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignora falhas de logout remoto e encerra sessão local mesmo assim.
    } finally {
      setAuth(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      auth,
      usuario: auth?.usuario || null,
      token: auth?.token || null,
      papel,
      isAdmin,
      isCliente,
      isAuthenticated,
      login,
      logout,
    }),
    [auth, papel, isAdmin, isCliente, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
