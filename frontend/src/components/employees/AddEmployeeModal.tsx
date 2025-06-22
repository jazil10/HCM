import { Fragment, useState, type FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserRole } from '../../types/auth';
import type { Employee } from '../../types/employee';
import api from '../../api/axios';

type AddEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: (newEmployee: Employee) => void;
};

export default function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }: AddEmployeeModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    position: '',
    role: UserRole.EMPLOYEE,
    salary: '',
    workLocation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/employees', {
        ...formData,
        salary: Number(formData.salary)
      });
      onEmployeeAdded(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add employee. Please try again.');
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
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Add New Employee
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                      {/* Form Fields */}
                      <div className="sm:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="input-field" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="input-field" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className="input-field" />
                      </div>
                      <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleChange} required className="input-field" />
                      </div>
                       <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-field">
                          {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                        <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} required className="input-field" />
                      </div>
                      <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                        <input type="text" name="position" id="position" value={formData.position} onChange={handleChange} required className="input-field" />
                      </div>
                       <div>
                        <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
                        <input type="number" name="salary" id="salary" value={formData.salary} onChange={handleChange} required className="input-field" />
                      </div>
                       <div>
                        <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">Work Location</label>
                        <input type="text" name="workLocation" id="workLocation" value={formData.workLocation} onChange={handleChange} required className="input-field" />
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Employee'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary mt-3 w-full sm:mt-0 sm:mr-3 sm:w-auto"
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