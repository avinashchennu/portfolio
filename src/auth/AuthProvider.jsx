import { useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from '../api.js';
import { AuthContext } from './auth-context.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // restore the session on first load
  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // login and signup return the user so pages can pick where to go next
  const login = useCallback(async (credentials) => {
    const { token, user: u } = await api.login(credentials);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (details) => {
    const { token, user: u } = await api.signup(details);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
