import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import Timesheet from '../models/Timesheet.js';
import { filterDashboardData } from '../utils/workflowHelpers.js';

export const getDashboard = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalProjects = await Project.countDocuments();
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const timesheetsThisWeek = await Timesheet.countDocuments({
      weekStart: { $gte: weekStart }
    });

    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const timesheetsByStatus = await Timesheet.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topProjects = await Project.find()
      .sort({ totalCost: -1 })
      .limit(5)
      .select('jobName totalCost totalHours');

    const dashboardData = {
      overview: {
        totalEmployees,
        totalProjects,
        timesheetsThisWeek
      },
      byStatus: {
        projects: projectsByStatus.reduce((acc, item) => {
          acc[item._id.toLowerCase()] = item.count;
          return acc;
        }, {}),
        timesheets: timesheetsByStatus.reduce((acc, item) => {
          acc[item._id.toLowerCase()] = item.count;
          return acc;
        }, {})
      },
      topProjects
    };
    
    // Filter data based on user role (RBAC)
    const filteredData = filterDashboardData(dashboardData, req.user.role);
    
    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};