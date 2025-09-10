import { Router } from 'express';
import {
  getAllPrograms,
  getActivePrograms,
  getProgramBySlug,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramStats
} from '../controllers/internshipProgramController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// Public routes (no authentication required)
router.get('/public', asyncHandler(getActivePrograms));
router.get('/public/:slug', asyncHandler(getProgramBySlug));

// Protected routes (require authentication)
router.use(authenticate);

// HR/Admin only routes
router.get('/', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(getAllPrograms)
);

router.post('/', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(createProgram)
);

router.get('/:id', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(getProgramById)
);

router.put('/:id', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(updateProgram)
);

router.delete('/:id', 
  authorize(UserRole.ADMIN), 
  asyncHandler(deleteProgram)
);

router.get('/:id/stats', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(getProgramStats)
);

export default router;
