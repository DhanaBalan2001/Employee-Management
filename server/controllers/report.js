import Employee from '../models/Employee.js';
import Project from '../models/Project.js';
import Timesheet from '../models/Timesheet.js';

export const getEmployeeReport = async (req, res) => {
  try {
    const { employeeIds } = req.query;
    const employees = employeeIds ? employeeIds.split(',') : [];
    
    const query = employees.length ? { _id: { $in: employees } } : {};
    const employeeData = await Employee.find(query);
    
    const report = await Promise.all(employeeData.map(async (emp) => {
      const projects = await Project.find({ 'assignedEmployeeIds.employeeId': emp._id });
      const timesheets = await Timesheet.find({ employeeId: emp._id });
      
      // Get unique employees involved in same projects
      const allEmployeeIds = new Set();
      projects.forEach(project => {
        project.assignedEmployeeIds.forEach(assigned => {
          allEmployeeIds.add(assigned.employeeId);
        });
      });
      
      return {
        employee: emp.name,
        employeeId: emp._id,
        totalProjectsWorked: projects.length,
        countByProjectStatus: {
          Open: projects.filter(p => p.status === 'Open').length,
          'In-progress': projects.filter(p => p.status === 'In-progress').length,
          Completed: projects.filter(p => p.status === 'Completed').length
        },
        totalEmployeesInvolved: allEmployeeIds.size,
        totalHours: timesheets.reduce((sum, ts) => sum + ts.hours, 0)
      };
    }));
    
    res.json({
      employees: report,
      summary: {
        totalEmployeesReported: report.length,
        totalProjectsAcrossAll: report.reduce((sum, emp) => sum + emp.totalProjectsWorked, 0),
        totalHoursAcrossAll: report.reduce((sum, emp) => sum + emp.totalHours, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectReport = async (req, res) => {
  try {
    const { projectIds } = req.query;
    const projects = projectIds ? projectIds.split(',') : [];
    
    const query = projects.length ? { _id: { $in: projects } } : {};
    const projectData = await Project.find(query);
    
    const report = projectData.map(project => ({
      projectName: project.jobName,
      projectCode: project.proCode?.code || 'N/A',
      numberOfEmployeesAssigned: project.assignedEmployeeIds.length,
      totalCost: project.totalCost,
      totalHours: project.totalHours,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));
    
    res.json({
      projects: report,
      summary: {
        projectCount: report.length,
        totalCostAcrossAll: report.reduce((sum, proj) => sum + proj.totalCost, 0),
        totalHoursAcrossAll: report.reduce((sum, proj) => sum + proj.totalHours, 0),
        totalEmployeesAcrossAll: report.reduce((sum, proj) => sum + proj.numberOfEmployeesAssigned, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const timesheets = await Timesheet.find({
      date: { $gte: startDate, $lte: endDate }
    });
    
    const report = {
      month: `${month}/${year}`,
      totalHours: timesheets.reduce((sum, ts) => sum + ts.hours, 0),
      totalTimesheets: timesheets.length,
      byEmployee: {},
      byProject: {}
    };
    
    // Get employee and project names manually
    for (const ts of timesheets) {
      let empName = 'Unknown';
      let projName = 'Unknown';
      
      if (ts.employeeId) {
        const employee = await Employee.findById(ts.employeeId);
        empName = employee?.name || 'Unknown';
      }
      
      if (ts.projectId) {
        const project = await Project.findById(ts.projectId);
        projName = project?.jobName || 'Unknown';
      }
      
      report.byEmployee[empName] = (report.byEmployee[empName] || 0) + ts.hours;
      report.byProject[projName] = (report.byProject[projName] || 0) + ts.hours;
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};