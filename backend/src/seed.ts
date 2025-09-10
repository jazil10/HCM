import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from './models/User';
import Team from './models/Team';
import Employee from './models/Employee';
import Attendance from './models/Attendance';
import InternshipProgram, { ProgramStatus } from './models/InternshipProgram';

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
    }  ]);

  // Create internship programs
  const internshipProgram1 = new InternshipProgram({
    title: 'Software Engineering Internship - Summer 2025',
    description: 'Join our engineering team for a 3-month internship where you will work on real projects using modern technologies like React, Node.js, and MongoDB. You will be mentored by senior developers and contribute to our production applications.',
    department: 'Engineering',
    location: 'New York, NY',
    duration: 3,
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-09-30'),
    applicationDeadline: new Date('2025-06-30'),
    maxApplicants: 5,
    currentApplicants: 0,
    requirements: [
      'Currently enrolled in Computer Science or related field',
      'Knowledge of JavaScript and web development',
      'Strong problem-solving skills',
      'Excellent communication skills'
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Git', 'MongoDB'],
    benefits: [
      'Competitive stipend',
      'Mentorship program',
      'Flexible work hours',
      'Learning budget',
      'Potential for full-time offer'
    ],
    stipend: 4000,
    isRemote: false,
    status: ProgramStatus.ACTIVE,
    createdBy: hr._id,
    publicSlug: 'software-engineering-summer-2025',
    applicationForm: {
      requiredFields: ['name', 'email', 'phone', 'university', 'major', 'graduationYear'],
      optionalFields: ['gpa', 'portfolio', 'linkedIn', 'github'],
      customQuestions: [
        {
          question: 'Why are you interested in this internship?',
          type: 'textarea',
          required: true
        },
        {
          question: 'What programming languages are you most comfortable with?',
          type: 'checkbox',
          options: ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue.js'],
          required: true
        }
      ]
    }
  });

  const internshipProgram2 = new InternshipProgram({
    title: 'HR Analytics Internship - Fall 2025',
    description: 'Work with our HR team to analyze employee data, create reports, and help improve our people processes. You will gain experience in data analysis, HR metrics, and organizational psychology.',
    department: 'Human Resources',
    location: 'Remote',
    duration: 4,
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-31'),
    applicationDeadline: new Date('2025-08-15'),
    maxApplicants: 2,
    currentApplicants: 0,
    requirements: [
      'Currently enrolled in HR, Psychology, or Business Administration',
      'Interest in data analysis and HR metrics',
      'Proficiency in Excel or Google Sheets',
      'Strong analytical skills'
    ],
    skills: ['Excel', 'Data Analysis', 'HR Metrics', 'Communication', 'Research'],
    benefits: [
      'Remote work opportunity',
      'HR professional development',
      'Networking opportunities',
      'Certificate of completion'
    ],
    stipend: 3000,
    isRemote: true,
    status: ProgramStatus.ACTIVE,
    createdBy: hr._id,
    publicSlug: 'hr-analytics-fall-2025',
    applicationForm: {
      requiredFields: ['name', 'email', 'phone', 'university', 'major', 'graduationYear', 'gpa'],
      optionalFields: ['linkedIn'],
      customQuestions: [
        {
          question: 'Do you have any experience with data analysis tools?',
          type: 'radio',
          options: ['Yes, extensive experience', 'Some experience', 'No experience but willing to learn'],
          required: true
        },
        {
          question: 'What interests you most about HR analytics?',
          type: 'textarea',
          required: true
        }
      ]
    }
  });

  await internshipProgram1.save();
  await internshipProgram2.save();

  console.log('Dummy data inserted!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
