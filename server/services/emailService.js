import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';

let transporter = null;
let emailConfigured = false;

// Lazy initialization of email service
const initializeEmailService = async () => {
  if (emailConfigured) return;
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  

  
  if (emailUser && emailPass) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
      
      await transporter.verify();

    } catch (error) {

      transporter = null;
    }
  } else {

  }
  
  emailConfigured = true;
};

export const sendEmail = async (to, subject, message, module, action, triggeredBy, attachments = []) => {
  let notification = null;
  
  try {
    await initializeEmailService();
    
    notification = new Notification({
      to,
      subject,
      message,
      module,
      action,
      triggeredBy
    });
    await notification.save();

    // Check if email service is configured
    if (!transporter) {
      throw new Error('Email service not configured. Please check EMAIL_USER and EMAIL_PASS in .env file');
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: message,
      attachments
    };

    await transporter.sendMail(mailOptions);

    // Update notification status
    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();


    return { success: true, notificationId: notification.notificationId };
  } catch (error) {
    if (notification) {
      notification.status = 'failed';
      notification.errorMessage = error.message;
      await notification.save();
    }
    

    return { success: false, error: error.message };
  }
};

// Email Templates
export const emailTemplates = {
  welcomeUser: (userName, password, role) => ({
    subject: 'Welcome to Employee Management System',
    message: `
      <h2>Welcome to Employee Management System!</h2>
      <p>Your account has been created successfully.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Login Credentials:</strong><br>
        Username: <strong>${userName}</strong><br>
        Password: <strong>${password}</strong><br>
        Role: <strong>${role}</strong>
      </div>
      <p>Please login and change your password immediately.</p>
      <p>Best regards,<br>EMS Team</p>
    `
  }),

  roleChange: (userName, oldRole, newRole) => ({
    subject: 'Role Updated - Employee Management System',
    message: `
      <h2>Role Update Notification</h2>
      <p>Hello ${userName},</p>
      <p>Your role has been updated in the Employee Management System.</p>
      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
        Previous Role: <strong>${oldRole}</strong><br>
        New Role: <strong>${newRole}</strong>
      </div>
      <p>Please login to access your updated permissions.</p>
      <p>Best regards,<br>EMS Team</p>
    `
  }),

  projectAssignment: (employeeName, projectName, projectCode, deadline, hours) => ({
    subject: `🎯 New Project Assignment: ${projectName}`,
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">🎯 New Project Assignment</h2>
        <p>Hello <strong>${employeeName}</strong>,</p>
        <p>You have been assigned to a new project in the Employee Management System.</p>
        <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h3 style="margin-top: 0; color: #2E7D32;">📋 Project Details:</h3>
          <p><strong>Project Name:</strong> ${projectName}</p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          ${deadline ? `<p><strong>Deadline:</strong> ${deadline}</p>` : ''}
          ${hours ? `<p><strong>Allocated Hours:</strong> ${hours}h</p>` : ''}
        </div>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Login to the Employee Management System</li>
            <li>View detailed project information</li>
            <li>Start logging your time for this project</li>
          </ul>
        </div>
        <p>If you have any questions about this assignment, please contact your project manager.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">Best regards,<br><strong>EMS Team</strong></p>
      </div>
    `
  }),

  timesheetSubmitted: (employeeName, projectName, date, hours) => ({
    subject: `Timesheet Submitted: ${employeeName} - ${projectName}`,
    message: `
      <h2>Timesheet Submission</h2>
      <p>A timesheet has been submitted for approval.</p>
      <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Details:</strong><br>
        Employee: <strong>${employeeName}</strong><br>
        Project: <strong>${projectName}</strong><br>
        Date: <strong>${date}</strong><br>
        Hours: <strong>${hours}h</strong>
      </div>
      <p>Please login to review and approve the timesheet.</p>
      <p>Best regards,<br>EMS Team</p>
    `
  }),

  timesheetStatus: (employeeName, projectName, date, status, comments = '') => ({
    subject: `Timesheet ${status}: ${projectName}`,
    message: `
      <h2>Timesheet Status Update</h2>
      <p>Hello ${employeeName},</p>
      <p>Your timesheet status has been updated.</p>
      <div style="background: ${status === 'Approved' ? '#e8f5e9' : '#ffebee'}; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Details:</strong><br>
        Project: <strong>${projectName}</strong><br>
        Date: <strong>${date}</strong><br>
        Status: <strong>${status}</strong><br>
        ${comments ? `Comments: <strong>${comments}</strong>` : ''}
      </div>
      <p>Please login to view your timesheet details.</p>
      <p>Best regards,<br>EMS Team</p>
    `
  }),

  employeeLimit: (currentCount) => ({
    subject: 'Employee Limit Reached - Action Required',
    message: `
      <h2>Employee Limit Alert</h2>
      <p>The employee limit has been reached in the Employee Management System.</p>
      <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f44336;">
        <strong>Current Employee Count: ${currentCount}/200</strong><br>
        <strong>Status: LIMIT REACHED</strong>
      </div>
      <p>No new employees can be added until the limit is increased or existing employees are removed.</p>
      <p>Please take appropriate action.</p>
      <p>Best regards,<br>EMS System</p>
    `
  }),

  weeklyReport: (reportData) => ({
    subject: `Weekly Report - Week of ${reportData.weekStart}`,
    message: `
      <h2>Weekly Report</h2>
      <p>Here's your weekly summary:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Week: ${reportData.weekStart} - ${reportData.weekEnd}</strong><br>
        Total Hours: <strong>${reportData.totalHours}h</strong><br>
        Total Timesheets: <strong>${reportData.totalTimesheets}</strong><br>
        Active Projects: <strong>${reportData.activeProjects}</strong>
      </div>
      <p>Detailed report is attached.</p>
      <p>Best regards,<br>EMS System</p>
    `
  })
};