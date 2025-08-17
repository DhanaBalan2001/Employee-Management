import express from 'express';
import { 
  getNotifications, 
  getNotificationStats, 
  sendWeeklyReport, 
  sendCustomReport,
  retryFailedNotification 
} from '../controllers/notification.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize(['Admin']), getNotifications);
router.get('/stats', authenticate, authorize(['Admin']), getNotificationStats);
router.post('/weekly-report', authenticate, authorize(['Admin']), sendWeeklyReport);
router.post('/custom-report', authenticate, authorize(['Admin']), sendCustomReport);
router.post('/retry/:id', authenticate, authorize(['Admin']), retryFailedNotification);

export default router;