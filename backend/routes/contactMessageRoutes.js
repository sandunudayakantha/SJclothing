import express from 'express';
import {
  getMessages,
  getMessage,
  markAsRead,
  markAsSpam,
  markAsNotSpam,
  deleteMessage,
  getStats
} from '../controllers/contactMessageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getMessages);
router.get('/stats', getStats);
router.get('/:id', getMessage);
router.put('/:id/read', markAsRead);
router.put('/:id/spam', markAsSpam);
router.put('/:id/not-spam', markAsNotSpam);
router.delete('/:id', deleteMessage);

export default router;

