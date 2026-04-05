import express from 'express';
import {
  getGroupPosts,
  createPost,
  deletePost
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/group/:groupId', protect, getGroupPosts);
router.post('/group/:groupId', protect, createPost);
router.delete('/:id', protect, deletePost);

export default router;