import express from 'express';
import {
  getSettings,
  updateSettings,
  sendContactEmail
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { parseNestedForm } from '../middleware/parseNestedForm.js';

const router = express.Router();

// Public routes
router.get('/', getSettings);
router.post('/contact', sendContactEmail);

// Protected routes (Admin only)
router.put('/', protect, upload.single('bannerImage'), parseNestedForm, updateSettings);

export default router;

