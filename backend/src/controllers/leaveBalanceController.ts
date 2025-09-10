import { Response } from 'express';
import LeaveBalance, { ILeaveBalance } from '../models/LeaveBalance';
import LeaveType from '../models/LeaveType';
import Employee from '../models/Employee';
import User, { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';

// Get leave balances for an employee
export const getEmployeeLeaveBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { year = new Date().getFullYear() } = req.query;
    const { role, id: userId } = req.user!;    // Check permissions
    if (role === UserRole.EMPLOYEE) {
      const employee = await Employee.findOne({ user: userId });
      if (!employee || (employee._id as any).toString() !== employeeId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    const balances = await LeaveBalance.find({
      employee: employeeId,
      year: year
    })
    .populate('leaveType', 'name color maxDaysPerYear')
    .sort({ 'leaveType.name': 1 });

    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get my leave balances (for current user)
export const getMyLeaveBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const { id: userId } = req.user!;

    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      res.status(404).json({ message: 'Employee profile not found' });
      return;
    }

    const balances = await LeaveBalance.find({
      employee: employee._id,
      year: year
    })
    .populate('leaveType', 'name color maxDaysPerYear')
    .sort({ 'leaveType.name': 1 });

    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all employee balances (HR/Admin only)
export const getAllEmployeeBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear(), department, page = 1, limit = 50 } = req.query;

    let employeeQuery: any = {};
    if (department) {
      employeeQuery.department = department;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get employees based on filter
    const employees = await Employee.find(employeeQuery)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limitNum);

    const employeeIds = employees.map(emp => emp._id);

    // Get balances for these employees
    const balances = await LeaveBalance.find({
      employee: { $in: employeeIds },
      year: year
    })
    .populate('employee', 'user department position')
    .populate({
      path: 'employee',
      populate: { path: 'user', select: 'name email' }
    })
    .populate('leaveType', 'name color');    // Group balances by employee
    const employeeBalances = employees.map(employee => {
      const empBalances = balances.filter(balance => 
        balance.employee._id.toString() === (employee._id as any).toString()
      );
      
      return {
        employee,
        balances: empBalances
      };
    });

    const total = await Employee.countDocuments(employeeQuery);

    res.json({
      employeeBalances,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Initialize leave balances for an employee (HR/Admin only)
export const initializeEmployeeBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { year = new Date().getFullYear() } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // Get all active leave types
    const leaveTypes = await LeaveType.find({ isActive: true });

    const newBalances = [];

    for (const leaveType of leaveTypes) {
      // Check if balance already exists
      const existingBalance = await LeaveBalance.findOne({
        employee: employeeId,
        leaveType: leaveType._id,
        year: year
      });

      if (!existingBalance) {
        const balance = new LeaveBalance({
          employee: employeeId,
          leaveType: leaveType._id,
          year: year,
          allocated: leaveType.maxDaysPerYear,
          used: 0,
          pending: 0,
          carriedForward: 0,
          encashed: 0
        });

        await balance.save();
        newBalances.push(balance);
      }
    }

    const populatedBalances = await LeaveBalance.find({
      employee: employeeId,
      year: year
    }).populate('leaveType', 'name color maxDaysPerYear');

    res.json({
      message: `Initialized ${newBalances.length} new leave balances`,
      balances: populatedBalances
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update leave balance (HR/Admin only)
export const updateLeaveBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { allocated, carriedForward, encashed, reason } = req.body;

    const balance = await LeaveBalance.findById(id);
    if (!balance) {
      res.status(404).json({ message: 'Leave balance not found' });
      return;
    }

    // Update balance
    if (allocated !== undefined) balance.allocated = allocated;
    if (carriedForward !== undefined) balance.carriedForward = carriedForward;
    if (encashed !== undefined) balance.encashed = encashed;

    // Recalculate remaining balance
    balance.calculateRemaining();
    await balance.save();

    // TODO: Log the change for audit trail
    // Create audit log entry here

    const updatedBalance = await LeaveBalance.findById(id)
      .populate('leaveType', 'name color')
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      });

    res.json(updatedBalance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Bulk initialize balances for all employees (Admin only)
export const bulkInitializeBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.body;

    const employees = await Employee.find({ status: 'active' });
    const leaveTypes = await LeaveType.find({ isActive: true });

    let initializedCount = 0;

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        const existingBalance = await LeaveBalance.findOne({
          employee: employee._id,
          leaveType: leaveType._id,
          year: year
        });

        if (!existingBalance) {
          const balance = new LeaveBalance({
            employee: employee._id,
            leaveType: leaveType._id,
            year: year,
            allocated: leaveType.maxDaysPerYear,
            used: 0,
            pending: 0,
            carriedForward: 0,
            encashed: 0
          });

          await balance.save();
          initializedCount++;
        }
      }
    }

    res.json({
      message: `Successfully initialized ${initializedCount} leave balances for ${employees.length} employees`,
      year: year,
      employeesProcessed: employees.length,
      balancesCreated: initializedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get leave balance summary (dashboard stats)
export const getLeaveBalanceSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const balanceSummary = await LeaveBalance.aggregate([
      { $match: { year: parseInt(year as string) } },
      {
        $group: {
          _id: '$leaveType',
          totalAllocated: { $sum: '$allocated' },
          totalUsed: { $sum: '$used' },
          totalPending: { $sum: '$pending' },
          totalRemaining: { $sum: '$remaining' },
          employeeCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'leavetypes',
          localField: '_id',
          foreignField: '_id',
          as: 'leaveType'
        }
      },
      { $unwind: '$leaveType' },
      {
        $project: {
          leaveTypeName: '$leaveType.name',
          leaveTypeColor: '$leaveType.color',
          totalAllocated: 1,
          totalUsed: 1,
          totalPending: 1,
          totalRemaining: 1,
          employeeCount: 1,
          utilizationPercentage: {
            $cond: {
              if: { $eq: ['$totalAllocated', 0] },
              then: 0,
              else: { $multiply: [{ $divide: ['$totalUsed', '$totalAllocated'] }, 100] }
            }
          }
        }
      }
    ]);

    res.json(balanceSummary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create/assign a specific leave balance (HR/Admin only)
export const createLeaveBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employee, leaveType, allocated, carriedForward = 0, year } = req.body;

    // Validate required fields
    if (!employee || !leaveType || allocated === undefined || !year) {
      res.status(400).json({ 
        message: 'Missing required fields: employee, leaveType, allocated, year' 
      });
      return;
    }

    // Check if employee exists
    const employeeDoc = await Employee.findById(employee);
    if (!employeeDoc) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    // Check if leave type exists
    const leaveTypeDoc = await LeaveType.findById(leaveType);
    if (!leaveTypeDoc) {
      res.status(404).json({ message: 'Leave type not found' });
      return;
    }

    // Check if balance already exists for this employee, leave type, and year
    const existingBalance = await LeaveBalance.findOne({
      employee,
      leaveType,
      year
    });

    if (existingBalance) {
      res.status(400).json({ 
        message: 'Leave balance already exists for this employee, leave type, and year. Use update instead.' 
      });
      return;
    }

    // Create new leave balance
    const newBalance = new LeaveBalance({
      employee,
      leaveType,
      year,
      allocated: parseInt(allocated),
      used: 0,
      pending: 0,
      carriedForward: parseInt(carriedForward),
      encashed: 0
    });

    // Calculate remaining balance
    newBalance.calculateRemaining();
    await newBalance.save();

    // Return populated balance
    const populatedBalance = await LeaveBalance.findById(newBalance._id)
      .populate('leaveType', 'name color maxDaysPerYear')
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email' }
      });

    res.status(201).json(populatedBalance);  } catch (error) {
    console.error('Error creating leave balance:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
