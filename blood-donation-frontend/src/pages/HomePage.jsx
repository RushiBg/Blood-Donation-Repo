import { Typography, Button, Box, Grid, Paper, Divider, Container, Stepper, Step, StepLabel, useTheme, Card, CardContent, Chip, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventIcon from '@mui/icons-material/Event';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const features = [
  {
    icon: <VolunteerActivismIcon sx={{ fontSize: 40, color: '#e74c3c' }} />, 
    title: 'Easy Blood Requests',
    desc: 'Request blood or donate with just a few clicks. Our platform connects donors and recipients efficiently.',
    color: '#e74c3c'
  },
  {
    icon: <EventIcon sx={{ fontSize: 40, color: '#e74c3c' }} />, 
    title: 'Appointment Scheduling',
    desc: 'Book, reschedule, and manage your donation appointments with reminders and calendar integration.',
    color: '#e74c3c'
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 40, color: '#27ae60' }} />, 
    title: 'Secure & Verified',
    desc: 'Your data is protected. Only verified users and admins can access sensitive features.',
    color: '#27ae60'
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#f39c12' }} />, 
    title: 'Leaderboard & Badges',
    desc: 'Earn badges and climb the leaderboard as you donate more. Get recognized for your impact!',
    color: '#f39c12'
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 40, color: '#9b59b6' }} />, 
    title: 'AI Health Screening',
    desc: 'Advanced AI-powered health assessment to ensure your safety and eligibility for blood donation.',
    color: '#9b59b6'
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: '#e67e22' }} />, 
    title: 'Smart Matching',
    desc: 'Intelligent donor-recipient matching using AI algorithms for optimal compatibility and efficiency.',
    color: '#e67e22'
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
          minHeight: { xs: 400, md: 500 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 50%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #e74c3c 100%)',
          position: 'relative',
          py: { xs: 8, md: 12 },
          borderRadius: { xs: 0, md: 3 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
                mb: 2,
              }}
            >
              <BloodtypeIcon sx={{ fontSize: 60, color: '#fff' }} />
            </Avatar>
          </Box>
          
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#fff', 
              letterSpacing: 2, 
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            Donate Blood, Save Lives
          </Typography>
          
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: 6, 
              fontWeight: 400,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join our community and make a real difference today with AI-powered blood donation platform.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              component={Link}
              to="/login"
              size="large"
              sx={{ 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                px: 6, 
                py: 2, 
                borderRadius: 3,
                background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c0392b, #a93226)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(231, 76, 60, 0.4)',
                }
              }}
            >
              Get Started
            </Button>
            
            <Button
              variant="outlined"
              component={Link}
              to="/dashboard"
              size="large"
              sx={{ 
                fontWeight: 600, 
                fontSize: '1.1rem', 
                px: 6, 
                py: 2, 
                borderRadius: 3,
                borderColor: 'rgba(231,76,60,0.5)',
                color: '#fff',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: 'rgba(231,76,60,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 }, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip 
            label="AI-Powered Features" 
            color="primary" 
            sx={{ mb: 2, px: 2, py: 1, fontSize: '0.9rem' }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, color: isDark ? '#fff' : 'text.primary' }}>
            Why Choose Our Platform?
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Experience the future of blood donation with cutting-edge AI technology and seamless user experience.
          </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center">
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: `1px solid ${isDark ? '#2c3e50' : '#ecf0f1'}`,
                  background: isDark ? 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    borderColor: f.color,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${f.color}20, ${f.color}40)`,
                      mx: 'auto',
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#fff' : 'text.primary' }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
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