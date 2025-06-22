import { Request, Response } from 'express';
import Team, { ITeam } from '../models/Team';
import User, { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';
import mongoose from 'mongoose';

// Get all teams (Admin/HR only)
export const getAllTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teams = await Team.find()
      .populate('manager', 'name email role')
      .populate('members', 'name email role');
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific team
export const getTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(teamId || '')) {
      res.status(400).json({ message: 'Invalid team ID' });
      return;
    }

    const team = await Team.findById(teamId)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');
    
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a new team (Admin/HR only)
export const createTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, managerId, memberIds = [] } = req.body;

    if (!name || !managerId) {
      res.status(400).json({ message: 'Team name and manager are required' });
      return;
    }

    // Verify manager exists and has correct role
    const manager = await User.findById(managerId);
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    if (manager.role !== UserRole.MANAGER) {
      res.status(400).json({ message: 'Selected user must have manager role' });
      return;
    }

    // Verify all members exist
    if (memberIds.length > 0) {
      const members = await User.find({ _id: { $in: memberIds } });
      if (members.length !== memberIds.length) {
        res.status(400).json({ message: 'One or more members not found' });
        return;
      }
    }

    const team = new Team({
      name,
      manager: managerId,
      members: memberIds
    });

    await team.save();

    // Update manager's team reference
    await User.findByIdAndUpdate(managerId, { team: team._id });

    // Update members' team references
    if (memberIds.length > 0) {
      await User.updateMany(
        { _id: { $in: memberIds } },
        { team: team._id }
      );
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a team (Admin/HR only)
export const updateTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, managerId, memberIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamId || '')) {
      res.status(400).json({ message: 'Invalid team ID' });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    // Clear old team references
    await User.updateMany(
      { team: teamId },
      { $unset: { team: 1 } }
    );

    // Update team
    const updateData: Partial<ITeam> = {};
    if (name) updateData.name = name;
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== UserRole.MANAGER) {
        res.status(400).json({ message: 'Invalid manager' });
        return;
      }
      updateData.manager = new mongoose.Types.ObjectId(managerId);
    }
    if (memberIds) {
      updateData.members = memberIds.map((id: string) => new mongoose.Types.ObjectId(id));
    }

    const finalTeam = await Team.findByIdAndUpdate(
      teamId,
      { $set: updateData },
      { new: true }
    );
    
    if (!finalTeam) {
      return res.status(404).json({ message: 'Team not found after update' });
    }

    // Now, correctly set the team field on all relevant users
    const allMemberIds = finalTeam.members.map(m => m.toString());
    if (finalTeam.manager) {
      allMemberIds.push(finalTeam.manager.toString());
    }

    await User.updateMany(
      { _id: { $in: allMemberIds } },
      { $set: { team: finalTeam._id } }
    );
    
    const populatedTeam = await Team.findById(finalTeam._id)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    return res.json(populatedTeam);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Delete a team (Admin/HR only)
export const deleteTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teamId || '')) {
      res.status(400).json({ message: 'Invalid team ID' });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    // Remove team references from users
    await User.updateMany(
      { team: teamId },
      { $unset: { team: 1 } }
    );

    await Team.findByIdAndDelete(teamId);

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add member to team (Admin/HR/Manager)
export const addMemberToTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(teamId || '') || !mongoose.Types.ObjectId.isValid(userId || '')) {
      res.status(400).json({ message: 'Invalid team ID or user ID' });
      return;
    }

    const team = await Team.findById(teamId);
    const user = await User.findById(userId);

    if (!team || !user) {
      res.status(404).json({ message: 'Team or user not found' });
      return;
    }

    // Check if user is already in the team
    if (team.members.some(member => member.equals(userId))) {
      res.status(400).json({ message: 'User is already a member of this team' });
      return;
    }

    // Add user to team
    team.members.push(new mongoose.Types.ObjectId(userId));
    await team.save();
    // Update user's team reference
    user.team = new mongoose.Types.ObjectId(teamId);
    await user.save();

    const updatedTeam = await Team.findById(teamId)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove member from team (Admin/HR/Manager)
export const removeMemberFromTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { teamId, userId } = req.params;    if (!mongoose.Types.ObjectId.isValid(teamId || '') || !mongoose.Types.ObjectId.isValid(userId || '')) {
      res.status(400).json({ message: 'Invalid team ID or user ID' });
      return;
    }

    const team = await Team.findById(teamId);
    const user = await User.findById(userId);

    if (!team || !user) {
      res.status(404).json({ message: 'Team or user not found' });
      return;
    }

    // Remove user from team
    team.members = team.members.filter(member => member.toString() !== userId);
    await team.save();

    // Remove team reference from user
    user.team = undefined;
    await user.save();

    const updatedTeam = await Team.findById(teamId)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get user's team (for employees/managers)
export const getMyTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      // Added a more specific check for the user
      return res.status(404).json({ message: 'User profile not found.' });
    }
    
    if (!user.team) {
      return res.status(404).json({ message: 'You are not assigned to a team. Please contact an admin.' });
    }

    const team = await Team.findById(user.team)
      .populate('manager', 'name email role')
      .populate('members', 'name email role');

    if (!team) {
      // Added a check in case the team ID on the user is stale
      return res.status(404).json({ message: 'Your assigned team could not be found. Please contact an admin.' });
    }

    return res.json(team);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
