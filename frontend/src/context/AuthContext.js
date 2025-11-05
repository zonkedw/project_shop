import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token: tkn, user: usr } = await apiLogin({ email, password });
      setToken(tkn);
      // Сразу обогащаем пользователя актуальными полями (включая is_admin)
      try {
        const me = await getMe(tkn);
        setUser(me?.user || usr || { email });
      } catch {
        setUser(usr || { email });
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const { token: tkn, user: usr } = await apiRegister(data);
      setToken(tkn);
      setUser(usr || { email: data.email });
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Синхронизируем пользователя при наличии токена (например, после перезагрузки)
  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const me = await getMe(token);
        if (me?.user) setUser(me.user);
      } catch {
        // токен просрочен/невалиден
      }
    })();
  }, [token]);

  const isAdmin = !!user?.is_admin;
  const value = useMemo(() => ({ token, user, isAuthenticated, isAdmin, loading, login, register, logout }), [token, user, isAuthenticated, isAdmin, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
