import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const username = localStorage.getItem('username') || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navbar stays on top */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ marginLeft: '240px', padding: '20px', width: '100%' }}>
        <Outlet /> {/* Nested route content renders here */}
      </div>
    </div>
  );
}
