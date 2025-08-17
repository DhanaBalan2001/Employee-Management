import express from 'express';
import { getDashboard } from '../controllers/dashboard.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize(['Admin', 'Principal']), getDashboard);

export default router;