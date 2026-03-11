import React, { useEffect, useState } from "react";
import API from "../api";

export default function Comments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = () => API.get(`/tasks/${taskId}/comments`).then(r => setComments(r.data));
  useEffect(() => { load(); }, [taskId]);

  const post = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await API.post(`/tasks/${taskId}/comments`, { comment: text });
    setText("");
    load();
  };

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      <div style={styles.divider}></div>
      <strong style={styles.title}>💬 Comments ({comments.length})</strong>
      <div style={styles.list}>
        {comments.map(c => (
          <div key={c.id} style={styles.comment}>
            <div style={styles.avatar}>{c.username?.[0]?.toUpperCase()}</div>
            <div style={styles.bubble}>
              <div style={styles.commentHeader}>
                <strong style={styles.uname}>{c.username}</strong>
                <span style={styles.time}>{timeAgo(c.created_at)}</span>
              </div>
              <div style={styles.text}>{c.comment}</div>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p style={styles.empty}>No comments yet. Be the first!</p>}
      </div>
      <form onSubmit={post} style={styles.form}>
        <div style={styles.avatar}>{user.username?.[0]?.toUpperCase()}</div>
        <input style={styles.input} placeholder="Write a comment..."
          value={text} onChange={e => setText(e.target.value)} />
        <button style={styles.btn} type="submit">Post</button>
      </form>
    </div>
  );
}

const styles = {
  container: { marginTop:"12px", padding:"12px 0 0" },
  divider: { borderTop:"1px solid #f1f3f5", marginBottom:"10px" },
  title: { fontSize:"13px", color:"#555" },
  list: { marginTop:"10px", display:"flex", flexDirection:"column", gap:"8px" },
  comment: { display:"flex", gap:"8px", alignItems:"flex-start" },
  avatar: { width:"28px", height:"28px", borderRadius:"50%", background:"#3b5bdb",
            color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"12px", fontWeight:"bold", flexShrink:0 },
  bubble: { background:"#f8f9fa", borderRadius:"10px", padding:"8px 12px", flex:1 },
  commentHeader: { display:"flex", justifyContent:"space-between", marginBottom:"4px" },
  uname: { fontSize:"12px", color:"#212529" },
  time: { fontSize:"11px", color:"#adb5bd" },
  text: { fontSize:"13px", color:"#333" },
  empty: { color:"#adb5bd", fontSize:"13px" },
  form: { display:"flex", gap:"8px", alignItems:"center", marginTop:"10px" },
  input: { flex:1, padding:"7px 12px", border:"1px solid #dee2e6", borderRadius:"20px",
           fontSize:"13px", outline:"none" },
  btn: { background:"#3b5bdb", color:"#fff", border:"none", padding:"7px 14px",
         borderRadius:"20px", cursor:"pointer", fontSize:"13px" }
};