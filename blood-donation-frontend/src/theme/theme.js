import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#e74c3c', // Blood red
        light: '#ff6b6b',
        dark: '#c0392b',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#3498db', // Blue
        light: '#5dade2',
        dark: '#2980b9',
        contrastText: '#ffffff',
      },
      success: {
        main: '#27ae60', // Green
        light: '#58d68d',
        dark: '#1e8449',
      },
      warning: {
        main: '#f39c12', // Orange
        light: '#f7dc6f',
        dark: '#d68910',
      },
      error: {
        main: '#e74c3c', // Red
        light: '#ec7063',
        dark: '#c0392b',
      },
      info: {
        main: '#3498db', // Blue
        light: '#5dade2',
        dark: '#2980b9',
      },
      background: {
        default: mode === 'dark' ? '#0a0a0a' : '#f8fafc',
        paper: mode === 'dark' ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#2c3e50',
        secondary: mode === 'dark' ? '#bdc3c7' : '#7f8c8d',
      },
      divider: mode === 'dark' ? '#2c3e50' : '#ecf0f1',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark' 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,0,0,0.08)',
            border: mode === 'dark' ? '1px solid #2c3e50' : '1px solid #ecf0f1',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark' 
                ? '0 8px 30px rgba(0,0,0,0.4)' 
                : '0 8px 30px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'dark' 
              ? '0 2px 10px rgba(0,0,0,0.2)' 
              : '0 2px 10px rgba(0,0,0,0.05)',
          },
          elevation1: {
            boxShadow: mode === 'dark' 
              ? '0 2px 8px rgba(0,0,0,0.15)' 
              : '0 2px 8px rgba(0,0,0,0.06)',
          },
          elevation2: {
            boxShadow: mode === 'dark' 
              ? '0 4px 12px rgba(0,0,0,0.2)' 
              : '0 4px 12px rgba(0,0,0,0.08)',
          },
          elevation3: {
            boxShadow: mode === 'dark' 
              ? '0 6px 16px rgba(0,0,0,0.25)' 
              : '0 6px 16px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? '#3498db' : '#e74c3c',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? '#3498db' : '#e74c3c',
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: mode === 'dark' 
              ? '0 10px 40px rgba(0,0,0,0.5)' 
              : '0 10px 40px rgba(0,0,0,0.15)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark' 
              ? '0 2px 10px rgba(0,0,0,0.3)' 
              : '0 2px 10px rgba(0,0,0,0.1)',
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 2,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.875rem',
            minHeight: 48,
            '&.Mui-selected': {
              color: mode === 'dark' ? '#3498db' : '#e74c3c',
            },
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            borderRadius: 12,
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${mode === 'dark' ? '#2c3e50' : '#ecf0f1'}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: mode === 'dark' ? '#2c3e50' : '#f8fafc',
              borderBottom: `2px solid ${mode === 'dark' ? '#34495e' : '#e9ecef'}`,
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark' 
              ? '0 2px 8px rgba(0,0,0,0.3)' 
              : '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: mode === 'dark' ? '#2c3e50' : '#ecf0f1',
          },
          bar: {
            borderRadius: 4,
          },
        },
      },
    },
  }); 