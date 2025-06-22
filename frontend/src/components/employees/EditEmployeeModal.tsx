import { Fragment, useState, useEffect, type FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { type Employee } from '../../types/employee';

type EditEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeUpdated: () => void;
};

export default function EditEmployeeModal({ isOpen, onClose, employee, onEmployeeUpdated }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        department: employee.department || '',
        position: employee.position || '',
        status: employee.status || 'active',
        salary: employee.salary || 0,
        workLocation: employee.workLocation || '',
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!employee) return;
      await api.put(`/employees/${employee._id}`, {
        ...formData,
        salary: Number(formData.salary),
      });
      onEmployeeUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update employee.');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Edit {employee.user.name}
                    </Dialog.Title>
                    <button type="button" className="text-gray-400 hover:text-gray-500" onClick={onClose}>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                      <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                      <input type="text" name="position" id="position" value={formData.position} onChange={handleChange} className="input-field" />
                    </div>
                     <div>
                      <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
                      <input type="number" name="salary" id="salary" value={formData.salary} onChange={handleChange} className="input-field" />
                    </div>
                     <div>
                      <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">Work Location</label>
                      <input type="text" name="workLocation" id="workLocation" value={formData.workLocation} onChange={handleChange} className="input-field" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                      <select id="status" name="status" value={formData.status} onChange={handleChange} className="input-field">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                   {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn-secondary mt-3 w-full sm:mt-0 sm:mr-3 sm:w-auto" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 