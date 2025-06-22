import { Router } from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeByUserId,
  getMyEmployeeProfile
} from '../controllers/employeeController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user's employee profile
router.get('/my-profile', asyncHandler(getMyEmployeeProfile));

// Get all employees (Admin/HR can see all, Managers can see their team)
router.get('/', 
  authorize(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER), 
  asyncHandler(getAllEmployees)
);

// Create employee profile (Admin/HR only)
router.post('/', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(createEmployee)
);

// Get employee by ID
router.get('/:employeeId', asyncHandler(getEmployeeById));

// Update employee (Admin/HR can update all, Managers can update their team)
router.put('/:employeeId', 
  authorize(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER), 
  asyncHandler(updateEmployee)
);

// Delete employee (Admin only)
router.delete('/:employeeId', 
  authorize(UserRole.ADMIN), 
  asyncHandler(deleteEmployee)
);

// Get employee by user ID
router.get('/user/:userId', asyncHandler(getEmployeeByUserId));

export default router;
