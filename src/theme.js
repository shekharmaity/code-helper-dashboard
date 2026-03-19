import { alpha, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3574f0',
      light: '#5b8cff',
      dark: '#235dcb',
    },
    secondary: {
      main: '#4b5563',
      light: '#6b7280',
      dark: '#374151',
    },
    background: {
      default: '#1f2329',
      paper: 'rgba(43, 49, 59, 0.84)',
    },
    text: {
      primary: '#e6edf3',
      secondary: '#9da7b3',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    button: {
      fontWeight: 600,
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
            'radial-gradient(circle at top left, rgba(83, 146, 247, 0.08), transparent 20%), linear-gradient(180deg, #23272e 0%, #1f2329 100%)',
          color: '#e6edf3',
          fontFamily:
            '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        },
        'code, pre, textarea, input': {
          fontFamily:
            '"SF Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        },
        '::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '::-webkit-scrollbar-track': {
          background: '#1f2329',
        },
        '::-webkit-scrollbar-thumb': {
          background: alpha('#8b949e', 0.34),
          borderRadius: 999,
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: alpha('#adbac7', 0.42),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(14px)',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
        },
      },
    },
  },
});

export default theme;
