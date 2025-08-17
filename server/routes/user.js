import express from 'express';
import { login, createUser, getUsers, updateUser, deleteUser } from '../controllers/user.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/', authenticate, authorize(['Admin']), createUser);
router.get('/', authenticate, authorize(['Admin']), getUsers);
router.put('/:id', authenticate, authorize(['Admin']), updateUser);
router.delete('/:id', authenticate, authorize(['Admin']), deleteUser);

export default router;