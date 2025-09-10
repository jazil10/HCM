import { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import api from '../api/axios';
import type { Leave, LeaveBalance } from '../types/leave';
import MyLeaves from '../components/leave/MyLeaves';
import TeamLeaves from '../components/leave/TeamLeaves';
import AllLeaves from '../components/leave/AllLeaves';
import ApplyLeaveModal from '../components/leave/ApplyLeaveModal';
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveTypeManagement from '../components/leave/LeaveTypeManagement';
import HolidayManagement from '../components/leave/HolidayManagement';
import LeaveBalanceManagement from '../components/leave/LeaveBalanceManagement';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LeavePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveStats, setLeaveStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  // Tab configuration based on user role
  const getTabs = () => {
    const baseTabs = [
      { name: 'My Leaves', component: MyLeaves }
    ];

    if (user?.role === UserRole.MANAGER) {
      baseTabs.push({ name: 'Team Leaves', component: TeamLeaves });
    }

    if (user?.role === UserRole.HR || user?.role === UserRole.ADMIN) {
      baseTabs.push(
        { name: 'Team Leaves', component: TeamLeaves },
        { name: 'All Leaves', component: AllLeaves },
        { name: 'Leave Balances', component: LeaveBalanceManagement },
        { name: 'Holidays', component: HolidayManagement }
      );
    }

    // Admin-only tabs
    if (user?.role === UserRole.ADMIN) {
      baseTabs.push({ name: 'Leave Types', component: LeaveTypeManagement });
    }

    return baseTabs;
  };

  const tabs = getTabs();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balancesRes, leavesRes] = await Promise.all([
        api.get('/leave-balances/my-balances'),
        api.get('/leaves')
      ]);

      setLeaveBalances(balancesRes.data);
      
      const leaves = leavesRes.data.leaves || leavesRes.data;
      const stats = {
        pending: leaves.filter((l: Leave) => l.status === 'pending').length,
        approved: leaves.filter((l: Leave) => l.status === 'approved').length,
        rejected: leaves.filter((l: Leave) => l.status === 'rejected').length,
        total: leaves.length
      };
      setLeaveStats(stats);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveApplied = () => {
    fetchData(); // Refresh data after new leave application
    setIsApplyModalOpen(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Apply for Leave
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{leaveStats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">{leaveStats.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">{leaveStats.rejected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-primary-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{leaveStats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balances</h3>
        {leaveBalances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveBalances.map((balance) => (
              <LeaveBalanceCard key={balance._id} balance={balance} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Leave Balances</h3>
            <p className="mt-1 text-sm text-gray-500">
              Contact HR to initialize your leave balances.
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="border-b border-gray-200">            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </nav>
          </Tab.List>
          <Tab.Panels>            {tabs.map((tab) => (
              <Tab.Panel key={tab.name} className="p-6">
                <tab.component onDataChange={fetchData} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onLeaveApplied={handleLeaveApplied}
        leaveBalances={leaveBalances}
      />
    </div>
  );
}
