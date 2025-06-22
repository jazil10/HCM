import { Router } from 'express';
import { 
    checkIn, 
    checkOut, 
    getTodaysAttendance, 
    getAllAttendance,
    getTeamAttendance,
    createOrUpdateAttendance
} from '../controllers/attendanceController';
import asyncHandler from '../utils/asyncHandler';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';

const router = Router();

// Employee routes - protected by authentication
router.post('/check-in', authenticate, asyncHandler(checkIn));
router.post('/check-out/:id', authenticate, asyncHandler(checkOut));
router.get('/today', authenticate, asyncHandler(getTodaysAttendance));

// Manager routes
router.get('/team', authenticate, authorize(UserRole.MANAGER), asyncHandler(getTeamAttendance));

// Admin/HR routes - protected and authorized
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(getAllAttendance));
router.post('/manual', authenticate, authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(createOrUpdateAttendance));

export default router;
