import Project from '../models/Project.js';
import Customer from '../models/Customer.js';
import Employee from '../models/Employee.js';
import { trackRecord } from '../utils/recordTracking.js';
import { calculateProjectCost, handleStatusTransition } from '../utils/workflowHelpers.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';

const generateProjectCode = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }
  const projectCount = await Project.countDocuments();
  const serial = String(projectCount + 1).padStart(4, '0');
  const letter = String.fromCharCode(65 + (projectCount % 26));
  return `${customer.custCode}.${serial}${letter}`;
};

export const createProject = async (req, res) => {
  try {
    if (!req.body.customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }
    
    // Calculate project cost if employees are assigned
    let projectData = { ...req.body };
    if (req.body.assignedEmployeeIds && req.body.assignedEmployeeIds.length > 0) {
      const { totalCost, totalHours, assignedEmployeeIds } = calculateProjectCost(req.body.assignedEmployeeIds);
      projectData = {
        ...projectData,
        assignedEmployeeIds,
        totalCost,
        totalHours,
        perHourCost: totalHours > 0 ? totalCost / totalHours : 0
      };
    }
    
    const proCode = await generateProjectCode(req.body.customerId);
    const project = new Project({
      ...projectData,
      proCode: { code: proCode, createdAt: new Date() },
      createdBy: req.user._id
    });
    await project.save();
    
    // Notify assigned employees
    if (projectData.assignedEmployeeIds && projectData.assignedEmployeeIds.length > 0) {
      for (const assignment of projectData.assignedEmployeeIds) {
        try {
          const employee = await Employee.findById(assignment.employeeId);
          if (!employee) continue;
          
          const emailAddress = employee?.companyEmail || employee?.personalEmail;
          if (emailAddress) {
            const template = emailTemplates.projectAssignment(
              employee.name,
              projectData.jobName,
              proCode,
              null,
              assignment.empHours
            );
            
            await sendEmail(
              emailAddress,
              template.subject,
              template.message,
              'Project',
              'create',
              req.user._id
            );
          }
        } catch (emailError) {
          // Email error handled silently
        }
      }
    }
    
    // Add record tracking
    await trackRecord(Project, project._id, null, req.body, req.user, 'Project', 'create');
    
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateUpdatedProjectCode = async (project) => {
  const currentCode = project.proCode.code;
  const basePart = currentCode.split('.')[0];
  const serialPart = currentCode.split('.')[1];
  const currentSerial = parseInt(serialPart.slice(0, -1));
  const newSerial = String(currentSerial + 1).padStart(4, '0');
  const newLetter = String.fromCharCode(66 + ((currentSerial) % 26));
  
  return `${basePart}.${newSerial}${newLetter}`;
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const originalProject = project.toObject();
    let updatedProCode = project.proCode;
    
    // Calculate project cost if employees are assigned
    let updateData = { ...req.body };
    if (req.body.assignedEmployeeIds && req.body.assignedEmployeeIds.length > 0) {
      const { totalCost, totalHours, assignedEmployeeIds } = calculateProjectCost(req.body.assignedEmployeeIds);
      updateData = {
        ...updateData,
        assignedEmployeeIds,
        totalCost,
        totalHours,
        perHourCost: totalHours > 0 ? totalCost / totalHours : 0
      };
    }
    
    // Handle status transitions
    if (req.body.status && req.body.status !== project.status) {
      await handleStatusTransition(Project, req.params.id, req.body.status, project.status);
    }
    
    // Increment code for significant changes (jobName or assignedEmployeeIds)
    const hasSignificantChanges = (
      (req.body.jobName && req.body.jobName !== project.jobName) ||
      (req.body.assignedEmployeeIds && JSON.stringify(req.body.assignedEmployeeIds) !== JSON.stringify(project.assignedEmployeeIds))
    );
    
    if (hasSignificantChanges) {
      const newCode = await generateUpdatedProjectCode(project);
      updatedProCode = {
        ...project.proCode,
        code: newCode,
        updatedAt: new Date()
      };
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...updateData, proCode: updatedProCode, updatedBy: req.user._id },
      { new: true }
    );
    
    // Add record tracking
    await trackRecord(Project, updatedProject._id, originalProject, req.body, req.user, 'Project', 'update');
    
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProjectsByEmployee = async (req, res) => {
  try {
    const projects = await Project.find({
      'assignedEmployeeIds.employeeId': req.params.employeeId,
      status: { $ne: 'Completed' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Add record tracking before deletion
    await trackRecord(Project, project._id, project.toObject(), {}, req.user, 'Project', 'delete');
    
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};