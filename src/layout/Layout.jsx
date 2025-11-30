import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, bgcolor: '#1f2937', color: '#fff' }}>
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>{children}</Box>
    </Box>
  );
}
