import express from 'express';
import { getEmployeeReport, getProjectReport, getMonthlyReport } from '../controllers/report.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/employee', authenticate, authorize(['Admin', 'Principal']), getEmployeeReport);
router.get('/project', authenticate, authorize(['Admin', 'Principal']), getProjectReport);
router.get('/monthly', authenticate, authorize(['Admin']), getMonthlyReport);

export default router;