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
exports.getTeamMembers = exports.updateProfile = exports.getProfile = exports.changePassword = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importStar(require("../models/User"));
const Team_1 = __importDefault(require("../models/Team"));
const bcrypt = __importStar(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllUsers = async (req, res) => {
    try {
        const { role, team, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        if (team)
            filter.team = team;
        const skip = (Number(page) - 1) * Number(limit);
        const users = await User_1.default.find(filter)
            .select('-password')
            .populate('team', 'name')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.default.countDocuments(filter);
        res.json({
            users,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / Number(limit)),
                total,
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        const user = await User_1.default.findById(userId)
            .select('-password')
            .populate('team', 'name');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role, team } = req.body;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (email && email !== user.email) {
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: 'Email already in use' });
                return;
            }
        }
        if (team) {
            const teamExists = await Team_1.default.findById(team);
            if (!teamExists) {
                res.status(400).json({ message: 'Team not found' });
                return;
            }
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (role)
            updateData.role = role;
        if (team !== undefined)
            updateData.team = team;
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true }).select('-password').populate('team', 'name');
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const managedTeam = await Team_1.default.findOne({ manager: userId });
        if (managedTeam) {
            res.status(400).json({
                message: 'Cannot delete user who is managing a team. Please reassign the team first.'
            });
            return;
        }
        await Team_1.default.updateMany({ members: userId }, { $pull: { members: userId } });
        await User_1.default.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteUser = deleteUser;
const changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;
        const requestingUserId = req.user?.id;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        if (userId !== requestingUserId &&
            req.user?.role !== User_1.UserRole.ADMIN &&
            req.user?.role !== User_1.UserRole.HR) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
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
        await User_1.default.findByIdAndUpdate(userId, { password: hashedNewPassword });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.changePassword = changePassword;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.default.findById(userId)
            .select('-password')
            .populate('team', 'name');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, email } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (email && email !== user.email) {
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: 'Email already in use' });
                return;
            }
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, updateData, { new: true }).select('-password').populate('team', 'name');
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateProfile = updateProfile;
const getTeamMembers = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        let teamId;
        if (userRole === User_1.UserRole.ADMIN || userRole === User_1.UserRole.HR) {
            teamId = req.params.teamId;
        }
        else {
            const currentUser = await User_1.default.findById(userId);
            if (!currentUser?.team) {
                res.status(404).json({ message: 'No team assigned' });
                return;
            }
            teamId = currentUser.team;
        }
        const members = await User_1.default.find({ team: teamId })
            .select('-password')
            .populate('team', 'name')
            .sort({ role: 1, name: 1 });
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTeamMembers = getTeamMembers;
//# sourceMappingURL=userController.js.map