import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      <header className="header">
        <h1>Employee Management System</h1>
        <nav className="nav">
          {(user.role === 'Admin' || user.role === 'Principal') && (
            <Link to="/dashboard">Dashboard</Link>
          )}
          {user.role === 'Employee' && (
            <Link to="/employees/own">My Profile</Link>
          )}
          {(user.role === 'Admin' || user.role === 'Principal') && (
            <Link to="/employees">Employees</Link>
          )}
          {(user.role === 'Admin' || user.role === 'Principal') && (
            <Link to="/projects">Projects</Link>
          )}
          <Link to="/timesheets">Timesheets</Link>
          {(user.role === 'Admin' || user.role === 'Principal') && (
            <Link to="/reports">Reports</Link>
          )}
          {user.role === 'Admin' && <Link to="/automation">Automation</Link>}
          {user.role === 'Admin' && <Link to="/users">Users</Link>}
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </nav>
      </header>
      <div className="container">
        {children}
      </div>
    </div>
  );
};

export default Layout;