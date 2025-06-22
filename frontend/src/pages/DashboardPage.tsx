import { useEffect, useState } from 'react';
import { UsersIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  totalTeams: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalTeams: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // You can implement these endpoints in your backend
        const [employeesRes, teamsRes] = await Promise.all([
          api.get('/employees'),
          api.get('/teams')
        ]);
        
        setStats({
          totalEmployees: employeesRes.data.length || 0,
          presentToday: Math.floor(Math.random() * employeesRes.data.length) || 0, // Mock data
          absentToday: Math.floor(Math.random() * 10) || 0, // Mock data
          totalTeams: teamsRes.data.length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set mock data if API fails
        setStats({
          totalEmployees: 124,
          presentToday: 108,
          absentToday: 16,
          totalTeams: 8
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      name: 'Total Employees',
      value: stats.totalEmployees,
      icon: UsersIcon,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600'
    },
    {
      name: 'Present Today',
      value: stats.presentToday,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Absent Today',
      value: stats.absentToday,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      name: 'Total Teams',
      value: stats.totalTeams,
      icon: ClockIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome back! Here's what's happening at your company today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div key={stat.name} className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} aria-hidden="true" />
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-500">{stat.name}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">John Doe checked in at 9:00 AM</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New team "Development" created</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">3 employees marked attendance</p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn-primary w-full justify-start">
              <UsersIcon className="h-5 w-5 mr-2" />
              Add New Employee
            </button>
            <button className="btn-secondary w-full justify-start">
              <ClockIcon className="h-5 w-5 mr-2" />
              Mark Attendance
            </button>
            <button className="btn-secondary w-full justify-start">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance Overview</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.presentToday}</div>
              <div className="text-sm text-gray-500">Present</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.absentToday}</div>
              <div className="text-sm text-gray-500">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.totalEmployees - stats.presentToday - stats.absentToday}
              </div>
              <div className="text-sm text-gray-500">Not Marked</div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-32 h-32 relative">
              {/* Simple attendance pie chart visualization */}
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <div className="text-lg font-semibold text-gray-600">
                  {Math.round((stats.presentToday / stats.totalEmployees) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}