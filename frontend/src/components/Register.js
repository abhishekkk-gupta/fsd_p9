import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", role: "member" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await API.post("/auth/register", form);
      setSuccess("Registered! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🗂 ProjectFlow</h2>
        <p style={styles.subtitle}>Create your account</p>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username"
            value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <input style={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <select style={styles.input} value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button style={styles.btn} type="submit">Register</button>
        </form>
        <p style={styles.link}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#f0f4ff" },
  card: { background:"#fff", padding:"2rem", borderRadius:"12px", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", width:"360px" },
  title: { textAlign:"center", marginBottom:"4px", color:"#3b5bdb" },
  subtitle: { textAlign:"center", color:"#666", marginBottom:"1.5rem" },
  input: { width:"100%", padding:"10px 12px", marginBottom:"12px", border:"1px solid #ddd",
           borderRadius:"8px", fontSize:"14px", boxSizing:"border-box" },
  btn: { width:"100%", padding:"10px", background:"#3b5bdb", color:"#fff", border:"none",
         borderRadius:"8px", fontSize:"15px", cursor:"pointer" },
  error: { background:"#ffe3e3", color:"#c92a2a", padding:"8px 12px", borderRadius:"6px", marginBottom:"12px" },
  success: { background:"#d3f9d8", color:"#2b8a3e", padding:"8px 12px", borderRadius:"6px", marginBottom:"12px" },
  link: { textAlign:"center", marginTop:"1rem", color:"#666", fontSize:"14px" }
};