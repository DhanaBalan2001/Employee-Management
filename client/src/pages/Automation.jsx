import React, { useState, useEffect } from 'react';
import { automationAPI } from '../services/api';

const Automation = () => {
  const [automationData, setAutomationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAutomationStatus();
  }, []);

  const fetchAutomationStatus = async () => {
    try {
      const response = await automationAPI.getStatus();
      setAutomationData(response.data);
    } catch (error) {
      console.error('Error fetching automation status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== 'Admin') {
    return (
      <div className="card">
        <h2>Access Denied</h2>
        <p>Only administrators can view automation status.</p>
      </div>
    );
  }

  if (loading) {
    return <div>Loading automation status...</div>;
  }

  return (
    <div>
      <h2>🤖 Automation Status</h2>
      
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>📊 Code Generation</h3>
            <div className="automation-stats">
              <div className="stat-item">
                <strong>Latest Customer Code:</strong> {automationData?.codeGeneration?.latestCustomerCode}
              </div>
              <div className="stat-item">
                <strong>Latest Project Code:</strong> {automationData?.codeGeneration?.latestProjectCode}
              </div>
              <div className="stat-item">
                <strong>Total Customers:</strong> {automationData?.codeGeneration?.totalCustomers}
              </div>
              <div className="stat-item">
                <strong>Total Projects:</strong> {automationData?.codeGeneration?.totalProjects}
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <h3>⚡ Auto-Transitions</h3>
            <div className="automation-stats">
              <div className="stat-item">
                <strong>Timesheets Auto-Transitioned:</strong> {automationData?.autoTransitions?.timesheetsAutoTransitioned}
              </div>
              <div className="stat-item">
                <strong>Projects Auto-Transitioned:</strong> {automationData?.autoTransitions?.projectsAutoTransitioned}
              </div>
            </div>
            
            {automationData?.autoTransitions?.recentAutoTimesheets?.length > 0 && (
              <div>
                <h4>Recent Auto-Timesheets</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Hours</th>
                      <th>Transitioned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationData.autoTransitions.recentAutoTimesheets.map((ts, index) => (
                      <tr key={index}>
                        <td>{ts.status}</td>
                        <td>{ts.hours}h</td>
                        <td>{new Date(ts.transitionedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>✅ Weekly Validations</h3>
        <div className="automation-stats">
          <div className="stat-item">
            <strong>This Week Completions:</strong> {automationData?.weeklyValidations?.thisWeekCompletions}
          </div>
          <div className="stat-item">
            <strong>Validation Success Rate:</strong> {automationData?.weeklyValidations?.validationSuccessRate}
          </div>
          <div className="stat-item">
            <strong>Total Validated:</strong> {automationData?.weeklyValidations?.totalValidated} / {automationData?.weeklyValidations?.totalTimesheets}
          </div>
        </div>
      </div>

      {automationData?.autoTransitions?.recentAutoProjects?.length > 0 && (
        <div className="card">
          <h3>🎯 Recent Auto-Completed Projects</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Actual Hours</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {automationData.autoTransitions.recentAutoProjects.map((proj, index) => (
                <tr key={index}>
                  <td>{proj.name}</td>
                  <td>{proj.status}</td>
                  <td>{proj.actualHours}h</td>
                  <td>{new Date(proj.completedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h3>📋 Automation Rules</h3>
        <div className="automation-rules">
          <div className="rule-item">
            <strong>Customer Codes:</strong> Auto-increment (0001, 0002, 0003...)
          </div>
          <div className="rule-item">
            <strong>Project Codes:</strong> Customer-based (0001.0001A, 0001.0002B...)
          </div>
          <div className="rule-item">
            <strong>Daily Limit:</strong> Max 8 hours per day per employee
          </div>
          <div className="rule-item">
            <strong>Weekly Limit:</strong> Max 40 hours per week per employee
          </div>
          <div className="rule-item">
            <strong>Auto-Submit:</strong> Timesheets at 8 hours or week at 40 hours
          </div>
          <div className="rule-item">
            <strong>Auto-Complete:</strong> Projects when target hours reached
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automation;