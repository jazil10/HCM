import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, UserCircleIcon, UsersIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import { type Team } from '../types/team';
import { useAuth } from '../contexts/AuthProvider';
import { UserRole } from '../types/auth';
import AddMemberModal from '../components/teams/AddMemberModal';

export default function TeamDetailsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/${teamId}`);
      setTeam(response.data);
    } catch (err) {
      setError('Failed to fetch team details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);
  
  const handleRemoveMember = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await api.delete(`/teams/${teamId}/members/${userId}`);
        // Refresh team data
        fetchTeam();
      } catch (err) {
        alert('Failed to remove member.');
      }
    }
  };

  const canManage = user?.role === UserRole.ADMIN || user?._id === team?.manager._id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-800">{error}</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Team not found</h3>
        <Link to="/dashboard/teams" className="mt-6 btn-secondary">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/dashboard/teams" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Teams
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
        </div>
        {canManage && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Member
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manager Card */}
        <div className="md:col-span-1 card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manager</h3>
          <div className="flex items-center">
            <UserCircleIcon className="h-12 w-12 text-gray-400" />
            <div className="ml-4">
              <p className="font-semibold">{team.manager.name}</p>
              <p className="text-sm text-gray-500">{team.manager.email}</p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="md:col-span-2 card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Team Members ({team.members.length})
          </h3>
          <ul className="divide-y divide-gray-200">
            {team.members.map(member => (
              <li key={member._id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                {canManage && (
                  <button 
                    onClick={() => handleRemoveMember(member._id)}
                    className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
            {team.members.length === 0 && (
              <p className="text-center text-gray-500 py-4">This team has no members yet.</p>
            )}
          </ul>
        </div>
      </div>
      
      {teamId && (
        <AddMemberModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          teamId={teamId}
          onMemberAdded={fetchTeam}
          currentMemberIds={team?.members.map(m => m._id) || []}
        />
      )}
    </div>
  );
} 