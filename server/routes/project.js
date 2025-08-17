import express from 'express';
import { createProject, getProjects, updateProject, getProjectsByEmployee, deleteProject } from '../controllers/project.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateNonNegative } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, authorize(['Admin']), validateNonNegative, createProject);
router.get('/', authenticate, getProjects);
router.put('/:id', authenticate, authorize(['Admin']), validateNonNegative, updateProject);
router.delete('/:id', authenticate, authorize(['Admin']), deleteProject);
router.get('/employee/:employeeId', authenticate, getProjectsByEmployee);

export default router;