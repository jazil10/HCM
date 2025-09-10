import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import type { LeaveType } from '../../types/leave';

interface EditLeaveTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leaveType: LeaveType;
}

export default function EditLeaveTypeModal({ isOpen, onClose, onSuccess, leaveType }: EditLeaveTypeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxDaysPerYear: 0,
    maxConsecutiveDays: 0,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    encashmentAllowed: false,
    attachmentRequired: false,
    eligibilityMonths: 0,
    applicableToGenders: ['all'],
    color: '#3B82F6'
  });

  useEffect(() => {
    if (leaveType && isOpen) {
      setFormData({
        name: leaveType.name,
        description: leaveType.description || '',
        maxDaysPerYear: leaveType.maxDaysPerYear,
        maxConsecutiveDays: leaveType.maxConsecutiveDays,
        carryForwardAllowed: leaveType.carryForwardAllowed,
        maxCarryForwardDays: leaveType.maxCarryForwardDays,
        encashmentAllowed: leaveType.encashmentAllowed,
        attachmentRequired: leaveType.attachmentRequired,
        eligibilityMonths: leaveType.eligibilityMonths,
        applicableToGenders: leaveType.applicableToGenders,
        color: leaveType.color
      });
    }
  }, [leaveType, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      applicableToGenders: value === 'all' ? ['all'] : [value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/leave-types/${leaveType._id}`, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update leave type');
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
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
                        Edit Leave Type
                      </Dialog.Title>
                      
                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        {/* Name */}
                        <div className="sm:col-span-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Max Days Per Year */}
                        <div>
                          <label htmlFor="maxDaysPerYear" className="block text-sm font-medium text-gray-700">
                            Max Days Per Year
                          </label>
                          <input
                            type="number"
                            name="maxDaysPerYear"
                            id="maxDaysPerYear"
                            min="0"
                            required
                            value={formData.maxDaysPerYear}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Max Consecutive Days */}
                        <div>
                          <label htmlFor="maxConsecutiveDays" className="block text-sm font-medium text-gray-700">
                            Max Consecutive Days
                          </label>
                          <input
                            type="number"
                            name="maxConsecutiveDays"
                            id="maxConsecutiveDays"
                            min="0"
                            required
                            value={formData.maxConsecutiveDays}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Eligibility Months */}
                        <div>
                          <label htmlFor="eligibilityMonths" className="block text-sm font-medium text-gray-700">
                            Eligibility (Months)
                          </label>
                          <input
                            type="number"
                            name="eligibilityMonths"
                            id="eligibilityMonths"
                            min="0"
                            value={formData.eligibilityMonths}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Applicable To Genders */}
                        <div>
                          <label htmlFor="applicableToGenders" className="block text-sm font-medium text-gray-700">
                            Applicable To
                          </label>
                          <select
                            name="applicableToGenders"
                            id="applicableToGenders"
                            value={formData.applicableToGenders[0]}
                            onChange={handleGenderChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          >
                            <option value="all">All Employees</option>
                            <option value="male">Male Only</option>
                            <option value="female">Female Only</option>
                          </select>
                        </div>

                        {/* Color */}
                        <div>
                          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                            Color
                          </label>
                          <input
                            type="color"
                            name="color"
                            id="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          />
                        </div>

                        {/* Checkboxes */}
                        <div className="sm:col-span-2 space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="carryForwardAllowed"
                              id="carryForwardAllowed"
                              checked={formData.carryForwardAllowed}
                              onChange={handleChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="carryForwardAllowed" className="ml-2 block text-sm text-gray-700">
                              Allow Carry Forward
                            </label>
                          </div>

                          {formData.carryForwardAllowed && (
                            <div className="ml-6">
                              <label htmlFor="maxCarryForwardDays" className="block text-sm font-medium text-gray-700">
                                Max Carry Forward Days
                              </label>
                              <input
                                type="number"
                                name="maxCarryForwardDays"
                                id="maxCarryForwardDays"
                                min="0"
                                value={formData.maxCarryForwardDays}
                                onChange={handleChange}
                                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              />
                            </div>
                          )}

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="encashmentAllowed"
                              id="encashmentAllowed"
                              checked={formData.encashmentAllowed}
                              onChange={handleChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="encashmentAllowed" className="ml-2 block text-sm text-gray-700">
                              Allow Encashment
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="attachmentRequired"
                              id="attachmentRequired"
                              checked={formData.attachmentRequired}
                              onChange={handleChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="attachmentRequired" className="ml-2 block text-sm text-gray-700">
                              Attachment Required
                            </label>
                          </div>
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
                      {loading ? 'Updating...' : 'Update Leave Type'}
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
