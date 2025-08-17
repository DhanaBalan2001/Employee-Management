import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardAPI.getData();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data.');
      }
    };
    fetchData();
  }, [user.role]);

  if (error) {
    return (
      <div className="card">
        <h2>Dashboard Access Restricted</h2>
        <p>{error}</p>
        <p>Please contact your administrator if you believe this is an error.</p>
      </div>
    );
  }

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card employees">
          <h3>{dashboardData.overview.totalEmployees}</h3>
          <p>Total Employees</p>
        </div>
        <div className="dashboard-card projects">
          <h3>{dashboardData.overview.totalProjects}</h3>
          <p>Total Projects</p>
        </div>
        <div className="dashboard-card timesheets">
          <h3>{dashboardData.overview.timesheetsThisWeek}</h3>
          <p>Timesheets This Week</p>
        </div>
      </div>

      <div className="status-grid">
        <div className="status-section">
          <h3>📊 Projects by Status</h3>
          <div>
            <div className="status-item open">
              <span>Open</span>
              <span className="status-count">{dashboardData.byStatus.projects.open || 0}</span>
            </div>
            <div className="status-item progress">
              <span>In Progress</span>
              <span className="status-count">{dashboardData.byStatus.projects['in-progress'] || 0}</span>
            </div>
            <div className="status-item completed">
              <span>Completed</span>
              <span className="status-count">{dashboardData.byStatus.projects.completed || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="status-section">
          <h3>⏰ Timesheets by Status</h3>
          <div>
            <div className="status-item open">
              <span>Open</span>
              <span className="status-count">{dashboardData.byStatus.timesheets.open || 0}</span>
            </div>
            <div className="status-item progress">
              <span>In Progress</span>
              <span className="status-count">{dashboardData.byStatus.timesheets.inprogress || 0}</span>
            </div>
            <div className="status-item">
              <span>Submitted</span>
              <span className="status-count">{dashboardData.byStatus.timesheets.submitted || 0}</span>
            </div>
            <div className="status-item approved">
              <span>Approved</span>
              <span className="status-count">{dashboardData.byStatus.timesheets.approved || 0}</span>
            </div>
            <div className="status-item rejected">
              <span>Rejected</span>
              <span className="status-count">{dashboardData.byStatus.timesheets.rejected || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="top-projects">
        <h3>🏆 Top Projects by Cost</h3>
        <div>
          {dashboardData.topProjects.map((project, index) => (
            <div key={index} className="project-item">
              <div className="project-name">{project.jobName}</div>
              <div className="project-stats">
                <span className="project-cost">${project.totalCost}</span>
                <span className="project-hours">{project.totalHours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;