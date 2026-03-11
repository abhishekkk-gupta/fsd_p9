import React, { useEffect, useState } from "react";
import API from "../api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    API.get("/auth/me").then(r => {
      setProfile(r.data);
      setBio(r.data.bio || "");
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await API.put("/auth/profile", { bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const logout = () => { localStorage.clear(); window.location.href = "/login"; };

  if (!profile) return <div style={{padding:"2rem"}}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.avatar}>{profile.username?.[0]?.toUpperCase()}</div>
        <h2 style={styles.name}>{profile.username}</h2>
        <span style={styles.role}>{profile.role}</span>
        <p style={styles.joined}>Joined: {new Date(profile.created_at).toLocaleDateString()}</p>

        <form onSubmit={save} style={styles.form}>
          <label style={styles.label}>Bio</label>
          <textarea style={styles.textarea} placeholder="Write something about yourself..."
            value={bio} onChange={e => setBio(e.target.value)} />
          <button style={styles.btn} type="submit">Save Profile</button>
          {saved && <span style={styles.saved}>✓ Saved!</span>}
        </form>

        <hr style={{margin:"1.5rem 0", border:"none", borderTop:"1px solid #f1f3f5"}} />
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding:"2rem", display:"flex", justifyContent:"center" },
  card: { background:"#fff", borderRadius:"12px", padding:"2rem",
          boxShadow:"0 2px 12px rgba(0,0,0,0.1)", width:"400px", textAlign:"center" },
  avatar: { width:"80px", height:"80px", borderRadius:"50%", background:"#3b5bdb",
            color:"#fff", fontSize:"32px", fontWeight:"bold",
            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" },
  name: { margin:"0 0 6px", color:"#212529" },
  role: { background:"#e7f5ff", color:"#1c7ed6", padding:"3px 12px",
          borderRadius:"12px", fontSize:"12px" },
  joined: { color:"#868e96", fontSize:"13px", marginTop:"8px" },
  form: { textAlign:"left", marginTop:"1.5rem" },
  label: { fontSize:"13px", color:"#555", fontWeight:"600" },
  textarea: { display:"block", width:"100%", padding:"10px", marginTop:"6px", marginBottom:"10px",
              border:"1px solid #ddd", borderRadius:"8px", fontSize:"13px",
              height:"100px", boxSizing:"border-box", resize:"vertical" },
  btn: { background:"#3b5bdb", color:"#fff", border:"none", padding:"8px 18px",
         borderRadius:"8px", cursor:"pointer", fontSize:"14px" },
  saved: { color:"#2f9e44", marginLeft:"10px", fontSize:"13px" },
  logoutBtn: { background:"#ffe3e3", color:"#c92a2a", border:"none", padding:"8px 18px",
               borderRadius:"8px", cursor:"pointer", fontSize:"14px", width:"100%" }
};