"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const auth_1 = __importDefault(require("./routes/auth"));
const teams_1 = __importDefault(require("./routes/teams"));
const users_1 = __importDefault(require("./routes/users"));
const employees_1 = __importDefault(require("./routes/employees"));
const attendance_1 = __importDefault(require("./routes/attendance"));
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', auth_1.default);
app.use('/api/teams', teams_1.default);
app.use('/api/users', users_1.default);
app.use('/api/employees', employees_1.default);
app.use('/api/attendance', attendance_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map