import express from 'express';
import {
  getSizes,
  getSize,
  createSize,
  updateSize,
  deleteSize
} from '../controllers/sizeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getSizes);
router.get('/:id', getSize);

// Protected routes (Admin only)
router.post('/', protect, createSize);
router.put('/:id', protect, updateSize);
router.delete('/:id', protect, deleteSize);

export default router;

