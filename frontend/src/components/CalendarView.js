import React, { useEffect, useState } from "react";
import API from "../api";

export default function CalendarView() {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    API.get("/tasks/all").then(r => setTasks(r.data));
  }, []);

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });

  const tasksByDate = {};
  tasks.forEach(t => {
    if (t.due_date) {
      tasksByDate[t.due_date] = tasksByDate[t.due_date] || [];
      tasksByDate[t.due_date].push(t);
    }
  });

  const pad = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const today = new Date();
  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>📅 Task Calendar</h2>
        <div style={styles.nav}>
          <button style={styles.navBtn} onClick={() => setDate(new Date(year, month - 1, 1))}>‹</button>
          <span style={styles.month}>{monthName}</span>
          <button style={styles.navBtn} onClick={() => setDate(new Date(year, month + 1, 1))}>›</button>
        </div>
      </div>

      <div style={styles.grid}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} style={styles.dayHeader}>{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} style={styles.empty}></div>)}
        {Array.from({length: daysInMonth}, (_, i) => i + 1).map(day => {
          const key = pad(day);
          const dayTasks = tasksByDate[key] || [];
          return (
            <div key={day} style={{ ...styles.cell, background: isToday(day) ? "#ebf4ff" : "#fff",
              border: isToday(day) ? "2px solid #3b5bdb" : "1px solid #f1f3f5" }}>
              <div style={{ ...styles.dayNum, color: isToday(day) ? "#3b5bdb" : "#333",
                fontWeight: isToday(day) ? "bold" : "normal" }}>{day}</div>
              {dayTasks.slice(0,3).map(t => (
                <div key={t.id} style={{
                  ...styles.taskPill,
                  background: t.status === "Done" ? "#d3f9d8" : t.status === "In Progress" ? "#d0ebff" : "#fff3bf",
                  color: t.status === "Done" ? "#2f9e44" : t.status === "In Progress" ? "#1c7ed6" : "#e67700"
                }}>
                  {t.title.length > 14 ? t.title.slice(0, 14) + "…" : t.title}
                </div>
              ))}
              {dayTasks.length > 3 && <div style={styles.more}>+{dayTasks.length - 3} more</div>}
            </div>
          );
        })}
      </div>

      <div style={styles.legend}>
        <span style={{...styles.pill, background:"#fff3bf", color:"#e67700"}}>To Do</span>
        <span style={{...styles.pill, background:"#d0ebff", color:"#1c7ed6"}}>In Progress</span>
        <span style={{...styles.pill, background:"#d3f9d8", color:"#2f9e44"}}>Done</span>
      </div>
    </div>
  );
}

const styles = {
  page: { padding:"2rem", maxWidth:"1100px", margin:"0 auto" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" },
  nav: { display:"flex", alignItems:"center", gap:"1rem" },
  navBtn: { background:"#e7f5ff", border:"none", borderRadius:"6px", padding:"6px 14px",
            cursor:"pointer", fontSize:"18px", color:"#1c7ed6" },
  month: { fontWeight:"bold", fontSize:"16px", minWidth:"180px", textAlign:"center" },
  grid: { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px" },
  dayHeader: { textAlign:"center", fontWeight:"600", fontSize:"12px", color:"#868e96",
               padding:"8px 0", background:"#f8f9fa", borderRadius:"4px" },
  empty: { background:"transparent" },
  cell: { minHeight:"90px", borderRadius:"8px", padding:"6px", boxSizing:"border-box" },
  dayNum: { fontSize:"13px", marginBottom:"4px" },
  taskPill: { fontSize:"11px", padding:"2px 6px", borderRadius:"4px",
              marginBottom:"2px", overflow:"hidden", whiteSpace:"nowrap" },
  more: { fontSize:"10px", color:"#adb5bd", marginTop:"2px" },
  legend: { marginTop:"1rem", display:"flex", gap:"10px", justifyContent:"center" },
  pill: { padding:"3px 12px", borderRadius:"12px", fontSize:"12px" }
};