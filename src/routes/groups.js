import express from 'express';
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  removeMember,
  getMyGroups
} from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllGroups);
router.get('/my-groups', protect, getMyGroups);
router.get('/:id', protect, getGroupById);
router.post('/', protect, createGroup);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.delete('/:groupId/members/:memberId', protect, removeMember);

export default router;