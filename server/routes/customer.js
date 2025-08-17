import express from 'express';
import { createCustomer, getCustomers, updateCustomer } from '../controllers/customer.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize(['Admin', 'Principal']), createCustomer);
router.get('/', authenticate, getCustomers);
router.put('/:id', authenticate, authorize(['Admin', 'Principal']), updateCustomer);

export default router;