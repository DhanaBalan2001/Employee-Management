import Timesheet from '../models/Timesheet.js';
import Project from '../models/Project.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { trackRecord } from '../utils/recordTracking.js';
import { calculateWeeklyTotal, calculateProjectTotalHours, handleStatusTransition } from '../utils/workflowHelpers.js';
import { validateWeeklyTimesheet, autoTransitionStatus, checkWeeklyCompletion } from '../utils/automation.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';

export const createTimesheet = async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(400).json({ message: 'Project not found' });
    }
    if (project.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot add timesheet to completed project' });
    }

    // Calculate week start date
    const date = new Date(req.body.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    
    // Validate weekly timesheet limits
    await validateWeeklyTimesheet(req.body.employeeId, weekStart, req.body.hours);
    
    const timesheet = new Timesheet({
      ...req.body,
      projectName: project.jobName,
      projectCode: project.proCode?.code || 'N/A',
      weekStart,
      createdBy: req.user._id
    });
    await timesheet.save();
    
    // Calculate weekly total for this employee
    await calculateWeeklyTotal(req.body.employeeId, weekStart);
    
    // Calculate project total hours
    await calculateProjectTotalHours(req.body.projectId);
    
    // Auto-transition statuses based on conditions
    await autoTransitionStatus(timesheet._id);
    
    // Check weekly completion
    await checkWeeklyCompletion(req.body.employeeId, weekStart);
    
    // Add record tracking
    await trackRecord(Timesheet, timesheet._id, null, req.body, req.user, 'Timesheet', 'create');
    
    res.status(201).json(timesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTimesheets = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      query.employeeId = req.user.employeeId;
    }
    const timesheets = await Timesheet.find(query);
    res.json(timesheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTimesheet = async (req, res) => {
  try {
    const originalTimesheet = await Timesheet.findById(req.params.id);
    if (!originalTimesheet) return res.status(404).json({ message: 'Timesheet not found' });
    
    // Handle status transitions and notifications
    if (req.body.status && req.body.status !== originalTimesheet.status) {
      await handleStatusTransition(Timesheet, req.params.id, req.body.status, originalTimesheet.status);
      
      // Notify employee of status change
      const employee = await Employee.findById(timesheet.employeeId);
      const employeeEmailAddress = employee?.companyEmail || employee?.personalEmail;
      if (employeeEmailAddress) {
        const template = emailTemplates.timesheetStatus(
          employee.name,
          timesheet.projectName,
          new Date(timesheet.date).toLocaleDateString(),
          req.body.status
        );
        await sendEmail(
          employeeEmailAddress,
          template.subject,
          template.message,
          'Timesheet',
          'status_change',
          req.user._id
        );
      }
      
      // Notify principal when timesheet is submitted
      if (req.body.status === 'Submitted') {
        const principals = await User.find({ role: 'Principal' });
        for (const principal of principals) {
          const principalEmployee = await Employee.findById(principal.employeeId);
          const principalEmailAddress = principalEmployee?.companyEmail || principalEmployee?.personalEmail;
          if (principalEmailAddress) {
            const template = emailTemplates.timesheetSubmitted(
              employee.name,
              timesheet.projectName,
              new Date(timesheet.date).toLocaleDateString(),
              timesheet.hours
            );
            await sendEmail(
              principalEmailAddress,
              template.subject,
              template.message,
              'Timesheet',
              'status_change',
              req.user._id
            );
          }
        }
      }
    }
    
    const timesheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    
    // Recalculate weekly total if hours changed
    if (req.body.hours && req.body.hours !== originalTimesheet.hours) {
      // Validate new hours don't exceed limits
      const hoursDifference = req.body.hours - originalTimesheet.hours;
      await validateWeeklyTimesheet(timesheet.employeeId, timesheet.weekStart, hoursDifference);
      
      await calculateWeeklyTotal(timesheet.employeeId, timesheet.weekStart);
      await calculateProjectTotalHours(timesheet.projectId);
      
      // Auto-transition statuses
      await autoTransitionStatus(timesheet._id);
      await checkWeeklyCompletion(timesheet.employeeId, timesheet.weekStart);
    }
    
    // Add record tracking
    await trackRecord(Timesheet, timesheet._id, originalTimesheet.toObject(), req.body, req.user, 'Timesheet', 'update');
    
    res.json(timesheet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWeeklyTimesheets = async (req, res) => {
  try {
    const { employeeId, weekStart } = req.params;
    const timesheets = await Timesheet.find({ employeeId, weekStart });
    const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
    res.json({ timesheets, totalHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });
    
    // Add record tracking before deletion
    await trackRecord(Timesheet, timesheet._id, timesheet.toObject(), {}, req.user, 'Timesheet', 'delete');
    
    await Timesheet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timesheet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};