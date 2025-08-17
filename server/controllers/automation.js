import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import Timesheet from '../models/Timesheet.js';

export const getAutomationStatus = async (req, res) => {
  try {
    // Get latest customer and project codes
    const latestCustomer = await Customer.findOne().sort({ createdAt: -1 });
    const latestProject = await Project.findOne().sort({ createdAt: -1 });
    
    // Get auto-transitioned records
    const autoTransitionedTimesheets = await Timesheet.find({ autoTransitioned: true }).limit(10);
    const autoTransitionedProjects = await Project.find({ autoTransitioned: true }).limit(10);
    
    // Get weekly completion stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weeklyCompletions = await Timesheet.find({
      weekCompleted: true,
      submittedAt: { $gte: weekStart, $lte: weekEnd }
    });
    
    // Validation statistics
    const totalTimesheets = await Timesheet.countDocuments();
    const validatedTimesheets = await Timesheet.countDocuments({
      hours: { $gte: 0, $lte: 8 },
      totalWeekHours: { $lte: 40 }
    });
    
    res.json({
      codeGeneration: {
        latestCustomerCode: latestCustomer?.custCode || 'None',
        latestProjectCode: latestProject?.proCode?.code || 'None',
        totalCustomers: await Customer.countDocuments(),
        totalProjects: await Project.countDocuments()
      },
      autoTransitions: {
        timesheetsAutoTransitioned: autoTransitionedTimesheets.length,
        projectsAutoTransitioned: autoTransitionedProjects.length,
        recentAutoTimesheets: autoTransitionedTimesheets.map(ts => ({
          id: ts._id,
          status: ts.status,
          transitionedAt: ts.transitionedAt,
          hours: ts.hours
        })),
        recentAutoProjects: autoTransitionedProjects.map(proj => ({
          id: proj._id,
          name: proj.jobName,
          status: proj.status,
          completedAt: proj.completedAt,
          actualHours: proj.actualHours
        }))
      },
      weeklyValidations: {
        thisWeekCompletions: weeklyCompletions.length,
        validationSuccessRate: totalTimesheets > 0 ? (validatedTimesheets / totalTimesheets * 100).toFixed(2) + '%' : '0%',
        totalValidated: validatedTimesheets,
        totalTimesheets
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};