"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teamController_1 = require("../controllers/teamController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const User_1 = require("../models/User");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(teamController_1.getAllTeams));
router.get('/my-team', (0, asyncHandler_1.default)(teamController_1.getMyTeam));
router.get('/:teamId', authorize_1.authorizeTeamAccess, (0, asyncHandler_1.default)(teamController_1.getTeam));
router.post('/', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(teamController_1.createTeam));
router.put('/:teamId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(teamController_1.updateTeam));
router.delete('/:teamId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(teamController_1.deleteTeam));
router.post('/:teamId/members', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR, User_1.UserRole.MANAGER), authorize_1.authorizeTeamAccess, (0, asyncHandler_1.default)(teamController_1.addMemberToTeam));
router.delete('/:teamId/members/:userId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR, User_1.UserRole.MANAGER), authorize_1.authorizeTeamAccess, (0, asyncHandler_1.default)(teamController_1.removeMemberFromTeam));
exports.default = router;
//# sourceMappingURL=teams.js.map