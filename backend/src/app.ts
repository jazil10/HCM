import express = require('express');
import cors = require('cors');
import dotenv = require('dotenv');
import authRoutes from './routes/auth';
import teamRoutes from './routes/teams';
import userRoutes from './routes/users';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';
import leaveRoutes from './routes/leaves';
import leaveTypeRoutes from './routes/leaveTypes';
import leaveBalanceRoutes from './routes/leaveBalances';
import holidayRoutes from './routes/holidays';
import internshipProgramRoutes from './routes/internshipPrograms';
import internshipApplicationRoutes from './routes/internshipApplications';

// Load environment variables
dotenv.config();

const app: express.Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-balances', leaveBalanceRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/internship-programs', internshipProgramRoutes);
app.use('/api/internship-applications', internshipApplicationRoutes);

export default app;