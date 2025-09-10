import express from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import {
  getAllLeaves,
  getLeave,
  createLeave,
  updateLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  addLeaveComment
} from '../controllers/leaveController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all leaves (role-based filtering applied in controller)
router.get('/', asyncHandler(getAllLeaves));

// Get specific leave
router.get('/:id', asyncHandler(getLeave));

// Create new leave request (employees can create)
router.post('/', 
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN),
  asyncHandler(createLeave)
);

// Update leave request (employee can update pending requests)
router.put('/:id', 
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN),
  asyncHandler(updateLeave)
);

// Approve leave request (Manager/HR/Admin only)
router.patch('/:id/approve', 
  authorize(UserRole.MANAGER, UserRole.HR, UserRole.ADMIN),
  asyncHandler(approveLeave)
);

// Reject leave request (Manager/HR/Admin only)
router.patch('/:id/reject', 
  authorize(UserRole.MANAGER, UserRole.HR, UserRole.ADMIN),
  asyncHandler(rejectLeave)
);

// Cancel leave request (Employee or higher roles)
router.patch('/:id/cancel', 
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN),
  asyncHandler(cancelLeave)
);

// Add comment to leave request
router.post('/:id/comments', 
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN),
  asyncHandler(addLeaveComment)
);

export default router;
