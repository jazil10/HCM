import { useEffect, useState } from 'react';
import { 
  EyeIcon,
  CalendarIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { Leave, LeaveStatus, LeaveFilters } from '../../types/leave';
import { useAuth } from '../../contexts/AuthProvider';
import { UserRole } from '../../types/auth';

interface AllLeavesProps {
  onDataChange?: () => void;
}

export default function AllLeaves({ onDataChange }: AllLeavesProps) {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<LeaveFilters>({
    status: undefined,
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20
  });

  useEffect(() => {
    fetchAllLeaves();
  }, [filters]);

  const fetchAllLeaves = async () => {
    try {
      const response = await api.get('/leaves', { params: filters });
      setLeaves(response.data.leaves || response.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setError('Failed to fetch leave requests');
      console.error('Error fetching all leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await api.patch(`/leaves/${leaveId}/approve`);
      fetchAllLeaves();
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
      fetchAllLeaves();
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

  const canApproveReject = (leave: Leave) => {
    return leave.status === 'pending' && 
           (user?.role === UserRole.HR || user?.role === UserRole.ADMIN);
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h3 className="text-lg font-medium text-gray-900">All Leave Requests</h3>
        
        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ 
              ...filters, 
              status: e.target.value === 'all' ? undefined : e.target.value as LeaveStatus,
              page: 1 
            })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Leave List */}
      {leaves.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Leave Requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            No leave requests found matching the current filters.
          </p>
        </div>
      ) : (
        <>
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
                              ({leave.employee.department})
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

                          {/* Approval/Rejection Info */}
                          {leave.approvedBy && (
                            <p className="mt-1 text-sm text-green-600">
                              Approved by {leave.approvedBy.name} on {formatDate(leave.approvedDate!)}
                            </p>
                          )}
                          
                          {leave.rejectedBy && leave.rejectionReason && (
                            <p className="mt-1 text-sm text-red-600">
                              Rejected by {leave.rejectedBy.name}: {leave.rejectionReason}
                            </p>
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
                        
                        {/* Approve/Reject for HR/Admin */}
                        {canApproveReject(leave) && (
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
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.pages} 
                ({pagination.total} total requests)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, pagination.page + 1) })}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
