import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { LeaveBalance, LeaveType, CreateLeaveRequest } from '../../types/leave';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveApplied: () => void;
  leaveBalances: LeaveBalance[];
}

export default function ApplyLeaveModal({ 
  isOpen, 
  onClose, 
  onLeaveApplied, 
  leaveBalances 
}: ApplyLeaveModalProps) {
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isEmergency: false,
    handoverNotes: '',
    contactDuringLeave: {
      phone: '',
      email: '',
      address: ''
    }
  });
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatedDays, setCalculatedDays] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchLeaveTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await api.get('/leave-types');
      setLeaveTypes(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  };

  const getSelectedLeaveBalance = () => {
    return leaveBalances.find(balance => 
      balance.leaveType._id === formData.leaveType
    );
  };

  const validateForm = () => {
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      return 'Please fill in all required fields';
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return 'End date must be after start date';
    }

    const selectedBalance = getSelectedLeaveBalance();
    if (selectedBalance && calculatedDays > selectedBalance.remaining) {
      return `Insufficient balance. Available: ${selectedBalance.remaining} days, Requested: ${calculatedDays} days`;
    }

    const selectedLeaveType = leaveTypes.find(lt => lt._id === formData.leaveType);
    if (selectedLeaveType && calculatedDays > selectedLeaveType.maxConsecutiveDays) {
      return `Cannot apply for more than ${selectedLeaveType.maxConsecutiveDays} consecutive days for ${selectedLeaveType.name}`;
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/leaves', formData);
      onLeaveApplied();
      resetForm();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      isEmergency: false,
      handoverNotes: '',
      contactDuringLeave: {
        phone: '',
        email: '',
        address: ''
      }
    });
    setError('');
    setCalculatedDays(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedBalance = getSelectedLeaveBalance();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Apply for Leave
                    </Dialog.Title>

                    {error && (
                      <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Leave Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Leave Type *
                        </label>
                        <select
                          value={formData.leaveType}
                          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        >
                          <option value="">Select leave type</option>
                          {leaveTypes.map((type) => (
                            <option key={type._id} value={type._id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        {selectedBalance && (
                          <p className="mt-1 text-sm text-gray-500">
                            Available balance: {selectedBalance.remaining} days
                          </p>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            End Date *
                          </label>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                          />
                        </div>
                      </div>

                      {calculatedDays > 0 && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="flex">
                            <CalendarIcon className="h-5 w-5 text-blue-400" />
                            <div className="ml-3">
                              <p className="text-sm text-blue-800">
                                Total days: <strong>{calculatedDays}</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reason */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Reason *
                        </label>
                        <textarea
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Please provide reason for leave"
                          required
                        />
                      </div>

                      {/* Emergency Leave */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isEmergency}
                          onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          This is an emergency leave
                        </label>
                      </div>

                      {/* Handover Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Handover Notes
                        </label>
                        <textarea
                          value={formData.handoverNotes}
                          onChange={(e) => setFormData({ ...formData, handoverNotes: e.target.value })}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Any work handover instructions"
                        />
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Contact During Leave</h4>
                        <div className="space-y-2">
                          <input
                            type="tel"
                            value={formData.contactDuringLeave?.phone || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              contactDuringLeave: { 
                                ...formData.contactDuringLeave, 
                                phone: e.target.value 
                              } 
                            })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Phone number"
                          />
                          <input
                            type="email"
                            value={formData.contactDuringLeave?.email || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              contactDuringLeave: { 
                                ...formData.contactDuringLeave, 
                                email: e.target.value 
                              } 
                            })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Email address"
                          />
                        </div>
                      </div>

                      {/* Submit Buttons */}
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:ml-3 sm:w-auto disabled:opacity-50"
                        >
                          {loading ? 'Applying...' : 'Apply for Leave'}
                        </button>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
