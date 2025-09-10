import express from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import {
  getAllLeaveTypes,
  getLeaveType,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
} from '../controllers/leaveTypeController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all leave types (all authenticated users)
router.get('/', asyncHandler(getAllLeaveTypes));

// Get specific leave type (all authenticated users)
router.get('/:id', asyncHandler(getLeaveType));

// Create leave type (Admin/HR only)
router.post('/', 
  authorize(UserRole.ADMIN, UserRole.HR),
  asyncHandler(createLeaveType)
);

// Update leave type (Admin/HR only)
router.put('/:id', 
  authorize(UserRole.ADMIN, UserRole.HR),
  asyncHandler(updateLeaveType)
);

// Delete/Deactivate leave type (Admin only)
router.delete('/:id', 
  authorize(UserRole.ADMIN),
  asyncHandler(deleteLeaveType)
);

export default router;
