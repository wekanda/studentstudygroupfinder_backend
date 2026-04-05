import express from 'express';
import {
  getGroupSessions,
  createSession,
  deleteSession,
  getMySessions
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-sessions', protect, getMySessions);
router.get('/group/:groupId', protect, getGroupSessions);
router.post('/group/:groupId', protect, createSession);
router.delete('/:id', protect, deleteSession);

export default router;