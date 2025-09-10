import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

interface CreateHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedYear: number;
}

export default function CreateHolidayModal({ isOpen, onClose, onSuccess, selectedYear }: CreateHolidayModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    isRecurring: false,
    type: 'company' as 'national' | 'religious' | 'company' | 'optional',
    applicableTo: ['all'] as ('all' | 'male' | 'female')[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'type') {
      setFormData(prev => ({ ...prev, [name]: value as 'national' | 'religious' | 'company' | 'optional' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApplicableToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      applicableTo: value === 'all' ? ['all'] : [value] as ('all' | 'male' | 'female')[]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/holidays', formData);
      onSuccess();
      // Reset form
      setFormData({
        name: '',
        date: '',
        description: '',
        isRecurring: false,
        type: 'company',
        applicableTo: ['all']
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create holiday');
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

                <form onSubmit={handleSubmit}>
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        Create Holiday
                      </Dialog.Title>
                      
                      <div className="mt-6 space-y-4">
                        {/* Name */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Holiday Name
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

                        {/* Date */}
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            min={`${selectedYear}-01-01`}
                            max={`${selectedYear}-12-31`}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (Optional)
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

                        {/* Type */}
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Holiday Type
                          </label>
                          <select
                            name="type"
                            id="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          >
                            <option value="company">Company Holiday</option>
                            <option value="national">National Holiday</option>
                            <option value="religious">Religious Holiday</option>
                            <option value="optional">Optional Holiday</option>
                          </select>
                        </div>

                        {/* Applicable To */}
                        <div>
                          <label htmlFor="applicableTo" className="block text-sm font-medium text-gray-700">
                            Applicable To
                          </label>
                          <select
                            name="applicableTo"
                            id="applicableTo"
                            value={formData.applicableTo[0]}
                            onChange={handleApplicableToChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          >
                            <option value="all">All Employees</option>
                            <option value="male">Male Only</option>
                            <option value="female">Female Only</option>
                          </select>
                        </div>

                        {/* Is Recurring */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="isRecurring"
                            id="isRecurring"
                            checked={formData.isRecurring}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                            Recurring Holiday (applies every year)
                          </label>
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
                      {loading ? 'Creating...' : 'Create Holiday'}
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
