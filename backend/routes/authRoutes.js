import express from 'express';
import {
  adminLogin,
  getCurrentAdmin,
  registerAdmin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/register', registerAdmin); // Remove or protect in production
router.get('/me', protect, getCurrentAdmin);

export default router;

