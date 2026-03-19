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
        bgcolor: '#e2e8f0',
      }}
    >
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1.5, md: 2 },
          bgcolor: '#eef2f7',
          background:
            'radial-gradient(circle at top right, rgba(148, 163, 184, 0.18), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
          transition: 'margin 0.3s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
