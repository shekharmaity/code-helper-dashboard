import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ username }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>Mock Dashboard</div>

      <nav style={styles.navContainer}>
        <Link to="/" style={location.pathname === '/' ? styles.activeLink : styles.link}>
          📄 All Mocks
        </Link>

        <Link
          to="/create"
          style={location.pathname === '/create' ? styles.activeLink : styles.link}
        >
          ➕ Create Mock
        </Link>
      </nav>

      {/* <div style={styles.footer}>
        <div style={styles.username}>{username}</div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div> */}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    backgroundColor: '#1f2937',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 15px',
    position: 'fixed',
    left: 0,
    top: 0,
  },

  header: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
  },

  navContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flex: 1,
  },

  link: {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '10px 12px',
    borderRadius: '8px',
    transition: '0.2s',
  },

  activeLink: {
    backgroundColor: '#374151',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontWeight: 'bold',
  },

  footer: {
    borderTop: '1px solid #374151',
    paddingTop: '15px',
  },

  username: {
    marginBottom: '10px',
    fontWeight: 'bold',
    color: '#93c5fd',
  },

  logoutBtn: {
    width: '100%',
    padding: '8px 10px',
    cursor: 'pointer',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontWeight: 'bold',
  },
};
