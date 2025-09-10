import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { LeaveType } from '../../types/leave';
import CreateLeaveTypeModal from './CreateLeaveTypeModal';
import EditLeaveTypeModal from './EditLeaveTypeModal';

interface LeaveTypeManagementProps {
  onDataChange?: () => void;
}

export default function LeaveTypeManagement({ onDataChange }: LeaveTypeManagementProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const response = await api.get('/leave-types');
      setLeaveTypes(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      setError('Failed to fetch leave types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchLeaveTypes();
    onDataChange?.();
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    fetchLeaveTypes();
    onDataChange?.();
    setEditingLeaveType(null);
  };

  const handleDelete = async (leaveTypeId: string) => {
    if (!confirm('Are you sure you want to delete this leave type? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/leave-types/${leaveTypeId}`);
      fetchLeaveTypes();
      onDataChange?.();
    } catch (error) {
      console.error('Error deleting leave type:', error);
      setError('Failed to delete leave type');
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Leave Type Management</h2>
          <p className="text-gray-600">Configure leave types and their policies</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Leave Type
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Leave Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaveTypes.map((leaveType) => (
          <div key={leaveType._id} className="bg-white overflow-hidden shadow rounded-lg">
            <div 
              className="h-2" 
              style={{ backgroundColor: leaveType.color }}
            ></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{leaveType.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingLeaveType(leaveType)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(leaveType._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{leaveType.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Days/Year:</span>
                  <span className="font-medium">{leaveType.maxDaysPerYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Consecutive:</span>
                  <span className="font-medium">{leaveType.maxConsecutiveDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Carry Forward:</span>
                  <span className="font-medium">
                    {leaveType.carryForwardAllowed ? `Yes (${leaveType.maxCarryForwardDays} days)` : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Encashment:</span>
                  <span className="font-medium">{leaveType.encashmentAllowed ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Attachment Required:</span>
                  <span className="font-medium">{leaveType.attachmentRequired ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Eligibility:</span>
                  <span className="font-medium">{leaveType.eligibilityMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applicable To:</span>
                  <span className="font-medium capitalize">
                    {leaveType.applicableToGenders.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaveTypes.length === 0 && (
        <div className="text-center py-12">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leave types</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first leave type.
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateLeaveTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {editingLeaveType && (
        <EditLeaveTypeModal
          isOpen={!!editingLeaveType}
          onClose={() => setEditingLeaveType(null)}
          onSuccess={handleEditSuccess}
          leaveType={editingLeaveType}
        />
      )}
    </div>
  );
}
