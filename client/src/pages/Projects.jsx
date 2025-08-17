import React, { useState, useEffect } from 'react';
import { projectAPI, employeeAPI, customerAPI } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    jobName: '', customerId: '', managerId: '', assignedEmployeeIds: [],
    totalCost: 0, totalHours: 0, perHourCost: 0, status: 'Open'
  });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    fetchCustomers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectAPI.update(editingProject._id, formData);
      } else {
        await projectAPI.create(formData);
      }
      fetchProjects();
      setShowForm(false);
      setEditingProject(null);
      setFormData({
        jobName: '', customerId: '', managerId: '', assignedEmployeeIds: [],
        totalCost: 0, totalHours: 0, perHourCost: 0, status: 'Open'
      });
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      jobName: project.jobName || '',
      customerId: project.customerId || '',
      managerId: project.managerId || '',
      assignedEmployeeIds: project.assignedEmployeeIds || [],
      totalCost: project.totalCost || 0,
      totalHours: project.totalHours || 0,
      perHourCost: project.perHourCost || 0,
      status: project.status || 'Open'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Projects</h2>
        {user.role === 'Admin' && (
          <button onClick={() => {
            setFormData({
              jobName: '', customerId: '', managerId: '', assignedEmployeeIds: [],
              totalCost: 0, totalHours: 0, perHourCost: 0, status: 'Open'
            });
            setEditingProject(null);
            setShowForm(true);
          }} className="btn btn-primary">
            Add Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingProject ? 'Edit Project' : 'Add Project'}</h3>
          {!editingProject && (
            <div className="info-box" style={{background: '#e8f5e9', padding: '10px', marginBottom: '15px', borderRadius: '4px'}}>
              <small>📋 Project code will be auto-generated based on selected customer</small>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Name:</label>
              <input
                type="text"
                value={formData.jobName}
                onChange={(e) => setFormData({...formData, jobName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Customer:</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>{customer.custName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Manager (Optional):</label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({...formData, managerId: e.target.value})}
              >
                <option value="">Select Manager</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Total Cost (Optional):</label>
              <input
                type="number"
                min="0"
                value={formData.totalCost}
                onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Total Hours (Optional):</label>
              <input
                type="number"
                min="0"
                value={formData.totalHours}
                onChange={(e) => setFormData({...formData, totalHours: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Per Hour Cost (Optional):</label>
              <input
                type="number"
                min="0"
                value={formData.perHourCost}
                onChange={(e) => setFormData({...formData, perHourCost: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label style={{fontSize: '1.1em', fontWeight: 'bold', color: '#333', marginBottom: '10px', display: 'block'}}>
                👥 Assign Employees to Project
              </label>
              <div style={{
                border: '2px solid #e3f2fd',
                borderRadius: '12px',
                padding: '15px',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                maxHeight: '300px',
                overflowY: 'auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {employees.length === 0 ? (
                  <div style={{textAlign: 'center', color: '#666', padding: '20px'}}>
                    <span style={{fontSize: '2em'}}>👤</span>
                    <p>No employees available</p>
                  </div>
                ) : (
                  employees.map((emp) => {
                    const isAssigned = formData.assignedEmployeeIds.some(assigned => assigned.employeeId === emp._id);
                    const assignment = formData.assignedEmployeeIds.find(assigned => assigned.employeeId === emp._id);
                    
                    return (
                      <div key={emp._id} style={{
                        marginBottom: '12px',
                        padding: '15px',
                        background: isAssigned 
                          ? 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)'
                          : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                        borderRadius: '10px',
                        border: isAssigned ? '2px solid #4caf50' : '2px solid #e0e0e0',
                        transition: 'all 0.3s ease',
                        boxShadow: isAssigned ? '0 4px 12px rgba(76, 175, 80, 0.2)' : '0 2px 6px rgba(0,0,0,0.05)',
                        cursor: 'pointer'
                      }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: isAssigned ? '10px' : '0',
                          cursor: 'pointer',
                          fontSize: '1em'
                        }}>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assignedEmployeeIds: [...formData.assignedEmployeeIds, {
                                    employeeId: emp._id,
                                    employeeName: emp.name,
                                    perHour: emp.perHoursCharge || 0,
                                    empHours: 0,
                                    empAmount: 0
                                  }]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedEmployeeIds: formData.assignedEmployeeIds.filter(assigned => assigned.employeeId !== emp._id)
                                });
                              }
                            }}
                            style={{
                              marginRight: '12px',
                              width: '18px',
                              height: '18px',
                              accentColor: '#4caf50'
                            }}
                          />
                          <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
                            <span style={{
                              fontSize: '1.8em',
                              marginRight: '10px'
                            }}>👨‍💼</span>
                            <div>
                              <div style={{
                                fontWeight: 'bold',
                                color: isAssigned ? '#2e7d32' : '#333',
                                fontSize: '1.1em'
                              }}>
                                {emp.name}
                              </div>
                              <div style={{
                                fontSize: '0.9em',
                                color: '#666',
                                marginTop: '2px'
                              }}>
                                {emp.designation || 'Employee'} • 
                                <span style={{
                                  color: '#4caf50',
                                  fontWeight: 'bold'
                                }}>
                                  ${emp.perHoursCharge || 0}/hour
                                </span>
                              </div>
                            </div>
                          </div>
                          {isAssigned && (
                            <span style={{
                              background: '#4caf50',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8em',
                              fontWeight: 'bold'
                            }}>✓ ASSIGNED</span>
                          )}
                        </label>
                        
                        {isAssigned && (
                          <div style={{
                            marginLeft: '42px',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.8)',
                            borderRadius: '8px',
                            border: '1px solid #e8f5e9'
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <label style={{
                                  fontSize: '0.9em',
                                  fontWeight: 'bold',
                                  color: '#555',
                                  minWidth: '50px'
                                }}>⏱️ Hours:</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="200"
                                  step="0.5"
                                  value={assignment?.empHours || 0}
                                  onChange={(e) => {
                                    const hours = parseFloat(e.target.value) || 0;
                                    const amount = hours * (assignment?.perHour || 0);
                                    setFormData({
                                      ...formData,
                                      assignedEmployeeIds: formData.assignedEmployeeIds.map(assigned => 
                                        assigned.employeeId === emp._id 
                                          ? { ...assigned, empHours: hours, empAmount: amount }
                                          : assigned
                                      )
                                    });
                                  }}
                                  style={{
                                    width: '80px',
                                    padding: '6px 10px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '6px',
                                    fontSize: '0.9em',
                                    textAlign: 'center',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                background: '#f1f8e9',
                                borderRadius: '20px',
                                border: '1px solid #c8e6c9'
                              }}>
                                <span style={{fontSize: '0.9em', color: '#2e7d32'}}>💰</span>
                                <span style={{
                                  fontSize: '0.9em',
                                  fontWeight: 'bold',
                                  color: '#2e7d32'
                                }}>
                                  Total: ${(assignment?.empAmount || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                
                {formData.assignedEmployeeIds.length > 0 && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    borderRadius: '10px',
                    border: '2px solid #2196f3'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <span style={{fontSize: '1.2em'}}>📊</span>
                      <div>
                        <div style={{fontWeight: 'bold', color: '#1976d2'}}>
                          Project Summary: {formData.assignedEmployeeIds.length} Employee(s) Assigned
                        </div>
                        <div style={{fontSize: '0.9em', color: '#666', marginTop: '2px'}}>
                          Total Hours: {formData.assignedEmployeeIds.reduce((sum, emp) => sum + (emp.empHours || 0), 0)}h • 
                          Total Cost: ${formData.assignedEmployeeIds.reduce((sum, emp) => sum + (emp.empAmount || 0), 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Open">Open</option>
                <option value="In-progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success">
              {editingProject ? 'Update' : 'Create'}
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
              <th>Project Code</th>
              <th>Job Name</th>
              <th>Customer</th>
              <th>Assigned Employees</th>
              <th>Status</th>
              <th>Total Cost</th>
              <th>Total Hours</th>
              {user.role === 'Admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project._id}>
                <td>
                  <strong>{project.proCode?.code || 'Generating...'}</strong>
                  {project.autoTransitioned && (
                    <span style={{fontSize: '0.7em', color: '#ff9800', marginLeft: '5px'}}>🤖 Auto</span>
                  )}
                  {project.proCode && (
                    <div style={{fontSize: '0.8em', color: '#666'}}>
                      {project.proCode.updatedAt ? (
                        <>Updated: {new Date(project.proCode.updatedAt).toLocaleDateString()}</>
                      ) : (
                        <>Created: {new Date(project.proCode.createdAt).toLocaleDateString()}</>
                      )}
                    </div>
                  )}
                </td>
                <td>{project.jobName}</td>
                <td>{customers.find(c => c._id === project.customerId)?.custName || 'Unknown'}</td>
                <td>
                  {project.assignedEmployeeIds && project.assignedEmployeeIds.length > 0 ? (
                    <div>
                      {project.assignedEmployeeIds.map((assignment, index) => (
                        <div key={index} style={{fontSize: '0.9em', marginBottom: '2px'}}>
                          <strong>{assignment.employeeName}</strong>
                          <span style={{color: '#666', marginLeft: '5px'}}>({assignment.empHours}h)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{color: '#999', fontStyle: 'italic'}}>No employees assigned</span>
                  )}
                </td>
                <td>{project.status}</td>
                <td>${project.totalCost}</td>
                <td>{project.totalHours}h</td>
                {user.role === 'Admin' && (
                  <td>
                    <button onClick={() => handleEdit(project)} className="btn btn-primary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="btn btn-danger">
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projects;