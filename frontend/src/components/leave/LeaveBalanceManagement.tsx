import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { LeaveBalance, LeaveType } from '../../types/leave';
import type { Employee } from '../../types/employee';
import AssignLeaveBalanceModal from './AssignLeaveBalanceModal';
import EditLeaveBalanceModal from './EditLeaveBalanceModal';

interface LeaveBalanceManagementProps {
  onDataChange?: () => void;
}

export default function LeaveBalanceManagement({ onDataChange }: LeaveBalanceManagementProps) {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<LeaveBalance | null>(null);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedDepartment, selectedLeaveType]);

  const fetchData = async () => {
    try {
      const [balancesRes, leaveTypesRes, employeesRes] = await Promise.all([
        api.get(`/leave-balances?year=${selectedYear}&department=${selectedDepartment}&leaveType=${selectedLeaveType}`),
        api.get('/leave-types'),
        api.get('/employees?limit=1000')
      ]);

      setLeaveBalances(balancesRes.data);
      setLeaveTypes(leaveTypesRes.data);
      setEmployees(employeesRes.data.employees || employeesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = () => {
    fetchData();
    onDataChange?.();
    setIsAssignModalOpen(false);
  };

  const handleEditSuccess = () => {
    fetchData();
    onDataChange?.();
    setEditingBalance(null);
  };

  const initializeBalancesForYear = async () => {
    if (!confirm(`Initialize leave balances for all employees for ${selectedYear}? This will create default balances based on leave type configurations.`)) {
      return;
    }

    try {
      await api.post('/leave-balances/initialize', { year: selectedYear });
      fetchData();
      onDataChange?.();
    } catch (error) {
      console.error('Error initializing balances:', error);
      setError('Failed to initialize balances');
    }
  };

  const getDepartments = () => {
    const departments = [...new Set(employees.map(emp => emp.department))];
    return departments.filter(Boolean);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Balance Management</h2>
          <p className="text-gray-600">Manage employee leave allocations and balances</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={initializeBalancesForYear}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
            Initialize Year
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Assign Balance
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={selectedLeaveType}
              onChange={(e) => setSelectedLeaveType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Leave Types</option>
              {leaveTypes.map(type => (
                <option key={type._id} value={type._id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Balances Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Leave Balances for {selectedYear}
          </h3>
          
          {leaveBalances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocated
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Used
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveBalances.map((balance) => {
                    const utilizationPercentage = balance.allocated > 0 
                      ? Math.round((balance.used / balance.allocated) * 100) 
                      : 0;
                    
                    return (
                      <tr key={balance._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {balance.employee.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {balance.employee.department}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: balance.leaveType.color }}
                            ></div>
                            <span className="text-sm text-gray-900">{balance.leaveType.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balance.allocated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balance.used}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balance.pending}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balance.remaining}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getUtilizationColor(utilizationPercentage)}`}>
                            {utilizationPercentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingBalance(balance)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave balances</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by assigning leave balances to employees or initialize balances for the year.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssignLeaveBalanceModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
        employees={employees}
        leaveTypes={leaveTypes}
        selectedYear={selectedYear}
      />

      {editingBalance && (
        <EditLeaveBalanceModal
          isOpen={!!editingBalance}
          onClose={() => setEditingBalance(null)}
          onSuccess={handleEditSuccess}
          leaveBalance={editingBalance}
        />
      )}
    </div>
  );
}
