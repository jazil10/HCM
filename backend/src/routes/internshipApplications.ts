import { Router } from 'express';
import {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  addComment,
  bulkUpdateApplications,
  getApplicationStats,
  downloadResume,
  upload
} from '../controllers/internshipApplicationController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// Public route for submitting applications
router.post('/submit/:programSlug', 
  upload.single('resume'), 
  asyncHandler(submitApplication)
);

// Protected routes (require authentication)
router.use(authenticate);

// HR/Admin only routes
router.get('/', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(getAllApplications)
);

router.get('/stats', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(getApplicationStats)
);

router.get('/:id', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(getApplicationById)
);

router.put('/:id/status', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(updateApplicationStatus)
);

router.post('/:id/comments', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(addComment)
);

router.put('/bulk-update', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(bulkUpdateApplications)
);

router.get('/:id/resume', 
  authorize(UserRole.ADMIN, UserRole.HR), 
  asyncHandler(downloadResume)
);

export default router;
