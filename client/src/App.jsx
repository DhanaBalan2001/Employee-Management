import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import Projects from './pages/Projects.jsx';
import Timesheets from './pages/Timesheets.jsx';
import Users from './pages/Users.jsx';
import MyProfile from './pages/MyProfile.jsx';
import Reports from './pages/Reports.jsx';
import Automation from './pages/Automation.jsx';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            {(() => {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              return user.role === 'Employee' ? <Navigate to="/employees/own" /> : <Navigate to="/dashboard" />;
            })()
            }
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute>
            <Layout><Employees /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Layout><Projects /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/timesheets" element={
          <ProtectedRoute>
            <Layout><Timesheets /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Layout><Users /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/automation" element={
          <ProtectedRoute>
            <Layout><Automation /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/employees/own" element={
          <ProtectedRoute>
            <Layout><MyProfile /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;