"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeTeamAccess = exports.authorize = void 0;
const User_1 = require("../models/User");
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: 'Access denied. Insufficient permissions.'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const authorizeTeamAccess = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    const { role, team: userTeam, id: userId } = req.user;
    const { teamId } = req.params;
    if (role === User_1.UserRole.ADMIN || role === User_1.UserRole.HR) {
        next();
        return;
    }
    if (role === User_1.UserRole.MANAGER) {
        if (userTeam !== teamId) {
            res.status(403).json({
                message: 'Access denied. You can only manage your own team.'
            });
            return;
        }
        next();
        return;
    }
    if (role === User_1.UserRole.EMPLOYEE) {
        if (userTeam !== teamId) {
            res.status(403).json({
                message: 'Access denied. You can only view your own team.'
            });
            return;
        }
        next();
        return;
    }
    res.status(403).json({ message: 'Access denied.' });
};
exports.authorizeTeamAccess = authorizeTeamAccess;
//# sourceMappingURL=authorize.js.map