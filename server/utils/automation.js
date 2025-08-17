import Timesheet from '../models/Timesheet.js';
import Project from '../models/Project.js';

// Timesheet weekly validations
export const validateWeeklyTimesheet = async (employeeId, weekStart, newHours = 0) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const weeklyTimesheets = await Timesheet.find({
    employeeId,
    date: { $gte: weekStart, $lte: weekEnd }
  });
  
  const currentWeekHours = weeklyTimesheets.reduce((sum, ts) => sum + ts.hours, 0);
  const totalWithNew = currentWeekHours + newHours;
  
  // Validation rules
  const validations = {
    maxWeeklyHours: 40,
    maxDailyHours: 8,
    minDailyHours: 0
  };
  
  // Check weekly limit
  if (totalWithNew > validations.maxWeeklyHours) {
    throw new Error(`Weekly hours cannot exceed ${validations.maxWeeklyHours}. Current: ${currentWeekHours}, Attempting to add: ${newHours}`);
  }
  
  // Check daily limit
  if (newHours > validations.maxDailyHours) {
    throw new Error(`Daily hours cannot exceed ${validations.maxDailyHours}`);
  }
  
  return {
    isValid: true,
    currentWeekHours,
    remainingHours: validations.maxWeeklyHours - currentWeekHours,
    weeklyTimesheets
  };
};

// Auto-transition statuses based on conditions
export const autoTransitionStatus = async (timesheetId) => {
  const timesheet = await Timesheet.findById(timesheetId);
  if (!timesheet) return;
  
  // Auto-submit if timesheet is complete for the day
  if (timesheet.status === 'Open' && timesheet.hours >= 8) {
    await Timesheet.findByIdAndUpdate(timesheetId, { 
      status: 'Submitted',
      autoTransitioned: true,
      transitionedAt: new Date()
    });
  }
  
  // Check if project should be auto-completed
  const project = await Project.findById(timesheet.projectId);
  if (project && project.status !== 'Completed') {
    const projectTimesheets = await Timesheet.find({ projectId: project._id });
    const totalProjectHours = projectTimesheets.reduce((sum, ts) => sum + ts.hours, 0);
    
    // Auto-complete project if total hours reached
    if (project.totalHours > 0 && totalProjectHours >= project.totalHours) {
      await Project.findByIdAndUpdate(project._id, {
        status: 'Completed',
        actualHours: totalProjectHours,
        completedAt: new Date(),
        autoTransitioned: true
      });
      
      // Auto-approve all submitted timesheets for completed project
      await Timesheet.updateMany(
        { projectId: project._id, status: 'Submitted' },
        { 
          status: 'Approved',
          autoTransitioned: true,
          approvedAt: new Date()
        }
      );
    }
  }
};

// Weekly timesheet completion check
export const checkWeeklyCompletion = async (employeeId, weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const weeklyTimesheets = await Timesheet.find({
    employeeId,
    date: { $gte: weekStart, $lte: weekEnd }
  });
  
  const totalWeekHours = weeklyTimesheets.reduce((sum, ts) => sum + ts.hours, 0);
  const workingDays = weeklyTimesheets.length;
  
  // Auto-submit week if conditions met
  if (totalWeekHours >= 40 || workingDays >= 5) {
    await Timesheet.updateMany(
      {
        employeeId,
        date: { $gte: weekStart, $lte: weekEnd },
        status: 'Open'
      },
      {
        status: 'Submitted',
        weekCompleted: true,
        autoTransitioned: true,
        submittedAt: new Date()
      }
    );
  }
  
  return {
    totalWeekHours,
    workingDays,
    isWeekComplete: totalWeekHours >= 40 || workingDays >= 5
  };
};