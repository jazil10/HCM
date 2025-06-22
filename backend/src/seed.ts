import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from './models/User';
import Team from './models/Team';
import Employee from './models/Employee';
import Attendance from './models/Attendance';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Attendance.deleteMany({});
  await Employee.deleteMany({});
  await Team.deleteMany({});
  await User.deleteMany({});

  // Create users
  const admin = new User({ name: 'Admin User', email: 'admin@example.com', password: 'hashed', role: UserRole.ADMIN });
  const hr = new User({ name: 'HR User', email: 'hr@example.com', password: 'hashed', role: UserRole.HR });
  const manager = new User({ name: 'Manager User', email: 'manager@example.com', password: 'hashed', role: UserRole.MANAGER });
  const employee1 = new User({ name: 'Employee One', email: 'emp1@example.com', password: 'hashed', role: UserRole.EMPLOYEE });
  const employee2 = new User({ name: 'Employee Two', email: 'emp2@example.com', password: 'hashed', role: UserRole.EMPLOYEE });
  await admin.save();
  await hr.save();
  await manager.save();
  await employee1.save();
  await employee2.save();

  // Create team
  const team = new Team({ name: 'Alpha Team', manager: manager._id, members: [employee1._id, employee2._id] });
  await team.save();

  // Link users to team (fix type error by casting team._id as mongoose.Types.ObjectId)
  manager.team = team._id as mongoose.Types.ObjectId;
  employee1.team = team._id as mongoose.Types.ObjectId;
  employee2.team = team._id as mongoose.Types.ObjectId;
  await manager.save();
  await employee1.save();
  await employee2.save();

  // Create employees
  const empProfile1 = new Employee({ user: employee1._id, employeeId: 'EMP20250001', department: 'Engineering', position: 'Developer', joinDate: new Date('2024-01-10'), salary: 60000, manager: manager._id, workLocation: 'Remote', status: 'active' });
  const empProfile2 = new Employee({ user: employee2._id, employeeId: 'EMP20250002', department: 'Engineering', position: 'QA', joinDate: new Date('2024-02-15'), salary: 50000, manager: manager._id, workLocation: 'Onsite', status: 'active' });
  await empProfile1.save();
  await empProfile2.save();

  // Create attendance records (employee field must reference Employee, status must be lowercase, checkIn/checkOut must be Date)
  await Attendance.create([
    {
      employee: empProfile1._id,
      date: new Date('2025-06-18'),
      status: 'present',
      checkIn: new Date('2025-06-18T09:00:00'),
      checkOut: new Date('2025-06-18T17:00:00')
    },
    {
      employee: empProfile2._id,
      date: new Date('2025-06-18'),
      status: 'absent'
    },
    {
      employee: empProfile1._id,
      date: new Date('2025-06-19'),
      status: 'present',
      checkIn: new Date('2025-06-19T09:10:00'),
      checkOut: new Date('2025-06-19T17:05:00')
    },
    {
      employee: empProfile2._id,
      date: new Date('2025-06-19'),
      status: 'present',
      checkIn: new Date('2025-06-19T09:05:00'),
      checkOut: new Date('2025-06-19T17:00:00')
    }
  ]);

  console.log('Dummy data inserted!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
