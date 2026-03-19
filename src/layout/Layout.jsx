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
            'radial-gradient(circle at top right, rgba(83, 146, 247, 0.08), transparent 18%), linear-gradient(180deg, rgba(43, 49, 59, 0.72) 0%, rgba(31, 35, 41, 0.9) 100%)',
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
                bgcolor: 'rgba(53, 116, 240, 0.16)',
                color: '#dce6f8',
                border: '1px solid rgba(83, 146, 247, 0.28)',
                '&:hover': {
                  bgcolor: 'rgba(53, 116, 240, 0.22)',
                },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: '#e6edf3',
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
