import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const load = () => API.get("/projects").then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    await API.post("/projects", form);
    setForm({ title: "", description: "" });
    setShowForm(false);
    load();
  };

  const archive = async (id) => {
    if (window.confirm("Archive this project?")) {
      await API.put(`/projects/${id}/archive`);
      load();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>📁 My Projects</h2>
        <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProject} style={styles.form}>
          <input style={styles.input} placeholder="Project title *" required
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea style={{...styles.input, height:"80px"}} placeholder="Description"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <button style={styles.btn} type="submit">Create Project</button>
        </form>
      )}

      <div style={styles.grid}>
        {projects.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardTop}>
              <h3 style={styles.cardTitle}>{p.title}</h3>
              <span style={styles.ownerTag}>by {p.owner_name}</span>
            </div>
            <p style={styles.desc}>{p.description || "No description provided."}</p>
            <div style={styles.actions}>
              <Link to={`/projects/${p.id}`} style={styles.linkBtn}>📋 Tasks</Link>
              <Link to={`/projects/${p.id}/board`} style={styles.linkBtnAlt}>🗃 Board</Link>
              <button style={styles.archiveBtn} onClick={() => archive(p.id)}>Archive</button>
            </div>
          </div>
        ))}
      </div>
      {projects.length === 0 && <p style={{color:"#999", marginTop:"2rem"}}>No projects yet. Create one!</p>}
    </div>
  );
}

const styles = {
  page: { padding:"2rem", maxWidth:"1100px", margin:"0 auto" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" },
  btn: { background:"#3b5bdb", color:"#fff", border:"none", padding:"8px 18px",
         borderRadius:"8px", cursor:"pointer", fontSize:"14px" },
  form: { background:"#fff", padding:"1.5rem", borderRadius:"10px",
          boxShadow:"0 2px 8px rgba(0,0,0,0.08)", marginBottom:"1.5rem" },
  input: { display:"block", width:"100%", padding:"10px 12px", marginBottom:"10px",
           border:"1px solid #ddd", borderRadius:"8px", fontSize:"14px", boxSizing:"border-box" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" },
  card: { background:"#fff", borderRadius:"10px", padding:"1.5rem",
          boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  cardTop: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" },
  cardTitle: { margin:0, color:"#212529" },
  ownerTag: { background:"#e7f5ff", color:"#1c7ed6", padding:"2px 8px",
              borderRadius:"10px", fontSize:"11px" },
  desc: { color:"#666", fontSize:"13px", marginBottom:"1rem" },
  actions: { display:"flex", gap:"8px", flexWrap:"wrap" },
  linkBtn: { background:"#3b5bdb", color:"#fff", padding:"5px 12px",
             borderRadius:"6px", textDecoration:"none", fontSize:"12px" },
  linkBtnAlt: { background:"#e7f5ff", color:"#1c7ed6", padding:"5px 12px",
                borderRadius:"6px", textDecoration:"none", fontSize:"12px" },
  archiveBtn: { background:"#fff3bf", color:"#e67700", border:"none", padding:"5px 12px",
                borderRadius:"6px", cursor:"pointer", fontSize:"12px" }
};