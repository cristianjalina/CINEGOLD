import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem('cinegold_token'));
  const [user, setUser] = useState(() => {
    const raw = window.localStorage.getItem('cinegold_user');
    return raw ? JSON.parse(raw) : null;
  });

  async function signIn(credentials) {
    const response = await authService.login(credentials);
    window.localStorage.setItem('cinegold_token', response.token);
    window.localStorage.setItem('cinegold_user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
    return response;
  }

  function signOut() {
    window.localStorage.removeItem('cinegold_token');
    window.localStorage.removeItem('cinegold_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading: false,
      signIn,
      signOut,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
