import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ username }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <Link
          style={location.pathname === "/" ? styles.activeLink : styles.link}
          to="/"
        >
          All Mocks
        </Link>
        <Link
          style={
            location.pathname === "/create" ? styles.activeLink : styles.link
          }
          to="/create"
        >
          Create Mock
        </Link>
      </div>
      <div style={styles.right}>
        <span style={styles.username}>{username}</span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#1f2937",
    color: "#fff",
  },
  left: { display: "flex", gap: "20px" },
  link: { color: "#fff", textDecoration: "none", fontWeight: "bold" },
  activeLink: {
    color: "#3b82f6",
    textDecoration: "underline",
    fontWeight: "bold",
  },
  right: { display: "flex", alignItems: "center", gap: "10px" },
  username: { fontWeight: "bold" },
  logoutBtn: {
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#fff",
  },
};
