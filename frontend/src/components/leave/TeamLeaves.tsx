import { useEffect, useState } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { Leave, LeaveStatus } from '../../types/leave';

interface TeamLeavesProps {
  onDataChange?: () => void;
}

export default function TeamLeaves({ onDataChange }: TeamLeavesProps) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');

  useEffect(() => {
    fetchTeamLeaves();
  }, [selectedStatus]);

  const fetchTeamLeaves = async () => {
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await api.get('/leaves', { params });
      // Filter to show only team leaves (this would be handled by backend based on user role)
      setLeaves(response.data.leaves || response.data);
    } catch (error) {
      setError('Failed to fetch team leave requests');
      console.error('Error fetching team leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await api.patch(`/leaves/${leaveId}/approve`);
      fetchTeamLeaves();
      onDataChange?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    const reason = prompt('Please provide reason for rejection:');
    if (!reason) return;

    try {
      await api.patch(`/leaves/${leaveId}/reject`, { rejectionReason: reason });
      fetchTeamLeaves();
      onDataChange?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject leave request');
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Team Leave Requests</h3>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="pending">Pending Approval</option>
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Leave List */}
      {leaves.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Leave Requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            No leave requests found for your team.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <li key={leave._id}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {leave.employee.user.name}
                          </p>
                          <span className="text-sm text-gray-500">
                            ({leave.employee.employeeId})
                          </span>
                          <span className={getStatusBadge(leave.status)}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: leave.leaveType.color }}
                            />
                            {leave.leaveType.name}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </span>
                          <span>{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{leave.reason}</p>
                        
                        {leave.isEmergency && (
                          <span className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Emergency Leave
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* View Details */}
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {/* Approve/Reject for pending requests */}
                      {leave.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveLeave(leave._id)}
                            className="p-2 text-gray-400 hover:text-green-600"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave._id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Reject"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  {leave.handoverNotes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Handover Notes:</strong> {leave.handoverNotes}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
