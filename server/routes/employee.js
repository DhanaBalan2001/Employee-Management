import express from 'express';
import { createEmployee, getEmployees, getEmployee, updateEmployee, updateOwnEmployee, deleteEmployee, getOwnEmployee, getEmployeesFiltered } from '../controllers/employee.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateNonNegative } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, authorize(['Admin']), validateNonNegative, createEmployee);
router.get('/', authenticate, getEmployeesFiltered);
router.get('/own', authenticate, authorize(['Employee', 'Principal']), getOwnEmployee);
router.get('/:id', authenticate, authorize(['Admin', 'Principal']), getEmployee);
router.put('/:id', authenticate, authorize(['Admin', 'Principal']), validateNonNegative, updateEmployee);
router.put('/own/:id', authenticate, authorize(['Employee']), validateNonNegative, updateOwnEmployee);
router.delete('/:id', authenticate, authorize(['Admin']), deleteEmployee);

export default router;