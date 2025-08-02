import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Card, CardContent, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';
import { Bloodtype, Lock, Email, Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [showVerify, setShowVerify] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Try admin login first
      const res = await api.post('/admin/login', { email, password });
      login(res.data.token, { email, role: 'admin' });
      enqueueSnackbar('Admin login successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      // If not admin, try user login
      const msg = err.response?.data?.message || 'Login failed';
      if (msg.includes('Access denied') || msg.includes('Not an admin')) {
        try {
          // Try user login
          const res = await api.post('/users/login', { email, password });
          login(res.data.token, res.data.user);
          enqueueSnackbar('User login successful!', { variant: 'success' });
          navigate('/dashboard');
        } catch (userErr) {
          const userMsg = userErr.response?.data?.message || 'Login failed';
          setError(userMsg);
          enqueueSnackbar(userMsg, { variant: 'error' });
          
          // Check if user needs verification
          if (userErr.response?.data?.needsVerification) {
            setShowVerify(true);
          }
        }
      } else {
        setError(msg);
        enqueueSnackbar(msg, { variant: 'error' });
        
        // Check if user needs verification
        if (err.response?.data?.needsVerification) {
          setShowVerify(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Verification logic
  const sendCode = async () => {
    setVerifyLoading(true);
    try {
      await api.post('/verify/send', { email });
      setSent(true);
      enqueueSnackbar('Verification code sent! Check your email (and spam folder).', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send code';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const confirmCode = async () => {
    setVerifying(true);
    try {
      await api.post('/verify/confirm', { email, token: code });
      enqueueSnackbar('Account verified! You can now log in.', { variant: 'success' });
      setShowVerify(false);
      setSent(false);
      setCode('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: isDark
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: { xs: '100%', sm: 450 },
          maxWidth: 500,
          borderRadius: 4,
          background: isDark 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${isDark ? '#34495e' : '#e2e8f0'}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #e74c3c, #3498db, #27ae60, #f39c12)',
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Bloodtype sx={{ fontSize: 40, color: '#fff' }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: isDark ? '#fff' : 'text.primary' }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Sign in to your account
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: (
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                ),
              }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c0392b, #a93226)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderColor: isDark ? '#34495e' : '#cbd5e1',
                color: isDark ? '#fff' : 'text.primary',
                '&:hover': {
                  borderColor: '#e74c3c',
                  backgroundColor: 'rgba(231, 76, 60, 0.05)',
                },
              }}
            >
              Create Account
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerify} onClose={() => setShowVerify(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: isDark ? '#fff' : 'text.primary', bgcolor: isDark ? '#232323' : '#fff' }}>
          Verify Your Account
        </DialogTitle>
        <DialogContent sx={{ bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
          <Typography sx={{ mb: 2, color: isDark ? '#fff' : 'text.primary' }}>
            Your account needs to be verified. A verification code will be sent to <strong>{email}</strong>.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Email Setup:</strong> If you don't receive emails, check the server console or set up email credentials in the Backend/.env file.
          </Alert>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Check Spam:</strong> Verification emails might go to your spam folder. Please check there as well.
          </Alert>
          {!sent ? (
            <Button
              variant="contained"
              onClick={sendCode}
              disabled={verifyLoading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {verifyLoading ? <CircularProgress size={20} /> : 'Send Verification Code'}
            </Button>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              <Alert severity="success" sx={{ mb: 1 }}>
                Verification code sent! Check your email and spam folder.
              </Alert>
              <TextField
                fullWidth
                label="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
                sx={{ input: { color: isDark ? '#fff' : undefined } }}
              />
              <Button
                variant="contained"
                onClick={confirmCode}
                disabled={verifying || !code || code.length !== 6}
                fullWidth
              >
                {verifying ? <CircularProgress size={20} /> : 'Verify Account'}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: isDark ? '#232323' : '#fff' }}>
          <Button onClick={() => setShowVerify(false)} sx={{ color: isDark ? '#fff' : undefined }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}