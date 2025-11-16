import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  const username = localStorage.getItem("username") || "User";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navbar stays on top */}
      <Navbar username={username} />

      {/* Main content area */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Outlet /> {/* Nested route content renders here */}
      </div>
    </div>
  );
}
