import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';

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
          login(res.data.token, { email, role: 'user' });
          enqueueSnackbar('User login successful!', { variant: 'success' });
          navigate('/dashboard');
        } catch (userErr) {
          const userMsg = userErr.response?.data?.message || 'Login failed';
          setError(userMsg);
          enqueueSnackbar(userMsg, { variant: 'error' });
          if (userErr.response?.status === 403 && userMsg.toLowerCase().includes('not verified')) {
            setShowVerify(true);
          }
        }
      } else {
        setError(msg);
        enqueueSnackbar(msg, { variant: 'error' });
        if (err.response?.status === 403 && msg.toLowerCase().includes('not verified')) {
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
      enqueueSnackbar('Verification code sent!', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to send code', { variant: 'error' });
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
    } catch {
      enqueueSnackbar('Verification failed', { variant: 'error' });
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
          ? 'linear-gradient(120deg, #232323 0%, #181818 100%)'
          : 'linear-gradient(120deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      <Paper sx={{ p: 5, minWidth: { xs: 320, sm: 400 }, maxWidth: 420, width: '100%', boxShadow: 6, borderRadius: 5, bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ color: isDark ? '#fff' : 'text.primary', fontWeight: 700, textAlign: 'center', mb: 3, letterSpacing: 1 }}>
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="username"
            InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
            sx={{ input: { color: isDark ? '#fff' : undefined } }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
            InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
            sx={{ input: { color: isDark ? '#fff' : undefined } }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.3, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, letterSpacing: 1 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
          </Button>
        </form>
        <Button
          variant="text"
          color="primary"
          fullWidth
          sx={{ mt: 2, fontWeight: 600, fontSize: '1rem', borderRadius: 2, letterSpacing: 1 }}
          onClick={() => navigate('/register')}
        >
          Don't have an account? Register
        </Button>
      </Paper>
      {/* Verification Dialog */}
      <Dialog open={showVerify} onClose={() => setShowVerify(false)}>
        <DialogTitle sx={{ color: isDark ? '#fff' : 'text.primary', bgcolor: isDark ? '#232323' : '#fff' }}>Account Verification Required</DialogTitle>
        <DialogContent sx={{ bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
          <Typography sx={{ mb: 2, color: isDark ? '#fff' : 'text.primary' }}>
            Your account is not verified. Please verify your account to log in.
          </Typography>
          <Button variant="outlined" onClick={sendCode} disabled={verifyLoading} sx={{ mb: 2, color: isDark ? '#fff' : undefined, borderColor: isDark ? '#fff' : undefined }}>
            {verifyLoading ? <CircularProgress size={20} /> : 'Send Verification Code'}
          </Button>
          {sent && (
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                label="Enter Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
                sx={{ input: { color: isDark ? '#fff' : undefined } }}
              />
              <Button variant="contained" onClick={confirmCode} disabled={verifying || !code}>
                {verifying ? <CircularProgress size={20} /> : 'Verify'}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: isDark ? '#232323' : '#fff' }}>
          <Button onClick={() => setShowVerify(false)} sx={{ color: isDark ? '#fff' : undefined }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 