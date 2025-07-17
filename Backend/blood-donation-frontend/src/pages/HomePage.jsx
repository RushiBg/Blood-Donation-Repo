import { Typography, Button, Box, Grid, Paper, Divider, Container, Stepper, Step, StepLabel, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventIcon from '@mui/icons-material/Event';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const features = [
  {
    icon: <VolunteerActivismIcon sx={{ fontSize: 38, color: '#d32f2f', mb: 1 }} />, 
    title: 'Easy Blood Requests',
    desc: 'Request blood or donate with just a few clicks. Our platform connects donors and recipients efficiently.'
  },
  {
    icon: <EventIcon sx={{ fontSize: 38, color: '#1976d2', mb: 1 }} />, 
    title: 'Appointment Scheduling',
    desc: 'Book, reschedule, and manage your donation appointments with reminders and calendar integration.'
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 38, color: '#43a047', mb: 1 }} />, 
    title: 'Secure & Verified',
    desc: 'Your data is protected. Only verified users and admins can access sensitive features.'
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 38, color: '#fbc02d', mb: 1 }} />, 
    title: 'Leaderboard & Badges',
    desc: 'Earn badges and climb the leaderboard as you donate more. Get recognized for your impact!'
  },
];

const steps = [
  { label: 'Sign Up', icon: <PersonAddAltIcon color="primary" /> },
  { label: 'Book Appointment', icon: <EventIcon color="error" /> },
  { label: 'Donate', icon: <VolunteerActivismIcon color="success" /> },
  { label: 'Earn Badges', icon: <EmojiEventsIcon color="warning" /> },
];

export default function HomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: isDark ? 'background.default' : '#f8fafc' }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: '100%',
          minHeight: { xs: 350, md: 420 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(120deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(120deg, #f44336 0%, #f8fafc 100%)',
          position: 'relative',
          py: { xs: 6, md: 10 },
          borderRadius: 2,
          transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: 2,
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.025)',
            boxShadow: 8,
          },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', zIndex: 2 }}>
          <BloodtypeIcon sx={{ fontSize: 70, color: isDark ? '#ffebee' : '#fff', mb: 2, filter: 'drop-shadow(0 2px 8px #d32f2f88)' }} />
          <Typography variant="h2" sx={{ fontWeight: 700, color: isDark ? '#fff' : '#fff', letterSpacing: 1, mb: 2 }}>
            Donate Blood, Save Lives
          </Typography>
          <Typography variant="h5" sx={{ color: isDark ? '#ffe0e0' : '#fffde7', mb: 4, fontWeight: 400 }}>
            Join our community and make a real difference today.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/login"
            size="large"
            sx={{ fontWeight: 600, fontSize: '1.1rem', px: 5, py: 1.7, borderRadius: 3, boxShadow: 2 }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 10 }, mb: 6 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 700, mb: 4, color: isDark ? '#fff' : 'text.primary' }}>
          Why Join Us?
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  textAlign: 'center',
                  bgcolor: isDark ? '#232323' : '#fff',
                  color: isDark ? '#fff' : 'inherit',
                  transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: 8,
                  },
                }}
              >
                {f.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: isDark ? '#fff' : 'text.primary' }}>{f.title}</Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#e0e0e0' : 'text.secondary' }}>{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it Works Section */}
      <Box sx={{ bgcolor: isDark ? '#181818' : '#fff', py: 6, mb: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 3, color: isDark ? '#fff' : 'text.primary' }}>
            How It Works
          </Typography>
          <Stepper alternativeLabel activeStep={-1} sx={{ background: 'none' }}>
            {steps.map((step, idx) => (
              <Step key={step.label} completed={false}>
                <StepLabel icon={step.icon}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isDark ? '#fff' : 'text.primary' }}>{step.label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      {/* Mission/Tagline */}
      <Container maxWidth="md" sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="body1" sx={{ fontSize: 18, maxWidth: 700, mx: 'auto', color: isDark ? '#e0e0e0' : 'text.secondary' }}>
          Blood Donation Platform is a modern, secure, and user-friendly system for managing blood donations, requests, and community engagement. Together, we can save lives—one donation at a time.
        </Typography>
      </Container>
    </Box>
  );
} 