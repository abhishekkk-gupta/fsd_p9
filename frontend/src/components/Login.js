import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🗂 ProjectFlow</h2>
        <p style={styles.subtitle}>Sign in to your workspace</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Username"
            value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <input style={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button style={styles.btn} type="submit">Login</button>
        </form>
        <p style={styles.link}>Don't have an account? <Link to="/register">Register</Link></p>
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
  link: { textAlign:"center", marginTop:"1rem", color:"#666", fontSize:"14px" }
};