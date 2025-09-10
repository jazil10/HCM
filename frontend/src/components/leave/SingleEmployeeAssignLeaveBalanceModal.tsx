import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { Employee } from '../../types/employee';
import type { LeaveType } from '../../types/leave';

interface SingleEmployeeAssignLeaveBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee;
  selectedYear?: number;
}

export default function SingleEmployeeAssignLeaveBalanceModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  employee,
  selectedYear = new Date().getFullYear()
}: SingleEmployeeAssignLeaveBalanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState({
    employee: employee._id,
    leaveType: '',
    allocated: 0,
    carriedForward: 0,
    year: selectedYear
  });

  useEffect(() => {
    if (isOpen) {
      fetchLeaveTypes();
      setFormData(prev => ({ ...prev, employee: employee._id }));
    }
  }, [isOpen, employee._id]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await api.get('/leave-types');
      setLeaveTypes(response.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      setError('Failed to fetch leave types');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLeaveTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLeaveType = leaveTypes.find(lt => lt._id === e.target.value);
    setFormData(prev => ({ 
      ...prev, 
      leaveType: e.target.value,
      allocated: selectedLeaveType?.maxDaysPerYear || 0
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting leave balance data:', formData);
      const response = await api.post('/leave-balances', formData);
      console.log('Leave balance created successfully:', response.data);
      onSuccess();
      // Reset form
      setFormData({
        employee: employee._id,
        leaveType: '',
        allocated: 0,
        carriedForward: 0,
        year: selectedYear
      });
    } catch (err: any) {
      console.error('Error creating leave balance:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to assign leave balance');
    } finally {
      setLoading(false);
    }
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

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Assign Leave Balance to {employee.user.name}
                    </Dialog.Title>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4 mb-4">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">
                          Leave Type
                        </label>
                        <select
                          id="leaveType"
                          name="leaveType"
                          value={formData.leaveType}
                          onChange={handleLeaveTypeChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                          <option value="">Select a leave type</option>
                          {leaveTypes.map((type) => (
                            <option key={type._id} value={type._id}>
                              {type.name} (Max: {type.maxDaysPerYear} days)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="allocated" className="block text-sm font-medium text-gray-700">
                          Allocated Days
                        </label>
                        <input
                          type="number"
                          id="allocated"
                          name="allocated"
                          value={formData.allocated}
                          onChange={handleChange}
                          min="0"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="carriedForward" className="block text-sm font-medium text-gray-700">
                          Carried Forward (Optional)
                        </label>
                        <input
                          type="number"
                          id="carriedForward"
                          name="carriedForward"
                          value={formData.carriedForward}
                          onChange={handleChange}
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                          Year
                        </label>
                        <input
                          type="number"
                          id="year"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          min={new Date().getFullYear() - 1}
                          max={new Date().getFullYear() + 1}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Assigning...' : 'Assign Balance'}
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
