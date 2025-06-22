import { Router } from 'express';
import {
  getAllTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  getMyTeam
} from '../controllers/teamController';
import { authenticate } from '../middlewares/auth';
import { authorize, authorizeTeamAccess } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all teams (Admin/HR only)
router.get('/', authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(getAllTeams));

// Get my team (for employees/managers)
router.get('/my-team', asyncHandler(getMyTeam));

// Get specific team (with team access control)
router.get('/:teamId', authorizeTeamAccess, asyncHandler(getTeam));

// Create team (Admin/HR only)
router.post('/', authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(createTeam));

// Update team (Admin/HR only)
router.put('/:teamId', authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(updateTeam));

// Delete team (Admin/HR only)
router.delete('/:teamId', authorize(UserRole.ADMIN, UserRole.HR), asyncHandler(deleteTeam));

// Add member to team (Admin/HR/Manager)
router.post('/:teamId/members', 
  authorize(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER),
  authorizeTeamAccess,
  asyncHandler(addMemberToTeam)
);

// Remove member from team (Admin/HR/Manager)
router.delete('/:teamId/members/:userId', 
  authorize(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER),
  authorizeTeamAccess,
  asyncHandler(removeMemberFromTeam)
);

export default router;
