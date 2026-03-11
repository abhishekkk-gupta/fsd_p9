import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/projects").then(r => setProjects(r.data));
    API.get("/tasks/all").then(r => setMyTasks(r.data));
  }, []);

  const todo = myTasks.filter(t => t.status === "To Do").length;
  const inprog = myTasks.filter(t => t.status === "In Progress").length;
  const done = myTasks.filter(t => t.status === "Done").length;

  return (
    <div style={styles.page}>
      <h2>👋 Welcome back, <span style={{color:"#3b5bdb"}}>{user.username}</span>!</h2>
      <div style={styles.statsRow}>
        <StatCard label="Total Projects" value={projects.length} color="#3b5bdb" />
        <StatCard label="To Do" value={todo} color="#f59f00" />
        <StatCard label="In Progress" value={inprog} color="#1c7ed6" />
        <StatCard label="Done" value={done} color="#2f9e44" />
      </div>

      <h3>📁 My Projects</h3>
      <div style={styles.grid}>
        {projects.slice(0, 6).map(p => (
          <div key={p.id} style={styles.card}>
            <h4>{p.title}</h4>
            <p style={styles.desc}>{p.description || "No description"}</p>
            <div style={styles.cardActions}>
              <Link to={`/projects/${p.id}`} style={styles.btnLink}>View Tasks</Link>
              <Link to={`/projects/${p.id}/board`} style={styles.btnLinkAlt}>Kanban Board</Link>
            </div>
          </div>
        ))}
      </div>

      <h3>📋 My Assigned Tasks</h3>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th>Task</th><th>Project</th><th>Status</th><th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {myTasks.slice(0, 8).map(t => (
            <tr key={t.id} style={styles.tr}>
              <td>{t.title}</td>
              <td>{t.project_title}</td>
              <td><StatusBadge status={t.status} /></td>
              <td>{t.due_date || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.stat, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize:"28px", fontWeight:"bold", color }}>{value}</div>
      <div style={{ color:"#666", fontSize:"13px" }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { "To Do": "#f59f00", "In Progress": "#1c7ed6", "Done": "#2f9e44" };
  return (
    <span style={{ background: colors[status] || "#aaa", color:"#fff",
      padding:"2px 10px", borderRadius:"12px", fontSize:"12px" }}>{status}</span>
  );
}

const styles = {
  page: { padding:"2rem", maxWidth:"1100px", margin:"0 auto" },
  statsRow: { display:"flex", gap:"1rem", marginBottom:"2rem", flexWrap:"wrap" },
  stat: { background:"#fff", borderRadius:"10px", padding:"1.2rem 1.5rem",
          boxShadow:"0 2px 8px rgba(0,0,0,0.08)", flex:"1", minWidth:"140px" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1rem", marginBottom:"2rem" },
  card: { background:"#fff", borderRadius:"10px", padding:"1.2rem",
          boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  desc: { color:"#666", fontSize:"13px", marginBottom:"1rem" },
  cardActions: { display:"flex", gap:"8px" },
  btnLink: { background:"#3b5bdb", color:"#fff", padding:"5px 12px", borderRadius:"6px",
             textDecoration:"none", fontSize:"13px" },
  btnLinkAlt: { background:"#e7f5ff", color:"#1c7ed6", padding:"5px 12px", borderRadius:"6px",
                textDecoration:"none", fontSize:"13px" },
  table: { width:"100%", borderCollapse:"collapse", background:"#fff",
           borderRadius:"10px", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  thead: { background:"#f1f3f5", fontSize:"13px", color:"#555" },
  tr: { borderBottom:"1px solid #f1f3f5", fontSize:"14px" }
};