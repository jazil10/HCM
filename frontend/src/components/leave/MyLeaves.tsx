import { useEffect, useState } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { Leave, LeaveStatus } from '../../types/leave';

interface MyLeavesProps {
  onDataChange?: () => void;
}

export default function MyLeaves({ onDataChange }: MyLeavesProps) {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchMyLeaves();
  }, [selectedStatus]);

  const fetchMyLeaves = async () => {
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await api.get('/leaves', { params });
      setLeaves(response.data.leaves || response.data);
    } catch (error) {
      setError('Failed to fetch your leave requests');
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <ExclamationCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canCancelLeave = (leave: Leave) => {
    return leave.status === 'pending' || leave.status === 'approved';
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await api.patch(`/leaves/${leaveId}/cancel`);
      fetchMyLeaves();
      onDataChange?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel leave request');
    }
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
        <h3 className="text-lg font-medium text-gray-900">My Leave Requests</h3>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Leave List */}
      {leaves.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Leave Requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't applied for any leaves yet.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <li key={leave._id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="flex-shrink-0 w-3 h-3 rounded-full"
                      style={{ backgroundColor: leave.leaveType.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {leave.leaveType.name}
                        </p>
                        <span className={getStatusBadge(leave.status)}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </span>
                        <span>{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</span>
                        {leave.isEmergency && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Emergency
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 truncate">{leave.reason}</p>
                      
                      {leave.status === 'rejected' && leave.rejectionReason && (
                        <p className="mt-1 text-sm text-red-600">
                          <strong>Reason:</strong> {leave.rejectionReason}
                        </p>
                      )}
                      
                      {leave.approvedBy && (
                        <p className="mt-1 text-sm text-green-600">
                          Approved by {leave.approvedBy.name} on {formatDate(leave.approvedDate!)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(leave.status)}
                    
                    <div className="flex space-x-1">
                      {/* View Details */}
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {/* Edit (only for pending) */}
                      {leave.status === 'pending' && (
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit Request"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Cancel */}
                      {canCancelLeave(leave) && (
                        <button
                          onClick={() => handleCancelLeave(leave._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Cancel Request"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
