import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

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
app.use(cors());
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
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

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export { connectDB };