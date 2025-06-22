"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTeam = exports.removeMemberFromTeam = exports.addMemberToTeam = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeam = exports.getAllTeams = void 0;
const Team_1 = __importDefault(require("../models/Team"));
const User_1 = __importStar(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllTeams = async (req, res) => {
    try {
        const teams = await Team_1.default.find()
            .populate('manager', 'name email role')
            .populate('members', 'name email role');
        res.json(teams);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllTeams = getAllTeams;
const getTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(teamId || '')) {
            res.status(400).json({ message: 'Invalid team ID' });
            return;
        }
        const team = await Team_1.default.findById(teamId)
            .populate('manager', 'name email role')
            .populate('members', 'name email role');
        if (!team) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTeam = getTeam;
const createTeam = async (req, res) => {
    try {
        const { name, managerId, memberIds = [] } = req.body;
        if (!name || !managerId) {
            res.status(400).json({ message: 'Team name and manager are required' });
            return;
        }
        const manager = await User_1.default.findById(managerId);
        if (!manager) {
            res.status(404).json({ message: 'Manager not found' });
            return;
        }
        if (manager.role !== User_1.UserRole.MANAGER) {
            res.status(400).json({ message: 'Selected user must have manager role' });
            return;
        }
        if (memberIds.length > 0) {
            const members = await User_1.default.find({ _id: { $in: memberIds } });
            if (members.length !== memberIds.length) {
                res.status(400).json({ message: 'One or more members not found' });
                return;
            }
        }
        const team = new Team_1.default({
            name,
            manager: managerId,
            members: memberIds
        });
        await team.save();
        await User_1.default.findByIdAndUpdate(managerId, { team: team._id });
        if (memberIds.length > 0) {
            await User_1.default.updateMany({ _id: { $in: memberIds } }, { team: team._id });
        }
        const populatedTeam = await Team_1.default.findById(team._id)
            .populate('manager', 'name email role')
            .populate('members', 'name email role');
        res.status(201).json(populatedTeam);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createTeam = createTeam;
const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, managerId, memberIds } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(teamId || '')) {
            res.status(400).json({ message: 'Invalid team ID' });
            return;
        }
        const team = await Team_1.default.findById(teamId);
        if (!team) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }
        await User_1.default.updateMany({ team: teamId }, { $unset: { team: 1 } });
        const updateData = {};
        if (name)
            updateData.name = name;
        if (managerId) {
            const manager = await User_1.default.findById(managerId);
            if (!manager || manager.role !== User_1.UserRole.MANAGER) {
                res.status(400).json({ message: 'Invalid manager' });
                return;
            }
            updateData.manager = new mongoose_1.default.Types.ObjectId(managerId);
        }
        if (memberIds) {
            updateData.members = memberIds.map((id) => new mongoose_1.default.Types.ObjectId(id));
        }
        const updatedTeam = await Team_1.default.findByIdAndUpdate(teamId, updateData, { new: true }).populate('manager', 'name email role')
            .populate('members', 'name email role');
        if (updatedTeam) {
            if (updatedTeam.manager) {
                await User_1.default.findByIdAndUpdate(updatedTeam.manager._id, { team: updatedTeam._id });
            }
            if (updatedTeam.members && updatedTeam.members.length > 0) {
                const memberObjectIds = updatedTeam.members.map((member) => member._id);
                await User_1.default.updateMany({ _id: { $in: memberObjectIds } }, { team: updatedTeam._id });
            }
        }
        res.json(updatedTeam);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(teamId || '')) {
            res.status(400).json({ message: 'Invalid team ID' });
            return;
        }
        const team = await Team_1.default.findById(teamId);
        if (!team) {
            res.status(404).json({ message: 'Team not found' });
            return;
        }
        await User_1.default.updateMany({ team: teamId }, { $unset: { team: 1 } });
        await Team_1.default.findByIdAndDelete(teamId);
        res.json({ message: 'Team deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteTeam = deleteTeam;
const addMemberToTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(teamId || '') || !mongoose_1.default.Types.ObjectId.isValid(userId || '')) {
            res.status(400).json({ message: 'Invalid team ID or user ID' });
            return;
        }
        const team = await Team_1.default.findById(teamId);
        const user = await User_1.default.findById(userId);
        if (!team || !user) {
            res.status(404).json({ message: 'Team or user not found' });
            return;
        }
        if (team.members.some(member => member.equals(userId))) {
            res.status(400).json({ message: 'User is already a member of this team' });
            return;
        }
        team.members.push(new mongoose_1.default.Types.ObjectId(userId));
        await team.save();
        user.team = new mongoose_1.default.Types.ObjectId(teamId);
        await user.save();
        const updatedTeam = await Team_1.default.findById(teamId)
            .populate('manager', 'name email role')
            .populate('members', 'name email role');
        res.json(updatedTeam);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.addMemberToTeam = addMemberToTeam;
const removeMemberFromTeam = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(teamId || '') || !mongoose_1.default.Types.ObjectId.isValid(userId || '')) {
            res.status(400).json({ message: 'Invalid team ID or user ID' });
            return;
        }
        const team = await Team_1.default.findById(teamId);
        const user = await User_1.default.findById(userId);
        if (!team || !user) {
            res.status(404).json({ message: 'Team or user not found' });
            return;
        }
        team.members = team.members.filter(member => member.toString() !== userId);
        await team.save();
        user.team = undefined;
        await user.save();
        const updatedTeam = await Team_1.default.findById(teamId)
            .populate('manager', 'name email role')
            .populate('members', 'name email role');
        res.json(updatedTeam);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.removeMemberFromTeam = removeMemberFromTeam;
const getMyTeam = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const user = await User_1.default.findById(userId).populate('team');
        if (!user || !user.team) {
            res.status(404).json({ message: 'No team assigned' });
            return;
        }
        const team = await Team_1.default.findById(user.team)
            .populate('manager', 'name email role')
            .populate('members', 'name email role');
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getMyTeam = getMyTeam;
//# sourceMappingURL=teamController.js.map