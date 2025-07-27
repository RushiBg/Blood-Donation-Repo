import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';

export default function RegisterPage() {
  const [name, setName] = useState('');
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
  const [registeredEmail, setRegisteredEmail] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users', { name, email, password });
      enqueueSnackbar('Registration successful! Please verify your account.', { variant: 'success' });
      setRegisteredEmail(email);
      setShowVerify(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Verification logic
  const sendCode = async () => {
    setVerifyLoading(true);
    try {
      await api.post('/verify/send', { email: registeredEmail });
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
      await api.post('/verify/confirm', { email: registeredEmail, token: code });
      enqueueSnackbar('Account verified! You can now log in.', { variant: 'success' });
      setShowVerify(false);
      setSent(false);
      setCode('');
      setRegisteredEmail('');
      navigate('/login');
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
          ? 'linear-gradient(120deg, #232323 0%, #181818 100%)'
          : 'linear-gradient(120deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      <Paper sx={{ p: 5, minWidth: { xs: 320, sm: 400 }, maxWidth: 420, width: '100%', boxShadow: 6, borderRadius: 5, bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ color: isDark ? '#fff' : 'text.primary', fontWeight: 700, textAlign: 'center', mb: 3, letterSpacing: 1 }}>
          Register
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
            sx={{ input: { color: isDark ? '#fff' : undefined } }}
          />
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
            autoComplete="new-password"
            InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
            sx={{ input: { color: isDark ? '#fff' : undefined } }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.3, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, letterSpacing: 1 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'REGISTER'}
          </Button>
        </form>
      </Paper>
      {/* Verification Dialog */}
      <Dialog open={showVerify} onClose={() => setShowVerify(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: isDark ? '#fff' : 'text.primary', bgcolor: isDark ? '#232323' : '#fff' }}>Account Verification Required</DialogTitle>
        <DialogContent sx={{ bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
          <Typography sx={{ mb: 2, color: isDark ? '#fff' : 'text.primary' }}>
            Please verify your account to log in. A verification code will be sent to <strong>{registeredEmail}</strong>.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Email Setup:</strong> If you don't receive emails, check the server console or set up email credentials in the Backend/.env file.
          </Alert>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Check Spam:</strong> Verification emails might go to your spam folder. Please check there as well.
          </Alert>
          <Button 
            variant="outlined" 
            onClick={sendCode} 
            disabled={verifyLoading} 
            sx={{ mb: 2, color: isDark ? '#fff' : undefined, borderColor: isDark ? '#fff' : undefined }}
            fullWidth
          >
            {verifyLoading ? <CircularProgress size={20} /> : 'Send Verification Code'}
          </Button>
          {sent && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Alert severity="success" sx={{ mb: 1 }}>
                Verification code sent! Check your email and spam folder.
              </Alert>
              <TextField
                label="Enter Verification Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                fullWidth
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
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 