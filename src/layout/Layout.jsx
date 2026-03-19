import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'transparent',
      }}
    >
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          px: { xs: 1.5, md: 3 },
          py: { xs: 1.5, md: 2.5 },
          bgcolor: 'transparent',
          background:
            'radial-gradient(circle at top right, rgba(37, 99, 235, 0.10), transparent 22%), radial-gradient(circle at 20% 20%, rgba(20, 184, 166, 0.08), transparent 24%)',
          transition: 'margin 0.3s ease',
        }}
      >
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 0.5,
              py: 0.5,
              mb: 1,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backdropFilter: 'blur(14px)',
            }}
          >
            <IconButton
              onClick={() => setMobileNavOpen(true)}
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.9)',
                color: '#f8fafc',
                '&:hover': {
                  bgcolor: 'rgba(15, 23, 42, 0.96)',
                },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              Mock Dashboard
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            minHeight: '100%',
            borderRadius: { xs: 0, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
