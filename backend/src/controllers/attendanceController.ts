import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import { AuthenticatedRequest } from '../types/auth';
import mongoose from 'mongoose';
import Team from '../models/Team';
import Employee from '../models/Employee';
import User from '../models/User';

const getStartOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  // Find the Employee document for the logged-in user
  const userId = req.user?.id;
  if (!userId || req.user?.role === 'admin') {
    return res.status(400).json({ message: 'This user is not a registered employee and cannot check in.' });
  }
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return res.status(400).json({ message: 'No employee profile found for this user.' });
  }
  const employeeId = employee._id;

  const today = getStartOfDay(new Date());

  const existingAttendance = await Attendance.findOne({
    employee: employeeId,
    date: today,
  });

  if (existingAttendance && existingAttendance.checkIn) {
    return res.status(400).json({ message: 'You have already checked in today.' });
  }

  const checkInTime = new Date();
  // Determine if check-in is late (after 11:00 AM)
  const cutoffTime = new Date();
  cutoffTime.setHours(11, 0, 0, 0); // 11:00 AM today
  const status = checkInTime > cutoffTime ? 'late' : 'present';

  const attendance = await Attendance.findOneAndUpdate(
    { employee: employeeId, date: today },
    { 
      checkIn: checkInTime,
      status: status,
      employee: employeeId,
      date: today
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json(attendance);
};

export const checkOut = async (req: AuthenticatedRequest, res: Response) => {
  const { id: attendanceId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: 'User has no valid employee ID.' });
  }
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return res.status(400).json({ message: 'No employee profile found for this user.' });
  }
  const employeeId = employee._id;

  if (!attendanceId || !mongoose.Types.ObjectId.isValid(attendanceId)) {
    return res.status(400).json({ message: 'Invalid attendance ID.' });
  }

  const attendance = await Attendance.findOne({ _id: attendanceId, employee: employeeId });

  if (!attendance) {
    return res.status(404).json({ message: 'Attendance record not found or you are not authorized.' });
  }

  if (!attendance.checkIn) {
    return res.status(400).json({ message: 'You must check in before checking out.' });
  }

  // Allow multiple checkouts - update to the most recent checkout time
  attendance.checkOut = new Date();

  // Calculate total working hours
  const diffMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
  attendance.totalHours = diffMs / (1000 * 60 * 60);
  // Determine if check-in was late (after 11:00 AM) to preserve status
  const checkInTimeOnRecord = new Date(attendance.checkIn);
  const cutoffTimeOnRecord = new Date(checkInTimeOnRecord);
  cutoffTimeOnRecord.setHours(11, 0, 0, 0); // 11:00 AM on the same day
  if (checkInTimeOnRecord > cutoffTimeOnRecord) {
    attendance.status = 'late';
  } else {
    attendance.status = 'present';
  }
  await attendance.save();
  return res.status(200).json(attendance);
};

export const getTodaysAttendance = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId || req.user?.role === 'admin') {
    return res.status(404).json(null);
  }
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return res.status(404).json(null);
  }
  const employeeId = employee._id;
  const today = getStartOfDay(new Date());
  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: today,
  });
  if (!attendance) {
    return res.status(404).json(null);
  }
  return res.status(200).json(attendance);
};

export const getAllAttendance = async (req: Request, res: Response) => {
  const { startDate, endDate, search } = req.query;

  const filter: any = {};

  if (startDate && endDate) {
    filter.date = {
      $gte: getStartOfDay(new Date(startDate as string)),
      $lte: getStartOfDay(new Date(endDate as string)),
    };
  }

  const query: any = [
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employeeDetails'
      }
    },
    { $unwind: '$employeeDetails' },
    {
      $lookup: {
        from: 'users',
        localField: 'employeeDetails.user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $match: {
        ...filter,
      }
    },
     {
      $project: {
        date: 1,
        status: 1,
        checkIn: 1,
        checkOut: 1,
        totalHours: 1,
        'employee._id': '$employeeDetails._id',
        'employee.employeeId': '$employeeDetails.employeeId',
        'employee.user.name': '$userDetails.name',
      }
    },
    { $sort: { date: -1 } }
  ];

  if (search) {
     query.splice(4, 0, {
      $match: {
        $or: [
          { 'userDetails.name': { $regex: search, $options: 'i' } },
          { 'employeeDetails.employeeId': { $regex: search, $options: 'i' } },
        ],
      }
    });
  }

  const attendance = await Attendance.aggregate(query);

  return res.status(200).json({ attendance });
};

export const createOrUpdateAttendance = async (req: Request, res: Response) => {
  const { employee, date, checkIn, checkOut, status } = req.body;

  if (!employee || !date || !status) {
    return res.status(400).json({ message: 'Employee, date, and status are required.' });
  }

  const recordDate = getStartOfDay(new Date(date));

  const updateData: any = {
    employee,
    date: recordDate,
    status,
    checkIn: checkIn ? new Date(checkIn) : null,
    checkOut: checkOut ? new Date(checkOut) : null,
  };

  if (updateData.checkIn && updateData.checkOut) {
    const diffMs = updateData.checkOut.getTime() - updateData.checkIn.getTime();
    updateData.totalHours = diffMs / (1000 * 60 * 60);
  } else {
    updateData.totalHours = 0;
  }

  const attendance = await Attendance.findOneAndUpdate(
    { employee, date: recordDate },
    updateData,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate({
      path: 'employee',
      populate: {
        path: 'user',
        model: 'User',
        select: 'name'
      }
    });

  return res.status(200).json(attendance);
};

export const getTeamAttendance = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  // First, find the logged-in user to identify their team
  const user = await User.findById(userId);
  if (!user || !user.team) {
    return res.status(404).json({ message: 'You are not assigned to a team.' });
  }
  // Now that we have the team ID, find all employees in that team
  const teamId = user.team;
  const teamMembers = await Employee.find({ team: teamId });
  const teamMemberIds = teamMembers.map(member => member._id);
  // Support optional date query param
  let targetDate: Date;
  if (req.query.date) {
    targetDate = getStartOfDay(new Date(req.query.date as string));
  } else {
    targetDate = getStartOfDay(new Date());
  }
  // Find attendance records for those employees for the target date
  const attendance = await Attendance.find({
    employee: { $in: teamMemberIds },
    date: targetDate
  }).populate({
    path: 'employee',
    populate: {
      path: 'user',
      model: 'User',
      select: 'name email role'
    }
  });
  return res.status(200).json(attendance);
};

