import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import Team from '../models/Team';
import { AuthenticatedRequest } from '../types/auth';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Get all users (Admin/HR only)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, team, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (team) filter.team = team;

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select('-password')
      .populate('team', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get user by ID
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('team', 'name');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update user (Admin/HR only)
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, role, team } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
    }

    // Verify team exists if provided
    if (team) {
      const teamExists = await Team.findById(team);
      if (!teamExists) {
        res.status(400).json({ message: 'Team not found' });
        return;
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (team !== undefined) updateData.team = team;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password').populate('team', 'name');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is a manager of any team
    const managedTeam = await Team.findOne({ manager: userId });
    if (managedTeam) {
      res.status(400).json({ 
        message: 'Cannot delete user who is managing a team. Please reassign the team first.' 
      });
      return;
    }

    // Remove user from any team they're a member of
    await Team.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const requestingUserId = req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    // Users can only change their own password unless they're admin/hr
    if (userId !== requestingUserId && 
        req.user?.role !== UserRole.ADMIN && 
        req.user?.role !== UserRole.HR) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If user is changing their own password, verify current password
    if (userId === requestingUserId && currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get current user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user = await User.findById(userId)
      .select('-password')
      .populate('team', 'name');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update current user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password').populate('team', 'name');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get team members (for managers)
export const getTeamMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let teamId;

    if (userRole === UserRole.ADMIN || userRole === UserRole.HR) {
      // Admin/HR can view any team
      teamId = req.params.teamId;
    } else {
      // Managers and employees can only view their own team
      const currentUser = await User.findById(userId);
      if (!currentUser?.team) {
        res.status(404).json({ message: 'No team assigned' });
        return;
      }
      teamId = currentUser.team;
    }

    const members = await User.find({ team: teamId })
      .select('-password')
      .populate('team', 'name')
      .sort({ role: 1, name: 1 });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
