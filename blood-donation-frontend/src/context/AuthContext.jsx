import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { Grid } from '@mui/material';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Get token and check expiry
  const [token, setToken] = useState(() => {
    const item = sessionStorage.getItem('token');
    if (!item) return null;
    try {
      const { value, expiry } = JSON.parse(item);
      if (Date.now() > expiry) {
        sessionStorage.removeItem('token');
        return null;
      }
      return value;
    } catch {
      sessionStorage.removeItem('token');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/profile')
        .then(res => setUser(res.data))
        .catch(() => {
          setUser(null);
          setToken(null);
          sessionStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (jwt, userInfo) => {
    setToken(jwt);
    // Store token with 24hr expiry
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem('token', JSON.stringify({ value: jwt, expiry }));
    setUser(userInfo);
    api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      <Grid columns={12}>
        <Grid columnSpan={12}>{children}</Grid>
      </Grid>
    </AuthContext.Provider>
  );
};