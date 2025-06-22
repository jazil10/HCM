import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { type Employee } from '../../types/employee';

type AddAttendanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRecordAdded: (newRecord: any) => void;
};

export default function AddAttendanceModal({ isOpen, onClose, onRecordAdded }: AddAttendanceModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch employees when modal opens
      const fetchEmployees = async () => {
        try {
          const response = await api.get('/employees?limit=1000'); // Fetch all employees
          setEmployees(response.data.employees);
        } catch (err) {
          console.error("Failed to fetch employees", err);
        }
      };
      fetchEmployees();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine date with time for checkIn and checkOut
      const payload = {
        ...formData,
        checkIn: formData.checkIn ? `${formData.date}T${formData.checkIn}` : null,
        checkOut: formData.checkOut ? `${formData.date}T${formData.checkOut}` : null,
      };
      const response = await api.post('/attendance/manual', payload);
      onRecordAdded(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... (Transition and positioning elements are standard) ... */}
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
             <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                   <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                     <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Add/Edit Attendance Record
                      </Dialog.Title>
                      <div className="mt-6 grid grid-cols-1 gap-y-6">
                        <div>
                          <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Employee</label>
                          <select name="employee" id="employee" value={formData.employee} onChange={handleChange} required className="input-field">
                            <option value="" disabled>Select an employee</option>
                            {employees.map(emp => (
                              <option key={emp._id} value={emp._id}>{emp.user.name} ({emp.employeeId})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                          <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="input-field" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4">
                           <div>
                            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">Check In</label>
                            <input type="time" name="checkIn" id="checkIn" value={formData.checkIn} onChange={handleChange} className="input-field" />
                          </div>
                          <div>
                            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">Check Out</label>
                            <input type="time" name="checkOut" id="checkOut" value={formData.checkOut} onChange={handleChange} className="input-field" />
                          </div>
                        </div>
                         <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                          <select name="status" id="status" value={formData.status} onChange={handleChange} required className="input-field">
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="leave">On Leave</option>
                            <option value="half-day">Half-day</option>
                          </select>
                        </div>
                      </div>
                      {error && <p className="text-red-500 mt-4">{error}</p>}
                   </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Record'}</button>
                    <button type="button" className="btn-secondary sm:mr-3 mt-3 sm:mt-0" onClick={onClose}>Cancel</button>
                  </div>
                </form>
              </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 