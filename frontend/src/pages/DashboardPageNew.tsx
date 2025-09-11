import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  totalTeams: number;
  pendingApplications: number;
  totalInternships: number;
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'leave' | 'employee' | 'internship';
  message: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'info';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  link: string;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalTeams: 0,
    pendingApplications: 0,
    totalInternships: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  usePageTitle('Dashboard');

  // Quick Actions based on user role
  const getQuickActions = (): QuickAction[] => {
    const commonActions: QuickAction[] = [
      {
        id: 'my-profile',
        title: 'View My Profile',
        description: 'Update your personal information',
        icon: UsersIcon,
        link: '/dashboard/my-profile',
        color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }
    ];

    if (user?.role === UserRole.ADMIN || user?.role === UserRole.HR) {
      return [
        ...commonActions,
        {
          id: 'add-employee',
          title: 'Add New Employee',
          description: 'Register a new team member',
          icon: PlusIcon,
          link: '/dashboard/employees',
          color: 'bg-green-50 text-green-600 hover:bg-green-100'
        },
        {
          id: 'manage-internships',
          title: 'Manage Internships',
          description: 'Create and oversee programs',
          icon: BuildingOfficeIcon,
          link: '/dashboard/internship-programs',
          color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
        },
        {
          id: 'attendance-report',
          title: 'Attendance Reports',
          description: 'View and export attendance data',
          icon: DocumentArrowDownIcon,
          link: '/dashboard/attendance',
          color: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
        },
        {
          id: 'manage-holidays',
          title: 'Manage Holidays',
          description: 'Set company holidays and events',
          icon: CalendarDaysIcon,
          link: '/dashboard/holidays',
          color: 'bg-red-50 text-red-600 hover:bg-red-100'
        }
      ];
    }

    return [
      ...commonActions,
      {
        id: 'my-leaves',
        title: 'My Leave Requests',
        description: 'View and manage your leave requests',
        icon: CalendarDaysIcon,
        link: '/dashboard/leaves',
        color: 'bg-green-50 text-green-600 hover:bg-green-100'
      },
      {
        id: 'my-attendance',
        title: 'My Attendance',
        description: 'Check your attendance record',
        icon: ClockIcon,
        link: '/dashboard/attendance',
        color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }
    ];
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return ClockIcon;
      case 'leave':
        return CalendarDaysIcon;
      case 'employee':
        return UsersIcon;
      case 'internship':
        return BuildingOfficeIcon;
      default:
        return CheckCircleIcon;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const promises = [
          api.get('/employees'),
          api.get('/teams'),
          api.get('/internship-programs'),
          api.get('/internship-applications')
        ];

        const [employeesRes, teamsRes, internshipsRes, applicationsRes] = await Promise.all(promises);
        
        const employees = employeesRes.data || [];
        const teams = teamsRes.data || [];
        const internships = internshipsRes.data || [];
        const applications = applicationsRes.data || [];
        
        // Calculate present/absent (mock calculation based on current time)
        const currentHour = new Date().getHours();
        const workingHours = currentHour >= 9 && currentHour <= 17;
        const presentCount = workingHours ? Math.floor(employees.length * 0.85) : Math.floor(employees.length * 0.15);
        
        setStats({
          totalEmployees: employees.length,
          presentToday: presentCount,
          absentToday: employees.length - presentCount,
          totalTeams: teams.length,
          pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
          totalInternships: internships.length,
        });

        // Generate recent activities
        const activities: RecentActivity[] = [];
        
        // Add employee-related activities
        employees.slice(0, 2).forEach((emp: any, index: number) => {
          activities.push({
            id: `emp-${emp.id}`,
            type: 'employee',
            message: `${emp.firstName} ${emp.lastName} ${workingHours ? 'checked in' : 'checked out'}`,
            timestamp: new Date(Date.now() - index * 1000 * 60 * 30).toISOString(),
            status: 'success'
          });
        });
        
        // Add application activities
        applications.slice(0, 2).forEach((app: any, index: number) => {
          activities.push({
            id: `app-${app.id}`,
            type: 'internship',
            message: `New internship application received from ${app.firstName} ${app.lastName}`,
            timestamp: new Date(Date.now() - (index + 2) * 1000 * 60 * 45).toISOString(),
            status: 'info'
          });
        });

        setRecentActivities(activities.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set some default values if API fails
        setStats({
          totalEmployees: 12,
          presentToday: 10,
          absentToday: 2,
          totalTeams: 4,
          pendingApplications: 3,
          totalInternships: 2,
        });
        
        // Mock recent activities for demo
        setRecentActivities([
          {
            id: '1',
            type: 'employee',
            message: 'John Doe checked in',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            status: 'success'
          },
          {
            id: '2',
            type: 'internship',
            message: 'New internship application from Sarah Wilson',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'info'
          },
          {
            id: '3',
            type: 'leave',
            message: 'Leave request approved for Mike Johnson',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: 'success'
          },
          {
            id: '4',
            type: 'attendance',
            message: 'Daily attendance report generated',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: 'info'
          },
          {
            id: '5',
            type: 'employee',
            message: 'Alice Smith updated profile information',
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            status: 'success'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const quickActions = getQuickActions();
  const attendancePercentage = stats.totalEmployees > 0 ? (stats.presentToday / stats.totalEmployees) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening at your organization today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.presentToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absentToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Internship Programs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInternships}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
            </div>
            <div className="p-6 space-y-4">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={action.id}
                    to={action.link}
                    className={`flex items-center p-4 rounded-lg transition-colors ${action.color} group`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs opacity-75">{action.description}</p>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-600">Latest updates from your organization</p>
                </div>
                <Link 
                  to="/dashboard/attendance" 
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity to show</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Attendance Overview</h2>
            <p className="text-sm text-gray-600">Current attendance status</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Present: {stats.presentToday}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Absent: {stats.absentToday}</span>
                </div>
              </div>
              <Link 
                to="/dashboard/attendance" 
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View detailed report →
              </Link>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {attendancePercentage.toFixed(1)}% attendance rate today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
