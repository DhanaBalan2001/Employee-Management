import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    name: '', personalEmail: '', dateOfBirth: '', address: '',
    designation: '', experienceYears: 0, bloodGroup: '',
    perHoursCharge: 0, emCategory: '', personalMobile: '',
    companyEmail: '', companyMobile: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee._id, formData);
      } else {
        await employeeAPI.create(formData);
      }
      fetchEmployees();
      setShowForm(false);
      setEditingEmployee(null);
      setFormData({
        name: '', personalEmail: '', dateOfBirth: '', address: '',
        designation: '', experienceYears: 0, bloodGroup: '',
        perHoursCharge: 0, emCategory: '', personalMobile: '',
        companyEmail: '', companyMobile: ''
      });
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await employeeAPI.delete(id);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Employees</h2>
        {user.role === 'Admin' && (
          <button onClick={() => {
            setFormData({
              name: '', personalEmail: '', dateOfBirth: '', address: '',
              designation: '', experienceYears: 0, bloodGroup: '',
              perHoursCharge: 0, emCategory: '', personalMobile: '',
              companyEmail: '', companyMobile: ''
            });
            setEditingEmployee(null);
            setShowForm(true);
          }} className="btn btn-primary">
            Add Employee
          </button>
        )}
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Personal Email:</label>
              <input
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Designation:</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Experience Years:</label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Blood Group:</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Per Hour Charge:</label>
              <input
                type="number"
                min="0"
                value={formData.perHoursCharge}
                onChange={(e) => setFormData({...formData, perHoursCharge: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Employee Category:</label>
              <select
                value={formData.emCategory}
                onChange={(e) => setFormData({...formData, emCategory: e.target.value})}
              >
                <option value="">Select Category</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div className="form-group">
              <label>Personal Mobile:</label>
              <input
                type="text"
                value={formData.personalMobile}
                onChange={(e) => setFormData({...formData, personalMobile: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Company Email:</label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Company Mobile:</label>
              <input
                type="text"
                value={formData.companyMobile}
                onChange={(e) => setFormData({...formData, companyMobile: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-success">
              {editingEmployee ? 'Update' : 'Create'}
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
              <th>Name</th>
              <th>Email</th>
              <th>Designation</th>
              <th>Per Hour Charge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr 
                key={employee._id}
                style={{
                  backgroundColor: employee._id === user.employeeId ? '#e3f2fd' : 'transparent',
                  border: employee._id === user.employeeId ? '2px solid #2196f3' : 'none'
                }}
              >
                <td>
                  {employee.name}
                  {employee._id === user.employeeId && (
                    <span style={{marginLeft: '8px', color: '#2196f3', fontWeight: 'bold'}}>
                      (You)
                    </span>
                  )}
                </td>
                <td>{employee.personalEmail}</td>
                <td>{employee.designation}</td>
                <td>${employee.perHoursCharge}</td>
                <td>
                  <button onClick={() => handleEdit(employee)} className="btn btn-primary">
                    Edit
                  </button>
                  {user.role === 'Admin' && employee._id !== user.employeeId && (
                    <button onClick={() => handleDelete(employee._id)} className="btn btn-danger">
                      Delete
                    </button>
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

export default Employees;