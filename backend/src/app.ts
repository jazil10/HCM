import express = require('express');
import cors = require('cors');
import dotenv = require('dotenv');
import authRoutes from './routes/auth';
import teamRoutes from './routes/teams';
import userRoutes from './routes/users';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';

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

export default app;