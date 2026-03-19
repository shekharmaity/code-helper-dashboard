import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/code-helper-dashboard/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
  },
}));
