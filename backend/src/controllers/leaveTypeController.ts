import { Response } from 'express';
import LeaveType, { ILeaveType } from '../models/LeaveType';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../models/User';

// Get all leave types
export const getAllLeaveTypes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ name: 1 });
    
    res.json(leaveTypes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific leave type
export const getLeaveType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leaveType = await LeaveType.findById(id).populate('createdBy', 'name email');
    
    if (!leaveType) {
      res.status(404).json({ message: 'Leave type not found' });
      return;
    }

    res.json(leaveType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a new leave type (Admin/HR only)
export const createLeaveType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      maxDaysPerYear,
      maxConsecutiveDays,
      carryForwardAllowed,
      maxCarryForwardDays,
      encashmentAllowed,
      attachmentRequired,
      eligibilityMonths,
      applicableToGenders,
      color
    } = req.body;

    if (!name || !maxDaysPerYear || !maxConsecutiveDays) {
      res.status(400).json({ message: 'Name, max days per year, and max consecutive days are required' });
      return;
    }

    const existingLeaveType = await LeaveType.findOne({ name: name.trim() });
    if (existingLeaveType) {
      res.status(409).json({ message: 'Leave type with this name already exists' });
      return;
    }

    const leaveType = new LeaveType({
      name: name.trim(),
      description,
      maxDaysPerYear,
      maxConsecutiveDays,
      carryForwardAllowed: carryForwardAllowed || false,
      maxCarryForwardDays: maxCarryForwardDays || 0,
      encashmentAllowed: encashmentAllowed || false,
      attachmentRequired: attachmentRequired || false,
      eligibilityMonths: eligibilityMonths || 0,
      applicableToGenders: applicableToGenders || ['all'],
      color: color || '#3B82F6',
      createdBy: req.user?.id
    });

    await leaveType.save();
    
    const populatedLeaveType = await LeaveType.findById(leaveType._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedLeaveType);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Leave type with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error });
    }
  }
};

// Update a leave type (Admin/HR only)
export const updateLeaveType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const leaveType = await LeaveType.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!leaveType) {
      res.status(404).json({ message: 'Leave type not found' });
      return;
    }

    res.json(leaveType);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Leave type with this name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error });
    }
  }
};

// Delete/Deactivate a leave type (Admin only)
export const deleteLeaveType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Instead of deleting, deactivate the leave type
    const leaveType = await LeaveType.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!leaveType) {
      res.status(404).json({ message: 'Leave type not found' });
      return;
    }

    res.json({ message: 'Leave type deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
