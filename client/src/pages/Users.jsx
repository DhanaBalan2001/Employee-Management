import React, { useState, useEffect } from 'react';
import { userAPI, employeeAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: '', password: '', employeeId: '', role: 'Employee'
  });

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.update(editingUser._id, formData);
      } else {
        await userAPI.create(formData);
      }
      fetchUsers();
      setShowForm(false);
      setEditingUser(null);
      setFormData({ userName: '', password: '', employeeId: '', role: 'Employee' });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      userName: user.userName,
      password: '', // Don't populate password for security
      employeeId: user.employeeId,
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Users</h2>
        <button onClick={() => {
          setFormData({ userName: '', password: '', employeeId: '', role: 'Employee' });
          setEditingUser(null);
          setShowForm(true);
        }} className="btn btn-primary">
          Add User
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Password {editingUser ? '(Leave blank to keep current)' : ''}:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!editingUser}
              />
            </div>
            <div className="form-group">
              <label>Employee:</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Employee">Employee</option>
                <option value="Principal">Principal</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success">
              {editingUser ? 'Update' : 'Create'}
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
              <th>Username</th>
              <th>Employee</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.userName}</td>
                <td>{employees.find(emp => emp._id === user.employeeId)?.name || 'Unknown'}</td>
                <td>{user.role}</td>
                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="btn btn-primary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user._id)} className="btn btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;