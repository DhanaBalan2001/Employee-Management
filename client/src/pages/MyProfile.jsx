import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';

const MyProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    name: '', personalEmail: '', dateOfBirth: '', address: '',
    designation: '', experienceYears: 0, bloodGroup: '',
    perHoursCharge: 0, emCategory: '', personalMobile: '',
    companyEmail: '', companyMobile: ''
  });

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      const response = await employeeAPI.getOwn();
      setEmployee(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.updateOwn(user.employeeId, formData);
      fetchMyProfile();
      setShowForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!employee) return <div>Loading...</div>;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>My Profile</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Edit Profile
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Edit My Profile</h3>
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
              <label>Personal Mobile:</label>
              <input
                type="text"
                value={formData.personalMobile}
                onChange={(e) => setFormData({...formData, personalMobile: e.target.value})}
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
              Update Profile
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn">
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Profile Information</h3>
        <div className="profile-info">
          <p><strong>Employee ID:</strong> {employee.employeeId}</p>
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Personal Email:</strong> {employee.personalEmail}</p>
          <p><strong>Date of Birth:</strong> {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Address:</strong> {employee.address}</p>
          <p><strong>Designation:</strong> {employee.designation}</p>
          <p><strong>Experience:</strong> {employee.experienceYears} years</p>
          <p><strong>Blood Group:</strong> {employee.bloodGroup}</p>
          <p><strong>Per Hour Charge:</strong> ${employee.perHoursCharge}</p>
          <p><strong>Employee Category:</strong> {employee.emCategory}</p>
          <p><strong>Personal Mobile:</strong> {employee.personalMobile}</p>
          <p><strong>Company Email:</strong> {employee.companyEmail}</p>
          <p><strong>Company Mobile:</strong> {employee.companyMobile}</p>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;