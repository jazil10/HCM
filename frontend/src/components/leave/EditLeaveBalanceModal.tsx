import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { LeaveBalance } from '../../types/leave';

interface EditLeaveBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leaveBalance: LeaveBalance;
}

export default function EditLeaveBalanceModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  leaveBalance 
}: EditLeaveBalanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    allocated: 0,
    used: 0,
    pending: 0,
    carriedForward: 0,
    encashed: 0
  });

  useEffect(() => {
    if (leaveBalance && isOpen) {
      setFormData({
        allocated: leaveBalance.allocated,
        used: leaveBalance.used,
        pending: leaveBalance.pending,
        carriedForward: leaveBalance.carriedForward,
        encashed: leaveBalance.encashed
      });
    }
  }, [leaveBalance, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/leave-balances/${leaveBalance._id}`, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update leave balance');
    } finally {
      setLoading(false);
    }
  };

  const calculateRemaining = () => {
    return Math.max(0, formData.allocated + formData.carriedForward - formData.used - formData.pending - formData.encashed);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        Edit Leave Balance
                      </Dialog.Title>
                      
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Employee Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Employee:</span>
                            <div className="font-medium">{leaveBalance.employee.user.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Department:</span>
                            <div className="font-medium">{leaveBalance.employee.department}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Leave Type:</span>
                            <div className="font-medium flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: leaveBalance.leaveType.color }}
                              ></div>
                              {leaveBalance.leaveType.name}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Year:</span>
                            <div className="font-medium">{leaveBalance.year}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        {/* Allocated Days */}
                        <div>
                          <label htmlFor="allocated" className="block text-sm font-medium text-gray-700">
                            Allocated Days
                          </label>
                          <input
                            type="number"
                            name="allocated"
                            id="allocated"
                            min="0"
                            max="365"
                            required
                            value={formData.allocated}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Used Days */}
                        <div>
                          <label htmlFor="used" className="block text-sm font-medium text-gray-700">
                            Used Days
                          </label>
                          <input
                            type="number"
                            name="used"
                            id="used"
                            min="0"
                            value={formData.used}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Pending Days */}
                        <div>
                          <label htmlFor="pending" className="block text-sm font-medium text-gray-700">
                            Pending Days
                          </label>
                          <input
                            type="number"
                            name="pending"
                            id="pending"
                            min="0"
                            value={formData.pending}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Days in pending leave requests
                          </p>
                        </div>

                        {/* Carried Forward Days */}
                        <div>
                          <label htmlFor="carriedForward" className="block text-sm font-medium text-gray-700">
                            Carried Forward Days
                          </label>
                          <input
                            type="number"
                            name="carriedForward"
                            id="carriedForward"
                            min="0"
                            value={formData.carriedForward}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Encashed Days */}
                        <div>
                          <label htmlFor="encashed" className="block text-sm font-medium text-gray-700">
                            Encashed Days
                          </label>
                          <input
                            type="number"
                            name="encashed"
                            id="encashed"
                            min="0"
                            value={formData.encashed}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Calculated Remaining */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-blue-900">
                              Calculated Remaining Days:
                            </span>
                            <span className="text-lg font-bold text-blue-900">
                              {calculateRemaining()}
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">
                            Allocated + Carried Forward - Used - Pending - Encashed
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="mt-4 rounded-md bg-red-50 p-4">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:ml-3 sm:w-auto disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Balance'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
