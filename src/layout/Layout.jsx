import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Layout() {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'transparent',
      }}
    >
      <Sidebar />

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
