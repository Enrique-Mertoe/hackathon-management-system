import { createTheme } from '@mui/material/styles'

// Create MUI theme with orange primary color matching globals.css
export const theme = createTheme({
  palette: {
    primary: {
      main: '#ea580c', // Orange-600 from globals.css
      dark: '#c2410c', // Orange-700
      light: '#f97316', // Orange-500 (used in dark mode)
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#fed7aa', // Orange-200 from globals.css
      dark: '#9a3412', // Orange-800
      light: '#ffedd5', // Orange-100
      contrastText: '#9a3412',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#171717',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: '#ea580c',
          '&:hover': {
            backgroundColor: '#c2410c',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#ea580c',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ea580c',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ea580c',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#ea580c',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#64748b',
          '&.Mui-checked': {
            color: '#ea580c',
          },
        },
      },
    },
  },
})

// Dark theme variant
export const darkTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
    primary: {
      main: '#f97316', // Orange-500 for dark mode
      dark: '#ea580c', // Orange-600
      light: '#fb923c', // Orange-400
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#0f172a',
    },
    text: {
      primary: '#ededed',
      secondary: '#94a3b8',
    },
    divider: '#334155',
  },
})