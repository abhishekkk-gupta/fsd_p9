import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";

const COLUMNS = ["To Do", "In Progress", "Done"];
const COL_COLORS = { "To Do": "#f59f00", "In Progress": "#1c7ed6", "Done": "#2f9e44" };

export default function TaskBoard() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const load = () => API.get(`/projects/${id}/tasks`).then(r => setTasks(r.data));
  useEffect(() => {
    load();
    API.get(`/projects/${id}`).then(r => setProject(r.data));
  }, [id]);

  const handleDragStart = (task) => setDragging(task);
  const handleDragOver = (e, col) => { e.preventDefault(); setDragOver(col); };

  const handleDrop = async (col) => {
    if (!dragging || dragging.status === col) { setDragging(null); setDragOver(null); return; }
    await API.patch(`/tasks/${dragging.id}/status`, { status: col });
    setDragging(null);
    setDragOver(null);
    load();
  };

  const tasksByCol = (col) => tasks.filter(t => t.status === col);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <Link to={`/projects/${id}`} style={styles.back}>← Back to Tasks</Link>
          <h2 style={{marginBottom:4}}>{project?.title} — Kanban Board</h2>
          <p style={{color:"#666", fontSize:"13px", margin:0}}>Drag & drop tasks between columns</p>
        </div>
      </div>

      <div style={styles.board}>
        {COLUMNS.map(col => (
          <div key={col}
            style={{ ...styles.column, background: dragOver === col ? "#e7f5ff" : "#f8f9fa",
                     outline: dragOver === col ? "2px dashed #1c7ed6" : "none" }}
            onDragOver={e => handleDragOver(e, col)}
            onDrop={() => handleDrop(col)}
            onDragLeave={() => setDragOver(null)}
          >
            <div style={styles.colHeader}>
              <span style={{ ...styles.colDot, background: COL_COLORS[col] }}></span>
              <strong>{col}</strong>
              <span style={styles.count}>{tasksByCol(col).length}</span>
            </div>
            <div style={styles.colBody}>
              {tasksByCol(col).map(task => (
                <div key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  style={{ ...styles.taskCard,
                    opacity: dragging?.id === task.id ? 0.5 : 1,
                    cursor: "grab" }}
                >
                  <div style={styles.taskTitle}>{task.title}</div>
                  {task.description && (
                    <div style={styles.taskDesc}>{task.description}</div>
                  )}
                  <div style={styles.taskMeta}>
                    <span>👤 {task.assigned_name || "Unassigned"}</span>
                    {task.due_date && <span>📅 {task.due_date}</span>}
                  </div>
                </div>
              ))}
              {tasksByCol(col).length === 0 && (
                <div style={styles.empty}>Drop here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding:"2rem", maxWidth:"1200px", margin:"0 auto" },
  header: { marginBottom:"1.5rem" },
  back: { color:"#3b5bdb", textDecoration:"none", fontSize:"13px" },
  board: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem", minHeight:"70vh" },
  column: { borderRadius:"12px", padding:"1rem", transition:"all 0.15s" },
  colHeader: { display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" },
  colDot: { width:"10px", height:"10px", borderRadius:"50%", display:"inline-block" },
  count: { background:"#dee2e6", padding:"2px 8px", borderRadius:"10px", fontSize:"12px", marginLeft:"auto" },
  colBody: { display:"flex", flexDirection:"column", gap:"10px", minHeight:"200px" },
  taskCard: { background:"#fff", borderRadius:"10px", padding:"12px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.08)", transition:"box-shadow 0.15s" },
  taskTitle: { fontWeight:"600", fontSize:"14px", marginBottom:"4px" },
  taskDesc: { fontSize:"12px", color:"#666", marginBottom:"6px" },
  taskMeta: { fontSize:"11px", color:"#868e96", display:"flex", gap:"10px", flexWrap:"wrap" },
  empty: { border:"2px dashed #dee2e6", borderRadius:"8px", padding:"1rem",
           textAlign:"center", color:"#adb5bd", fontSize:"13px" }
};