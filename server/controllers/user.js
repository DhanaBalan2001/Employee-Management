import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { trackRecord } from '../utils/recordTracking.js';
import { sendEmail, emailTemplates } from '../services/emailService.js';
import Employee from '../models/Employee.js';

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT || 'secret');
    res.json({ token, user: { id: user._id, userName: user.userName, role: user.role, employeeId: user.employeeId } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    console.log('Creating user with data:', { ...req.body, password: '[HIDDEN]' });
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      ...req.body,
      password: hashedPassword,
      createdBy: req.user._id
    });
    await user.save();
    
    // Get employee email for welcome notification (don't block user creation if email fails)
    try {
      const employee = await Employee.findById(req.body.employeeId);
      const emailAddress = employee?.companyEmail || employee?.personalEmail;
      if (emailAddress) {
        const template = emailTemplates.welcomeUser(req.body.userName, req.body.password, req.body.role);
        await sendEmail(
          emailAddress,
          template.subject,
          template.message,
          'User',
          'create',
          req.user._id
        );
      }
    } catch (emailError) {
      console.error('Email sending failed during user creation:', emailError.message);
      // Continue with user creation even if email fails
    }
    
    // Add record tracking (exclude password from tracking)
    const trackingData = { ...req.body };
    delete trackingData.password;
    await trackRecord(User, user._id, null, trackingData, req.user, 'User', 'create');
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('User creation error:', error.message);
    console.error('Error details:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const originalUser = await User.findById(req.params.id);
    if (!originalUser) return res.status(404).json({ message: 'User not found' });
    
    const updateData = { ...req.body, updatedBy: req.user._id };
    
    // Only update password if it's provided and not empty
    if (req.body.password && req.body.password.trim() !== '') {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    } else {
      // Remove password from update data if it's empty
      delete updateData.password;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    // Send role change notification (don't block user update if email fails)
    if (req.body.role && req.body.role !== originalUser.role) {
      try {
        const employee = await Employee.findById(originalUser.employeeId);
        const emailAddress = employee?.companyEmail || employee?.personalEmail;
        if (emailAddress) {
          const template = emailTemplates.roleChange(user.userName, originalUser.role, req.body.role);
          await sendEmail(
            emailAddress,
            template.subject,
            template.message,
            'User',
            'update',
            req.user._id
          );
          
          // Notify admin about role change
          const adminUsers = await User.find({ role: 'Admin' });
          for (const admin of adminUsers) {
            const adminEmployee = await Employee.findById(admin.employeeId);
            const adminEmailAddress = adminEmployee?.companyEmail || adminEmployee?.personalEmail;
            if (adminEmailAddress) {
              await sendEmail(
                adminEmailAddress,
                `Role Change: ${user.userName}`,
                `User ${user.userName} role changed from ${originalUser.role} to ${req.body.role}`,
                'User',
                'status_change',
                req.user._id
              );
            }
          }
        }
      } catch (emailError) {
        console.error('Email sending failed during role change:', emailError.message);
        // Continue with user update even if email fails
      }
    }
    
    // Add record tracking (exclude password from tracking)
    const trackingData = { ...req.body };
    delete trackingData.password;
    await trackRecord(User, user._id, originalUser.toObject(), trackingData, req.user, 'User', 'update');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Add record tracking before deletion (exclude password)
    const trackingData = user.toObject();
    delete trackingData.password;
    await trackRecord(User, user._id, trackingData, {}, req.user, 'User', 'delete');
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};