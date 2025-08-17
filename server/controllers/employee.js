import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { trackRecord } from '../utils/recordTracking.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';

export const createEmployee = async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments();
    if (employeeCount >= 200) {
      // Send email to admin about limit reached
      const adminUsers = await User.find({ role: 'Admin' });
      for (const admin of adminUsers) {
        const adminEmployee = await Employee.findById(admin.employeeId);
        const emailAddress = adminEmployee?.companyEmail || adminEmployee?.personalEmail;
        if (emailAddress) {
          const template = emailTemplates.employeeLimit(employeeCount);
          await sendEmail(
            emailAddress,
            template.subject,
            template.message,
            'Employee',
            'create',
            req.user._id
          );
        }
      }
      return res.status(400).json({ message: 'Employee limit reached (200)' });
    }

    const employee = new Employee({
      ...req.body,
      createdBy: req.user._id
    });
    await employee.save();
    
    // Add record tracking
    await trackRecord(Employee, employee._id, null, req.body, req.user, 'Employee', 'create');
    
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeesFiltered = async (req, res) => {
  try {
    if (req.user.role === 'Employee') {
      const employee = await Employee.findById(req.user.employeeId);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      res.json([employee]);
    } else {
      const employees = await Employee.find();
      res.json(employees);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const originalEmployee = await Employee.findById(req.params.id);
    if (!originalEmployee) return res.status(404).json({ message: 'Employee not found' });
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    
    // Add record tracking
    await trackRecord(Employee, employee._id, originalEmployee.toObject(), req.body, req.user, 'Employee', 'update');
    
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateOwnEmployee = async (req, res) => {
  try {
    // Check if employee is updating their own record
    if (req.params.id !== req.user.employeeId) {
      return res.status(403).json({ message: 'Can only update own employee details' });
    }

    const originalEmployee = await Employee.findById(req.params.id);
    if (!originalEmployee) return res.status(404).json({ message: 'Employee not found' });
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    
    // Add record tracking
    await trackRecord(Employee, employee._id, originalEmployee.toObject(), req.body, req.user, 'Employee', 'update');
    
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    // Add record tracking before deletion
    await trackRecord(Employee, employee._id, employee.toObject(), {}, req.user, 'Employee', 'delete');
    
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};