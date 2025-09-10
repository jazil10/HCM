import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import api from '../api/axios';
import type { Employee } from '../types/employee';
import type { LeaveBalance, Leave } from '../types/leave';
import EditEmployeeModal from '../components/employees/EditEmployeeModal';
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import SingleEmployeeAssignLeaveBalanceModal from '../components/leave/SingleEmployeeAssignLeaveBalanceModal';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function EmployeeDetailsPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignBalanceModalOpen, setIsAssignBalanceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);  const fetchEmployeeData = async () => {
    try {
      // Fetch employee data first
      const employeeRes = await api.get(`/employees/${employeeId}`);
      setEmployee(employeeRes.data);

      // Fetch leave balances (optional)
      try {
        const balancesRes = await api.get(`/leave-balances/employee/${employeeId}`);
        setLeaveBalances(balancesRes.data);
      } catch (balanceError) {
        console.warn('Leave balances not available:', balanceError);
        setLeaveBalances([]);
      }

      // Fetch recent leaves (optional)
      try {
        const leavesRes = await api.get(`/leaves?employeeId=${employeeId}&limit=10`);
        setRecentLeaves(leavesRes.data.leaves || leavesRes.data);
      } catch (leaveError) {
        console.warn('Leave history not available:', leaveError);
        setRecentLeaves([]);
      }

    } catch (error: any) {
      console.error('Error fetching employee data:', error);
      setError(`Failed to fetch employee data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeUpdated = () => {
    fetchEmployeeData();
    setIsEditModalOpen(false);
  };

  const handleLeaveBalanceAssigned = () => {
    fetchEmployeeData();
    setIsAssignBalanceModalOpen(false);
  };

  const canManageEmployee = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.HR;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'active': return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive': return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'terminated': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getLeaveStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
      case 'cancelled': return `${baseClasses} bg-gray-100 text-gray-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const tabs = [
    { name: 'Overview', icon: UserIcon },
    { name: 'Leave Balances', icon: ChartBarIcon },
    { name: 'Leave History', icon: CalendarIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Employee Not Found</h1>
            <p className="mt-2 text-gray-600">{error || 'The requested employee could not be found.'}</p>            <button
              onClick={() => navigate('/dashboard/employees')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Employees
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/employees')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowLeftIcon className="-ml-0.5 mr-2 h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{employee.user.name}</h1>
                <p className="text-gray-600">{employee.position} • {employee.department}</p>
              </div>
            </div>
            
            {canManageEmployee() && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsAssignBalanceModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <CalendarIcon className="-ml-1 mr-2 h-5 w-5" />
                  Assign Leave Balance
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                  Edit Employee
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{employee.user.name}</h2>
                  <p className="text-gray-600">{employee.user.email}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">ID: {employee.employeeId}</span>
                    <span className={getStatusBadge(employee.status)}>{employee.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Salary</p>
                <p className="text-lg font-semibold text-gray-900">${employee.salary.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Work Location: {employee.workLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
            <Tab.List className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm focus:outline-none'
                      )
                    }
                  >
                    <tab.icon
                      className={classNames(
                        'text-gray-400 group-hover:text-gray-500',
                        '-ml-0.5 mr-2 h-5 w-5'
                      )}
                      aria-hidden="true"
                    />
                    {tab.name}
                  </Tab>
                ))}
              </nav>
            </Tab.List>
            
            <Tab.Panels>
              {/* Overview Tab */}
              <Tab.Panel className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="text-sm text-gray-900">{employee.user.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{employee.user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                        <dd className="text-sm text-gray-900">{employee.employeeId}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                        <dd className="text-sm text-gray-900 capitalize">{employee.user.role}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                        <dd className="text-sm text-gray-900">{employee.department}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Position</dt>
                        <dd className="text-sm text-gray-900">{employee.position}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900">
                          <span className={getStatusBadge(employee.status)}>{employee.status}</span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Work Location</dt>
                        <dd className="text-sm text-gray-900">{employee.workLocation}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Salary</dt>
                        <dd className="text-sm text-gray-900">${employee.salary.toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </Tab.Panel>

              {/* Leave Balances Tab */}
              <Tab.Panel className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Leave Balances</h3>
                  {canManageEmployee() && (
                    <button
                      onClick={() => setIsAssignBalanceModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <CalendarIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Assign Balance
                    </button>
                  )}
                </div>
                
                {leaveBalances.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leaveBalances.map((balance) => (
                      <LeaveBalanceCard key={balance._id} balance={balance} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Leave Balances</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No leave balances have been assigned to this employee.
                    </p>
                  </div>
                )}
              </Tab.Panel>

              {/* Leave History Tab */}
              <Tab.Panel className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Leave History</h3>
                
                {recentLeaves.length > 0 ? (
                  <div className="space-y-4">
                    {recentLeaves.map((leave) => (
                      <div key={leave._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <ClockIcon className="h-8 w-8 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {leave.leaveType.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">{leave.reason}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={getLeaveStatusBadge(leave.status)}>
                              {leave.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Leave History</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This employee has no recent leave requests.
                    </p>
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Modals */}
        {isEditModalOpen && employee && (
          <EditEmployeeModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            employee={employee}
            onEmployeeUpdated={handleEmployeeUpdated}
          />
        )}        {isAssignBalanceModalOpen && employee && (
          <SingleEmployeeAssignLeaveBalanceModal
            isOpen={isAssignBalanceModalOpen}
            onClose={() => setIsAssignBalanceModalOpen(false)}
            onSuccess={handleLeaveBalanceAssigned}
            employee={employee}
            selectedYear={new Date().getFullYear()}
          />
        )}
      </div>
    </div>
  );
}