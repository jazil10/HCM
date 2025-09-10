import express from 'express';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';
import { UserRole } from '../models/User';
import {
  getHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getCurrentMonthHolidays,
  getUpcomingHolidays
} from '../controllers/holidayController';

const router = express.Router();

// Public routes (all authenticated users can view holidays)
router.get('/', authenticate, getHolidays);
router.get('/current-month', authenticate, getCurrentMonthHolidays);
router.get('/upcoming', authenticate, getUpcomingHolidays);
router.get('/:id', authenticate, getHolidayById);

// Admin and HR routes (can create, update, delete holidays)
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.HR), createHoliday);
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.HR), updateHoliday);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.HR), deleteHoliday);

export default router;
