import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/', createOrder);

// Protected routes (Admin only)
router.get('/', protect, getOrders);
router.get('/stats', protect, getOrderStats);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);

export default router;

