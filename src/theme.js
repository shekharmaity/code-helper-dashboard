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
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
      fontSize: '2.8rem',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
      fontSize: '1.35rem',
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.86rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.86rem',
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
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#0f172a',
        },
        input: {
          color: '#0f172a',
          '::placeholder': {
            color: '#64748b',
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(248, 250, 252, 0.96)',
          color: '#0f172a',
          borderRadius: 12,
          '& fieldset': {
            borderColor: 'rgba(148, 163, 184, 0.24)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(83, 146, 247, 0.36)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3574f0',
            borderWidth: 1,
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(241, 245, 249, 0.92)',
          },
        },
        input: {
          color: '#0f172a',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#475569',
          '&.Mui-focused': {
            color: '#3574f0',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#64748b',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          boxShadow: 'none',
          minHeight: 38,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;
