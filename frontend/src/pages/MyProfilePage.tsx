import { useEffect, useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import { type Employee } from '../types/employee';

export default function MyProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await api.get('/employees/my-profile');
        setEmployee(response.data);
      } catch (err) {
        setError('Failed to fetch your profile details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">{error}</div>
      </div>
    );
  }

  if (!employee) {
    return <div className="text-center py-12">Could not load your profile.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center space-x-6">
          <UserCircleIcon className="h-24 w-24 text-gray-300" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{employee.user.name}</h1>
            <p className="text-xl text-gray-600">{employee.position}</p>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{employee.employeeId}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Email address</dt>
            <dd className="mt-1 text-sm text-gray-900">{employee.user.email}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Department</dt>
            <dd className="mt-1 text-sm text-gray-900">{employee.department}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Date of Joining</dt>
            <dd className="mt-1 text-sm text-gray-900">{new Date(employee.dateOfJoining).toLocaleDateString()}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Work Location</dt>
            <dd className="mt-1 text-sm text-gray-900">{employee.workLocation}</dd>
          </div>
           <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{employee.status}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
} 