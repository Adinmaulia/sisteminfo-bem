import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On mount, load from localStorage and fetch user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
      api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setUser(prev => ({ ...prev, username: res.data.username, name: res.data.name }));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        });
    }
  }, []);

  const login = async (username, password, isAdmin) => {
    const url = isAdmin ? '/auth/admin/login' : '/auth/users/login';
    const res = await api.post(url, { username, password });
    const { token } = res.data;
    const role = isAdmin ? 'admin' : 'user';
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ token, role });
    const userInfo = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    setUser(prev => ({ ...prev, username: userInfo.data.username, name: userInfo.data.name }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
