"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../controllers/employeeController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const User_1 = require("../models/User");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/my-profile', (0, asyncHandler_1.default)(employeeController_1.getMyEmployeeProfile));
router.get('/', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR, User_1.UserRole.MANAGER), (0, asyncHandler_1.default)(employeeController_1.getAllEmployees));
router.post('/', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR), (0, asyncHandler_1.default)(employeeController_1.createEmployee));
router.get('/:employeeId', (0, asyncHandler_1.default)(employeeController_1.getEmployeeById));
router.put('/:employeeId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.HR, User_1.UserRole.MANAGER), (0, asyncHandler_1.default)(employeeController_1.updateEmployee));
router.delete('/:employeeId', (0, authorize_1.authorize)(User_1.UserRole.ADMIN), (0, asyncHandler_1.default)(employeeController_1.deleteEmployee));
router.get('/user/:userId', (0, asyncHandler_1.default)(employeeController_1.getEmployeeByUserId));
exports.default = router;
//# sourceMappingURL=employees.js.map