import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.logoLink}>🗂 ProjectFlow</Link>
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>
        <Link to="/calendar" style={styles.link}>📅 Calendar</Link>
        <Link to="/profile" style={styles.link}>👤 {user.username}</Link>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background:"#3b5bdb", color:"#fff", display:"flex", justifyContent:"space-between",
         alignItems:"center", padding:"0 2rem", height:"56px", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" },
  logo: { fontWeight:"bold", fontSize:"18px" },
  logoLink: { color:"#fff", textDecoration:"none" },
  links: { display:"flex", alignItems:"center", gap:"1.2rem" },
  link: { color:"#d0d8ff", textDecoration:"none", fontSize:"14px" },
  logoutBtn: { background:"rgba(255,255,255,0.2)", border:"none", color:"#fff",
               padding:"6px 14px", borderRadius:"6px", cursor:"pointer", fontSize:"13px" }
};