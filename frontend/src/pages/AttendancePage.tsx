import { useEffect, useState, Fragment } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import api from '../api/axios';
import type { Attendance } from '../types/attendance';
import { UserRole } from '../types/auth';
import { useAuth } from '../contexts/AuthProvider';
import MyAttendance from '../components/attendance/MyAttendance';
import TeamAttendance from '../components/attendance/TeamAttendance';
import AddAttendanceModal from '../components/attendance/AddAttendanceModal';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// This is now the Admin/HR view
function AllAttendanceList() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get('/attendance', { params });
      setAttendance(response.data.attendance || response.data);
    } catch (err) {
      setError('Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRecordAdded = (newRecord: Attendance) => {
    setAttendance(prev => [newRecord, ...prev]);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'present': return `${baseClasses} bg-green-100 text-green-800`;
      case 'absent': return `${baseClasses} bg-red-100 text-red-800`;
      case 'late': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'half-day': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'holiday': return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'leave': return `${baseClasses} bg-indigo-100 text-indigo-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const employeeName = record.employee?.user?.name || '';
    const employeeId = record.employee?.employeeId || '';
    const matchesSearch = employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         employeeId.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDate = (filters.startDate === '' || new Date(record.date) >= new Date(filters.startDate)) &&
                       (filters.endDate === '' || new Date(record.date) <= new Date(filters.endDate));
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredAttendance.slice(startIndex, endIndex);

  return (
    <>
      <AddAttendanceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordAdded={handleRecordAdded}
      />
      <div className="space-y-6">
         <div className="card p-6">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                name="search"
                placeholder="Search by name or ID..."
                value={filters.search}
                onChange={handleFilterChange}
                className="input-field"
              />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="input-field"
              />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="input-field"
              />
           </div>
        </div>
        
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map(record => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employee?.user?.name}</div>
                      <div className="text-sm text-gray-500">{record.employee?.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(record.status)}>{record.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function ManagerAttendanceView() {
  const tabs = ['My Attendance', 'Team Attendance'];

  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-primary-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-primary-700',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel><MyAttendance /></Tab.Panel>
          <Tab.Panel><TeamAttendance /></Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  const isManager = user.role === UserRole.MANAGER;
  const isAdminOrHR = user.role === UserRole.ADMIN || user.role === UserRole.HR;

  const getPageComponent = () => {
    if (isAdminOrHR) {
      return <AllAttendanceList />;
    }
    if (isManager) {
      return <ManagerAttendanceView />;
    }
    return <MyAttendance />;
  };

  return (
    <div className="space-y-6">
      {isAdminOrHR && <AddAttendanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRecordAdded={() => { /* Consider refetching data */ }} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-lg text-gray-600">
            {isAdminOrHR ? 'Track and manage employee attendance records.' : 'View your attendance and mark your presence.'}
          </p>
        </div>
         {isAdminOrHR && (
           <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="btn-secondary">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Export Report
              </button>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                <ClockIcon className="h-5 w-5 mr-2" />
                Mark Attendance
              </button>
            </div>
         )}
      </div>

      {getPageComponent()}
    </div>
  );
}