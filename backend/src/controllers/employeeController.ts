import { Request, Response } from 'express';
import Employee, { IEmployee } from '../models/Employee';
import User, { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';
import mongoose from 'mongoose';

// Generate unique employee ID
const generateEmployeeId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Employee.countDocuments();
  return `EMP${year}${String(count + 1).padStart(4, '0')}`;
};

// Create employee profile (Admin/HR only)
export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      joinDate,
      salary,
      manager,
      workLocation,
      phoneNumber,
      emergencyContact,
      address
    } = req.body;

    // 1. Validate required fields for user and employee
    if (!name || !email || !password || !role || !department || !position || !salary || !workLocation) {
      res.status(400).json({ 
        message: 'All fields are required: name, email, password, role, department, position, salary, and work location' 
      });
      return;
    }

    // 2. Check if user with that email already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }
    
    // 3. Create new User
    const user = new User({
      name,
      email,
      password, // Password should be hashed in a real app (pre-save hook in User model)
      role,
    });
    const newUser = await user.save({ session });

    // 4. Validate manager if provided
    if (manager) {
      const managerUser = await User.findById(manager).session(session);
      if (!managerUser || managerUser.role !== UserRole.MANAGER) {
        res.status(400).json({ message: 'Invalid manager' });
        return;
      }
    }

    // 5. Generate Employee ID
    const employeeId = await generateEmployeeId();

    // 6. Create new Employee
    const employee = new Employee({
      user: newUser._id,
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
    
    await employee.save({ session });

    // 7. Commit transaction
    await session.commitTransaction();

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'name email role')
      .populate('manager', 'name email');

    res.status(201).json(populatedEmployee);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error });
  } finally {
    session.endSession();
  }
};

// Get all employees (Admin/HR/Manager)
export const getAllEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, status, manager, page = 1, limit = 10 } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const filter: any = {};
    
    // If user is a manager, only show their team members
    if (userRole === UserRole.MANAGER) {
      filter.manager = userId;
    }

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (manager && (userRole === UserRole.ADMIN || userRole === UserRole.HR)) {
      filter.manager = manager;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await Employee.find(filter)
      .populate('user', 'name email role team')
      .populate('manager', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get employee by ID
export const getEmployeeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({ message: 'Invalid employee ID' });
      return;
    }

    const employee = await Employee.findById(employeeId)
      .populate('user', 'name email role team')
      .populate('manager', 'name email');

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // Check access permissions
    if (userRole === UserRole.MANAGER) {
      if (employee.manager?.toString() !== userId && employee.user.toString() !== userId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    } else if (userRole === UserRole.EMPLOYEE) {
      if (employee.user.toString() !== userId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update employee (Admin/HR/Manager for their team)
export const updateEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({ message: 'Invalid employee ID' });
      return;
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // Check access permissions
    if (userRole === UserRole.MANAGER && employee.manager?.toString() !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const {
      department,
      position,
      salary,
      status,
      manager,
      workLocation,
      phoneNumber,
      emergencyContact,
      address
    } = req.body;

    const updateData: any = {};
    if (department) updateData.department = department;
    if (position) updateData.position = position;
    if (workLocation) updateData.workLocation = workLocation;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (address) updateData.address = address;

    // Only Admin/HR can update salary, status, and manager
    if (userRole === UserRole.ADMIN || userRole === UserRole.HR) {
      if (salary !== undefined) updateData.salary = salary;
      if (status) updateData.status = status;
      if (manager !== undefined) {
        if (manager) {
          const managerUser = await User.findById(manager);
          if (!managerUser || managerUser.role !== UserRole.MANAGER) {
            res.status(400).json({ message: 'Invalid manager' });
            return;
          }
        }
        updateData.manager = manager;
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true }
    ).populate('user', 'name email role')
     .populate('manager', 'name email');

    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete employee (Admin only)
export const deleteEmployee = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      res.status(400).json({ message: 'Invalid employee ID' });
      return;
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    await Employee.findByIdAndDelete(employeeId);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get employee by user ID
export const getEmployeeByUserId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const employee = await Employee.findOne({ user: userId })
      .populate('user', 'name email role team')
      .populate('manager', 'name email');

    if (!employee) {
      res.status(404).json({ message: 'Employee profile not found' });
      return;
    }

    // Check access permissions
    if (userRole === UserRole.EMPLOYEE && userId !== requestingUserId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (userRole === UserRole.MANAGER) {
      if (employee.manager?.toString() !== requestingUserId && userId !== requestingUserId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    res.json(employee);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get current user's employee profile
export const getMyEmployeeProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const employee = await Employee.findOne({ user: userId })
      .populate('user', 'name email role team')
      .populate('manager', 'name email');

    if (!employee) {
      res.status(404).json({ message: 'Employee profile not found' });
      return;
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
