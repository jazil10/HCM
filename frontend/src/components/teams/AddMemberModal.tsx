import { Fragment, useState, useEffect, type FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { type User } from '../../types/auth';

type AddMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onMemberAdded: () => void;
  currentMemberIds: string[];
};

export default function AddMemberModal({ isOpen, onClose, teamId, onMemberAdded, currentMemberIds }: AddMemberModalProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAvailableUsers = async () => {
        try {
          const response = await api.get('/users');
          // Filter out users who are already in the team
          const users = response.data.users.filter((user: User) => !currentMemberIds.includes(user._id));
          setAvailableUsers(users);
        } catch (err) {
          setError('Failed to fetch users.');
        }
      };
      fetchAvailableUsers();
    }
  }, [isOpen, currentMemberIds]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user to add.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post(`/teams/${teamId}/members`, { userId: selectedUserId });
      onMemberAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member.');
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
                        Add Member to Team
                      </Dialog.Title>
                       <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-6">
                      <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                        Select User
                      </label>
                      <select
                        id="user"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="input-field"
                      >
                        <option value="" disabled>Select a user...</option>
                        {availableUsers.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
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
                      {loading ? 'Adding...' : 'Add Member'}
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