import express from 'express';
import {
  getColors,
  getColor,
  createColor,
  updateColor,
  deleteColor
} from '../controllers/colorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getColors);
router.get('/:id', getColor);

// Protected routes (Admin only)
router.post('/', protect, createColor);
router.put('/:id', protect, updateColor);
router.delete('/:id', protect, deleteColor);

export default router;

