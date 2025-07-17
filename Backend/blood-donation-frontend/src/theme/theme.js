import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#d32f2f', // blood red
      },
      secondary: {
        main: '#1976d2',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
  }); 