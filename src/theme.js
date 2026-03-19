import { alpha, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
      light: '#14b8a6',
      dark: '#115e59',
    },
    secondary: {
      main: '#1d4ed8',
      light: '#60a5fa',
      dark: '#1e3a8a',
    },
    background: {
      default: '#edf3f8',
      paper: 'rgba(255, 255, 255, 0.82)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: 'rgba(148, 163, 184, 0.18)',
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    h5: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
        },
        body: {
          minHeight: '100%',
          margin: 0,
          background:
            'radial-gradient(circle at top left, rgba(20, 184, 166, 0.10), transparent 24%), radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 28%), linear-gradient(180deg, #f8fbfd 0%, #edf3f8 100%)',
          color: '#0f172a',
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          background: alpha('#64748b', 0.28),
          borderRadius: 999,
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: alpha('#475569', 0.42),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
