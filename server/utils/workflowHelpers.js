import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import Timesheet from '../models/Timesheet.js';

// 8.2 Project Setup - Calculate project cost based on assigned employees
export const calculateProjectCost = (assignedEmployeeIds) => {
  let totalCost = 0;
  let totalHours = 0;
  
  assignedEmployeeIds.forEach(assignment => {
    const cost = (assignment.perHour || 0) * (assignment.empHours || 0);
    totalCost += cost;
    totalHours += assignment.empHours || 0;
    assignment.empAmount = cost; // Set individual employee amount
  });
  
  return { totalCost, totalHours, assignedEmployeeIds };
};

// 8.3 Timesheet Entry - Calculate weekly totals
export const calculateWeeklyTotal = async (employeeId, weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const timesheets = await Timesheet.find({
    employeeId,
    date: { $gte: weekStart, $lte: weekEnd }
  });
  
  const totalWeekHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
  
  // Update all timesheets for this week with total
  await Timesheet.updateMany(
    {
      employeeId,
      date: { $gte: weekStart, $lte: weekEnd }
    },
    { totalWeekHours }
  );
  
  return totalWeekHours;
};

// 8.3 Calculate per project total hours
export const calculateProjectTotalHours = async (projectId) => {
  const timesheets = await Timesheet.find({ projectId });
  const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
  
  // Update project with total hours
  await Project.findByIdAndUpdate(projectId, { totalHours });
  
  return totalHours;
};

// 8.4 Status Transitions - Auto-lock on completion
export const handleStatusTransition = async (Model, documentId, newStatus, oldStatus) => {
  if (newStatus === 'Completed' && oldStatus !== 'Completed') {
    // Auto-lock completed projects/timesheets
    await Model.findByIdAndUpdate(documentId, { 
      status: 'Completed',
      locked: true,
      completedAt: new Date()
    });
    
    // If it's a project, update all related timesheets
    if (Model.modelName === 'Project') {
      await Timesheet.updateMany(
        { projectId: documentId, status: { $ne: 'Completed' } },
        { status: 'Completed', locked: true }
      );
    }
  }
};

// 8.5 Dashboard Access - RBAC-based data filtering
export const filterDashboardData = (data, userRole) => {
  switch (userRole) {
    case 'Admin':
      return data; // Full access
    case 'Principal':
      // Remove sensitive admin data
      return {
        ...data,
        overview: data.overview,
        byStatus: data.byStatus,
        topProjects: data.topProjects
      };
    case 'Employee':
      // Very limited access
      return {
        overview: {
          totalProjects: data.overview.totalProjects
        }
      };
    default:
      return {};
  }
};