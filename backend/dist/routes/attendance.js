"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const User_1 = require("../models/User");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/clock-in', (0, asyncHandler_1.default)(attendanceController_1.clockIn));
router.post('/clock-out', (0, asyncHandler_1.default)(attendanceController_1.clockOut));
router.get('/today', (0, asyncHandler_1.default)(attendanceController_1.getTodayAttendance));
router.get('/summary', (0, asyncHandler_1.default)(attendanceController_1.getAttendanceSummary));
router.get('/', (0, asyncHandler_1.default)(attendanceController_1.getAttendance));
router.put('/:attendanceId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR, User_1.UserRole.MANAGER), (0, asyncHandler_1.default)(attendanceController_1.updateAttendance));
exports.default = router;
//# sourceMappingURL=attendance.js.map