import React, { useState, useEffect } from 'react';
import { reportAPI, employeeAPI, projectAPI } from '../services/api';

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('employee');
  const [employeeReport, setEmployeeReport] = useState(null);
  const [projectReport, setProjectReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [monthYear, setMonthYear] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const generateEmployeeReport = async () => {
    try {
      const employeeIds = selectedEmployees.length ? selectedEmployees.join(',') : '';
      const response = await reportAPI.getEmployeeReport(employeeIds);
      setEmployeeReport(response.data);
    } catch (error) {
      console.error('Error generating employee report:', error);
    }
  };

  const generateProjectReport = async () => {
    try {
      const projectIds = selectedProjects.length ? selectedProjects.join(',') : '';
      const response = await reportAPI.getProjectReport(projectIds);
      setProjectReport(response.data);
    } catch (error) {
      console.error('Error generating project report:', error);
    }
  };

  const generateMonthlyReport = async () => {
    try {
      const response = await reportAPI.getMonthlyReport(monthYear.month, monthYear.year);
      setMonthlyReport(response.data);
    } catch (error) {
      console.error('Error generating monthly report:', error);
    }
  };

  if (user.role === 'Employee') {
    return (
      <div className="card">
        <h2>Access Denied</h2>
        <p>Employees do not have access to reports.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Reports</h2>
      
      <div className="tabs">
        <button 
          className={activeTab === 'employee' ? 'btn btn-primary' : 'btn'}
          onClick={() => setActiveTab('employee')}
        >
          Employee Reports
        </button>
        <button 
          className={activeTab === 'project' ? 'btn btn-primary' : 'btn'}
          onClick={() => setActiveTab('project')}
        >
          Project Reports
        </button>
        <button 
          className={activeTab === 'monthly' ? 'btn btn-primary' : 'btn'}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Reports
        </button>
      </div>

      {activeTab === 'employee' && (
        <div className="card">
          <h3>Employee Report</h3>
          <div className="form-group">
            <label>Select Employees (Optional - leave empty for all):</label>
            <select 
              multiple 
              value={selectedEmployees}
              onChange={(e) => setSelectedEmployees(Array.from(e.target.selectedOptions, option => option.value))}
            >
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <button onClick={generateEmployeeReport} className="btn btn-success">
            Generate Report
          </button>

          {employeeReport && (
            <div className="report-results">
              <h4>Employee Report Results</h4>
              <div className="summary">
                <p><strong>Total Employees:</strong> {employeeReport.summary.totalEmployeesReported}</p>
                <p><strong>Total Projects:</strong> {employeeReport.summary.totalProjectsAcrossAll}</p>
                <p><strong>Total Hours:</strong> {employeeReport.summary.totalHoursAcrossAll}</p>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Total Projects Worked</th>
                    <th>Open</th>
                    <th>In Progress</th>
                    <th>Completed</th>
                    <th>Total Employees Involved</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeReport.employees.map(emp => (
                    <tr key={emp.employeeId}>
                      <td>{emp.employee}</td>
                      <td>{emp.totalProjectsWorked}</td>
                      <td>{emp.countByProjectStatus.Open}</td>
                      <td>{emp.countByProjectStatus['In-progress']}</td>
                      <td>{emp.countByProjectStatus.Completed}</td>
                      <td>{emp.totalEmployeesInvolved}</td>
                      <td>{emp.totalHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'project' && (
        <div className="card">
          <h3>Project Report</h3>
          <div className="form-group">
            <label>Select Projects (Optional - leave empty for all):</label>
            <select 
              multiple 
              value={selectedProjects}
              onChange={(e) => setSelectedProjects(Array.from(e.target.selectedOptions, option => option.value))}
            >
              {projects.map(proj => (
                <option key={proj._id} value={proj._id}>{proj.jobName}</option>
              ))}
            </select>
          </div>
          <button onClick={generateProjectReport} className="btn btn-success">
            Generate Report
          </button>

          {projectReport && (
            <div className="report-results">
              <h4>Project Report Results</h4>
              <div className="summary">
                <p><strong>Project Count:</strong> {projectReport.summary.projectCount}</p>
                <p><strong>Total Cost:</strong> ${projectReport.summary.totalCostAcrossAll}</p>
                <p><strong>Total Hours:</strong> {projectReport.summary.totalHoursAcrossAll}</p>
                <p><strong>Total Employees:</strong> {projectReport.summary.totalEmployeesAcrossAll}</p>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Project Code</th>
                    <th>Project Name</th>
                    <th>Employees Assigned</th>
                    <th>Total Cost</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectReport.projects.map(proj => (
                    <tr key={proj.projectName}>
                      <td>{proj.projectCode}</td>
                      <td>{proj.projectName}</td>
                      <td>{proj.numberOfEmployeesAssigned}</td>
                      <td>${proj.totalCost}</td>
                      <td>{proj.totalHours}h</td>
                      <td>{proj.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="card">
          <h3>Monthly Report</h3>
          <div className="form-group">
            <label>Month:</label>
            <select 
              value={monthYear.month}
              onChange={(e) => setMonthYear({...monthYear, month: e.target.value})}
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year:</label>
            <input 
              type="number" 
              value={monthYear.year}
              onChange={(e) => setMonthYear({...monthYear, year: e.target.value})}
            />
          </div>
          <button onClick={generateMonthlyReport} className="btn btn-success">
            Generate Report
          </button>

          {monthlyReport && (
            <div className="report-results">
              <h4>Monthly Report - {monthlyReport.month}</h4>
              <div className="summary">
                <p><strong>Total Hours:</strong> {monthlyReport.totalHours}</p>
                <p><strong>Total Timesheets:</strong> {monthlyReport.totalTimesheets}</p>
              </div>
              
              <div className="row">
                <div className="col">
                  <h5>By Employee</h5>
                  <table className="table">
                    <thead>
                      <tr><th>Employee</th><th>Hours</th></tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyReport.byEmployee).map(([emp, hours]) => (
                        <tr key={emp}><td>{emp}</td><td>{hours}h</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="col">
                  <h5>By Project</h5>
                  <table className="table">
                    <thead>
                      <tr><th>Project</th><th>Hours</th></tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyReport.byProject).map(([proj, hours]) => (
                        <tr key={proj}><td>{proj}</td><td>{hours}h</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;