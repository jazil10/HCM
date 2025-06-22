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
exports.getAttendanceSummary = exports.updateAttendance = exports.getTodayAttendance = exports.getAttendance = exports.clockOut = exports.clockIn = void 0;
const Attendance_1 = __importDefault(require("../models/Attendance"));
const User_1 = __importStar(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const clockIn = async (req, res) => {
    try {
        const userId = req.user?.id;
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const existingAttendance = await Attendance_1.default.findOne({
            employee: userId,
            date: startOfDay
        });
        if (existingAttendance && existingAttendance.checkIn) {
            res.status(400).json({ message: 'Already clocked in today' });
            return;
        }
        let attendance;
        if (existingAttendance) {
            attendance = await Attendance_1.default.findByIdAndUpdate(existingAttendance._id, {
                checkIn: new Date(),
                status: 'present'
            }, { new: true }).populate('employee', 'name email');
        }
        else {
            attendance = new Attendance_1.default({
                employee: userId,
                date: startOfDay,
                checkIn: new Date(),
                status: 'present'
            });
            await attendance.save();
            attendance = await attendance.populate('employee', 'name email');
        }
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.clockIn = clockIn;
const clockOut = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { breakTime } = req.body;
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const attendance = await Attendance_1.default.findOne({
            employee: userId,
            date: startOfDay
        });
        if (!attendance || !attendance.checkIn) {
            res.status(400).json({ message: 'Please clock in first' });
            return;
        }
        if (attendance.checkOut) {
            res.status(400).json({ message: 'Already clocked out today' });
            return;
        }
        attendance.checkOut = new Date();
        if (breakTime !== undefined)
            attendance.breakTime = breakTime;
        if (attendance.checkIn && attendance.checkOut) {
            const diffInMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
            const diffInHours = diffInMs / (1000 * 60 * 60);
            const breakHours = (attendance.breakTime || 0) / 60;
            attendance.totalHours = Math.max(0, diffInHours - breakHours);
        }
        await attendance.save();
        const populatedAttendance = await attendance.populate('employee', 'name email');
        res.json(populatedAttendance);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.clockOut = clockOut;
const getAttendance = async (req, res) => {
    try {
        const { employeeId, startDate, endDate, page = 1, limit = 10 } = req.query;
        const userRole = req.user?.role;
        const userId = req.user?.id;
        const filter = {};
        if (employeeId && (userRole === User_1.UserRole.ADMIN || userRole === User_1.UserRole.HR)) {
            filter.employee = employeeId;
        }
        else if (userRole === User_1.UserRole.MANAGER) {
            const teamMembers = await User_1.default.find({ team: req.user?.team }).select('_id');
            const memberIds = teamMembers.map(member => member._id);
            if (employeeId && memberIds.includes(employeeId)) {
                filter.employee = employeeId;
            }
            else if (!employeeId) {
                filter.employee = { $in: memberIds };
            }
            else {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        }
        else {
            filter.employee = userId;
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const attendance = await Attendance_1.default.find(filter)
            .populate('employee', 'name email')
            .populate('approvedBy', 'name email')
            .skip(skip)
            .limit(Number(limit))
            .sort({ date: -1 });
        const total = await Attendance_1.default.countDocuments(filter);
        res.json({
            attendance,
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
exports.getAttendance = getAttendance;
const getTodayAttendance = async (req, res) => {
    try {
        const userId = req.user?.id;
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const attendance = await Attendance_1.default.findOne({
            employee: userId,
            date: startOfDay
        }).populate('employee', 'name email');
        if (!attendance) {
            res.json({
                message: 'No attendance record for today',
                clockedIn: false
            });
            return;
        }
        res.json({
            ...attendance.toObject(),
            clockedIn: !!attendance.checkIn,
            clockedOut: !!attendance.checkOut
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTodayAttendance = getTodayAttendance;
const updateAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { status, checkIn, checkOut, breakTime, notes } = req.body;
        const userRole = req.user?.role;
        const userId = req.user?.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(attendanceId || '')) {
            res.status(400).json({ message: 'Invalid attendance ID' });
            return;
        }
        const attendance = await Attendance_1.default.findById(attendanceId).populate('employee');
        if (!attendance) {
            res.status(404).json({ message: 'Attendance record not found' });
            return;
        }
        if (userRole === User_1.UserRole.MANAGER) {
            const employee = await User_1.default.findById(attendance.employee);
            if (!employee || employee.team?.toString() !== req.user?.team) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        }
        const updateData = {};
        if (status)
            updateData.status = status;
        if (checkIn)
            updateData.checkIn = new Date(checkIn);
        if (checkOut)
            updateData.checkOut = new Date(checkOut);
        if (breakTime !== undefined)
            updateData.breakTime = breakTime;
        if (notes !== undefined)
            updateData.notes = notes;
        updateData.approvedBy = userId;
        const updatedAttendance = await Attendance_1.default.findByIdAndUpdate(attendanceId, updateData, { new: true }).populate('employee', 'name email')
            .populate('approvedBy', 'name email');
        if (checkIn || checkOut || breakTime !== undefined) {
            if (updatedAttendance?.checkIn && updatedAttendance?.checkOut) {
                const diffInMs = updatedAttendance.checkOut.getTime() - updatedAttendance.checkIn.getTime();
                const diffInHours = diffInMs / (1000 * 60 * 60);
                const breakHours = (updatedAttendance.breakTime || 0) / 60;
                updatedAttendance.totalHours = Math.max(0, diffInHours - breakHours);
            }
            await updatedAttendance?.save();
        }
        res.json(updatedAttendance);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateAttendance = updateAttendance;
const getAttendanceSummary = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;
        const userRole = req.user?.role;
        const userId = req.user?.id;
        let targetEmployeeId = userId;
        if (employeeId) {
            if (userRole === User_1.UserRole.ADMIN || userRole === User_1.UserRole.HR) {
                targetEmployeeId = employeeId;
            }
            else if (userRole === User_1.UserRole.MANAGER) {
                const employee = await User_1.default.findById(employeeId);
                if (!employee || employee.team?.toString() !== req.user?.team) {
                    res.status(403).json({ message: 'Access denied' });
                    return;
                }
                targetEmployeeId = employeeId;
            }
            else if (employeeId !== userId) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        }
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth();
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0);
        const attendance = await Attendance_1.default.find({
            employee: targetEmployeeId,
            date: { $gte: startDate, $lte: endDate }
        });
        const summary = {
            totalDays: attendance.length,
            presentDays: attendance.filter(a => a.status === 'present').length,
            absentDays: attendance.filter(a => a.status === 'absent').length,
            lateDays: attendance.filter(a => a.status === 'late').length,
            halfDays: attendance.filter(a => a.status === 'half-day').length,
            totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
            averageHours: 0
        };
        if (summary.presentDays > 0) {
            summary.averageHours = summary.totalHours / summary.presentDays;
        }
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAttendanceSummary = getAttendanceSummary;
//# sourceMappingURL=attendanceController.js.map