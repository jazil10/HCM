"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const User_1 = require("../models/User");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/profile', (0, asyncHandler_1.default)(userController_1.getProfile));
router.put('/profile', (0, asyncHandler_1.default)(userController_1.updateProfile));
router.put('/:userId/change-password', (0, asyncHandler_1.default)(userController_1.changePassword));
router.get('/', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(userController_1.getAllUsers));
router.get('/team/:teamId?/members', (0, asyncHandler_1.default)(userController_1.getTeamMembers));
router.get('/:userId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(userController_1.getUserById));
router.put('/:userId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(userController_1.updateUser));
router.delete('/:userId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN), (0, asyncHandler_1.default)(userController_1.deleteUser));
exports.default = router;
//# sourceMappingURL=users.js.map