import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Box, Fade, useTheme } from '@mui/material';
import { Brightness4, Brightness7, Bloodtype } from '@mui/icons-material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { mode, toggleTheme } = useThemeMode();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fadeIn, setFadeIn] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Animate on route change
  React.useEffect(() => {
    setFadeIn(false);
    const timeout = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: isDark ? '#232323' : 'primary.main', color: isDark ? '#fff' : '#fff' }}>
        <Toolbar sx={{ minHeight: 64, display: 'flex', alignItems: 'center' }}>
          <Bloodtype
            sx={{
              mr: 1,
              fontSize: 32,
              color: '#fff',
              filter: isDark ? 'drop-shadow(0 0 8px #ff1744) drop-shadow(0 0 16px #d32f2f)' : 'none',
              transition: 'filter 0.3s',
            }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }} component={Link} to="/" color="inherit" style={{ textDecoration: 'none' }}>
            Blood Donation
          </Typography>
          <Button color="inherit" component={Link} to="/" sx={{ fontWeight: 600, mx: 1 }}>Home</Button>
          {token ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard" sx={{ fontWeight: 600, mx: 1 }}>Dashboard</Button>
              <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600, mx: 1 }}>Logout</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ fontWeight: 600, mx: 1 }}>Login</Button>
          )}
          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: { xs: 1, sm: 3 }, bgcolor: isDark ? 'background.default' : undefined, minHeight: '100vh' }}>
        <Fade in={fadeIn} timeout={500} key={location.pathname}>
          <div>
            <Outlet />
          </div>
        </Fade>
      </Box>
    </>
  );
} 