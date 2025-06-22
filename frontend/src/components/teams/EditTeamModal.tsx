import { Fragment, useState, useEffect, type FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { type User } from '../../types/auth';
import { type Team } from '../../types/team';

type EditTeamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onTeamUpdated: () => void;
};

export default function EditTeamModal({ isOpen, onClose, team, onTeamUpdated }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && team) {
      setName(team.name);
      setManagerId(team.manager._id);

      const fetchManagers = async () => {
        try {
          const response = await api.get('/users?role=manager');
          setManagers(response.data.users);
        } catch (err) {
          console.error('Failed to fetch managers', err);
        }
      };
      fetchManagers();
    }
  }, [isOpen, team]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!team) return;
      await api.put(`/teams/${team._id}`, { name, managerId });
      onTeamUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update team.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!team) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete(`/teams/${team._id}`);
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      onTeamUpdated();
      onClose();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete team.');
      setDeleteLoading(false);
    }
  };

  if (!team) return null;

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
                        Edit Team
                      </Dialog.Title>
                       <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-6 space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Team Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">Manager</label>
                        <select
                          id="managerId"
                          name="managerId"
                          value={managerId}
                          onChange={(e) => setManagerId(e.target.value)}
                          required
                          className="input-field"
                        >
                          <option value="" disabled>Select a manager</option>
                          {managers.map((manager) => (
                            <option key={manager._id} value={manager._id}>
                              {manager.name} ({manager.email})
                            </option>
                          ))}
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
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary mt-3 w-full sm:mt-0 sm:mr-3 sm:w-auto"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-danger mt-3 w-full sm:mt-0 sm:mr-3 sm:w-auto"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={loading || deleteLoading}
                    >
                      Delete Team
                    </button>
                  </div>
                </form>
                {/* Delete confirmation dialog */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                      <h3 className="text-lg font-bold mb-2">Delete Team?</h3>
                      <p className="mb-4 text-sm text-gray-700">Are you sure you want to delete this team? This action cannot be undone.</p>
                      {deleteError && <div className="mb-2 text-red-600 text-sm">{deleteError}</div>}
                      <div className="flex justify-end space-x-2">
                        <button
                          className="btn-secondary"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleteLoading}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-danger"
                          onClick={handleDelete}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 