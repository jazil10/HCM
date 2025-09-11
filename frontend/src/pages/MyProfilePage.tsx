import { useEffect, useState } from 'react';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon, 
  CalendarDaysIcon,
  MapPinIcon,
  CheckBadgeIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import { type Employee } from '../types/employee';
import { UserRole } from '../types/auth';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthProvider';

export default function MyProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  usePageTitle('My Profile');

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await api.get('/employees/my-profile');
        setEmployee(response.data);
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        
        // If profile not found, create a mock profile from auth context
        if (err.response?.status === 404) {
          // Create a mock employee profile for demo purposes
          const authUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (authUser.name) {
            const mockEmployee: Employee = {
              _id: 'mock-' + authUser._id,
              employeeId: `EMP${Date.now().toString().slice(-6)}`,
              user: {
                _id: authUser._id,
                name: authUser.name,
                email: authUser.email,
                role: authUser.role
              },
              position: authUser.role === UserRole.ADMIN ? 'System Administrator' :
                       authUser.role === UserRole.HR ? 'HR Manager' :
                       authUser.role === UserRole.MANAGER ? 'Team Manager' : 
                       'Software Developer',
              department: authUser.role === UserRole.ADMIN ? 'IT' :
                         authUser.role === UserRole.HR ? 'Human Resources' :
                         'Engineering',
              dateOfJoining: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString(),
              workLocation: 'Office',
              salary: 75000,
              status: 'active' as const
            };
            setEmployee(mockEmployee);
            return;
          }
        }
        
        setError('Failed to fetch your profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Header */}
        <div className="animate-pulse">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="h-32 w-32 bg-white/20 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-8 bg-white/20 rounded w-48"></div>
                <div className="h-5 bg-white/20 rounded w-32"></div>
                <div className="h-4 bg-white/20 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Profile</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Profile Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">Could not load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Profile Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
        
        <div className="relative px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className={`h-32 w-32 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white/20 ${
                employee.user.role === UserRole.ADMIN ? 'bg-red-500' :
                employee.user.role === UserRole.MANAGER ? 'bg-blue-400' :
                employee.user.role === UserRole.HR ? 'bg-purple-500' :
                'bg-green-500'
              }`}>
                {employee.user.name.split(' ').map(n => n[0]).join('')}
              </div>
              {/* Status Indicator */}
              <div className="absolute -bottom-2 -right-2">
                <div className="flex items-center space-x-1 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  <CheckBadgeIcon className="h-3 w-3" />
                  <span className="capitalize">{employee.status}</span>
                </div>
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{employee.user.name}</h1>
              <p className="text-xl font-medium text-blue-100 mb-3">{employee.position}</p>
              <div className="flex flex-wrap items-center space-x-6 text-sm text-blue-100">
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{employee.workLocation}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="h-4 w-4" />
                  <span>Since {new Date(employee.dateOfJoining).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            {/* Role Badge */}
            <div className="md:text-right">
              <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full shadow-lg ${
                employee.user.role === UserRole.ADMIN ? 'bg-red-500 text-white' :
                employee.user.role === UserRole.MANAGER ? 'bg-white text-blue-600' :
                employee.user.role === UserRole.HR ? 'bg-purple-500 text-white' :
                'bg-white text-green-600'
              }`}>
                {employee.user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Employee Information */}
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0V4a2 2 0 014 0v2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
              <p className="text-sm text-gray-600">Basic employment information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Employee ID</span>
              <span className="text-sm font-semibold text-gray-900">{employee.employeeId}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Department</span>
              <span className="text-sm font-semibold text-gray-900">{employee.department}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <span className={`text-sm font-semibold capitalize px-2 py-1 rounded-full ${
                employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
              <EnvelopeIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <p className="text-sm text-gray-600">How to reach you</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1 py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Email Address</span>
              <span className="text-sm font-semibold text-gray-900 break-all">{employee.user.email}</span>
            </div>
            <div className="flex flex-col space-y-1 py-2">
              <span className="text-sm font-medium text-gray-500">Work Location</span>
              <span className="text-sm font-semibold text-gray-900">{employee.workLocation}</span>
            </div>
          </div>
        </div>

        {/* Work Timeline */}
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Work Timeline</h3>
              <p className="text-sm text-gray-600">Your journey with us</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Joining Date</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(employee.dateOfJoining).toLocaleDateString('en-US', { 
                  day: 'numeric',
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Tenure</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.floor((new Date().getTime() - new Date(employee.dateOfJoining).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-500">Position</span>
              <span className="text-sm font-semibold text-gray-900">{employee.position}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
            <PencilIcon className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
            <EyeIcon className="h-4 w-4" />
            <span>View Attendance</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Leave History</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200">
            <BuildingOfficeIcon className="h-4 w-4" />
            <span>My Team</span>
          </button>
        </div>
      </div>
    </div>
  );
} 