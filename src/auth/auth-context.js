import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// where each kind of user lands after logging in
export const homePath = (user) => (user?.role === 'admin' ? '/admin' : '/dashboard');
