import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import Employee, { IEmployee } from '../models/Employee';
import { JwtPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    // Using `any` to bypass linter issue with custom methods
    const user: any = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const employee: IEmployee | null = await Employee.findOne({ user: user._id });

    if (!employee && user.role !== 'admin') {
      return res.status(403).json({ message: 'User is not linked to an employee profile.' });
    }

    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
      employeeId: employee ? (employee._id as any).toString() : 'admin_user',
    });

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, team: user.team } });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};