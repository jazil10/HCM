import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from './models/User';
import Employee from './models/Employee';
import LeaveType from './models/LeaveType';
import LeaveBalance from './models/LeaveBalance';
import Leave, { LeaveStatus } from './models/Leave';
import Holiday from './models/Holiday';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function seedLeaveData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create Leave Types
    const leaveTypes = [
      {
        name: 'Annual Leave',
        description: 'Annual vacation leave',
        maxDaysPerYear: 25,
        maxConsecutiveDays: 15,
        carryForwardAllowed: true,
        maxCarryForwardDays: 5,
        encashmentAllowed: false,
        attachmentRequired: false,
        eligibilityMonths: 6,
        applicableToGenders: ['all'],
        color: '#3B82F6'
      },
      {
        name: 'Sick Leave',
        description: 'Medical leave for illness',
        maxDaysPerYear: 12,
        maxConsecutiveDays: 7,
        carryForwardAllowed: false,
        maxCarryForwardDays: 0,
        encashmentAllowed: false,
        attachmentRequired: true,
        eligibilityMonths: 0,
        applicableToGenders: ['all'],
        color: '#EF4444'
      },
      {
        name: 'Casual Leave',
        description: 'Short-term casual leave',
        maxDaysPerYear: 10,
        maxConsecutiveDays: 3,
        carryForwardAllowed: false,
        maxCarryForwardDays: 0,
        encashmentAllowed: false,
        attachmentRequired: false,
        eligibilityMonths: 3,
        applicableToGenders: ['all'],
        color: '#10B981'
      },
      {
        name: 'Maternity Leave',
        description: 'Maternity leave for new mothers',
        maxDaysPerYear: 180,
        maxConsecutiveDays: 180,
        carryForwardAllowed: false,
        maxCarryForwardDays: 0,
        encashmentAllowed: false,
        attachmentRequired: true,
        eligibilityMonths: 12,
        applicableToGenders: ['female'],
        color: '#F59E0B'
      },
      {
        name: 'Paternity Leave',
        description: 'Paternity leave for new fathers',
        maxDaysPerYear: 15,
        maxConsecutiveDays: 15,
        carryForwardAllowed: false,
        maxCarryForwardDays: 0,
        encashmentAllowed: false,
        attachmentRequired: true,
        eligibilityMonths: 12,
        applicableToGenders: ['male'],
        color: '#8B5CF6'
      },
      {
        name: 'Emergency Leave',
        description: 'Emergency or compassionate leave',
        maxDaysPerYear: 7,
        maxConsecutiveDays: 5,
        carryForwardAllowed: false,
        maxCarryForwardDays: 0,
        encashmentAllowed: false,
        attachmentRequired: false,
        eligibilityMonths: 0,
        applicableToGenders: ['all'],
        color: '#DC2626'
      }
    ];

    // Find admin user to set as creator
    const adminUser = await User.findOne({ role: UserRole.ADMIN });
    if (!adminUser) {
      console.error('No admin user found. Please run the main seed script first.');
      return;
    }

    // Clear existing leave data
    await Leave.deleteMany({});
    await LeaveBalance.deleteMany({});
    await Holiday.deleteMany({});
    await LeaveType.deleteMany({});

    // Create leave types
    const createdLeaveTypes = [];
    for (const leaveTypeData of leaveTypes) {
      const leaveType = new LeaveType({
        ...leaveTypeData,
        createdBy: adminUser._id
      });
      await leaveType.save();
      createdLeaveTypes.push(leaveType);
      console.log(`Created leave type: ${leaveType.name}`);
    }

    // Create holidays for current year
    const currentYear = new Date().getFullYear();
    const holidays = [
      {
        name: 'New Year\'s Day',
        date: new Date(`${currentYear}-01-01`),
        description: 'New Year celebration',
        isRecurring: true,
        type: 'national',
        applicableTo: ['all'],
        createdBy: adminUser._id
      },
      {
        name: 'Independence Day',
        date: new Date(`${currentYear}-07-04`),
        description: 'Independence Day celebration',
        isRecurring: true,
        type: 'national',
        applicableTo: ['all'],
        createdBy: adminUser._id
      },
      {
        name: 'Christmas Day',
        date: new Date(`${currentYear}-12-25`),
        description: 'Christmas celebration',
        isRecurring: true,
        type: 'national',
        applicableTo: ['all'],
        createdBy: adminUser._id
      },
      {
        name: 'Company Foundation Day',
        date: new Date(`${currentYear}-09-15`),
        description: 'Company anniversary',
        isRecurring: true,
        type: 'company',
        applicableTo: ['all'],
        createdBy: adminUser._id
      }
    ];

    for (const holidayData of holidays) {
      const holiday = new Holiday(holidayData);
      await holiday.save();
      console.log(`Created holiday: ${holiday.name}`);
    }

    // Get all active employees
    const employees = await Employee.find({ status: 'active' }).populate('user');
    console.log(`Found ${employees.length} active employees`);

    // Create leave balances for all employees
    for (const employee of employees) {
      for (const leaveType of createdLeaveTypes) {
        // Skip gender-specific leaves if not applicable
        if (leaveType.applicableToGenders.length > 0 && 
            !leaveType.applicableToGenders.includes('all')) {
          // For demo purposes, we'll assume all users are applicable
          // In a real system, you'd check employee gender
        }

        const leaveBalance = new LeaveBalance({
          employee: employee._id,
          leaveType: leaveType._id,
          year: currentYear,
          allocated: leaveType.maxDaysPerYear,
          used: Math.floor(Math.random() * 5), // Random used days for demo
          pending: 0,
          carriedForward: leaveType.carryForwardAllowed ? Math.floor(Math.random() * 3) : 0,
          encashed: 0
        });        await leaveBalance.save();
      }
      console.log(`Created leave balances for ${(employee.user as any).name}`);
    }    // Create some sample leave requests
    let sampleLeavesCount = 0;
    const sampleLeaves = [];
    if (employees.length >= 2 && createdLeaveTypes.length >= 2) {
      const sampleLeavesToCreate = [
        {
          employee: employees[0]!._id,
          leaveType: createdLeaveTypes[0]!._id, // Annual Leave
          startDate: new Date('2025-07-15'),
          endDate: new Date('2025-07-19'),
          totalDays: 5,
          reason: 'Family vacation',
          status: LeaveStatus.APPROVED,
          appliedDate: new Date('2025-06-15'),
          approvedBy: adminUser._id,
          approvedDate: new Date('2025-06-16'),
          isEmergency: false
        },
        {
          employee: employees[1]!._id,
          leaveType: createdLeaveTypes[1]!._id, // Sick Leave
          startDate: new Date('2025-06-25'),
          endDate: new Date('2025-06-26'),
          totalDays: 2,
          reason: 'Fever and cold',
          status: LeaveStatus.PENDING,
          appliedDate: new Date('2025-06-22'),
          isEmergency: false
        }
      ];

      for (const leaveData of sampleLeavesToCreate) {
        const leave = new Leave(leaveData);
        await leave.save();
        sampleLeaves.push(leave);
        sampleLeavesCount++;
        console.log(`Created sample leave request for employee`);
      }
    }

    console.log('Leave management seed data created successfully!');
    console.log('\nSummary:');
    console.log(`- Created ${createdLeaveTypes.length} leave types`);
    console.log(`- Created ${holidays.length} holidays`);
    console.log(`- Created leave balances for ${employees.length} employees`);
    console.log(`- Created ${sampleLeaves.length} sample leave requests`);

  } catch (error) {
    console.error('Error seeding leave data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedLeaveData();
}

export default seedLeaveData;
