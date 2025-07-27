import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Box, Fade, useTheme, Avatar, Menu, MenuItem, Divider, Chip } from '@mui/material';
import { Brightness4, Brightness7, Bloodtype, AccountCircle, Logout, Settings, Dashboard, Home } from '@mui/icons-material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { mode, toggleTheme } = useThemeMode();
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fadeIn, setFadeIn] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
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
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          mt: 0, 
          borderRadius: 0,
          background: isDark 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)' 
            : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          borderBottom: `1px solid ${isDark ? '#34495e' : '#c0392b'}`,
        }}
      >
        <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Bloodtype
              sx={{
                mr: 2,
                fontSize: 36,
                color: '#e74c3c',
                filter: isDark ? 'drop-shadow(0 0 12px #e74c3c)' : 'drop-shadow(0 0 8px #e74c3c)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  filter: isDark ? 'drop-shadow(0 0 16px #e74c3c)' : 'drop-shadow(0 0 12px #e74c3c)',
                }
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} 
              component={Link} 
              to="/" 
              color="inherit" 
              style={{ textDecoration: 'none' }}
            >
              Blood Donation
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/" 
              startIcon={<Home />}
              sx={{ 
                fontWeight: 600, 
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Home
            </Button>
            
            {token ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/dashboard" 
                  startIcon={<Dashboard />}
                  sx={{ 
                    fontWeight: 600, 
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Dashboard
                </Button>
                
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    ml: 1,
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || <AccountCircle />}
                  </Avatar>
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: `1px solid ${isDark ? '#2c3e50' : '#ecf0f1'}`,
                      }
                    }
                  }}
                >
                  <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
                    <AccountCircle sx={{ mr: 2 }} />
                    {user?.name || user?.email || 'User'}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                    <Logout sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/login" 
                variant="outlined"
                sx={{ 
                  fontWeight: 600, 
                  px: 3,
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.5)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Login
              </Button>
            )}
            
            <IconButton 
              color="inherit" 
              onClick={toggleTheme} 
              sx={{ 
                ml: 1,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
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