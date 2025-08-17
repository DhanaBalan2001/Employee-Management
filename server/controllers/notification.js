import Notification from '../models/Notification.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const moduleStats = await Notification.aggregate([
      {
        $group: {
          _id: '$module',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentFailures = await Notification.find({ status: 'failed' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      statusStats: stats,
      moduleStats,
      recentFailures,
      totalNotifications: await Notification.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendWeeklyReport = async (req, res) => {
  try {
    const { reportData } = req.body;
    
    // Send to all admins
    const adminUsers = await User.find({ role: 'Admin' });
    
    for (const admin of adminUsers) {
      const adminEmployee = await Employee.findById(admin.employeeId);
      const emailAddress = adminEmployee?.companyEmail || adminEmployee?.personalEmail;
      if (emailAddress) {
        const template = emailTemplates.weeklyReport(reportData);
        await sendEmail(
          emailAddress,
          template.subject,
          template.message,
          'Report',
          'report',
          req.user._id
        );
      }
    }
    
    res.json({ message: 'Weekly reports sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendCustomReport = async (req, res) => {
  try {
    const { emails, subject, message, attachments } = req.body;
    
    const emailList = Array.isArray(emails) ? emails : [emails];
    
    for (const email of emailList) {
      await sendEmail(
        email,
        subject,
        message,
        'Report',
        'report',
        req.user._id,
        attachments
      );
    }
    
    res.json({ message: 'Custom reports sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const retryFailedNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.status !== 'failed') {
      return res.status(400).json({ message: 'Notification is not in failed state' });
    }
    
    const result = await sendEmail(
      notification.to,
      notification.subject,
      notification.message,
      notification.module,
      notification.action,
      notification.triggeredBy
    );
    
    res.json({ message: 'Notification retry initiated', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};