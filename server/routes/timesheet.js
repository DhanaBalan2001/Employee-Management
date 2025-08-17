import express from 'express';
import { createTimesheet, getTimesheets, updateTimesheet, getWeeklyTimesheets, deleteTimesheet } from '../controllers/timesheet.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateNonNegative } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, validateNonNegative, createTimesheet);
router.get('/', authenticate, getTimesheets);
router.put('/:id', authenticate, authorize(['Admin', 'Principal', 'Employee']), validateNonNegative, updateTimesheet);
router.delete('/:id', authenticate, authorize(['Admin']), deleteTimesheet);
router.get('/weekly/:employeeId/:weekStart', authenticate, getWeeklyTimesheets);

export default router;