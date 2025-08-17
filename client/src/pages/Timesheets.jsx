import React, { useState, useEffect, useCallback } from 'react';
import { timesheetAPI, projectAPI, employeeAPI } from '../services/api';

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '', employeeId: '', date: '', hours: 0, weekStart: '', status: 'Open'
  });
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTimesheets = async () => {
    try {
      const response = await timesheetAPI.getAll();
      setTimesheets(response.data);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      if (user.role === 'Employee') {
        // Employees only see projects they are assigned to
        const response = await projectAPI.getByEmployee(user.employeeId);
        setProjects(response.data.filter(p => p.status !== 'Completed'));
      } else {
        // Admin and Principal see all projects
        const response = await projectAPI.getAll();
        setProjects(response.data.filter(p => p.status !== 'Completed'));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, [user.role, user.employeeId]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchWeeklyHours = useCallback(async () => {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const employeeId = user.role === 'Admin' ? formData.employeeId : user.employeeId;
      if (employeeId) {
        const response = await timesheetAPI.getWeekly(employeeId, weekStart.toISOString().split('T')[0]);
        setWeeklyHours(response.data.totalHours || 0);
      }
    } catch (error) {
      console.error('Error fetching weekly hours:', error);
    }
  }, [user.role, user.employeeId, formData.employeeId]);

  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
    if (user.role === 'Admin') {
      fetchEmployees();
    }
    fetchWeeklyHours();
  }, [fetchProjects, user.role, fetchWeeklyHours]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationMessage('');
    
    // Client-side validation
    if (formData.hours > 8) {
      setValidationMessage('⚠️ Daily hours cannot exceed 8 hours');
      return;
    }
    if (weeklyHours + parseFloat(formData.hours) > 40) {
      setValidationMessage(`⚠️ Weekly hours would exceed 40. Current: ${weeklyHours}h, Adding: ${formData.hours}h`);
      return;
    }
    
    try {
      if (editingTimesheet) {
        await timesheetAPI.update(editingTimesheet._id, formData);
      } else {
        const timesheetData = {
          ...formData,
          employeeId: user.role === 'Admin' ? formData.employeeId : user.employeeId
        };
        await timesheetAPI.create(timesheetData);
      }
      fetchTimesheets();
      setShowForm(false);
      setEditingTimesheet(null);
      setFormData({ projectId: '', employeeId: '', date: '', hours: 0, weekStart: '', status: 'Open' });
      setValidationMessage('');
    } catch (error) {
      console.error('Error saving timesheet:', error);
      if (error.response?.data?.message) {
        setValidationMessage(`❌ ${error.response.data.message}`);
      }
    }
  };

  const handleEdit = (timesheet) => {
    setEditingTimesheet(timesheet);
    setFormData({
      projectId: timesheet.projectId,
      employeeId: timesheet.employeeId,
      date: timesheet.date.split('T')[0],
      hours: timesheet.hours,
      weekStart: timesheet.weekStart ? timesheet.weekStart.split('T')[0] : '',
      status: timesheet.status
    });
    setShowForm(true);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await timesheetAPI.update(id, { status });
      fetchTimesheets();
    } catch (error) {
      console.error('Error updating timesheet:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      try {
        await timesheetAPI.delete(id);
        fetchTimesheets();
      } catch (error) {
        console.error('Error deleting timesheet:', error);
      }
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Timesheets</h2>
        {(user.role === 'Employee' || user.role === 'Admin') && (
          <button onClick={() => {
            setFormData({ projectId: '', employeeId: '', date: '', hours: 0, weekStart: '', status: 'Open' });
            setEditingTimesheet(null);
            setShowForm(true);
          }} className="btn btn-primary">
            Add Timesheet
          </button>
        )}
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingTimesheet ? 'Edit Timesheet' : 'Add Timesheet'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project:</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.jobName}</option>
                ))}
              </select>
            </div>
            {user.role === 'Admin' && (
              <div className="form-group">
                <label>Employee:</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>{employee.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Hours:</label>
              <input
                type="number"
                min="0"
                max="8"
                step="0.5"
                value={formData.hours}
                onChange={(e) => {
                  setFormData({...formData, hours: e.target.value});
                  const hours = parseFloat(e.target.value) || 0;
                  if (hours > 8) {
                    setValidationMessage('⚠️ Daily hours cannot exceed 8 hours');
                  } else if (weeklyHours + hours > 40) {
                    setValidationMessage(`⚠️ Weekly hours would exceed 40. Current: ${weeklyHours}h`);
                  } else {
                    setValidationMessage('');
                  }
                }}
                required
              />
              <small style={{color: '#666'}}>Max 8 hours per day, 40 hours per week</small>
            </div>
            <div className="form-group">
              <label>Week Start:</label>
              <input
                type="date"
                value={formData.weekStart}
                onChange={(e) => setFormData({...formData, weekStart: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Submitted">Submitted</option>
                {(user.role === 'Principal' || user.role === 'Admin') && (
                  <>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>
            {validationMessage && (
              <div style={{color: '#f44336', marginBottom: '10px', fontSize: '0.9em'}}>
                {validationMessage}
              </div>
            )}
            <button type="submit" className="btn btn-success" disabled={!!validationMessage}>
              {editingTimesheet ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn">
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              {user.role === 'Admin' && <th>Employee</th>}
              <th>Date</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((timesheet) => (
              <tr key={timesheet._id}>
                <td>{timesheet.projectName}</td>
                {user.role === 'Admin' && (
                  <td>{employees.find(emp => emp._id === timesheet.employeeId)?.name || 'Unknown'}</td>
                )}
                <td>{new Date(timesheet.date).toLocaleDateString()}</td>
                <td>
                  {timesheet.hours}h
                  {timesheet.hours >= 8 && (
                    <span style={{fontSize: '0.7em', color: '#4caf50', marginLeft: '5px'}}>✓ Full</span>
                  )}
                </td>
                <td>
                  {timesheet.status}
                  {timesheet.autoTransitioned && (
                    <span style={{fontSize: '0.7em', color: '#ff9800', marginLeft: '5px'}}>🤖 Auto</span>
                  )}
                  {timesheet.weekCompleted && (
                    <span style={{fontSize: '0.7em', color: '#2196f3', marginLeft: '5px'}}>📅 Week</span>
                  )}
                </td>
                <td>
                  {user.role === 'Principal' && timesheet.status === 'Submitted' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(timesheet._id, 'Approved')}
                        className="btn btn-success"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(timesheet._id, 'Rejected')}
                        className="btn btn-danger"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {user.role === 'Admin' && (
                    <>
                      <button onClick={() => handleEdit(timesheet)} className="btn btn-secondary">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(timesheet._id)} className="btn btn-danger">
                        Delete
                      </button>
                    </>
                  )}
                  {user.role === 'Employee' && (timesheet.status === 'Open' || timesheet.status === 'InProgress') && (
                    <>
                      <button onClick={() => handleEdit(timesheet)} className="btn btn-secondary">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(timesheet._id, 'Submitted')}
                        className="btn btn-primary"
                      >
                        Submit
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timesheets;