import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import Comments from "./Comments";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title:"", description:"", assigned_to:"", due_date:"", status:"To Do" });
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addMember, setAddMember] = useState("");

  const loadTasks = () => API.get(`/projects/${id}/tasks`).then(r => setTasks(r.data));

  useEffect(() => {
    API.get(`/projects/${id}`).then(r => setProject(r.data));
    API.get("/users").then(r => setUsers(r.data));
    loadTasks();
  }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    await API.post("/tasks", { ...form, project_id: parseInt(id) });
    setForm({ title:"", description:"", assigned_to:"", due_date:"", status:"To Do" });
    setShowForm(false);
    loadTasks();
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    await API.put(`/tasks/${editTask.id}`, editTask);
    setEditTask(null);
    loadTasks();
  };

  const archiveTask = async (tid) => {
    await API.put(`/tasks/${tid}/archive`);
    loadTasks();
  };

  const handleAddMember = async () => {
    if (!addMember) return;
    await API.post(`/projects/${id}/members`, { user_id: parseInt(addMember) });
    setAddMember("");
    API.get(`/projects/${id}`).then(r => setProject(r.data));
  };

  if (!project) return <div style={{padding:"2rem"}}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2>{project.title}</h2>
          <p style={styles.desc}>{project.description}</p>
        </div>
        <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {/* Members */}
      <div style={styles.section}>
        <strong>👥 Members: </strong>
        {project.members?.map(m => (
          <span key={m.id} style={styles.memberTag}>{m.username}</span>
        ))}
        <select style={styles.smallSelect} value={addMember}
          onChange={e => setAddMember(e.target.value)}>
          <option value="">+ Add member</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
        {addMember && <button style={styles.smallBtn} onClick={handleAddMember}>Add</button>}
      </div>

      {/* Task Form */}
      {showForm && (
        <form onSubmit={createTask} style={styles.form}>
          <h4 style={{marginTop:0}}>Create New Task</h4>
          <input style={styles.input} placeholder="Task title *" required
            value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea style={{...styles.input, height:"60px"}} placeholder="Description"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div style={styles.row}>
            <select style={styles.input} value={form.assigned_to}
              onChange={e => setForm({...form, assigned_to: e.target.value})}>
              <option value="">Assign to...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <input style={styles.input} type="date" value={form.due_date}
              onChange={e => setForm({...form, due_date: e.target.value})} />
            <select style={styles.input} value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <button style={styles.btn} type="submit">Create Task</button>
        </form>
      )}

      {/* Edit Modal */}
      {editTask && (
        <div style={styles.overlay}>
          <form onSubmit={saveEdit} style={styles.modal}>
            <h4>Edit Task</h4>
            <input style={styles.input} value={editTask.title}
              onChange={e => setEditTask({...editTask, title: e.target.value})} />
            <textarea style={{...styles.input, height:"60px"}} value={editTask.description}
              onChange={e => setEditTask({...editTask, description: e.target.value})} />
            <select style={styles.input} value={editTask.assigned_to || ""}
              onChange={e => setEditTask({...editTask, assigned_to: e.target.value})}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <input type="date" style={styles.input} value={editTask.due_date || ""}
              onChange={e => setEditTask({...editTask, due_date: e.target.value})} />
            <select style={styles.input} value={editTask.status}
              onChange={e => setEditTask({...editTask, status: e.target.value})}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
            <div style={{display:"flex", gap:"8px"}}>
              <button style={styles.btn} type="submit">Save</button>
              <button style={styles.cancelBtn} type="button" onClick={() => setEditTask(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Task List */}
      <div style={styles.taskList}>
        {tasks.map(t => (
          <div key={t.id} style={styles.taskCard}>
            <div style={styles.taskTop}>
              <div>
                <strong>{t.title}</strong>
                <span style={{...styles.statusBadge, background: statusColor(t.status)}}>{t.status}</span>
              </div>
              <div style={{display:"flex", gap:"6px"}}>
                <button style={styles.iconBtn} onClick={() => setSelectedTask(selectedTask?.id === t.id ? null : t)}>
                  💬
                </button>
                <button style={styles.iconBtn} onClick={() => setEditTask({...t})}>✏️</button>
                <button style={styles.iconBtn} onClick={() => archiveTask(t.id)}>🗃</button>
              </div>
            </div>
            <div style={styles.taskMeta}>
              {t.description && <p style={{margin:"4px 0", color:"#555", fontSize:"13px"}}>{t.description}</p>}
              <span style={styles.meta}>👤 {t.assigned_name || "Unassigned"}</span>
              {t.due_date && <span style={styles.meta}>📅 {t.due_date}</span>}
            </div>
            {selectedTask?.id === t.id && <Comments taskId={t.id} />}
          </div>
        ))}
        {tasks.length === 0 && <p style={{color:"#999"}}>No tasks yet.</p>}
      </div>
    </div>
  );
}

function statusColor(s) {
  return s === "Done" ? "#2f9e44" : s === "In Progress" ? "#1c7ed6" : "#f59f00";
}

const styles = {
  page: { padding:"2rem", maxWidth:"900px", margin:"0 auto" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" },
  desc: { color:"#666", fontSize:"13px", margin:0 },
  btn: { background:"#3b5bdb", color:"#fff", border:"none", padding:"8px 18px",
         borderRadius:"8px", cursor:"pointer", fontSize:"14px" },
  cancelBtn: { background:"#f1f3f5", color:"#333", border:"none", padding:"8px 18px",
               borderRadius:"8px", cursor:"pointer" },
  section: { marginBottom:"1rem", fontSize:"14px" },
  memberTag: { background:"#e7f5ff", color:"#1c7ed6", padding:"2px 8px",
               borderRadius:"10px", fontSize:"12px", marginRight:"6px" },
  smallSelect: { padding:"4px 8px", borderRadius:"6px", border:"1px solid #ddd", fontSize:"12px" },
  smallBtn: { background:"#3b5bdb", color:"#fff", border:"none", padding:"4px 10px",
              borderRadius:"6px", cursor:"pointer", fontSize:"12px", marginLeft:"6px" },
  form: { background:"#fff", padding:"1.5rem", borderRadius:"10px",
          boxShadow:"0 2px 8px rgba(0,0,0,0.08)", marginBottom:"1.5rem" },
  input: { display:"block", width:"100%", padding:"8px 10px", marginBottom:"8px",
           border:"1px solid #ddd", borderRadius:"7px", fontSize:"13px", boxSizing:"border-box" },
  row: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" },
  taskList: { display:"flex", flexDirection:"column", gap:"10px" },
  taskCard: { background:"#fff", borderRadius:"10px", padding:"1rem",
              boxShadow:"0 2px 8px rgba(0,0,0,0.07)" },
  taskTop: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  taskMeta: { display:"flex", gap:"12px", flexWrap:"wrap", marginTop:"6px" },
  statusBadge: { color:"#fff", padding:"2px 10px", borderRadius:"12px",
                 fontSize:"11px", marginLeft:"8px" },
  meta: { fontSize:"12px", color:"#666" },
  iconBtn: { background:"none", border:"none", cursor:"pointer", fontSize:"16px", padding:"2px" },
  overlay: { position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)",
             display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 },
  modal: { background:"#fff", padding:"1.5rem", borderRadius:"12px", width:"420px",
           boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }
};