import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
};

export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getOwn: () => api.get('/employees/own'),
  updateOwn: (id, data) => api.put(`/employees/own/${id}`, data),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getByEmployee: (employeeId) => api.get(`/projects/employee/${employeeId}`),
};

export const timesheetAPI = {
  getAll: () => api.get('/timesheets'),
  create: (data) => api.post('/timesheets', data),
  update: (id, data) => api.put(`/timesheets/${id}`, data),
  delete: (id) => api.delete(`/timesheets/${id}`),
  getWeekly: (employeeId, weekStart) => api.get(`/timesheets/weekly/${employeeId}/${weekStart}`),
};

export const customerAPI = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
};

export const reportAPI = {
  getEmployeeReport: (employeeIds) => api.get(`/reports/employee${employeeIds ? `?employeeIds=${employeeIds}` : ''}`),
  getProjectReport: (projectIds) => api.get(`/reports/project${projectIds ? `?projectIds=${projectIds}` : ''}`),
  getMonthlyReport: (month, year) => api.get(`/reports/monthly?month=${month}&year=${year}`),
};

export const automationAPI = {
  getStatus: () => api.get('/automation/status'),
};

export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export default api;