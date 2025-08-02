import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton, Link, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
        padding: { xs: 2, sm: 3 }
      }}
    >
      <Paper 
        elevation={12}
        sx={{ 
          p: { xs: 3, sm: 5 }, 
          minWidth: { xs: 300, sm: 400 }, 
          maxWidth: 450, 
          width: '100%', 
          borderRadius: 4,
          bgcolor: isDark ? '#232323' : '#fff', 
          color: isDark ? '#fff' : 'inherit', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '5px',
            background: 'linear-gradient(90deg,rgb(197, 13, 13), #f44336)'
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mb: 4 
          }}
        >
          <BloodtypeIcon sx={{ fontSize: 32, color: '#f44336' }} />
          <Typography 
            variant="h4" 
            sx={{ 
              color: isDark ? '#fff' : 'text.primary', 
              fontWeight: 700, 
              letterSpacing: 1 
            }}
          >
            Register
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3, width: '100%' }}>{error}</Alert>}
        
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
            sx={{ 
              mb: 2,
              input: { color: isDark ? '#fff' : undefined },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#f44336',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f44336',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: isDark ? '#fff' : 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
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
            sx={{ 
              mb: 2,
              input: { color: isDark ? '#fff' : undefined },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#f44336',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f44336',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: isDark ? '#fff' : 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
            InputLabelProps={{ style: { color: isDark ? '#fff' : undefined } }}
            sx={{ 
              mb: 3,
              input: { color: isDark ? '#fff' : undefined },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#f44336',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f44336',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: isDark ? '#fff' : 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                    sx={{ color: isDark ? '#fff' : 'text.secondary' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ 
              mt: 2, 
              py: 1.5, 
              fontWeight: 700, 
              fontSize: '1.1rem', 
              borderRadius: 2, 
              letterSpacing: 1,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#f44336',
              },
              boxShadow: '0 4px 12px rgba(208, 27, 27, 0.7)'
            }} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'REGISTER'}
          </Button>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" sx={{ color: isDark ? '#aaa' : 'text.secondary', px: 1 }}>
                Already have an account?
              </Typography>
            </Divider>
            <Link 
              component={RouterLink} 
              to="/login" 
              sx={{ 
                color: '#f44336', 
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Sign in instead
            </Link>
          </Box>
        </form>
      </Paper>
      {/* Verification Dialog */}
      <Dialog 
        open={showVerify} 
        onClose={() => setShowVerify(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #e91e63, #f44336)'
            }
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: isDark ? '#fff' : 'text.primary', 
            bgcolor: isDark ? '#232323' : '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 2.5
          }}
        >
          <BloodtypeIcon sx={{ color: '#e91e63' }} />
          Account Verification Required
        </DialogTitle>
        
        <DialogContent sx={{ bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit', pt: 2 }}>
          <Typography sx={{ mb: 3, color: isDark ? '#fff' : 'text.primary' }}>
            Please verify your account to log in. A verification code will be sent to <strong>{registeredEmail}</strong>.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <strong>Email Setup:</strong> If you don't receive emails, check the server console or set up email credentials in the Backend/.env file.
          </Alert>
          
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Check Spam:</strong> Verification emails might go to your spam folder. Please check there as well.
          </Alert>
          
          <Button 
            variant="outlined" 
            onClick={sendCode} 
            disabled={verifyLoading} 
            sx={{ 
              mb: 3, 
              py: 1.2,
              color: isDark ? '#fff' : '#e91e63', 
              borderColor: isDark ? '#fff' : '#e91e63',
              '&:hover': {
                borderColor: '#d81b60',
                bgcolor: 'rgba(233, 30, 99, 0.04)'
              }
            }}
            fullWidth
            startIcon={<EmailIcon />}
          >
            {verifyLoading ? <CircularProgress size={20} /> : 'Send Verification Code'}
          </Button>
          
          {sent && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                Verification code sent! Check your email and spam folder.
              </Alert>
              
              <TextField
                label="Enter Verification Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                fullWidth
                placeholder="Enter 6-digit code"
                sx={{ 
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    color: isDark ? '#fff' : undefined
                  },
                  '& .MuiInputBase-input': {
                    color: isDark ? '#fff' : undefined
                  },
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#e91e63',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#e91e63',
                    },
                  },
                }}
              />
              
              <Button 
                variant="contained" 
                onClick={confirmCode} 
                disabled={verifying || !code || code.length !== 6}
                fullWidth
                sx={{ 
                  py: 1.2,
                  bgcolor: '#e91e63',
                  '&:hover': {
                    bgcolor: '#d81b60',
                  },
                  boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
                }}
              >
                {verifying ? <CircularProgress size={20} /> : 'Verify Account'}
              </Button>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: isDark ? '#232323' : '#fff', px: 3, py: 2 }}>
          <Button 
            onClick={() => setShowVerify(false)} 
            sx={{ 
              color: isDark ? '#fff' : '#e91e63',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(233, 30, 99, 0.04)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}