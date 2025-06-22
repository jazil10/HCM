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
exports.getMyEmployeeProfile = exports.getEmployeeByUserId = exports.deleteEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getAllEmployees = exports.createEmployee = void 0;
const Employee_1 = __importDefault(require("../models/Employee"));
const User_1 = __importStar(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const generateEmployeeId = async () => {
    const year = new Date().getFullYear();
    const count = await Employee_1.default.countDocuments();
    return `EMP${year}${String(count + 1).padStart(4, '0')}`;
};
const createEmployee = async (req, res) => {
    try {
        const { userId, department, position, joinDate, salary, manager, workLocation, phoneNumber, emergencyContact, address } = req.body;
        if (!userId || !department || !position || !salary || !workLocation) {
            res.status(400).json({
                message: 'User ID, department, position, salary, and work location are required'
            });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const existingEmployee = await Employee_1.default.findOne({ user: userId });
        if (existingEmployee) {
            res.status(400).json({ message: 'Employee profile already exists for this user' });
            return;
        }
        if (manager) {
            const managerUser = await User_1.default.findById(manager);
            if (!managerUser || managerUser.role !== User_1.UserRole.MANAGER) {
                res.status(400).json({ message: 'Invalid manager' });
                return;
            }
        }
        const employeeId = await generateEmployeeId();
        const employee = new Employee_1.default({
            user: userId,
            employeeId,
            department,
            position,
            joinDate: joinDate ? new Date(joinDate) : new Date(),
            salary,
            manager,
            workLocation,
            phoneNumber,
            emergencyContact,
            address
        });
        await employee.save();
        const populatedEmployee = await Employee_1.default.findById(employee._id)
            .populate('user', 'name email role')
            .populate('manager', 'name email');
        res.status(201).json(populatedEmployee);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createEmployee = createEmployee;
const getAllEmployees = async (req, res) => {
    try {
        const { department, status, manager, page = 1, limit = 10 } = req.query;
        const userRole = req.user?.role;
        const userId = req.user?.id;
        const filter = {};
        if (userRole === User_1.UserRole.MANAGER) {
            filter.manager = userId;
        }
        if (department)
            filter.department = department;
        if (status)
            filter.status = status;
        if (manager && (userRole === User_1.UserRole.ADMIN || userRole === User_1.UserRole.HR)) {
            filter.manager = manager;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const employees = await Employee_1.default.find(filter)
            .populate('user', 'name email role team')
            .populate('manager', 'name email')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Employee_1.default.countDocuments(filter);
        res.json({
            employees,
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
exports.getAllEmployees = getAllEmployees;
const getEmployeeById = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const userRole = req.user?.role;
        const userId = req.user?.id;
        if (!employeeId || !mongoose_1.default.Types.ObjectId.isValid(employeeId)) {
            res.status(400).json({ message: 'Invalid employee ID' });
            return;
        }
        const employee = await Employee_1.default.findById(employeeId)
            .populate('user', 'name email role team')
            .populate('manager', 'name email');
        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }
        if (userRole === User_1.UserRole.MANAGER) {
            if (employee.manager?.toString() !== userId && employee.user.toString() !== userId) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        }
        else if (userRole === User_1.UserRole.EMPLOYEE) {
            if (employee.user.toString() !== userId) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        }
        res.json(employee);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getEmployeeById = getEmployeeById;
const updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const userRole = req.user?.role;
        const userId = req.user?.id;
        if (!employeeId || !mongoose_1.default.Types.ObjectId.isValid(employeeId)) {
            res.status(400).json({ message: 'Invalid employee ID' });
            return;
        }
        const employee = await Employee_1.default.findById(employeeId);
        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }
        if (userRole === User_1.UserRole.MANAGER && employee.manager?.toString() !== userId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        const { department, position, salary, status, manager, workLocation, phoneNumber, emergencyContact, address } = req.body;
        const updateData = {};
        if (department)
            updateData.department = department;
        if (position)
            updateData.position = position;
        if (workLocation)
            updateData.workLocation = workLocation;
        if (phoneNumber !== undefined)
            updateData.phoneNumber = phoneNumber;
        if (emergencyContact)
            updateData.emergencyContact = emergencyContact;
        if (address)
            updateData.address = address;
        if (userRole === User_1.UserRole.ADMIN || userRole === User_1.UserRole.HR) {
            if (salary !== undefined)
                updateData.salary = salary;
            if (status)
                updateData.status = status;
            if (manager !== undefined) {
                if (manager) {
                    const managerUser = await User_1.default.findById(manager);
                    if (!managerUser || managerUser.role !== User_1.UserRole.MANAGER) {
                        res.status(400).json({ message: 'Invalid manager' });
                        return;
                    }
                }
                updateData.manager = manager;
            }
        }
        const updatedEmployee = await Employee_1.default.findByIdAndUpdate(employeeId, updateData, { new: true }).populate('user', 'name email role')
            .populate('manager', 'name email');
        res.json(updatedEmployee);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (!employeeId || !mongoose_1.default.Types.ObjectId.isValid(employeeId)) {
            res.status(400).json({ message: 'Invalid employee ID' });
            return;
        }
        const employee = await Employee_1.default.findById(employeeId);
        if (!employee) {
            res.status(404).json({ message: 'Employee not found' });
            return;
        }
        await Employee_1.default.findByIdAndDelete(employeeId);
        res.json({ message: 'Employee deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteEmployee = deleteEmployee;
const getEmployeeByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        const employee = await Employee_1.default.findOne({ user: userId })
            .populate('user', 'name email role team')
            .populate('manager', 'name email');
        if (!employee) {
            res.status(404).json({ message: 'Employee profile not found' });
            return;
        }
        if (userRole === User_1.UserRole.EMPLOYEE && userId !== requestingUserId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        if (userRole === User_1.UserRole.MANAGER) {
            if (employee.manager?.toString() !== requestingUserId && userId !== requestingUserId) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        }
        res.json(employee);
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getEmployeeByUserId = getEmployeeByUserId;
const getMyEmployeeProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const employee = await Employee_1.default.findOne({ user: userId })
            .populate('user', 'name email role team')
            .populate('manager', 'name email');
        if (!employee) {
            res.status(404).json({ message: 'Employee profile not found' });
            return;
        }
        res.json(employee);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getMyEmployeeProfile = getMyEmployeeProfile;
//# sourceMappingURL=employeeController.js.map