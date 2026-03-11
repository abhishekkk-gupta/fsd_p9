import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProjectList from "./components/ProjectList";
import ProjectDetail from "./components/ProjectDetail";
import TaskBoard from "./components/TaskBoard";
import CalendarView from "./components/CalendarView";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Navbar />
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/projects" element={
          <PrivateRoute>
            <Navbar />
            <ProjectList />
          </PrivateRoute>
        } />
        <Route path="/projects/:id" element={
          <PrivateRoute>
            <Navbar />
            <ProjectDetail />
          </PrivateRoute>
        } />
        <Route path="/projects/:id/board" element={
          <PrivateRoute>
            <Navbar />
            <TaskBoard />
          </PrivateRoute>
        } />
        <Route path="/calendar" element={
          <PrivateRoute>
            <Navbar />
            <CalendarView />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Navbar />
            <Profile />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;