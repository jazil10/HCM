import { Response } from 'express';
import Leave, { ILeave, LeaveStatus } from '../models/Leave';
import LeaveBalance from '../models/LeaveBalance';
import LeaveType from '../models/LeaveType';
import Employee from '../models/Employee';
import User, { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';
import mongoose from 'mongoose';

// Get all leaves (Admin/HR can see all, Manager can see team leaves, Employee can see own)
export const getAllLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, id: userId } = req.user!;
    const { status, startDate, endDate, employeeId, leaveType, page = 1, limit = 10 } = req.query;

    let query: any = {};
    
    // Role-based filtering
    if (role === UserRole.EMPLOYEE) {
      const employee = await Employee.findOne({ user: userId });
      if (!employee) {
        res.status(404).json({ message: 'Employee profile not found' });
        return;
      }
      query.employee = employee._id;
    } else if (role === UserRole.MANAGER) {
      // Get team members for manager
      const user = await User.findById(userId);
      if (user?.team) {
        const teamMembers = await Employee.find({
          user: { $in: await User.find({ team: user.team }).distinct('_id') }
        });
        query.employee = { $in: teamMembers.map(emp => emp._id) };
      }
    }

    // Apply additional filters
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;
    if (leaveType) query.leaveType = leaveType;
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const leaves = await Leave.find(query)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('leaveType', 'name color')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('comments.user', 'name email')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Leave.countDocuments(query);

    res.json({
      leaves,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific leave
export const getLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user!;

    const leave = await Leave.findById(id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('leaveType', 'name color')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('comments.user', 'name email');

    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }    // Check access permissions
    if (role === UserRole.EMPLOYEE) {
      const employee = await Employee.findOne({ user: userId });
      if (!employee || leave.employee._id.toString() !== (employee._id as any).toString()) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    } else if (role === UserRole.MANAGER) {
      // Check if the leave belongs to a team member
      const user = await User.findById(userId);
      if (user?.team) {
        const teamMembers = await Employee.find({
          user: { $in: await User.find({ team: user.team }).distinct('_id') }
        });
        const isTeamMember = teamMembers.some(emp => 
          (emp._id as any).toString() === leave.employee._id.toString()
        );
        if (!isTeamMember) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a new leave request
export const createLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      isEmergency,
      handoverNotes,
      contactDuringLeave
    } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      res.status(400).json({ message: 'Leave type, dates, and reason are required' });
      return;
    }

    // Get employee profile
    const employee = await Employee.findOne({ user: req.user?.id });
    if (!employee) {
      res.status(404).json({ message: 'Employee profile not found' });
      return;
    }

    // Validate leave type
    const leaveTypeDoc = await LeaveType.findById(leaveType);
    if (!leaveTypeDoc || !leaveTypeDoc.isActive) {
      res.status(400).json({ message: 'Invalid leave type' });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      res.status(400).json({ message: 'End date must be after start date' });
      return;
    }

    // Calculate total days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check if exceeds maximum consecutive days
    if (totalDays > leaveTypeDoc.maxConsecutiveDays) {
      res.status(400).json({ 
        message: `Cannot apply for more than ${leaveTypeDoc.maxConsecutiveDays} consecutive days for ${leaveTypeDoc.name}` 
      });
      return;
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      employee: employee._id,
      leaveType: leaveType,
      year: currentYear
    });

    if (leaveBalance && leaveBalance.remaining < totalDays) {
      res.status(400).json({ 
        message: `Insufficient leave balance. Available: ${leaveBalance.remaining} days` 
      });
      return;
    }

    // Get manager for approval workflow
    const managerId = employee.manager;

    const leave = new Leave({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      isEmergency: isEmergency || false,
      handoverNotes: handoverNotes?.trim(),
      contactDuringLeave,
      managerId
    });

    await leave.save();

    // Update leave balance (pending)
    if (leaveBalance) {
      leaveBalance.pending += totalDays;
      await leaveBalance.save();
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('leaveType', 'name color');

    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update leave request (employee can update pending requests)
export const updateLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user!;

    const leave = await Leave.findById(id);
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    // Only allow updates for pending requests
    if (leave.status !== LeaveStatus.PENDING) {
      res.status(400).json({ message: 'Can only update pending leave requests' });
      return;
    }    // Check permissions
    if (role === UserRole.EMPLOYEE) {
      const employee = await Employee.findOne({ user: userId });
      if (!employee || leave.employee.toString() !== (employee._id as any).toString()) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    const updateData = req.body;
    delete updateData.status; // Prevent status updates through this endpoint
    delete updateData.approvedBy;
    delete updateData.rejectedBy;

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: 'employee',
      populate: { path: 'user', select: 'name email' }
    }).populate('leaveType', 'name color');

    res.json(updatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Approve leave request (Manager/HR/Admin)
export const approveLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const { id: userId } = req.user!;

    const leave = await Leave.findById(id);
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    if (leave.status !== LeaveStatus.PENDING) {
      res.status(400).json({ message: 'Leave request is not pending' });
      return;
    }

    // Update leave status
    leave.status = LeaveStatus.APPROVED;
    leave.approvedBy = new mongoose.Types.ObjectId(userId);
    leave.approvedDate = new Date();

    if (comments) {
      leave.comments.push({
        user: new mongoose.Types.ObjectId(userId),
        comment: comments,
        timestamp: new Date()
      } as any);
    }

    await leave.save();

    // Update leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      employee: leave.employee,
      leaveType: leave.leaveType,
      year: currentYear
    });

    if (leaveBalance) {
      leaveBalance.used += leave.totalDays;
      leaveBalance.pending = Math.max(0, leaveBalance.pending - leave.totalDays);
      await leaveBalance.save();
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('leaveType', 'name color')
      .populate('approvedBy', 'name email')
      .populate('comments.user', 'name email');

    res.json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Reject leave request (Manager/HR/Admin)
export const rejectLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason, comments } = req.body;
    const { id: userId } = req.user!;

    if (!rejectionReason) {
      res.status(400).json({ message: 'Rejection reason is required' });
      return;
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    if (leave.status !== LeaveStatus.PENDING) {
      res.status(400).json({ message: 'Leave request is not pending' });
      return;
    }

    // Update leave status
    leave.status = LeaveStatus.REJECTED;
    leave.rejectedBy = new mongoose.Types.ObjectId(userId);
    leave.rejectedDate = new Date();
    leave.rejectionReason = rejectionReason;

    if (comments) {
      leave.comments.push({
        user: new mongoose.Types.ObjectId(userId),
        comment: comments,
        timestamp: new Date()
      } as any);
    }

    await leave.save();

    // Update leave balance (remove from pending)
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      employee: leave.employee,
      leaveType: leave.leaveType,
      year: currentYear
    });

    if (leaveBalance) {
      leaveBalance.pending = Math.max(0, leaveBalance.pending - leave.totalDays);
      await leaveBalance.save();
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('leaveType', 'name color')
      .populate('rejectedBy', 'name email')
      .populate('comments.user', 'name email');

    res.json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Cancel leave request (Employee)
export const cancelLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user!;

    const leave = await Leave.findById(id);
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }    // Check permissions
    if (role === UserRole.EMPLOYEE) {
      const employee = await Employee.findOne({ user: userId });
      if (!employee || leave.employee.toString() !== (employee._id as any).toString()) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    if (leave.status === LeaveStatus.CANCELLED) {
      res.status(400).json({ message: 'Leave request is already cancelled' });
      return;
    }

    const previousStatus = leave.status;
    leave.status = LeaveStatus.CANCELLED;
    await leave.save();

    // Update leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      employee: leave.employee,
      leaveType: leave.leaveType,
      year: currentYear
    });

    if (leaveBalance) {
      if (previousStatus === LeaveStatus.APPROVED) {
        leaveBalance.used = Math.max(0, leaveBalance.used - leave.totalDays);
      } else if (previousStatus === LeaveStatus.PENDING) {
        leaveBalance.pending = Math.max(0, leaveBalance.pending - leave.totalDays);
      }
      await leaveBalance.save();
    }

    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add comment to leave request
export const addLeaveComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const { id: userId } = req.user!;

    if (!comment?.trim()) {
      res.status(400).json({ message: 'Comment is required' });
      return;
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    leave.comments.push({
      user: new mongoose.Types.ObjectId(userId),
      comment: comment.trim(),
      timestamp: new Date()
    } as any);

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('comments.user', 'name email');

    res.json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
