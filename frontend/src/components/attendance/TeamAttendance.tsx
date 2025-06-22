import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { type Attendance } from '../../types/attendance';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function TeamAttendance() {
  const [teamAttendance, setTeamAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  useEffect(() => {
    const fetchTeamAttendance = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/attendance/team?date=${selectedDate}`);
        setTeamAttendance(response.data);
      } catch (err) {
        setError('Failed to fetch team attendance.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeamAttendance();
  }, [selectedDate]);

  const getStatusInfo = (record?: Attendance) => {
    const status = record?.status || 'absent';
    switch (status) {
      case 'present':
        return { 
          text: `Checked in at ${new Date(record!.checkIn!).toLocaleTimeString()}`, 
          icon: <CheckCircleIcon className="h-6 w-6 text-green-500" /> 
        };
      case 'late':
         return { 
          text: `Checked in late at ${new Date(record!.checkIn!).toLocaleTimeString()}`, 
          icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" /> 
        };
      case 'absent':
      default:
        return { text: 'Absent', icon: <XCircleIcon className="h-6 w-6 text-red-500" /> };
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Team Attendance</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          max={formatDate(new Date())}
        />
      </div>
      {loading && <p>Loading team attendance...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <ul role="list" className="divide-y divide-gray-200">
          {teamAttendance.map(record => {
            const statusInfo = getStatusInfo(record);
            return (
              <li key={record.employee._id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-white">
                      {record.employee.user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.employee.user.name}</p>
                    <p className="text-sm text-gray-500">{record.employee.position}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {statusInfo.icon}
                  <span className="ml-2 text-sm text-gray-700">{statusInfo.text}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {teamAttendance.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No attendance records for your team have been created for this date.
          </p>
        </div>
      )}
    </div>
  );
} 