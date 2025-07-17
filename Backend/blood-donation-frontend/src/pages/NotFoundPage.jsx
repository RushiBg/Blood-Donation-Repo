import { Typography, Button, Box, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box textAlign="center" sx={{ bgcolor: isDark ? 'background.default' : '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h3" gutterBottom sx={{ color: isDark ? '#fff' : 'text.primary' }}>404 - Page Not Found</Typography>
      <Button variant="contained" color="primary" component={Link} to="/" sx={{ color: isDark ? '#fff' : undefined }}>
        Go Home
      </Button>
    </Box>
  );
} 