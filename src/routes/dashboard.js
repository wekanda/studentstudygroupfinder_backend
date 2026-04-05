import express from 'express';
import { getStudentDashboard, getAdminDashboard } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/student', protect, getStudentDashboard);
router.get('/admin', protect, admin, getAdminDashboard);

export default router;