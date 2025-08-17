import express from 'express';
import { getAutomationStatus } from '../controllers/automation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', authenticate, authorize(['Admin']), getAutomationStatus);

export default router;