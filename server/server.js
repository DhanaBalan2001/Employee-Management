import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import employeeRoutes from './routes/employee.js';
import userRoutes from './routes/user.js';
import projectRoutes from './routes/project.js';
import timesheetRoutes from './routes/timesheet.js';
import dashboardRoutes from './routes/dashboard.js';
import customerRoutes from './routes/customer.js';
import reportRoutes from './routes/report.js';
import setupRoutes from './routes/setup.js';
import automationRoutes from './routes/automation.js';
import notificationRoutes from './routes/notification.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://employeemanagementtool.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
  } catch (error) {
    process.exit(1);
  }
};

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT);
});

export { connectDB };