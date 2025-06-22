import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getProfile,
  updateProfile,
  getTeamMembers
} from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', asyncHandler(getProfile));

// Update current user profile
router.put('/profile', asyncHandler(updateProfile));

// Change password
router.put('/:userId/change-password', asyncHandler(changePassword));

// Get all users (Admin/HR only)
router.get('/', authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(getAllUsers));

// Get team members (managers can see their team, admin/hr can see any team)
router.get('/team/:teamId?/members', asyncHandler(getTeamMembers));

// Get user by ID (Admin/HR only)
router.get('/:userId', authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(getUserById));

// Update user (Admin/HR only)
router.put('/:userId', authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(updateUser));

// Delete user (Admin only)
router.delete('/:userId', authorize(UserRole.ADMIN), asyncHandler(deleteUser));

export default router;
