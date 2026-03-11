from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import sqlite3
import bcrypt
from datetime import datetime

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "pm_secret_key_2024"
jwt = JWTManager(app)
CORS(app)

# ─────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────
def get_db():
    conn = sqlite3.connect("pm.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'member',
            bio TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            owner_id INTEGER,
            archived INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS project_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            user_id INTEGER,
            FOREIGN KEY(project_id) REFERENCES projects(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            status TEXT DEFAULT 'To Do',
            assigned_to INTEGER,
            due_date TEXT,
            archived INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(project_id) REFERENCES projects(id),
            FOREIGN KEY(assigned_to) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            user_id INTEGER,
            comment TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(task_id) REFERENCES tasks(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    """)
    conn.commit()
    conn.close()

# ─────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "member")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    try:
        conn = get_db()
        conn.execute("INSERT INTO users (username, password, role) VALUES (?,?,?)",
                     (username, hashed, role))
        conn.commit()
        conn.close()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "")
    password = data.get("password", "")
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    conn.close()
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401
    token = create_access_token(identity=str(user["id"]))
    return jsonify({
        "access_token": token,
        "user": {"id": user["id"], "username": user["username"], "role": user["role"]}
    })

@app.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    conn = get_db()
    user = conn.execute("SELECT id, username, role, bio, created_at FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(user))

@app.route("/auth/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.json
    conn = get_db()
    conn.execute("UPDATE users SET bio=? WHERE id=?", (data.get("bio", ""), user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Profile updated"})

# ─────────────────────────────────────────
# USER ROUTES
# ─────────────────────────────────────────
@app.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    conn = get_db()
    users = conn.execute("SELECT id, username, role FROM users").fetchall()
    conn.close()
    return jsonify([dict(u) for u in users])

# ─────────────────────────────────────────
# PROJECT ROUTES
# ─────────────────────────────────────────
@app.route("/projects", methods=["GET"])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    conn = get_db()
    projects = conn.execute("""
        SELECT DISTINCT p.*, u.username as owner_name
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_members pm ON pm.project_id = p.id
        WHERE (p.owner_id=? OR pm.user_id=?) AND p.archived=0
    """, (user_id, user_id)).fetchall()
    conn.close()
    return jsonify([dict(p) for p in projects])

@app.route("/projects", methods=["POST"])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.json
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO projects (title, description, owner_id) VALUES (?,?,?)",
        (data["title"], data.get("description", ""), user_id)
    )
    project_id = cur.lastrowid
    # Add owner as member too
    conn.execute("INSERT INTO project_members (project_id, user_id) VALUES (?,?)", (project_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Project created", "id": project_id}), 201

@app.route("/projects/<int:pid>", methods=["GET"])
@jwt_required()
def get_project(pid):
    conn = get_db()
    project = conn.execute("SELECT * FROM projects WHERE id=?", (pid,)).fetchone()
    members = conn.execute("""
        SELECT u.id, u.username FROM users u
        JOIN project_members pm ON pm.user_id = u.id
        WHERE pm.project_id=?
    """, (pid,)).fetchall()
    conn.close()
    if not project:
        return jsonify({"error": "Not found"}), 404
    result = dict(project)
    result["members"] = [dict(m) for m in members]
    return jsonify(result)

@app.route("/projects/<int:pid>", methods=["PUT"])
@jwt_required()
def update_project(pid):
    data = request.json
    conn = get_db()
    conn.execute("UPDATE projects SET title=?, description=? WHERE id=?",
                 (data["title"], data.get("description", ""), pid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Project updated"})

@app.route("/projects/<int:pid>/archive", methods=["PUT"])
@jwt_required()
def archive_project(pid):
    conn = get_db()
    conn.execute("UPDATE projects SET archived=1 WHERE id=?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Project archived"})

@app.route("/projects/<int:pid>/members", methods=["POST"])
@jwt_required()
def add_member(pid):
    data = request.json
    conn = get_db()
    existing = conn.execute("SELECT * FROM project_members WHERE project_id=? AND user_id=?",
                            (pid, data["user_id"])).fetchone()
    if not existing:
        conn.execute("INSERT INTO project_members (project_id, user_id) VALUES (?,?)",
                     (pid, data["user_id"]))
        conn.commit()
    conn.close()
    return jsonify({"message": "Member added"})

# ─────────────────────────────────────────
# TASK ROUTES
# ─────────────────────────────────────────
@app.route("/projects/<int:pid>/tasks", methods=["GET"])
@jwt_required()
def get_tasks(pid):
    conn = get_db()
    tasks = conn.execute("""
        SELECT t.*, u.username as assigned_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.project_id=? AND t.archived=0
        ORDER BY t.created_at DESC
    """, (pid,)).fetchall()
    conn.close()
    return jsonify([dict(t) for t in tasks])

@app.route("/tasks/all", methods=["GET"])
@jwt_required()
def get_all_tasks():
    user_id = get_jwt_identity()
    conn = get_db()
    tasks = conn.execute("""
        SELECT t.*, u.username as assigned_name, p.title as project_title
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_to=? AND t.archived=0
    """, (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(t) for t in tasks])

@app.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    data = request.json
    conn = get_db()
    cur = conn.execute("""
        INSERT INTO tasks (project_id, title, description, status, assigned_to, due_date)
        VALUES (?,?,?,?,?,?)
    """, (data["project_id"], data["title"], data.get("description", ""),
          data.get("status", "To Do"), data.get("assigned_to"), data.get("due_date")))
    task_id = cur.lastrowid
    conn.commit()
    conn.close()
    return jsonify({"message": "Task created", "id": task_id}), 201

@app.route("/tasks/<int:tid>", methods=["PUT"])
@jwt_required()
def update_task(tid):
    data = request.json
    conn = get_db()
    conn.execute("""
        UPDATE tasks SET title=?, description=?, status=?, assigned_to=?, due_date=?
        WHERE id=?
    """, (data["title"], data.get("description", ""), data["status"],
          data.get("assigned_to"), data.get("due_date"), tid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Task updated"})

@app.route("/tasks/<int:tid>/status", methods=["PATCH"])
@jwt_required()
def update_task_status(tid):
    data = request.json
    conn = get_db()
    conn.execute("UPDATE tasks SET status=? WHERE id=?", (data["status"], tid))
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated"})

@app.route("/tasks/<int:tid>/archive", methods=["PUT"])
@jwt_required()
def archive_task(tid):
    conn = get_db()
    conn.execute("UPDATE tasks SET archived=1 WHERE id=?", (tid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Task archived"})

@app.route("/tasks/<int:tid>", methods=["DELETE"])
@jwt_required()
def delete_task(tid):
    conn = get_db()
    conn.execute("DELETE FROM tasks WHERE id=?", (tid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Task deleted"})

# ─────────────────────────────────────────
# COMMENT ROUTES
# ─────────────────────────────────────────
@app.route("/tasks/<int:tid>/comments", methods=["GET"])
@jwt_required()
def get_comments(tid):
    conn = get_db()
    comments = conn.execute("""
        SELECT c.*, u.username FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id=?
        ORDER BY c.created_at ASC
    """, (tid,)).fetchall()
    conn.close()
    return jsonify([dict(c) for c in comments])

@app.route("/tasks/<int:tid>/comments", methods=["POST"])
@jwt_required()
def add_comment(tid):
    user_id = get_jwt_identity()
    data = request.json
    conn = get_db()
    conn.execute("INSERT INTO comments (task_id, user_id, comment) VALUES (?,?,?)",
                 (tid, user_id, data["comment"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Comment added"}), 201

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)