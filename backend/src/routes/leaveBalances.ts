import express from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';
import {
  getEmployeeLeaveBalances,
  getMyLeaveBalances,
  getAllEmployeeBalances,
  initializeEmployeeBalances,
  updateLeaveBalance,
  bulkInitializeBalances,
  getLeaveBalanceSummary,
  createLeaveBalance
} from '../controllers/leaveBalanceController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my leave balances (current user)
router.get('/my-balances', asyncHandler(getMyLeaveBalances));

// Get leave balance summary for dashboard (Admin/HR only)
router.get('/summary', 
  authorize(UserRole.ADMIN, UserRole.HR),
  asyncHandler(getLeaveBalanceSummary)
);

// Get all employee balances (HR/Admin only)
router.get('/all', 
  authorize(UserRole.ADMIN, UserRole.HR),
  asyncHandler(getAllEmployeeBalances)
);

// Create/assign individual leave balance (HR/Admin only)
router.post('/', 
  authorize(UserRole.ADMIN, UserRole.HR),
  asyncHandler(createLeaveBalance)
);

// Bulk initialize balances for all employees (Admin only)
router.post('/bulk-initialize', 
  authorize(UserRole.ADMIN),
  asyncHandler(bulkInitializeBalances)
);

// Get specific employee's leave balances
router.get('/employee/:employeeId', 
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN),
  asyncHandler(getEmployeeLeaveBalances)
);

// Initialize leave balances for an employee (HR/Admin only)
router.post('/employee/:employeeId/initialize', 
  authorize(UserRole.ADMIN, UserRole.HR),
  asyncHandler(initializeEmployeeBalances)
);

// Update leave balance (HR/Admin only)
router.put('/:id', 
  authorize(UserRole.ADMIN, UserRole.HR),
  asyncHandler(updateLeaveBalance)
);

export default router;
